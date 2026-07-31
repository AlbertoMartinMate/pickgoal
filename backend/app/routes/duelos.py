import random
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Duelo, Jornada, JornadaMatch, Match, PredictionV2, DivisionMember, User

duelos_bp = Blueprint('duelos_v2', __name__)


def _get_active_jornada():
    return Jornada.query.filter_by(status='active').first()


def _get_user_jornada_points(user_id, jornada_id):
    from app.utils import calculate_jornada_points
    return calculate_jornada_points(user_id, jornada_id, commit=False)


def _match_started(match):
    dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
    return match.status != 'scheduled' or datetime.now(timezone.utc) >= dt_utc


def _build_duelo_matches(jornada_id, user_id, rival_id):
    """Per-match list for the duelo: my pick always visible, rival's pick
    only once that specific match has started. Never serializes the
    rival's pick before that, even if the client inspects the raw response."""
    jornada_matches = (
        JornadaMatch.query
        .filter_by(jornada_id=jornada_id)
        .join(JornadaMatch.match)
        .order_by(Match.match_datetime.asc())
        .all()
    )
    if not jornada_matches:
        return []

    jm_ids = [jm.id for jm in jornada_matches]
    my_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=user_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
    }
    rival_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=rival_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
    }

    result = []
    for jm in jornada_matches:
        match = jm.match
        started = _match_started(match)
        my_pred = my_preds.get(jm.id)
        rival_pred = rival_preds.get(jm.id) if started else None

        result.append({
            'jornada_match_id': jm.id,
            'home_team': match.home_team,
            'away_team': match.away_team,
            'match_datetime': match.match_datetime.replace(tzinfo=timezone.utc).isoformat(),
            'status': match.status,
            'home_score_90': match.home_score_90,
            'away_score_90': match.away_score_90,
            'started': started,
            'my_prediction': {
                'predicted_result': my_pred.predicted_result,
                'units_wagered': my_pred.units_wagered,
            } if my_pred else None,
            'rival_prediction': {
                'predicted_result': rival_pred.predicted_result,
                'units_wagered': rival_pred.units_wagered,
            } if rival_pred else None,
        })
    return result


@duelos_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_duelo():
    user_id = int(get_jwt_identity())
    jornada = _get_active_jornada()
    if not jornada:
        return jsonify({'duelo': None}), 200

    from sqlalchemy import or_
    duelo = Duelo.query.filter(
        Duelo.jornada_id == jornada.id,
        or_(Duelo.player1_id == user_id, Duelo.player2_id == user_id)
    ).first()

    if not duelo:
        return jsonify({'duelo': None}), 200

    is_p1 = duelo.player1_id == user_id
    rival_id = duelo.player2_id if is_p1 else duelo.player1_id
    rival = User.query.get(rival_id)

    my_points = _get_user_jornada_points(user_id, jornada.id)
    rival_points = _get_user_jornada_points(rival_id, jornada.id)

    if duelo.winner_id is None:
        status = 'en_curso'
    elif duelo.winner_id == user_id:
        status = 'ganado'
    elif duelo.winner_id == rival_id:
        status = 'perdido'
    else:
        status = 'empate'

    is_bye = duelo.player1_id == duelo.player2_id
    matches = [] if is_bye else _build_duelo_matches(jornada.id, user_id, rival_id)

    return jsonify({
        'duelo': {
            **duelo.to_dict(),
            'rival': {'id': rival.id, 'username': rival.username} if rival else None,
            'my_points': round(my_points, 2),
            'rival_points': round(rival_points, 2),
            'status': status,
            'matches': matches,
        }
    }), 200


def assign_duelos(jornada_id, league_id):
    """
    Assign random duelos for all members of a division league in a jornada.
    Odd number of players → one player gets a bye (plays against a ghost with average points).
    """
    members = DivisionMember.query.filter_by(league_id=league_id).all()
    player_ids = [m.user_id for m in members]
    random.shuffle(player_ids)

    bye_player_id = None
    if len(player_ids) % 2 != 0:
        bye_player_id = player_ids.pop()

    for i in range(0, len(player_ids), 2):
        p1 = player_ids[i]
        p2 = player_ids[i + 1]
        duelo = Duelo(
            jornada_id=jornada_id,
            division_league_id=league_id,
            player1_id=p1,
            player2_id=p2,
        )
        db.session.add(duelo)

    if bye_player_id is not None:
        # Bye player plays against themselves (ghost): use player2_id = player1_id
        bye_duelo = Duelo(
            jornada_id=jornada_id,
            division_league_id=league_id,
            player1_id=bye_player_id,
            player2_id=bye_player_id,
        )
        db.session.add(bye_duelo)

    db.session.commit()
