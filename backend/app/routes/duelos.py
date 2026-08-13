import random
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Duelo, Jornada, JornadaMatch, Match, PredictionV2, DivisionMember, User, DueloCalendar

duelos_bp = Blueprint('duelos_v2', __name__)


def _get_active_jornada():
    """Earliest jornada open for predictions. 'upcoming' and 'active' are
    equivalent for the user — the real per-match lock is `match.is_locked()`."""
    return (
        Jornada.query
        .filter(Jornada.status.in_(['active', 'upcoming']))
        .order_by(Jornada.date_start.asc())
        .first()
    )


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


@duelos_bp.route('/list', methods=['GET'])
@jwt_required()
def list_duelos():
    user_id = int(get_jwt_identity())

    from sqlalchemy import or_
    duelos = (
        Duelo.query
        .filter(or_(Duelo.player1_id == user_id, Duelo.player2_id == user_id))
        .join(Duelo.jornada)
        .order_by(Jornada.number.asc())
        .all()
    )

    result = []
    for duelo in duelos:
        jornada = duelo.jornada
        is_p1 = duelo.player1_id == user_id
        rival_id = duelo.player2_id if is_p1 else duelo.player1_id
        rival = User.query.get(rival_id)
        is_bye = duelo.player1_id == duelo.player2_id

        my_points = duelo.points_player1 if is_p1 else duelo.points_player2
        rival_points = duelo.points_player2 if is_p1 else duelo.points_player1

        if duelo.winner_id is None and jornada.status != 'finished':
            status = 'en_curso'
        elif duelo.winner_id == user_id:
            status = 'ganado'
        elif duelo.winner_id == rival_id:
            status = 'perdido'
        else:
            status = 'empate'

        result.append({
            'jornada_id': jornada.id,
            'jornada_number': jornada.number,
            'jornada_date_start': jornada.date_start.replace(tzinfo=timezone.utc).isoformat(),
            'jornada_date_end': jornada.date_end.replace(tzinfo=timezone.utc).isoformat(),
            'jornada_status': jornada.status,
            'duelo_id': duelo.id,
            'rival': {'id': rival.id, 'username': rival.username} if rival and not is_bye else None,
            'is_bye': is_bye,
            'my_points': round(my_points or 0, 2),
            'rival_points': round(rival_points or 0, 2),
            'status': status,
            'division_league_id': duelo.division_league_id,
        })

    return jsonify({'duelos': result}), 200


@duelos_bp.route('/current/detail', methods=['GET'])
@jwt_required()
def get_current_duelo_detail():
    user_id = int(get_jwt_identity())
    jornada = _get_active_jornada()
    if not jornada:
        return jsonify({'detail': None}), 200

    from sqlalchemy import or_
    duelo = Duelo.query.filter(
        Duelo.jornada_id == jornada.id,
        or_(Duelo.player1_id == user_id, Duelo.player2_id == user_id)
    ).first()
    if not duelo:
        return jsonify({'detail': None}), 200

    is_p1 = duelo.player1_id == user_id
    rival_id = duelo.player2_id if is_p1 else duelo.player1_id
    is_bye = duelo.player1_id == duelo.player2_id

    jm_list = (
        JornadaMatch.query
        .filter_by(jornada_id=jornada.id)
        .join(JornadaMatch.match)
        .order_by(Match.match_datetime.asc())
        .all()
    )
    jm_ids = [jm.id for jm in jm_list]

    def _compute(uid, reveal_unbet):
        preds = {
            p.jornada_match_id: p
            for p in PredictionV2.query.filter_by(user_id=uid)
                .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
        }
        points_earned = 0.0
        units_at_stake = 0
        total_wagered = 0

        for jm in jm_list:
            if jm.status == 'cancelled':
                continue
            pred = preds.get(jm.id)
            if not pred:
                continue
            finished = jm.match.status == 'finished'
            total_wagered += pred.units_wagered
            if finished:
                points_earned += pred.points_earned or 0.0
            else:
                # Includes both not-yet-started and in-progress matches
                units_at_stake += pred.units_wagered

        return {
            'points_earned': round(points_earned, 2),
            'units_at_stake': units_at_stake,
            'units_unbet': (20 - total_wagered) if reveal_unbet else None,
        }

    me_detail = _compute(user_id, reveal_unbet=True)
    rival_detail = _compute(rival_id, reveal_unbet=False) if not is_bye else None

    return jsonify({
        'detail': {
            'me': me_detail,
            'rival': rival_detail,
            'is_bye': is_bye,
        }
    }), 200


