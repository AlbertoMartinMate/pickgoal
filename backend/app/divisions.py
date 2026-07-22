import logging
from sqlalchemy import or_

logger = logging.getLogger(__name__)

PROMOTION_SPOTS = 4
RELEGATION_SPOTS = 8


def get_division_standings(league_id):
    """
    Compute division standings for a league dynamically from Duelo records.
    Returns list of dicts sorted by pts_division DESC, pts_general DESC.
    """
    from app import db
    from app.models import DivisionMember, Duelo, User

    members = DivisionMember.query.filter_by(league_id=league_id).all()
    standings = []

    for dm in members:
        user = User.query.get(dm.user_id)
        if not user:
            continue

        all_duelos = Duelo.query.filter(
            Duelo.division_league_id == league_id,
            or_(Duelo.player1_id == dm.user_id, Duelo.player2_id == dm.user_id),
        ).all()

        g = e = p = pj = 0
        pts_div = 0
        pts_total = 0.0

        for d in all_duelos:
            is_resolved = (d.div_points_p1 or 0) + (d.div_points_p2 or 0) > 0
            if not is_resolved:
                continue

            is_bye = d.player1_id == d.player2_id

            if is_bye and d.player1_id == dm.user_id:
                pj += 1
                dp = d.div_points_p1 or 0
                if dp == 3: g += 1
                elif dp == 1: e += 1
                else: p += 1
                pts_div += dp
                pts_total += d.points_player1 or 0

            elif d.player1_id == dm.user_id:
                pj += 1
                dp = d.div_points_p1 or 0
                if dp == 3: g += 1
                elif dp == 1: e += 1
                else: p += 1
                pts_div += dp
                pts_total += d.points_player1 or 0

            elif d.player2_id == dm.user_id:
                pj += 1
                dp = d.div_points_p2 or 0
                if dp == 3: g += 1
                elif dp == 1: e += 1
                else: p += 1
                pts_div += dp
                pts_total += d.points_player2 or 0

        standings.append({
            'user_id': dm.user_id,
            'username': user.username,
            'is_bot': dm.is_bot,
            'division': dm.division,
            'pj': pj,
            'g': g,
            'e': e,
            'p': p,
            'pts_division': pts_div,
            'pts_general': round(pts_total, 2),
        })

    standings.sort(key=lambda x: (-x['pts_division'], -x['pts_general']))
    for i, row in enumerate(standings):
        row['pos'] = i + 1

    return standings


def process_season_end(season_id):
    """
    Promote top PROMOTION_SPOTS and relegate bottom RELEGATION_SPOTS in each
    division league of the season. Resets season counters for all members.
    """
    from app import db
    from app.models import Season, Jornada, Duelo, DivisionMember

    season = Season.query.get(season_id)
    if not season:
        logger.warning('process_season_end: temporada %d no encontrada', season_id)
        return

    jornada_ids = [j.id for j in season.jornadas.all()]
    if not jornada_ids:
        logger.info('process_season_end: temporada %d sin jornadas', season_id)
        return

    league_ids = {
        d.division_league_id
        for jid in jornada_ids
        for d in Duelo.query.filter_by(jornada_id=jid).all()
    }

    for league_id in league_ids:
        standings = get_division_standings(league_id)
        if not standings:
            continue

        n = len(standings)
        promoted_ids = {row['user_id'] for row in standings[:min(PROMOTION_SPOTS, n)]}
        relegated_ids = {
            row['user_id']
            for row in standings[max(0, n - RELEGATION_SPOTS):]
        } - promoted_ids  # no overlap with promoted

        for dm in DivisionMember.query.filter_by(league_id=league_id).all():
            if dm.user_id in promoted_ids and dm.division > 1:
                dm.division -= 1
            elif dm.user_id in relegated_ids:
                dm.division += 1
            dm.season_div_points = 0
            dm.season_total_points = 0.0

        logger.info(
            'Liga %d: %d promovidos, %d relegados',
            league_id, len(promoted_ids), len(relegated_ids)
        )

    season.status = 'finished'
    db.session.commit()
    logger.info('Temporada %d cerrada', season_id)
