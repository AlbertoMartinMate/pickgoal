import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from app import db
from app.models import PrivateMessage, User

logger = logging.getLogger(__name__)
messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/unread', methods=['GET'])
@jwt_required()
def get_unread_count():
    user_id = int(get_jwt_identity())
    count = PrivateMessage.query.filter_by(receiver_id=user_id, is_read=False).count()
    return jsonify({'count': count}), 200


@messages_bp.route('/', methods=['GET'])
@jwt_required()
def list_conversations():
    user_id = int(get_jwt_identity())

    sent_to = {r[0] for r in db.session.query(PrivateMessage.receiver_id)
               .filter_by(sender_id=user_id).distinct().all()}
    received_from = {r[0] for r in db.session.query(PrivateMessage.sender_id)
                     .filter_by(receiver_id=user_id).distinct().all()}
    partner_ids = sent_to | received_from

    conversations = []
    for partner_id in partner_ids:
        last_msg = (PrivateMessage.query
                    .filter(or_(
                        db.and_(PrivateMessage.sender_id == user_id, PrivateMessage.receiver_id == partner_id),
                        db.and_(PrivateMessage.sender_id == partner_id, PrivateMessage.receiver_id == user_id),
                    ))
                    .order_by(PrivateMessage.created_at.desc())
                    .first())

        unread = PrivateMessage.query.filter_by(
            sender_id=partner_id, receiver_id=user_id, is_read=False
        ).count()

        partner = User.query.get(partner_id)
        if not partner or partner.is_bot:
            continue

        conversations.append({
            'user_id': partner_id,
            'username': partner.username,
            'last_message': last_msg.message if last_msg else '',
            'last_message_at': last_msg.created_at.isoformat() if last_msg else '',
            'unread_count': unread,
        })

    conversations.sort(key=lambda c: c['last_message_at'], reverse=True)
    return jsonify({'conversations': conversations}), 200


@messages_bp.route('/<int:partner_id>', methods=['GET'])
@jwt_required()
def get_messages_with(partner_id):
    user_id = int(get_jwt_identity())

    msgs = (PrivateMessage.query
            .filter(or_(
                db.and_(PrivateMessage.sender_id == user_id, PrivateMessage.receiver_id == partner_id),
                db.and_(PrivateMessage.sender_id == partner_id, PrivateMessage.receiver_id == user_id),
            ))
            .order_by(PrivateMessage.created_at.asc())
            .all())

    unread = [m for m in msgs if m.receiver_id == user_id and not m.is_read]
    if unread:
        for m in unread:
            m.is_read = True
        db.session.commit()

    partner = User.query.get(partner_id)
    return jsonify({
        'messages': [m.to_dict() for m in msgs],
        'partner': {'id': partner.id, 'username': partner.username} if partner else None,
    }), 200


@messages_bp.route('/mark-all-read', methods=['PATCH'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    PrivateMessage.query.filter_by(receiver_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'ok': True}), 200


@messages_bp.route('/<int:partner_id>', methods=['POST'])
@jwt_required()
def send_message(partner_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    text = (data.get('message') or '').strip()

    if not text:
        return jsonify({'error': 'El mensaje no puede estar vacío'}), 400
    if len(text) > 1000:
        return jsonify({'error': 'El mensaje no puede superar los 1000 caracteres'}), 400

    partner = User.query.get_or_404(partner_id)
    if partner.is_bot:
        return jsonify({'error': 'No puedes enviar mensajes a bots'}), 400
    if partner_id == user_id:
        return jsonify({'error': 'No puedes enviarte mensajes a ti mismo'}), 400

    msg = PrivateMessage(sender_id=user_id, receiver_id=partner_id, message=text)
    db.session.add(msg)
    db.session.commit()

    try:
        from app.routes.notifications import send_push_notification
        sender = User.query.get(user_id)
        send_push_notification(
            partner_id,
            f'💬 Mensaje de {sender.username}',
            text[:100] + ('…' if len(text) > 100 else ''),
            url=f'https://pickgoal.es/#/mensajes/{user_id}',
        )
    except Exception as e:
        logger.warning('[messages] push error: %s', e)

    return jsonify({'message': msg.to_dict()}), 201
