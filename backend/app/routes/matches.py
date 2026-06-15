from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models import Match, User, Prediction, ChampionPrediction
from app.scheduler import sync_full_calendar as _sync_full

matches_bp = Blueprint('matches', __name__)


@matches_bp.route('/', methods=['GET'])
def get_matches():
    phase = request.args.get('phase')
    status = request.args.get('status')

    query = Match.query
    if phase:
        query = query.filter_by(phase=phase)
    if status:
        query = query.filter_by(status=status)

    matches = query.order_by(Match.match_datetime).all()
    return jsonify({'matches': [m.to_dict() for m in matches]}), 200


@matches_bp.route('/grouped', methods=['GET'])
def get_matches_grouped():
    matches = Match.query.order_by(Match.match_datetime).all()
    grouped = {}
    phase_order = ['group', 'r32', 'r16', 'quarters', 'semis', 'third', 'final']
    phase_labels = {
        'group': 'Fase de Grupos',
        'r32': 'Dieciseisavos',
        'r16': 'Octavos de Final',
        'quarters': 'Cuartos de Final',
        'semis': 'Semifinales',
        'third': 'Tercer y Cuarto Puesto',
        'final': 'Final',
    }
    for m in matches:
        key = m.phase
        if m.phase == 'group' and m.group_name:
            key = f'group_{m.group_name}'
        if key not in grouped:
            grouped[key] = {
                'phase': m.phase,
                'label': phase_labels.get(m.phase, m.phase),
                'group_name': m.group_name,
                'matches': [],
            }
        grouped[key]['matches'].append(m.to_dict())

    ordered = []
    for phase in phase_order:
        if phase == 'group':
            group_keys = sorted(k for k in grouped if k.startswith('group_'))
            for gk in group_keys:
                ordered.append(grouped[gk])
        elif phase in grouped:
            ordered.append(grouped[phase])

    return jsonify({'groups': ordered}), 200


@matches_bp.route('/<int:match_id>', methods=['GET'])
def get_match(match_id):
    match = Match.query.get_or_404(match_id)
    return jsonify({'match': match.to_dict()}), 200


@matches_bp.route('/sync', methods=['POST'])
@jwt_required()
def manual_sync():
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403

    from flask import current_app
    try:
        _sync_full(current_app._get_current_object())
        return jsonify({'message': 'Sincronización completada'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@matches_bp.route('/<int:match_id>/result', methods=['PATCH'])
@jwt_required()
def update_match_result(match_id):
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403

    match = Match.query.get_or_404(match_id)
    data = request.get_json()

    home_90 = data.get('home_score_90')
    away_90 = data.get('away_score_90')
    if home_90 is None or away_90 is None:
        return jsonify({'error': 'Se requieren home_score_90 y away_score_90'}), 400

    from app.utils import compute_result_90, recalculate_match_predictions

    match.home_score_90 = int(home_90)
    match.away_score_90 = int(away_90)
    match.result_90 = compute_result_90(int(home_90), int(away_90))
    match.home_score_final = int(data.get('home_score_final', home_90))
    match.away_score_final = int(data.get('away_score_final', away_90))
    match.status = 'finished'
    db.session.commit()

    recalculate_match_predictions(match)

    return jsonify({'match': match.to_dict(), 'message': 'Resultado actualizado y puntos recalculados'}), 200


@matches_bp.route('/recalculate-all', methods=['POST'])
@jwt_required()
def recalculate_all_points():
    user_id = int(get_jwt_identity())
    admin = User.query.get_or_404(user_id)
    if not admin.is_admin:
        return jsonify({'error': 'Sin permisos'}), 403

    from app.utils import calculate_prediction_points

    for pred in Prediction.query.all():
        pred.pts_result = 0
        pred.pts_score = 0
        pred.total_points = 0
    db.session.commit()

    finished = Match.query.filter_by(status='finished').all()
    for match in finished:
        for pred in Prediction.query.filter_by(match_id=match.id).all():
            r, s = calculate_prediction_points(pred, match)
            pred.pts_result = r
            pred.pts_score = s
            pred.total_points = r + s
    db.session.commit()

    for u in User.query.all():
        pts = db.session.query(func.sum(Prediction.total_points)).filter_by(user_id=u.id).scalar() or 0
        champ_pts = db.session.query(func.sum(ChampionPrediction.points_earned)).filter_by(user_id=u.id).scalar() or 0
        u.total_points_all_time = pts + champ_pts
    db.session.commit()

    return jsonify({'message': f'{len(finished)} partidos recalculados'}), 200
