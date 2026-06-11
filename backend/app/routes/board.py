import logging
import re
from datetime import timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import BoardMessage, User, LeagueMember, League

logger = logging.getLogger(__name__)

board_bp = Blueprint('board', __name__)
PAGE_SIZE = 50


@board_bp.route('/unread', methods=['GET'])
def get_unread_count():
    league_id = request.args.get('league_id', None, type=int)
    since = request.args.get('since', None)

    if not league_id or not since:
        return jsonify({'count': 0}), 200

    try:
        from datetime import datetime
        # JS toISOString() produces 3-decimal milliseconds (e.g. "...000Z").
        # Python < 3.11 fromisoformat only accepts 0 or 6 decimal places,
        # so we strip sub-seconds as a safe fallback.
        clean = since.replace('Z', '+00:00')
        try:
            since_dt = datetime.fromisoformat(clean)
        except ValueError:
            since_dt = datetime.fromisoformat(clean[:19] + '+00:00')
        if since_dt.tzinfo is None:
            since_dt = since_dt.replace(tzinfo=timezone.utc)
    except (ValueError, AttributeError):
        return jsonify({'count': 0}), 200

    count = (BoardMessage.query
             .filter_by(league_id=league_id, parent_id=None, is_deleted=False)
             .filter(BoardMessage.created_at > since_dt)
             .count())

    return jsonify({'count': count}), 200


@board_bp.route('/', methods=['GET'])
def get_messages():
    league_id = request.args.get('league_id', None, type=int)
    page = request.args.get('page', 1, type=int)

    # Pinned top-level messages (all, not paginated)
    pinned_q = (BoardMessage.query
                .filter_by(league_id=league_id, parent_id=None, is_pinned=True, is_deleted=False)
                .order_by(BoardMessage.created_at.asc()))
    pinned = pinned_q.all()

    pinned_list = []
    for msg in pinned:
        d = msg.to_dict()
        d['replies'] = [
            r.to_dict()
            for r in msg.replies.order_by(BoardMessage.created_at.asc()).all()
        ]
        pinned_list.append(d)

    # Regular (non-pinned, non-reply) messages, paginated newest first
    regular_q = (BoardMessage.query
                 .filter_by(league_id=league_id, parent_id=None, is_pinned=False)
                 .order_by(BoardMessage.created_at.desc())
                 .paginate(page=page, per_page=PAGE_SIZE, error_out=False))

    return jsonify({
        'pinned': pinned_list,
        'messages': [m.to_dict() for m in regular_q.items],
        'total': regular_q.total,
        'pages': regular_q.pages,
        'page': page,
    }), 200


@board_bp.route('/', methods=['POST'])
@jwt_required()
def post_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    message = data.get('message', '').strip()
    league_id = data.get('league_id', None)
    if not message:
        return jsonify({'error': 'El mensaje no puede estar vacío'}), 400
    if len(message) > 500:
        return jsonify({'error': 'El mensaje no puede superar los 500 caracteres'}), 400

    if league_id:
        is_member = LeagueMember.query.filter_by(league_id=league_id, user_id=user_id).first()
        user = User.query.get(user_id)
        if not is_member and not user.is_admin:
            return jsonify({'error': 'No perteneces a esta liga'}), 403

    msg = BoardMessage(user_id=user_id, message=message, league_id=league_id)
    db.session.add(msg)
    db.session.commit()

    # Notify @mentioned users (skip bots and the author)
    _notify_mentions(message, user_id, league_id)

    return jsonify({'message': msg.to_dict()}), 201


def _notify_mentions(message, author_id, league_id):
    """Fire-and-forget push notifications for @username mentions."""
    try:
        from app.routes.notifications import send_push_notification
        if '@' not in message:
            return
        author = User.query.get(author_id)
        league = League.query.get(league_id) if league_id else None
        league_name = league.name if league else 'PickGoal'
        tablon_url = f'https://pickgoal.es/#/tablon?liga={league_id}' if league_id else 'https://pickgoal.es/#/tablon'

        # @todos / @everyone → notify all league members
        broadcast_keywords = {'@todos', '@everyone'}
        if any(kw in message.lower() for kw in broadcast_keywords):
            if league_id:
                member_ids = (db.session.query(LeagueMember.user_id)
                              .filter_by(league_id=league_id)
                              .all())
                recipient_ids = [r[0] for r in member_ids if r[0] != author_id]
                for uid in recipient_ids:
                    try:
                        send_push_notification(
                            uid,
                            '📣 Mensaje para todos en PickGoal',
                            f'{author.username} tiene un aviso para tu liga',
                            url=tablon_url,
                        )
                    except Exception as e:
                        logger.error('[mention] error enviando broadcast a %s: %s', uid, e, exc_info=True)
            return

        # Individual @username mentions — handles multi-word usernames (e.g. "Alberto Martin")
        all_users = User.query.filter(User.is_bot == False).all()
        mentioned_users = [u for u in all_users if f'@{u.username}' in message]
        for mentioned in mentioned_users:
            if mentioned.id == author_id:
                continue
            try:
                send_push_notification(
                    mentioned.id,
                    '📣 Te han mencionado en PickGoal',
                    f'@{author.username} te mencionó en {league_name}',
                    url=tablon_url,
                )
            except Exception as e:
                logger.error('[mention] error enviando push a %s: %s', mentioned.id, e, exc_info=True)
    except Exception as exc:
        logger.error('[mention] error en _notify_mentions: %s', exc, exc_info=True)


@board_bp.route('/<int:msg_id>/pin', methods=['POST'])
@jwt_required()
def pin_message(msg_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if not user.is_admin:
        return jsonify({'error': 'Solo el admin puede fijar mensajes'}), 403

    msg = BoardMessage.query.get_or_404(msg_id)
    if msg.parent_id is not None:
        return jsonify({'error': 'No se puede fijar una respuesta'}), 400

    msg.is_pinned = not msg.is_pinned
    db.session.commit()
    return jsonify({'message': msg.to_dict()}), 200


@board_bp.route('/<int:msg_id>/reply', methods=['POST'])
@jwt_required()
def reply_message(msg_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'El mensaje no puede estar vacío'}), 400
    if len(message) > 500:
        return jsonify({'error': 'El mensaje no puede superar los 500 caracteres'}), 400

    parent = BoardMessage.query.get_or_404(msg_id)
    if parent.parent_id is not None:
        return jsonify({'error': 'No se puede responder a una respuesta'}), 400
    if not parent.is_pinned:
        return jsonify({'error': 'Solo se puede responder a mensajes fijados'}), 400

    if parent.league_id:
        is_member = LeagueMember.query.filter_by(league_id=parent.league_id, user_id=user_id).first()
        user = User.query.get(user_id)
        if not is_member and not user.is_admin:
            return jsonify({'error': 'No perteneces a esta liga'}), 403

    reply = BoardMessage(
        user_id=user_id,
        message=message,
        league_id=parent.league_id,
        parent_id=msg_id,
    )
    db.session.add(reply)
    db.session.commit()
    return jsonify({'message': reply.to_dict()}), 201


@board_bp.route('/<int:msg_id>', methods=['DELETE'])
@jwt_required()
def delete_message(msg_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    msg = BoardMessage.query.get_or_404(msg_id)

    if msg.user_id != user_id and not user.is_admin:
        return jsonify({'error': 'Sin permisos para eliminar este mensaje'}), 403

    msg.is_deleted = True
    db.session.commit()
    return jsonify({'message': msg.to_dict()}), 200
