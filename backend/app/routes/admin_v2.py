"""
Admin V2 — gestión manual de jornadas semanales.
Todos los endpoints requieren JWT y usuario admin.
"""

import logging
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Match, Jornada, JornadaMatch, Season, Competition, PredictionV2

admin_v2_bp = Blueprint('admin_v2', __name__)
logger = logging.getLogger(__name__)

COMP_META = {
    'PD':  {'name': 'LaLiga',             'weight': 8,  'max_per_jornada': 4},
    'PL':  {'name': 'Premier League',     'weight': 8,  'max_per_jornada': 4},
    'CL':  {'name': 'Champions League',   'weight': 10, 'max_per_jornada': 4, 'max_display': 5},
    'SA':  {'name': 'Serie A',            'weight': 7,  'max_per_jornada': 4},
    'BL1': {'name': 'Bundesliga',         'weight': 7,  'max_per_jornada': 4},
    'FL1': {'name': 'Ligue 1',            'weight': 6,  'max_per_jornada': 4},
    'PPL': {'name': 'Primeira Liga',      'weight': 6,  'max_per_jornada': 4},
}


def _require_admin():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    if not user or not user.is_admin:
        return None, jsonify({'error': 'Acceso denegado'}), 403
    return user, None, None


def _get_or_create_competition(code):
    comp = Competition.query.filter_by(code=code).first()
    if not comp:
        meta = COMP_META.get(code, {'name': code, 'weight': 5, 'max_per_jornada': 4})
        comp = Competition(code=code, name=meta['name'],
                           weight=meta['weight'], max_per_jornada=meta['max_per_jornada'])
        db.session.add(comp)
        db.session.flush()
    return comp


def _week_range(semana: str):
    """'YYYY-WW' → (date_from: date, date_to: date) Monday–Sunday."""
    monday = datetime.strptime(f'{semana}-1', '%G-W%V-%u').date()
    sunday = monday + timedelta(days=6)
    return monday, sunday


# ─── GET /api/v2/admin/partidos-disponibles?semana=YYYY-WW ───────────────────

@admin_v2_bp.route('/partidos-disponibles', methods=['GET'])
@jwt_required()
def partidos_disponibles():
    user, err, code = _require_admin()
    if err:
        return err, code

    semana = request.args.get('semana', '').strip()
    if not semana:
        return jsonify({'error': 'Parámetro semana requerido (YYYY-WW)'}), 400

    try:
        date_from, date_to = _week_range(semana)
    except ValueError:
        return jsonify({'error': 'Formato de semana inválido. Usa YYYY-WW'}), 400

    import os
    import requests as req

    base = 'https://api.football-data.org/v4'
    headers = {'X-Auth-Token': os.environ.get('FOOTBALL_API_KEY', '')}

    result = {}
    for code in COMP_META:
        try:
            resp = req.get(
                f'{base}/competitions/{code}/matches',
                params={'dateFrom': date_from.isoformat(), 'dateTo': date_to.isoformat()},
                headers=headers,
                timeout=15,
            )
            resp.raise_for_status()
            matches = resp.json().get('matches', [])
            serialized = [_serialize_api_match(m, code) for m in matches]
            max_display = COMP_META.get(code, {}).get('max_display')
            result[code] = serialized[:max_display] if max_display else serialized
        except Exception as e:
            result[code] = []
            import logging
            logging.getLogger(__name__).warning('Error fetching %s: %s', code, e)

    total = sum(len(v) for v in result.values())
    return jsonify({'semana': semana, 'date_from': date_from.isoformat(),
                    'date_to': date_to.isoformat(), 'matches': result, 'total': total})


def _serialize_api_match(m, comp_code):
    return {
        'api_id': m['id'],
        'competition_code': comp_code,
        'home_team': m['homeTeam'].get('name') or m['homeTeam'].get('shortName') or 'TBD',
        'away_team': m['awayTeam'].get('name') or m['awayTeam'].get('shortName') or 'TBD',
        'match_datetime': m.get('utcDate'),
        'status': m.get('status', 'SCHEDULED'),
    }


# ─── POST /api/v2/admin/jornada/<id>/publish ────────────────────────────────

