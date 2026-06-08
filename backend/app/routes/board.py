from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import BoardMessage, User, LeagueMember

board_bp = Blueprint('board', __name__)
PAGE_SIZE = 50


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
    return jsonify({'message': msg.to_dict()}), 201


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
