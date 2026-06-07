import os
import secrets
import string
import requests
from datetime import datetime, timezone


FOOTBALL_API_BASE = 'https://api.football-data.org/v4'
WC_2026_ID = 2000  # ID del Mundial 2026 en football-data.org


def get_api_headers():
    return {'X-Auth-Token': os.environ.get('FOOTBALL_API_KEY', '')}


def fetch_wc_matches():
    url = f'{FOOTBALL_API_BASE}/competitions/WC/matches'
    resp = requests.get(url, headers=get_api_headers(), timeout=15)
    resp.raise_for_status()
    return resp.json().get('matches', [])


def fetch_live_matches():
    url = f'{FOOTBALL_API_BASE}/competitions/WC/matches?status=IN_PLAY'
    resp = requests.get(url, headers=get_api_headers(), timeout=10)
    resp.raise_for_status()
    return resp.json().get('matches', [])


def map_api_phase(stage: str) -> str:
    mapping = {
        'GROUP_STAGE': 'group',
        'ROUND_OF_32': 'r32',
        'ROUND_OF_16': 'r16',
        'QUARTER_FINALS': 'quarters',
        'SEMI_FINALS': 'semis',
        'THIRD_PLACE': 'third',
        'FINAL': 'final',
    }
    return mapping.get(stage, 'group')


def map_api_status(status: str) -> str:
    mapping = {
        'SCHEDULED': 'scheduled',
        'TIMED': 'scheduled',
        'IN_PLAY': 'live',
        'PAUSED': 'live',
        'FINISHED': 'finished',
        'AWARDED': 'finished',
        'CANCELLED': 'scheduled',
        'POSTPONED': 'scheduled',
        'SUSPENDED': 'live',
    }
    return mapping.get(status, 'scheduled')


def parse_match_datetime(utc_str: str) -> datetime:
    if utc_str.endswith('Z'):
        utc_str = utc_str[:-1] + '+00:00'
    return datetime.fromisoformat(utc_str).replace(tzinfo=timezone.utc)


def compute_result_90(home: int, away: int) -> str:
    if home > away:
        return '1'
    elif home == away:
        return 'X'
    return '2'


def calculate_prediction_points(prediction, match):
    if match.status != 'finished' or match.result_90 is None:
        return 0, 0

    pts_result_val, pts_score_val = match.points_for_phase()
    earned_result = 0
    earned_score = 0

    if prediction.predicted_result == match.result_90:
        earned_result = pts_result_val
        if (prediction.predicted_home == match.home_score_90 and
                prediction.predicted_away == match.away_score_90):
            earned_score = pts_score_val

    return earned_result, earned_score


def generate_invite_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def recalculate_match_predictions(match):
    from app.models import Prediction, User
    from app import db

    predictions = Prediction.query.filter_by(match_id=match.id).all()
    for pred in predictions:
        old_total = pred.total_points or 0
        r, s = calculate_prediction_points(pred, match)
        pred.pts_result = r
        pred.pts_score = s
        pred.total_points = r + s
        delta = pred.total_points - old_total
        if delta != 0:
            user = User.query.get(pred.user_id)
            if user:
                user.total_points_all_time = (user.total_points_all_time or 0) + delta
    db.session.commit()
