from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import DivisionMember, League, Jornada, JornadaMatch, PredictionV2

home_bp = Blueprint('home', __name__)


@home_bp.route('/summary', methods=['GET'])
@jwt_required()
def home_summary():
    user_id = int(get_jwt_identity())

    # Check v2 division membership first
    dm = (
        DivisionMember.query
        .filter_by(user_id=user_id)
        .order_by(DivisionMember.joined_at.desc())
        .first()
    )

    if not dm:
        return jsonify({'leagues_summary': [], 'upcoming_matches': []}), 200

    league_id = dm.league_id
    league = db.session.get(League, league_id)

    # Build standings for this division
    from app.divisions import get_division_standings
    standings = get_division_standings(league_id)
    my_row = next((r for r in standings if r['user_id'] == user_id), None)

    division_summary = {
        'league_id': league_id,
        'league_name': league.name if league else 'PickGoal Liga',
        'is_v2': True,
        'rank': my_row['pos'] if my_row else None,
        'member_count': len(standings),
        'pts_division': my_row['pts_division'] if my_row else 0,
        'pts_general': my_row['pts_general'] if my_row else 0,
        'pj': my_row['pj'] if my_row else 0,
        'g': my_row['g'] if my_row else 0,
        'e': my_row['e'] if my_row else 0,
        'p': my_row['p'] if my_row else 0,
        'zone': my_row.get('zone', 'mid') if my_row else 'mid',
    }

    # Next upcoming jornada match for this user
    upcoming_matches = _upcoming_jornada_matches(user_id)

    return jsonify({
        'leagues_summary': [],
        'division_summary': division_summary,
        'upcoming_matches': upcoming_matches,
    }), 200


def _upcoming_jornada_matches(user_id):
    now = datetime.now(timezone.utc)
    jornada = (
        Jornada.query
        .filter(Jornada.status.in_(['active', 'upcoming']))
        .order_by(Jornada.date_start.asc())
        .first()
    )
    if not jornada:
        return []

    jm_list = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()
    predicted_jm_ids = {
        p.jornada_match_id
        for p in PredictionV2.query.filter_by(user_id=user_id).filter(
            PredictionV2.jornada_match_id.in_([jm.id for jm in jm_list])
        ).all()
    }

    result = []
    for jm in jm_list:
        m = jm.match
        dt_utc = m.match_datetime.replace(tzinfo=timezone.utc)
        result.append({
            'match': {
                'id': m.id,
                'home_team': m.home_team,
                'away_team': m.away_team,
                'match_datetime': dt_utc.isoformat(),
                'status': m.status,
            },
            'has_prediction': jm.id in predicted_jm_ids,
        })

    return result
