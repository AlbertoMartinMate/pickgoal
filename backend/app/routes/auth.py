from flask import Blueprint, request, jsonify
from flask_jwt_extended import (create_access_token, jwt_required,
                                 get_jwt_identity)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask import current_app
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint('auth', __name__)


def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    country = data.get('country', '').strip()

    if not username or not email or not password:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    if len(password) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya está en uso'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'El email ya está registrado'}), 409

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, email=email, password_hash=pw_hash, country=country)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict(include_email=True)}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')

    user = User.query.filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict(include_email=True)}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict(include_email=True)}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    user = User.query.filter_by(email=email).first()
    # Siempre devolvemos 200 para no revelar si el email existe
    if user:
        s = get_serializer()
        token = s.dumps(email, salt='recover-key')
        from flask_mail import Message
        from app import mail
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        reset_url = f'{frontend_url}/reset-password?token={token}'
        try:
            msg = Message(
                subject='PickGoal — Recuperar contraseña',
                recipients=[email],
                body=f'Accede a este enlace para restablecer tu contraseña (válido 1 hora):\n\n{reset_url}',
            )
            mail.send(msg)
        except Exception:
            pass
    return jsonify({'message': 'Si el email existe, recibirás un enlace de recuperación'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token', '')
    new_password = data.get('password', '')

    if len(new_password) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400

    s = get_serializer()
    try:
        email = s.loads(token, salt='recover-key', max_age=3600)
    except SignatureExpired:
        return jsonify({'error': 'El enlace ha expirado'}), 400
    except BadSignature:
        return jsonify({'error': 'Token inválido'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Contraseña actualizada correctamente'}), 200


@auth_bp.route('/ranking', methods=['GET'])
def ranking():
    users = User.query.all()
    ranking_data = []
    for u in users:
        ranking_data.append({
            **u.to_dict(),
            'total_points': u.total_points(),
        })
    ranking_data.sort(key=lambda x: x['total_points'], reverse=True)
    for i, entry in enumerate(ranking_data):
        entry['position'] = i + 1
    return jsonify({'ranking': ranking_data}), 200


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403
    users = User.query.all()
    return jsonify({'users': [u.to_dict(include_email=True) for u in users]}), 200


@auth_bp.route('/users/<int:uid>/toggle-admin', methods=['PATCH'])
@jwt_required()
def toggle_admin(uid):
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403
    target = User.query.get_or_404(uid)
    target.is_admin = not target.is_admin
    db.session.commit()
    return jsonify({'user': target.to_dict()}), 200
