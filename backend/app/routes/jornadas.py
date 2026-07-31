from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Jornada, JornadaMatch, PredictionV2, Duelo, User

jornadas_bp = Blueprint('jornadas_v2', __name__)

MAX_UNITS = 20
MAX_UNITS_PER_MATCH = 5


def _get_active_jornada():
    return Jornada.query.filter_by(status='active').first()


@jornadas_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_jornada():
    user_id = int(get_jwt_identity())
    jornada = _get_active_jornada()
    if not jornada:
        next_jornada = (
            Jornada.query.filter_by(status='upcoming')
            .order_by(Jornada.date_start.asc())
            .first()
        )
        return jsonify({
            'jornada': None,
            'next_jornada': next_jornada.to_dict() if next_jornada else None,
        }), 200

    jornada_matches = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()

    # Units used by this user in this jornada
    user_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=user_id).filter(
            PredictionV2.jornada_match_id.in_([jm.id for jm in jornada_matches])
        ).all()
    }
    units_used = sum(p.units_wagered for p in user_preds.values())

    matches_data = []
    for jm in jornada_matches:
        match = jm.match
        dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
        pred = user_preds.get(jm.id)
        matches_data.append({
            'jornada_match_id': jm.id,
            'match_id': match.id,
            'home_team': match.home_team,
            'away_team': match.away_team,
            'match_datetime': dt_utc.isoformat(),
            'status': match.status,
            'result_90': match.result_90,
            'home_score_90': match.home_score_90,
            'away_score_90': match.away_score_90,
            'odds_1': jm.odds_1,
            'odds_x': jm.odds_x,
            'odds_2': jm.odds_2,
            'predict_locked': match.is_locked(),
            'opens_until': (dt_utc - timedelta(minutes=30)).isoformat(),
            'prediction': pred.to_dict() if pred else None,
        })

    return jsonify({
        'jornada': jornada.to_dict(),
        'matches': matches_data,
        'units_used': units_used,
        'units_disponibles': MAX_UNITS - units_used,
    }), 200


@jornadas_bp.route('/predict', methods=['POST'])
@jwt_required()
def save_prediction():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    jornada_match_id = data.get('jornada_match_id')
    predicted_result = data.get('predicted_result')
    units = data.get('units', 1)

    jornada = _get_active_jornada()
    if not jornada:
        return jsonify({'error': 'No hay jornada activa'}), 400

    jm = JornadaMatch.query.filter_by(id=jornada_match_id, jornada_id=jornada.id).first()
    if not jm:
        return jsonify({'error': f'Partido {jornada_match_id} no pertenece a la jornada activa'}), 400

    if jm.match.is_locked():
        return jsonify({'error': 'Este partido ya está bloqueado'}), 403

    if predicted_result not in ('1', 'X', '2'):
        return jsonify({'error': 'Resultado inválido'}), 400

    if not isinstance(units, int) or units < 0 or units > MAX_UNITS_PER_MATCH:
        return jsonify({'error': f'Unidades inválidas (0-{MAX_UNITS_PER_MATCH})'}), 400

    jm_ids = [m.id for m in JornadaMatch.query.filter_by(jornada_id=jornada.id).all()]
    other_units = sum(
        p.units_wagered
        for p in PredictionV2.query.filter_by(user_id=user_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
        if p.jornada_match_id != jornada_match_id
    )
    if other_units + units > MAX_UNITS:
        return jsonify({'error': f'Total de unidades supera el máximo de {MAX_UNITS}'}), 400

    existing = PredictionV2.query.filter_by(user_id=user_id, jornada_match_id=jornada_match_id).first()
    if existing:
        existing.predicted_result = predicted_result
        existing.units_wagered = units
        pred = existing
    else:
        pred = PredictionV2(
            user_id=user_id,
            jornada_match_id=jornada_match_id,
            predicted_result=predicted_result,
            units_wagered=units,
        )
        db.session.add(pred)

    db.session.commit()
    return jsonify({'prediction': pred.to_dict()}), 200


@jornadas_bp.route('/history', methods=['GET'])
@jwt_required()
def get_jornada_history():
    user_id = int(get_jwt_identity())

    finished_jornadas = Jornada.query.filter_by(status='finished').order_by(Jornada.number.desc()).all()

    history = []
    for jornada in finished_jornadas:
        jm_ids = [jm.id for jm in JornadaMatch.query.filter_by(jornada_id=jornada.id).all()]
        preds = PredictionV2.query.filter_by(user_id=user_id).filter(
            PredictionV2.jornada_match_id.in_(jm_ids)
        ).all()

        units_used = sum(p.units_wagered for p in preds)
        points_earned = sum(p.points_earned or 0 for p in preds)
        unplayed_units = MAX_UNITS - units_used

        history.append({
            **jornada.to_dict(),
            'units_used': units_used,
            'points_from_bets': round(points_earned, 2),
            'points_from_unused_units': unplayed_units,
            'total_points': round(points_earned + unplayed_units, 2),
            'predictions_count': len(preds),
        })

    return jsonify({'history': history}), 200
