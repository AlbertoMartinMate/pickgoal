import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (create_access_token, jwt_required,
                                 get_jwt_identity)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask import current_app
from app import db, bcrypt
from app.models import User, Prediction, LeagueMember, ChampionPrediction
from sqlalchemy import func

logger = logging.getLogger(__name__)

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
        if not current_app.config.get('MAIL_USERNAME') or not current_app.config.get('MAIL_PASSWORD'):
            logger.error('Email no configurado: faltan MAIL_USERNAME o MAIL_PASSWORD en las variables de entorno')
            return jsonify({'error': 'El sistema de email no está configurado. Contacta con el administrador.'}), 500

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
        except Exception as e:
            logger.error('Error enviando email de recuperación a %s: %s', email, e, exc_info=True)
            return jsonify({'error': 'No se pudo enviar el email. Inténtalo de nuevo más tarde.'}), 500
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
    league_id = request.args.get('league_id', type=int)

    if league_id is not None:
        member_ids = [
            m.user_id for m in LeagueMember.query.filter_by(league_id=league_id).all()
        ]
        users = User.query.filter(User.id.in_(member_ids)).all()
    else:
        users = User.query.all()

    ranking_data = []
    for u in users:
        pred_q = Prediction.query.filter_by(user_id=u.id)
        champ_q = ChampionPrediction.query.filter_by(user_id=u.id)
        if league_id is not None:
            pred_q = pred_q.filter_by(league_id=league_id)
            champ_q = champ_q.filter_by(league_id=league_id)

        preds = pred_q.all()
        champ = champ_q.first()

        total_points = sum(p.total_points for p in preds) + (champ.points_earned if champ else 0)
        correct_results = sum(1 for p in preds if p.pts_result > 0)
        exact_scores = sum(1 for p in preds if p.pts_score > 0)

        ranking_data.append({
            **u.to_dict(),
            'total_points': total_points,
            'correct_results': correct_results,
            'exact_scores': exact_scores,
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
