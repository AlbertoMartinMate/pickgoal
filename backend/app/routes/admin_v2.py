"""
Admin V2 — gestión manual de jornadas semanales.
Todos los endpoints requieren JWT y usuario admin.
"""

from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Match, Jornada, JornadaMatch, Season, Competition

admin_v2_bp = Blueprint('admin_v2', __name__)

COMP_META = {
    'PD': {'name': 'LaLiga',           'weight': 8, 'max_per_jornada': 4},
    'PL': {'name': 'Premier League',   'weight': 8, 'max_per_jornada': 4},
    'CL': {'name': 'Champions League', 'weight': 10, 'max_per_jornada': 4},
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
            result[code] = [_serialize_api_match(m, code) for m in matches]
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
