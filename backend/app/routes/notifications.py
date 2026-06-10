import json
import os
import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import PushSubscription, User, LeagueMember, League

notifications_bp = Blueprint('notifications', __name__)


def send_push_notification(user_id, title, body, url='/'):
    """Send push to all active subscriptions of a user. Returns number sent."""
    from pywebpush import webpush, WebPushException

    private_key_raw = os.environ.get('VAPID_PRIVATE_KEY', '')
    if not private_key_raw:
        return 0

    # .env stores \n as literal backslash-n; restore real newlines
    private_key = private_key_raw.replace('\\n', '\n')

    subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()
    sent = 0

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    'endpoint': sub.endpoint,
                    'keys': {'p256dh': sub.p256dh, 'auth': sub.auth},
                },
                data=json.dumps({'title': title, 'body': body, 'url': url}),
                vapid_private_key=private_key,
                vapid_claims={'sub': 'mailto:admin@pickgoal.es'},
            )
            sent += 1
        except WebPushException as exc:
            # 404/410 → subscription expired; clean it up
            if exc.response is not None and exc.response.status_code in (404, 410):
                db.session.delete(sub)
                db.session.commit()
        except Exception:
            pass

    return sent


# ──────────────────────────────────────────────────────────────────────────────
# Public: expose VAPID public key to the frontend
# ──────────────────────────────────────────────────────────────────────────────

@notifications_bp.route('/vapid-public-key', methods=['GET'])
def get_vapid_public_key():
    return jsonify({'public_key': os.environ.get('VAPID_PUBLIC_KEY', '')}), 200


# ──────────────────────────────────────────────────────────────────────────────
# Save / update a push subscription
# ──────────────────────────────────────────────────────────────────────────────

@notifications_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    endpoint = data.get('endpoint')
    p256dh = (data.get('keys') or {}).get('p256dh')
    auth = (data.get('keys') or {}).get('auth')

    if not all([endpoint, p256dh, auth]):
        return jsonify({'error': 'Datos de suscripción incompletos'}), 400

    existing = PushSubscription.query.filter_by(
        user_id=user_id, endpoint=endpoint
    ).first()

    if existing:
        existing.p256dh = p256dh
        existing.auth = auth
    else:
        db.session.add(PushSubscription(
            user_id=user_id, endpoint=endpoint, p256dh=p256dh, auth=auth
        ))

    db.session.commit()
    return jsonify({'ok': True}), 201


# ──────────────────────────────────────────────────────────────────────────────
# Admin: send push notification
# ──────────────────────────────────────────────────────────────────────────────

@notifications_bp.route('/send', methods=['POST'])
@jwt_required()
def send_notification():
    caller_id = int(get_jwt_identity())
    caller = User.query.get_or_404(caller_id)
    if not caller.is_admin:
        return jsonify({'error': 'Solo admins pueden enviar notificaciones'}), 403

    data = request.get_json() or {}
    title = data.get('title', 'PickGoal')
    body = data.get('body', '')
    target_user_id = data.get('user_id')
    target_league_id = data.get('league_id')

    sent = 0

    if target_user_id:
        sent = send_push_notification(int(target_user_id), title, body)
    elif target_league_id:
        members = LeagueMember.query.filter_by(league_id=int(target_league_id)).all()
        for m in members:
            sent += send_push_notification(m.user_id, title, body)
    else:
        # Broadcast to all subscribed users
        user_ids = db.session.query(PushSubscription.user_id).distinct().all()
        for (uid,) in user_ids:
            sent += send_push_notification(uid, title, body)

    return jsonify({'sent': sent}), 200
