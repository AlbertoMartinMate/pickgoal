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
    # Include PAUSED (half-time) so we don't miss score updates during the break
    url = f'{FOOTBALL_API_BASE}/competitions/WC/matches?status=IN_PLAY,PAUSED'
    resp = requests.get(url, headers=get_api_headers(), timeout=10)
    resp.raise_for_status()
    return resp.json().get('matches', [])


def fetch_match_by_api_id(api_id):
    """Fetch a single match by its football-data.org API id."""
    url = f'{FOOTBALL_API_BASE}/matches/{api_id}'
    resp = requests.get(url, headers=get_api_headers(), timeout=10)
    resp.raise_for_status()
    return resp.json()


def map_api_phase(stage: str) -> str:
    mapping = {
        'GROUP_STAGE': 'group',
        'LAST_32': 'r32',
        'ROUND_OF_32': 'r32',
        'LAST_16': 'r16',
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

    if (prediction.predicted_home == match.home_score_final and
            prediction.predicted_away == match.away_score_final):
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


# ---------------------------------------------------------------------------
# V2 helpers
# ---------------------------------------------------------------------------

_ODDS_MARGIN = 0.10
_ODDS_MIN = 1.10
_ODDS_MAX = 15.00

# UEFA coefficient proxies: (home_pos, away_pos, recent_form) → raw win probability
# Form weight vs position weight
_FORM_WEIGHT = 0.4
_POS_WEIGHT = 0.6


def _form_score(results: list[str]) -> float:
    """Convert last-5 results ['W','D','L',...] to a 0-1 score."""
    points = {'W': 1.0, 'D': 0.5, 'L': 0.0}
    if not results:
        return 0.5
    return sum(points.get(r, 0.5) for r in results) / len(results)


def _position_score(pos: int, total_teams: int) -> float:
    """1st place → 1.0, last place → 0.0."""
    if total_teams <= 1:
        return 0.5
    return 1.0 - (pos - 1) / (total_teams - 1)


def _fetch_team_stats(competition_code: str, team_id: int) -> tuple[int, int, list[str]]:
    """Return (position, total_teams, last_5_results) for a team in a competition."""
    headers = get_api_headers()
    # Standing
    url = f'{FOOTBALL_API_BASE}/competitions/{competition_code}/standings'
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    standings = resp.json().get('standings', [])
    pos, total = 1, 20
    for table in standings:
        if table.get('type') == 'TOTAL':
            rows = table.get('table', [])
            total = len(rows)
            for row in rows:
                if row.get('team', {}).get('id') == team_id:
                    pos = row['position']
                    break
            break

    # Last 5 matches
    matches_url = f'{FOOTBALL_API_BASE}/teams/{team_id}/matches?status=FINISHED&limit=5'
    resp2 = requests.get(matches_url, headers=headers, timeout=10)
    last5: list[str] = []
    if resp2.ok:
        for m in resp2.json().get('matches', [])[-5:]:
            score = m.get('score', {})
            ft = score.get('fullTime', {})
            h, a = ft.get('home'), ft.get('away')
            home_team_id = m.get('homeTeam', {}).get('id')
            if h is None or a is None:
                last5.append('D')
                continue
            if home_team_id == team_id:
                last5.append('W' if h > a else ('D' if h == a else 'L'))
            else:
                last5.append('W' if a > h else ('D' if h == a else 'L'))

    return pos, total, last5


def _clamp_odds(raw: float) -> float:
    return max(_ODDS_MIN, min(_ODDS_MAX, raw))


def calculate_odds(match) -> tuple[float, float, float]:
    """
    Calculate 1X2 odds for a match using standing position and recent form.
    Returns (odds_1, odds_x, odds_2).

    Falls back to balanced 50/30/20 split when API data is unavailable.
    """
    comp_code = None
    if match.competition_id:
        from app.models import Competition
        comp = Competition.query.get(match.competition_id)
        if comp:
            comp_code = comp.code

    home_strength = 0.5
    away_strength = 0.5

    if comp_code:
        try:
            # Resolve team IDs from the API using the match api_id
            match_url = f'{FOOTBALL_API_BASE}/matches/{match.api_id}'
            resp = requests.get(match_url, headers=get_api_headers(), timeout=10)
            resp.raise_for_status()
            data = resp.json()
            home_id = data.get('homeTeam', {}).get('id')
            away_id = data.get('awayTeam', {}).get('id')

            if home_id and away_id:
                h_pos, h_total, h_form = _fetch_team_stats(comp_code, home_id)
                a_pos, a_total, a_form = _fetch_team_stats(comp_code, away_id)

                home_strength = (
                    _POS_WEIGHT * _position_score(h_pos, h_total) +
                    _FORM_WEIGHT * _form_score(h_form)
                )
                away_strength = (
                    _POS_WEIGHT * _position_score(a_pos, a_total) +
                    _FORM_WEIGHT * _form_score(a_form)
                )
        except Exception:
            pass  # fall back to 0.5 / 0.5 defaults

    total = home_strength + away_strength or 1.0
    h = home_strength / total
    a = away_strength / total

    # Home advantage bump
    h = min(h + 0.05, 0.90)
    a = max(a - 0.03, 0.05)

    # Draw probability: higher when teams are evenly matched
    balance = 1.0 - abs(h - a)
    draw_raw = 0.25 * balance
    scale = max(1.0 - draw_raw, 0.01)
    h_adj = h * scale
    a_adj = a * scale
    d_adj = draw_raw

    # Normalize
    total_adj = h_adj + d_adj + a_adj
    p1 = h_adj / total_adj
    px = d_adj / total_adj
    p2 = a_adj / total_adj

    # Convert to decimal odds with margin
    margin = 1 + _ODDS_MARGIN
    odds_1 = _clamp_odds(margin / p1)
    odds_x = _clamp_odds(margin / px)
    odds_2 = _clamp_odds(margin / p2)

    return round(odds_1, 2), round(odds_x, 2), round(odds_2, 2)


# Codes of European competition competitions in football-data.org
_EUROPEAN_COMP_CODES = {'CL', 'UCL', 'EL', 'UECL', 'EC', 'WC'}


def select_jornada_matches(jornada, candidates: list) -> list[int]:
    """
    Select the 10 best match_ids for a jornada from a list of candidate Match objects.

    Rules:
    - Max 5 matches from European competitions (UCL/EL/etc.)
    - Prioritise by importance_score descending (None treated as 0)
    - Returns up to 10 match_ids
    """
    def is_european(match) -> bool:
        if not match.competition_id:
            return False
        from app.models import Competition
        comp = Competition.query.get(match.competition_id)
        return comp is not None and comp.code.upper() in _EUROPEAN_COMP_CODES

    sorted_matches = sorted(candidates, key=lambda m: m.importance_score or 0.0, reverse=True)

    selected: list[int] = []
    euro_count = 0

    for match in sorted_matches:
        if len(selected) >= 10:
            break
        if is_european(match):
            if euro_count >= 5:
                continue
            euro_count += 1
        selected.append(match.id)

    return selected


# ---------------------------------------------------------------------------
# V2 points calculation
# ---------------------------------------------------------------------------

def calculate_v2_points(prediction, match) -> float:
    """
    Returns points earned for a single PredictionV2.
    Correct result → units_wagered × corresponding odds.
    Wrong result → 0.
    Unused units (units_wagered=0) contribute 0 here; they're counted separately.
    """
    if match.result_90 is None or match.status != 'finished':
        return 0.0

    if prediction.predicted_result != match.result_90:
        return 0.0

    jm = prediction.jornada_match
    odds_map = {'1': jm.odds_1, 'X': jm.odds_x, '2': jm.odds_2}
    odds = odds_map.get(match.result_90) or 1.0
    return prediction.units_wagered * odds


def calculate_jornada_points(user_id: int, jornada_id: int, commit: bool = True) -> float:
    """
    Calculates and persists total points for a user in a jornada:
      - Sum of points_earned across all PredictionV2 rows
      - Plus unused units (20 - sum of units_wagered)
    Updates Duelo if one exists. Returns total points.
    """
    from app.models import JornadaMatch, PredictionV2, Duelo

    MAX_UNITS = 20

    jm_ids = [
        jm.id for jm in JornadaMatch.query.filter_by(jornada_id=jornada_id).all()
    ]
    preds = PredictionV2.query.filter_by(user_id=user_id).filter(
        PredictionV2.jornada_match_id.in_(jm_ids)
    ).all()

    units_used = sum(p.units_wagered for p in preds)
    points_from_bets = 0.0

    for pred in preds:
        earned = calculate_v2_points(pred, pred.jornada_match.match)
        pred.points_earned = earned
        points_from_bets += earned

    unused_units = MAX_UNITS - units_used
    total = points_from_bets + unused_units

    # Update duelo live points
    from app import db
    from sqlalchemy import or_
    duelo = Duelo.query.filter(
        Duelo.jornada_id == jornada_id,
        or_(Duelo.player1_id == user_id, Duelo.player2_id == user_id)
    ).first()
    if duelo:
        if duelo.player1_id == user_id:
            duelo.points_player1 = total
        else:
            duelo.points_player2 = total

        # Resolve winner if jornada is finished
        from app.models import Jornada
        jornada = Jornada.query.get(jornada_id)
        is_bye = duelo.player1_id == duelo.player2_id
        if jornada and jornada.status == 'finished':
            if is_bye:
                # Bye player gets a draw (1 div point) against themselves
                duelo.winner_id = None
                duelo.div_points_p1 = 1
                duelo.div_points_p2 = 1
            else:
                p1 = duelo.points_player1
                p2 = duelo.points_player2
                if p1 > p2:
                    duelo.winner_id = duelo.player1_id
                    duelo.div_points_p1 = 3
                    duelo.div_points_p2 = 0
                elif p2 > p1:
                    duelo.winner_id = duelo.player2_id
                    duelo.div_points_p1 = 0
                    duelo.div_points_p2 = 3
                else:
                    duelo.winner_id = None
                    duelo.div_points_p1 = 1
                    duelo.div_points_p2 = 1

    if commit:
        db.session.commit()

    return total


def recalculate_v2_for_match(match):
    """Update PredictionV2 points and live duelo scores after a match finishes."""
    from app.models import JornadaMatch, Jornada, PredictionV2
    from app import db

    jornada_matches = JornadaMatch.query.filter_by(match_id=match.id).all()
    if not jornada_matches:
        return

    for jm in jornada_matches:
        jornada = Jornada.query.get(jm.jornada_id)
        if not jornada or jornada.status == 'upcoming':
            continue

        user_ids = {
            p.user_id
            for p in PredictionV2.query.filter_by(jornada_match_id=jm.id).all()
        }
        for uid in user_ids:
            calculate_jornada_points(uid, jm.jornada_id, commit=False)

    db.session.commit()