def _round_robin_schedule(player_ids):
    """Return N-1 rounds of pairs for N players using the circle method.

    Each round is a list of (p1, p2) tuples. p2 is None when the player gets
    a bye (only possible when len(player_ids) is odd).
    """
    players = list(player_ids)
    n = len(players)
    if n % 2 == 1:
        players.append(None)  # sentinel for bye
        n += 1

    fixed = players[0]
    rotating = players[1:]  # length n-1

    rounds = []
    for _ in range(n - 1):
        pairs = [(fixed, rotating[-1])]
        half = (n - 2) // 2
        for i in range(half):
            pairs.append((rotating[i], rotating[n - 3 - i]))
        rounds.append(pairs)
        # Rotate circle: bring last element to front
        rotating = [rotating[-1]] + rotating[:-1]

    return rounds


def _generate_calendar(league_id, vuelta):
    """Generate and persist the full round-robin calendar for one vuelta."""
    # Clear any stale calendar for this league+vuelta (idempotent)
    DueloCalendar.query.filter_by(league_id=league_id, vuelta=vuelta).delete()

    members = DivisionMember.query.filter_by(league_id=league_id).all()
    player_ids = [m.user_id for m in members]
    random.shuffle(player_ids)  # different draw each vuelta

    rounds = _round_robin_schedule(player_ids)
    for round_idx, pairs in enumerate(rounds):
        round_number = round_idx + 1
        for p1, p2 in pairs:
            bye_player = p1 if p2 is None else (p2 if p1 is None else None)
            if bye_player is not None:
                db.session.add(DueloCalendar(
                    league_id=league_id,
                    vuelta=vuelta,
                    round_number=round_number,
                    player1_id=bye_player,
                    player2_id=None,
                ))
            else:
                db.session.add(DueloCalendar(
                    league_id=league_id,
                    vuelta=vuelta,
                    round_number=round_number,
                    player1_id=p1,
                    player2_id=p2,
                ))
    db.session.flush()


def assign_duelos(jornada_id, league_id):
    """Assign duelos for a jornada using a pre-generated round-robin calendar.

    On the first round of each vuelta the full 15-round schedule is generated
    and stored in DueloCalendar. Subsequent rounds look up the stored schedule,
    ensuring each player faces every other player exactly once per vuelta.
    """
    from app.divisions import ROTATION_JORNADAS

    # Guard: skip if duelos already exist for this jornada+league
    if Duelo.query.filter_by(jornada_id=jornada_id, division_league_id=league_id).first():
        return

    jornada = Jornada.query.get(jornada_id)
    if not jornada:
        return

    vuelta = (jornada.number - 1) // ROTATION_JORNADAS + 1
    round_in_vuelta = (jornada.number - 1) % ROTATION_JORNADAS + 1

    if round_in_vuelta == 1:
        _generate_calendar(league_id, vuelta)

    entries = DueloCalendar.query.filter_by(
        league_id=league_id,
        vuelta=vuelta,
        round_number=round_in_vuelta,
    ).all()

    for entry in entries:
        if entry.player2_id is None:
            # Bye: player plays against themselves
            db.session.add(Duelo(
                jornada_id=jornada_id,
                division_league_id=league_id,
                player1_id=entry.player1_id,
                player2_id=entry.player1_id,
            ))
        else:
            db.session.add(Duelo(
                jornada_id=jornada_id,
                division_league_id=league_id,
                player1_id=entry.player1_id,
                player2_id=entry.player2_id,
            ))

    db.session.commit()