@admin_v2_bp.route('/jornada/<int:jornada_id>/publish', methods=['POST'])
@jwt_required()
def publish_jornada(jornada_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jornada = db.session.get(Jornada, jornada_id)
    if not jornada:
        return jsonify({'error': 'Jornada no encontrada'}), 404
    if jornada.status != 'draft':
        return jsonify({'error': f'La jornada ya está en estado {jornada.status}'}), 400

    from app.utils import calculate_odds
    from app.routes.duelos import assign_duelos
    from app.models import DivisionMember, PushSubscription
    from app.routes.notifications import send_push_notification

    step = 'init'
    try:
        now = datetime.now(timezone.utc)

        step = 'calcular_cuotas'
        jm_list = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()
        logger.info('[publish] jornada %d: calculando cuotas para %d partidos', jornada.id, len(jm_list))
        for jm in jm_list:
            if jm.odds_1 is None:
                try:
                    o1, ox, o2 = calculate_odds(jm.match)
                except Exception as odds_exc:
                    logger.warning('[publish] jornada %d: calculate_odds falló para match %d (%s), uso cuotas por defecto',
                                    jornada.id, jm.match_id, odds_exc)
                    o1, ox, o2 = 2.50, 3.20, 2.80
                jm.odds_1 = o1
                jm.odds_x = ox
                jm.odds_2 = o2
                jm.calculated_at = now
        logger.info('[publish] jornada %d: cuotas calculadas OK', jornada.id)

        step = 'actualizar_status'
        jornada.status = 'upcoming'
        db.session.commit()
        logger.info('[publish] jornada %d: status -> upcoming', jornada.id)

        step = 'asignar_duelos'
        active_league_ids = {dm.league_id for dm in DivisionMember.query.all()}
        logger.info('[publish] jornada %d: %d ligas activas', jornada.id, len(active_league_ids))
        duelos_errors = []
        for lid in active_league_ids:
            try:
                assign_duelos(jornada.id, lid)
                logger.info('[publish] jornada %d: duelos asignados OK liga %d', jornada.id, lid)
            except Exception as e:
                logger.exception('[publish] jornada %d: fallo asignando duelos liga %d', jornada.id, lid)
                duelos_errors.append(f'Liga {lid}: {e}')

        step = 'enviar_push'
        user_ids = {uid for (uid,) in db.session.query(PushSubscription.user_id).distinct().all()}
        title = '⚽ PickGoal — Nueva jornada disponible'
        body = f'La jornada {jornada.number} ya está abierta. ¡Haz tus predicciones!'
        logger.info('[publish] jornada %d: enviando push a %d usuarios', jornada.id, len(user_ids))
        push_sent = 0
        for uid in user_ids:
            try:
                push_sent += send_push_notification(uid, title, body)
            except Exception:
                logger.exception('[publish] jornada %d: fallo enviando push a usuario %d', jornada.id, uid)
        logger.info('[publish] jornada %d: push enviado a %d/%d usuarios', jornada.id, push_sent, len(user_ids))

    except Exception as e:
        logger.exception('[publish] jornada %d: fallo en paso "%s"', jornada.id, step)
        return jsonify({'error': str(e), 'step': step}), 500

    return jsonify({
        'message': f'Jornada {jornada.number} publicada',
        'odds_calculated': len(jm_list),
        'duelos_leagues': len(active_league_ids),
        'push_sent': push_sent,
        'duelos_errors': duelos_errors,
    }), 200


# ─── GET /api/v2/admin/jornadas ──────────────────────────────────────────────

@admin_v2_bp.route('/jornadas', methods=['GET'])
@jwt_required()
def list_jornadas():
    user, err, code = _require_admin()
    if err:
        return err, code

    jornadas = Jornada.query.order_by(Jornada.number.desc()).all()
    out = []
    for j in jornadas:
        match_count = JornadaMatch.query.filter_by(jornada_id=j.id).count()
        out.append({**j.to_dict(), 'match_count': match_count})
    return jsonify({'jornadas': out})


# ─── POST /api/v2/admin/jornada ──────────────────────────────────────────────

@admin_v2_bp.route('/jornada', methods=['POST'])
@jwt_required()
def create_jornada():
    user, err, code = _require_admin()
    if err:
        return err, code

    data = request.get_json() or {}
    number = data.get('number')
    date_start_str = data.get('date_start')
    date_end_str = data.get('date_end')
    matches_payload = data.get('matches', [])  # list of {api_id, home_team, away_team, match_datetime, competition_code}

    if not all([number, date_start_str, date_end_str]):
        return jsonify({'error': 'number, date_start y date_end son obligatorios'}), 400
    if not matches_payload or len(matches_payload) != 10:
        return jsonify({'error': 'Debes seleccionar exactamente 10 partidos'}), 400

    try:
        date_start = datetime.fromisoformat(date_start_str.replace('Z', '+00:00'))
        date_end = datetime.fromisoformat(date_end_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido'}), 400

    if Jornada.query.filter_by(number=number).first():
        return jsonify({'error': f'Ya existe una jornada con número {number}'}), 409

    season = Season.query.filter(Season.status.in_(['active', 'upcoming'])).order_by(Season.id.desc()).first()
    if not season:
        return jsonify({'error': 'No hay temporada activa o upcoming'}), 400

    jornada = Jornada(
        season_id=season.id,
        number=number,
        date_start=date_start.replace(tzinfo=None),
        date_end=date_end.replace(tzinfo=None),
        status='draft',
    )
    db.session.add(jornada)
    db.session.flush()

    _upsert_jornada_matches(jornada.id, matches_payload)
    db.session.commit()

    return jsonify({'jornada': {**jornada.to_dict(), 'match_count': len(matches_payload)}}), 201


# ─── PUT /api/v2/admin/jornada/<id> ─────────────────────────────────────────

@admin_v2_bp.route('/jornada/<int:jornada_id>', methods=['PUT'])
@jwt_required()
def update_jornada(jornada_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jornada = db.session.get(Jornada, jornada_id)
    if not jornada:
        return jsonify({'error': 'Jornada no encontrada'}), 404
    if jornada.status != 'draft':
        return jsonify({'error': 'Solo se pueden editar jornadas en estado draft'}), 400

    data = request.get_json() or {}
    if 'date_start' in data:
        jornada.date_start = datetime.fromisoformat(data['date_start'].replace('Z', '+00:00')).replace(tzinfo=None)
    if 'date_end' in data:
        jornada.date_end = datetime.fromisoformat(data['date_end'].replace('Z', '+00:00')).replace(tzinfo=None)
    if 'number' in data:
        jornada.number = data['number']

    matches_payload = data.get('matches')
    if matches_payload is not None:
        if len(matches_payload) != 10:
            return jsonify({'error': 'Debes seleccionar exactamente 10 partidos'}), 400
        JornadaMatch.query.filter_by(jornada_id=jornada.id).delete()
        _upsert_jornada_matches(jornada.id, matches_payload)

    db.session.commit()
    match_count = JornadaMatch.query.filter_by(jornada_id=jornada.id).count()
    return jsonify({'jornada': {**jornada.to_dict(), 'match_count': match_count}})


# ─── DELETE /api/v2/admin/jornada/<id> (solo drafts) ────────────────────────

@admin_v2_bp.route('/jornada/<int:jornada_id>', methods=['DELETE'])
@jwt_required()
def delete_jornada(jornada_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jornada = db.session.get(Jornada, jornada_id)
    if not jornada:
        return jsonify({'error': 'Jornada no encontrada'}), 404
    if jornada.status != 'draft':
        return jsonify({'error': 'Solo se pueden eliminar jornadas en estado draft'}), 400

    JornadaMatch.query.filter_by(jornada_id=jornada.id).delete()
    db.session.delete(jornada)
    db.session.commit()
    return jsonify({'message': f'Jornada {jornada.number} eliminada'})


# ─── GET /api/v2/admin/jornada/<id>/matches ─────────────────────────────────

@admin_v2_bp.route('/jornada/<int:jornada_id>/matches', methods=['GET'])
@jwt_required()
def get_jornada_matches_admin(jornada_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jornada = db.session.get(Jornada, jornada_id)
    if not jornada:
        return jsonify({'error': 'Jornada no encontrada'}), 404

    jm_list = JornadaMatch.query.filter_by(jornada_id=jornada_id).all()
    matches_data = []
    for jm in jm_list:
        m = jm.match
        matches_data.append({
            'jornada_match_id': jm.id,
            'match_id': m.id,
            'home_team': m.home_team,
            'away_team': m.away_team,
            'match_datetime': m.match_datetime.replace(tzinfo=timezone.utc).isoformat(),
            'status': m.status,
            'jm_status': jm.status,
            'home_score_90': m.home_score_90,
            'away_score_90': m.away_score_90,
            'result_90': m.result_90,
            'odds_1': jm.odds_1,
            'odds_x': jm.odds_x,
            'odds_2': jm.odds_2,
        })
    return jsonify({'jornada': jornada.to_dict(), 'matches': matches_data})


# ─── POST /api/v2/admin/jornada-match/<id>/resultado ────────────────────────

@admin_v2_bp.route('/jornada-match/<int:jm_id>/resultado', methods=['POST'])
@jwt_required()
def set_jornada_match_resultado(jm_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jm = db.session.get(JornadaMatch, jm_id)
    if not jm:
        return jsonify({'error': 'Partido no encontrado'}), 404
    if jm.status == 'cancelled':
        return jsonify({'error': 'El partido está cancelado'}), 400

    data = request.get_json() or {}
    home = data.get('home_score')
    away = data.get('away_score')
    result_90_override = data.get('result_90')

    if home is None or away is None:
        return jsonify({'error': 'Se requieren home_score y away_score'}), 400
    try:
        home, away = int(home), int(away)
    except (TypeError, ValueError):
        return jsonify({'error': 'Los marcadores deben ser números enteros'}), 400
    if result_90_override is not None and result_90_override not in ('1', 'X', '2'):
        return jsonify({'error': 'result_90 debe ser 1, X o 2'}), 400

    from app.utils import recalculate_v2_for_match, compute_result_90

    match = jm.match
    match.home_score_90 = home
    match.away_score_90 = away
    match.home_score_final = home
    match.away_score_final = away
    match.result_90 = result_90_override if result_90_override is not None else compute_result_90(home, away)
    match.status = 'finished'
    jm.status = 'finished'
    db.session.commit()

    recalculate_v2_for_match(match)

    return jsonify({'message': 'Resultado guardado y puntos recalculados'}), 200


# ─── POST /api/v2/admin/jornada-match/<id>/cancel ───────────────────────────

@admin_v2_bp.route('/jornada-match/<int:jm_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_jornada_match(jm_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jm = db.session.get(JornadaMatch, jm_id)
    if not jm:
        return jsonify({'error': 'Partido no encontrado'}), 404
    if jm.status == 'cancelled':
        return jsonify({'error': 'El partido ya está cancelado'}), 400

    jm.status = 'cancelled'
    db.session.commit()

    from app.utils import calculate_jornada_points

    user_ids = {p.user_id for p in PredictionV2.query.filter_by(jornada_match_id=jm_id).all()}
    for uid in user_ids:
        calculate_jornada_points(uid, jm.jornada_id, commit=False)
    db.session.commit()

    return jsonify({'message': f'Partido cancelado. {len(user_ids)} usuario(s) afectado(s).'}), 200


# ─── Helper ──────────────────────────────────────────────────────────────────

def _upsert_jornada_matches(jornada_id, matches_payload):
    for mp in matches_payload:
        api_id = mp['api_id']
        comp_code = mp.get('competition_code', 'PD')
        comp = _get_or_create_competition(comp_code)

        match = Match.query.filter_by(api_id=api_id).first()
        if not match:
            dt_str = mp.get('match_datetime', '')
            try:
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00')).replace(tzinfo=None)
            except (ValueError, AttributeError):
                dt = datetime.now(timezone.utc).replace(tzinfo=None)

            match = Match(
                api_id=api_id,
                phase='group',
                home_team=mp.get('home_team', 'TBD'),
                away_team=mp.get('away_team', 'TBD'),
                match_datetime=dt,
                status='scheduled',
                competition_id=comp.id,
            )
            db.session.add(match)
            db.session.flush()
        else:
            if comp.id and match.competition_id != comp.id:
                match.competition_id = comp.id

        if not JornadaMatch.query.filter_by(jornada_id=jornada_id, match_id=match.id).first():
            db.session.add(JornadaMatch(
                jornada_id=jornada_id,
                match_id=match.id,
            ))
