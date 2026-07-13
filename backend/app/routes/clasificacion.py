from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models import User, DivisionMember, get_user_status

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
        .filter(User.is_bot == False)
        .group_by(DivisionMember.user_id)
        .order_by(func.sum(DivisionMember.season_total_points).desc())
        .limit(100)
        .all()
    )

    standings = []
    for i, row in enumerate(results):
        user = User.query.get(row.user_id)
        if not user:
            continue
        standings.append({
            'pos': i + 1,
            'user_id': user.id,
            'username': user.username,
            'country': user.country,
            'pts_general': round(row.total or 0, 2),
            'pts_division': int(row.div_pts or 0),
            'status': get_user_status(user.total_points_all_time or 0),
        })

    return jsonify({'standings': standings}), 200
