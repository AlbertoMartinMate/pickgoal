from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Prediction, Match, User, ChampionPrediction

predictions_bp = Blueprint('predictions', __name__)

# Fecha de inicio del torneo: 11 junio 2026 21:00 UTC (primer partido)
TOURNAMENT_START = datetime(2026, 6, 11, 21, 0, 0, tzinfo=timezone.utc)


@predictions_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_predictions():
    user_id = int(get_jwt_identity())
    league_id = request.args.get('league_id', type=int)

    query = Prediction.query.filter_by(user_id=user_id)
    if league_id is not None:
        query = query.filter_by(league_id=league_id)

    preds = query.all()
    return jsonify({'predictions': [p.to_dict() for p in preds]}), 200


@predictions_bp.route('/match/<int:match_id>', methods=['GET'])
@jwt_required()
def get_prediction_for_match(match_id):
    user_id = int(get_jwt_identity())
    league_id = request.args.get('league_id', type=int)

    query = Prediction.query.filter_by(user_id=user_id, match_id=match_id)
    if league_id is not None:
        query = query.filter_by(league_id=league_id)

    pred = query.first()
    if not pred:
        return jsonify({'prediction': None}), 200
    return jsonify({'prediction': pred.to_dict()}), 200


@predictions_bp.route('/', methods=['POST'])
@jwt_required()
def save_prediction():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    match_id = data.get('match_id')
    predicted_result = data.get('predicted_result')
    predicted_home = data.get('predicted_home')
    predicted_away = data.get('predicted_away')
    league_id = data.get('league_id')  # nullable — liga activa del frontend

    if not all([match_id, predicted_result, predicted_home is not None, predicted_away is not None]):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    if predicted_result not in ('1', 'X', '2'):
        return jsonify({'error': 'Resultado inválido (1, X o 2)'}), 400

    match = Match.query.get_or_404(match_id)
    if match.status != 'scheduled':
        return jsonify({'error': 'No se puede predecir un partido que ya ha comenzado'}), 403

    match_dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) >= match_dt_utc - timedelta(minutes=30):
        return jsonify({'error': 'El plazo para predecir este partido ha cerrado (cierra 30 min antes)'}), 403

    home = int(predicted_home)
    away = int(predicted_away)
    if home < 0 or away < 0:
        return jsonify({'error': 'El marcador no puede ser negativo'}), 400

    derived_result = '1' if home > away else ('X' if home == away else '2')
    if derived_result != predicted_result:
        return jsonify({'error': 'El resultado 1X2 no coincide con el marcador predicho'}), 400

    existing = Prediction.query.filter_by(
        user_id=user_id, match_id=match_id, league_id=league_id
    ).first()
    if existing:
        existing.predicted_result = predicted_result
        existing.predicted_home = home
        existing.predicted_away = away
    else:
        pred = Prediction(
            user_id=user_id,
            match_id=match_id,
            league_id=league_id,
            predicted_result=predicted_result,
            predicted_home=home,
            predicted_away=away,
        )
        db.session.add(pred)

    db.session.commit()
    saved = existing or Prediction.query.filter_by(
        user_id=user_id, match_id=match_id, league_id=league_id
    ).first()
    return jsonify({'prediction': saved.to_dict()}), 200


@predictions_bp.route('/user/<int:target_user_id>', methods=['GET'])
@jwt_required()
def get_user_predictions(target_user_id):
    """Devuelve predicciones de partidos finalizados para un usuario dado."""
    league_id = request.args.get('league_id', type=int)

    target = User.query.get_or_404(target_user_id)

    query = (
        Prediction.query
        .join(Match, Prediction.match_id == Match.id)
        .filter(Prediction.user_id == target_user_id, Match.status == 'finished')
    )
    if league_id is not None:
        query = query.filter(Prediction.league_id == league_id)

    preds = query.all()

    correct_results = sum(1 for p in preds if p.pts_result > 0)
    exact_scores = sum(1 for p in preds if p.pts_score > 0)
    total_points = sum(p.total_points for p in preds)

    return jsonify({
        'user': {
            'id': target.id,
            'username': target.username,
            'country': target.country,
            'total_points': total_points,
            'correct_results': correct_results,
            'exact_scores': exact_scores,
        },
        'predictions': [
            {
                **p.to_dict(),
                'match': p.match.to_dict(),
            }
            for p in sorted(preds, key=lambda p: p.match.match_datetime, reverse=True)
        ],
    }), 200


@predictions_bp.route('/champion', methods=['GET'])
@jwt_required()
def get_champion_prediction():
    user_id = int(get_jwt_identity())
    league_id = request.args.get('league_id', type=int)

    query = ChampionPrediction.query.filter_by(user_id=user_id)
    if league_id is not None:
        query = query.filter_by(league_id=league_id)

    cp = query.first()
    return jsonify({'champion_prediction': cp.to_dict() if cp else None}), 200


@predictions_bp.route('/champion', methods=['POST'])
@jwt_required()
def save_champion_prediction():
    user_id = int(get_jwt_identity())
    now = datetime.now(timezone.utc)
    tournament_started = now >= TOURNAMENT_START

    data = request.get_json()
    league_id = data.get('league_id')
    team_name = data.get('team_name', '').strip()
    if not team_name:
        return jsonify({'error': 'Debes indicar un equipo'}), 400

    existing = ChampionPrediction.query.filter_by(
        user_id=user_id, league_id=league_id
    ).first()

    if existing:
        # Si el torneo ya empezó, la predicción existente está bloqueada
        if tournament_started:
            return jsonify({'error': 'El torneo ya ha comenzado, tu predicción está bloqueada'}), 403
        # Antes del torneo se puede actualizar
        existing.team_name = team_name
        db.session.commit()
        return jsonify({'champion_prediction': existing.to_dict()}), 200
    else:
        # Nueva predicción — siempre permitida (incluso tras inicio para inscritos tarde)
        cp = ChampionPrediction(user_id=user_id, league_id=league_id, team_name=team_name)
        db.session.add(cp)
        db.session.commit()
        return jsonify({'champion_prediction': cp.to_dict()}), 201


@predictions_bp.route('/champion/award', methods=['POST'])
@jwt_required()
def award_champion():
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403

    data = request.get_json()
    winner_team = data.get('team_name', '').strip()
    if not winner_team:
        return jsonify({'error': 'Indica el equipo campeón'}), 400

    updated = 0
    for cp in ChampionPrediction.query.all():
        if cp.team_name.lower() == winner_team.lower():
            cp.points_earned = 10
            updated += 1
        else:
            cp.points_earned = 0
    db.session.commit()
    return jsonify({'message': f'{updated} predicciones premiadas con 10 puntos'}), 200
