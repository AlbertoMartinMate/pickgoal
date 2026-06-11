from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Match, User
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
    from flask import current_app
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if not user.is_admin:
        return jsonify({'error': 'Solo admins pueden forzar la sincronización'}), 403
    _sync_full(current_app._get_current_object())
    return jsonify({'ok': True, 'message': 'Sincronización completada'}), 200


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
