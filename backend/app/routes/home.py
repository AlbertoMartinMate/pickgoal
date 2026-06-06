from datetime import datetime, timezone, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Match, Prediction, ChampionPrediction, LeagueMember, League
from sqlalchemy import func

home_bp = Blueprint('home', __name__)


def _league_summary(user_id, league):
    """Calcula stats del usuario en una liga específica."""
    # Predicciones del usuario en esta liga
    preds = Prediction.query.filter_by(user_id=user_id, league_id=league.id).all()
    champ = ChampionPrediction.query.filter_by(user_id=user_id, league_id=league.id).first()

    user_pts = sum(p.total_points for p in preds) + (champ.points_earned if champ else 0)
    correct_results = sum(1 for p in preds if p.pts_result > 0)
    exact_scores = sum(1 for p in preds if p.pts_score > 0)
    finished_preds = sum(1 for p in preds if p.total_points is not None)

    # Ranking dentro de la liga
    members = LeagueMember.query.filter_by(league_id=league.id).all()
    member_count = len(members)

    scores = []
    for m in members:
        m_preds = Prediction.query.filter_by(user_id=m.user_id, league_id=league.id).all()
        m_champ = ChampionPrediction.query.filter_by(user_id=m.user_id, league_id=league.id).first()
        pts = sum(p.total_points for p in m_preds) + (m_champ.points_earned if m_champ else 0)
        scores.append((m.user_id, pts))
    scores.sort(key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (uid, _) in enumerate(scores) if uid == user_id), member_count)

    # Próximo partido sin predecir
    now = datetime.now(timezone.utc)
    predicted_ids = {p.match_id for p in preds}
    next_to_predict = None
    for m in Match.query.filter_by(status='scheduled').order_by(Match.match_datetime).all():
        dt_utc = m.match_datetime.replace(tzinfo=timezone.utc)
        if m.id not in predicted_ids and now < dt_utc - timedelta(minutes=30):
            next_to_predict = m.to_dict()
            break

    return {
        'league_id': league.id,
        'league_name': league.name,
        'rank': rank,
        'member_count': member_count,
        'total_points': user_pts,
        'predictions_made': len(preds),
        'correct_results': correct_results,
        'exact_scores': exact_scores,
        'next_to_predict': next_to_predict,
    }


@home_bp.route('/summary', methods=['GET'])
@jwt_required()
def home_summary():
    user_id = int(get_jwt_identity())

    memberships = LeagueMember.query.filter_by(user_id=user_id).all()
    leagues = [League.query.get(m.league_id) for m in memberships if m.league_id]
    leagues = [l for l in leagues if l]

    leagues_summary = [_league_summary(user_id, league) for league in leagues]

    # Próximos 3 partidos globales
    now = datetime.now(timezone.utc)
    upcoming_raw = (
        Match.query
        .filter_by(status='scheduled')
        .filter(Match.match_datetime > now)
        .order_by(Match.match_datetime)
        .limit(3)
        .all()
    )

    # IDs de partidos ya predichos en cualquier liga del usuario
    league_ids = [l.id for l in leagues]
    predicted_any = set(
        p.match_id for p in
        Prediction.query.filter(
            Prediction.user_id == user_id,
            Prediction.league_id.in_(league_ids) if league_ids else False,
        ).all()
    ) if league_ids else set()

    upcoming_matches = [
        {
            'match': m.to_dict(),
            'has_prediction': m.id in predicted_any,
        }
        for m in upcoming_raw
    ]

    return jsonify({
        'leagues_summary': leagues_summary,
        'upcoming_matches': upcoming_matches,
    }), 200
