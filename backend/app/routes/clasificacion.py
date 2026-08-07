from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models import User, DivisionMember, League, Jornada, get_user_status

clasificacion_bp = Blueprint('clasificacion_v2', __name__)


@clasificacion_bp.route('/division', methods=['GET'])
@jwt_required()
def division_standings():
    user_id = int(get_jwt_identity())

    # Allow explicit league_id override via query param
    league_id = request.args.get('league_id', type=int)

    if not league_id:
        dm = (
            DivisionMember.query
            .filter_by(user_id=user_id)
            .order_by(DivisionMember.joined_at.desc())
            .first()
        )
        if not dm:
            return jsonify({'standings': [], 'league_id': None}), 200
        league_id = dm.league_id

    from app.divisions import get_division_standings
    standings = get_division_standings(league_id)

    return jsonify({
        'league_id': league_id,
        'standings': standings,
    }), 200


@clasificacion_bp.route('/general', methods=['GET'])
def general_standings():
    """Top 100 real users by accumulated V2 season_total_points across all leagues."""
    results = (
        db.session.query(
            DivisionMember.user_id,
            func.sum(DivisionMember.season_total_points).label('total'),
            func.sum(DivisionMember.season_div_points).label('div_pts'),
        )
        .join(User, User.id == DivisionMember.user_id)
        .group_by(DivisionMember.user_id)
        .order_by(func.sum(DivisionMember.season_total_points).desc())
        .limit(100)
        .all()
    )

    active_jornada = Jornada.query.filter_by(status='active').first()

    standings = []
    for i, row in enumerate(results):
        user = User.query.get(row.user_id)
        if not user:
            continue

        pts_jornada_actual = 0.0
        if active_jornada:
            from app.utils import calculate_jornada_points
            pts_jornada_actual = calculate_jornada_points(user.id, active_jornada.id, commit=False)

        standings.append({
            'pos': i + 1,
            'user_id': user.id,
            'username': user.username,
            'country': user.country,
            'is_bot': user.is_bot,
            'pts_general': round(row.total or 0, 2),
            'pts_division': int(row.div_pts or 0),
            'pts_jornada_actual': round(pts_jornada_actual, 2),
            'status': get_user_status(user.total_points_all_time or 0),
        })

    return jsonify({'standings': standings}), 200


@clasificacion_bp.route('/all-divisions', methods=['GET'])
@jwt_required()
def all_divisions():
    from app.divisions import get_division_standings

    league_ids = [
        lid for (lid,) in
        db.session.query(DivisionMember.league_id)
        .distinct()
        .order_by(DivisionMember.league_id.asc())
        .all()
    ]

    divisions = []
    for i, lid in enumerate(league_ids, 1):
        league = db.session.get(League, lid)
        standings = get_division_standings(lid)
        if not standings:
            continue
        divisions.append({
            'division_number': i,
            'league_id': lid,
            'league_name': league.name if league else f'División {i}',
            'standings': standings,
        })

    return jsonify({'divisions': divisions}), 200
