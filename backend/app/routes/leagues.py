from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError
from jwt.exceptions import InvalidTokenError
from app import db
from app.models import League, LeagueMember, User, Prediction
from app.utils import generate_invite_code

leagues_bp = Blueprint('leagues', __name__)

SITE_URL = 'https://pickgoal.es'


def league_ranking(league_id):
    members = LeagueMember.query.filter_by(league_id=league_id).all()
    ranking = []
    for m in members:
        user = User.query.get(m.user_id)
        if user:
            ranking.append({
                **user.to_dict(),
                'total_points': user.total_points(),
                'joined_at': m.joined_at.isoformat(),
            })
    ranking.sort(key=lambda x: x['total_points'], reverse=True)
    for i, entry in enumerate(ranking):
        entry['position'] = i + 1
    return ranking


@leagues_bp.route('/all', methods=['GET'])
def list_all_leagues():
    """Devuelve todas las ligas (públicas y privadas) sin exponer invite_code."""
    leagues = League.query.order_by(League.is_official.desc(), League.created_at.desc()).all()
    return jsonify({'leagues': [l.to_dict() for l in leagues]}), 200


@leagues_bp.route('/public', methods=['GET'])
def list_public_leagues():
    leagues = League.query.filter_by(is_public=True).order_by(League.created_at.desc()).all()
    return jsonify({'leagues': [l.to_dict() for l in leagues]}), 200


@leagues_bp.route('/', methods=['POST'])
@jwt_required()
def create_league():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'El nombre de la liga es obligatorio'}), 400

    description = data.get('description', '').strip() or None
    is_public = bool(data.get('is_public', True))
    prize = data.get('prize', '').strip() or None

    # is_official only settable by admins
    is_official = bool(data.get('is_official', False)) if user.is_admin else False

    invite_code = generate_invite_code()
    invite_link = f'{SITE_URL}/#/unirse?codigo={invite_code}'

    league = League(
        name=name,
        description=description,
        created_by=user_id,
        is_public=is_public,
        is_official=is_official,
        prize=prize,
        invite_code=invite_code,
    )
    db.session.add(league)
    db.session.flush()

    member = LeagueMember(league_id=league.id, user_id=user_id)
    db.session.add(member)
    db.session.commit()

    result = league.to_dict(include_code=True)
    result['invite_link'] = invite_link
    return jsonify({'league': result}), 201


@leagues_bp.route('/join', methods=['POST'])
@jwt_required()
def join_league():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    league_id = data.get('league_id')
    invite_code = data.get('invite_code', '').strip().upper()

    if league_id:
        league = League.query.get_or_404(league_id)
        if not league.is_public:
            return jsonify({'error': 'Liga privada, usa el enlace de invitación'}), 403
    elif invite_code:
        league = League.query.filter_by(invite_code=invite_code).first()
        if not league:
            return jsonify({'error': 'Código de invitación inválido'}), 404
    else:
        return jsonify({'error': 'Proporciona league_id o invite_code'}), 400

    already = LeagueMember.query.filter_by(league_id=league.id, user_id=user_id).first()
    if already:
        return jsonify({'error': 'Ya eres miembro de esta liga'}), 409

    member = LeagueMember(league_id=league.id, user_id=user_id)
    db.session.add(member)
    db.session.commit()
    return jsonify({'league': league.to_dict()}), 200


@leagues_bp.route('/join/<string:codigo>', methods=['GET'])
@jwt_required()
def join_by_code(codigo):
    """Unirse a una liga mediante código de invitación (GET)."""
    user_id = int(get_jwt_identity())
    code = codigo.strip().upper()

    league = League.query.filter_by(invite_code=code).first()
    if not league:
        return jsonify({'error': 'Código de invitación inválido'}), 404

    already = LeagueMember.query.filter_by(league_id=league.id, user_id=user_id).first()
    if already:
        return jsonify({'error': 'Ya eres miembro de esta liga', 'league': league.to_dict()}), 409

    member = LeagueMember(league_id=league.id, user_id=user_id)
    db.session.add(member)
    db.session.commit()
    return jsonify({'league': league.to_dict()}), 200


@leagues_bp.route('/<int:league_id>', methods=['GET'])
@jwt_required()
def get_league(league_id):
    user_id = int(get_jwt_identity())
    league = League.query.get_or_404(league_id)

    is_member = LeagueMember.query.filter_by(
        league_id=league_id, user_id=user_id
    ).first() is not None

    if not league.is_public and not is_member:
        return jsonify({'error': 'Acceso denegado'}), 403

    # Any member can see the invite code (to share)
    include_code = is_member
    result = league.to_dict(include_code=include_code)
    if is_member and league.invite_code:
        result['invite_link'] = f'{SITE_URL}/#/unirse?codigo={league.invite_code}'

    return jsonify({
        'league': result,
        'ranking': league_ranking(league_id),
        'is_member': is_member,
    }), 200


@leagues_bp.route('/<int:league_id>/leave', methods=['DELETE'])
@jwt_required()
def leave_league(league_id):
    user_id = int(get_jwt_identity())
    member = LeagueMember.query.filter_by(
        league_id=league_id, user_id=user_id
    ).first_or_404()
    db.session.delete(member)
    db.session.commit()
    return jsonify({'message': 'Has abandonado la liga'}), 200


@leagues_bp.route('/my', methods=['GET'])
@jwt_required()
def my_leagues():
    user_id = int(get_jwt_identity())
    memberships = LeagueMember.query.filter_by(user_id=user_id).all()
    result = []
    for m in memberships:
        league = League.query.get(m.league_id)
        if league:
            # Members always get the invite code for sharing
            data = league.to_dict(include_code=True)
            data['invite_link'] = f'{SITE_URL}/#/unirse?codigo={league.invite_code}'
            result.append(data)
    return jsonify({'leagues': result}), 200


@leagues_bp.route('/<int:league_id>/predictions/<int:match_id>', methods=['GET'])
@jwt_required()
def league_match_predictions(league_id, match_id):
    user_id = int(get_jwt_identity())
    from app.models import Match

    is_member = LeagueMember.query.filter_by(
        league_id=league_id, user_id=user_id
    ).first() is not None
    if not is_member:
        return jsonify({'error': 'Acceso denegado'}), 403

    match = Match.query.get_or_404(match_id)
    reveal = match.status == 'finished'

    member_ids = [m.user_id for m in LeagueMember.query.filter_by(league_id=league_id).all()]
    preds = Prediction.query.filter(
        Prediction.match_id == match_id,
        Prediction.user_id.in_(member_ids)
    ).all()

    result = []
    for p in preds:
        user = User.query.get(p.user_id)
        data = p.to_dict(reveal_score=reveal)
        data['username'] = user.username if user else 'Desconocido'
        result.append(data)

    return jsonify({'predictions': result, 'revealed': reveal}), 200
