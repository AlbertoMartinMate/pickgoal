from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import BoardMessage, User

board_bp = Blueprint('board', __name__)
PAGE_SIZE = 50


@board_bp.route('/', methods=['GET'])
def get_messages():
    page = request.args.get('page', 1, type=int)
    messages = (BoardMessage.query
                .order_by(BoardMessage.created_at.desc())
                .paginate(page=page, per_page=PAGE_SIZE, error_out=False))
    return jsonify({
        'messages': [m.to_dict() for m in reversed(messages.items)],
        'total': messages.total,
        'pages': messages.pages,
        'page': page,
    }), 200


@board_bp.route('/', methods=['POST'])
@jwt_required()
def post_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'El mensaje no puede estar vacío'}), 400
    if len(message) > 500:
        return jsonify({'error': 'El mensaje no puede superar los 500 caracteres'}), 400

    msg = BoardMessage(user_id=user_id, message=message)
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': msg.to_dict()}), 201


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
