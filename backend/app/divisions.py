import logging
import math
from sqlalchemy import or_

logger = logging.getLogger(__name__)

PROMOTION_SPOTS = 4
RELEGATION_SPOTS = 4
ROTATION_JORNADAS = 15   # ascensos/descensos cada N jornadas (1 vuelta)
TOTAL_JORNADAS = 45      # temporada completa (3 vueltas)
LEAGUE_SIZE = 16         # jugadores por liga

FASE_PRIMERA_RELEGATION = 4   # bottom N of Primera descend to Segunda
FASE_SEGUNDA_PROMOTION = 2    # top N of Segunda ascend to Primera
FASE_SEGUNDA_ELIMINATION = 2  # bottom N of Segunda removed (prefer bots)
FASE_PRIMERA_BOTS = 2         # bots added to Primera to fill freed spots


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

        pts_div += dm.points_offset  # carry-over from previous fase
        pts_total += dm.total_points_offset or 0.0  # 50% de los puntos generales de la fase anterior

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
        pos = i + 1
        row['pos'] = pos
        if pos <= 4:
            row['zone'] = 'promotion'
        elif pos >= 13:
            row['zone'] = 'relegation'
        else:
            row['zone'] = 'mid'

    return standings


def process_rotation(season_id, close_season=False):
    """
    Promote top PROMOTION_SPOTS and relegate bottom RELEGATION_SPOTS in each
    division league of the season. Resets season counters for all members.
    If close_season=True, marks the season as finished (last rotation).
    """
    from app import db
    from app.models import Season, Duelo, DivisionMember

    season = Season.query.get(season_id)
    if not season:
        logger.warning('process_rotation: temporada %d no encontrada', season_id)
        return

    jornada_ids = [j.id for j in season.jornadas.all()]
    if not jornada_ids:
        logger.info('process_rotation: temporada %d sin jornadas', season_id)
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

    if close_season:
        season.status = 'finished'
        logger.info('Temporada %d cerrada', season_id)

    db.session.commit()
    logger.info('Rotación completada para temporada %d (close=%s)', season_id, close_season)


def process_season_end(season_id):
    """Alias for final rotation that closes the season."""
    process_rotation(season_id, close_season=True)


# ---------------------------------------------------------------------------
# Fase-close logic (manual, executed once per fase from admin)
# ---------------------------------------------------------------------------

def _standings_with_tiebreaker(league_id):
    """
    Like get_division_standings but sorted by:
    pts_division DESC → g (wins) DESC → User.total_points_all_time DESC.
    Also injects 'total_points_all_time' into each row.
    """
    from app.models import User

    rows = get_division_standings(league_id)
    for row in rows:
        u = User.query.get(row['user_id'])
        row['total_points_all_time'] = u.total_points_all_time if u else 0

    rows.sort(key=lambda x: (
        -x['pts_division'],
        -x['g'],
        -x['total_points_all_time'],
    ))
    for i, row in enumerate(rows):
        row['pos'] = i + 1

    return rows


def _find_bots_for_league(target_league_id, count, exclude_user_ids):
    """
    Return up to `count` bot User objects that are not a member of any league
    (no DivisionMember row) and not in exclude_user_ids (e.g. bots eliminated
    in this same fase close). Creates new bots inline if the pool is exhausted.
    """
    from app import db
    from app.models import User, DivisionMember
    from werkzeug.security import generate_password_hash
    import os, random, string

    in_any_league = {uid for (uid,) in db.session.query(DivisionMember.user_id).all()}
    excluded = in_any_league | set(exclude_user_ids or ())

    bots = User.query.filter_by(is_bot=True).filter(
        ~User.id.in_(excluded or {0})
    ).order_by(User.id).all()

    result = bots[:count]

    while len(result) < count:
        suffix = ''.join(random.choices(string.digits, k=4))
        name = f'Bot_{suffix}.'
        while User.query.filter_by(username=name).first():
            suffix = ''.join(random.choices(string.digits, k=4))
            name = f'Bot_{suffix}.'
        bot = User(
            username=name,
            email=f'{name.lower().rstrip(".")}@bots.pickgoal.es',
            password_hash=generate_password_hash(os.urandom(24).hex()),
            is_bot=True,
        )
        db.session.add(bot)
        db.session.flush()
        result.append(bot)

    return result


def _half_general(pts):
    """50% de los puntos generales, redondeado hacia abajo al céntimo."""
    return math.floor(round((pts or 0) * 100) / 2) / 100


def process_fase_close():
    """
    End-of-fase handler (manual, run once from admin on 23N or similar):

    1. Find Primera (division=1) and Segunda (division=2) leagues.
    2. Compute standings with tiebreaker: pts_division → g → total_points_all_time.
    3. Primera: top 2 symbolic ascent (stay), positions 3-12 stay, bottom 4 relegate.
    4. Segunda: top 2 promote to Primera, positions 3-14 stay, bottom 2 eliminated
       (prefer bots/inactives first).
    5. Reset division points to 0 (points_offset=0) and carry over 50% of the
       general points (floored to the cent) via total_points_offset.
    6. Add 2 bots to Primera to fill freed spots.
    7. Delete all Duelos and DueloCalendar for both leagues (fresh start).
    8. Update User.current_division and current_league_id for moved players.

    Returns a summary dict for the admin response.
    Does NOT commit — caller is responsible.
    """
    from app import db
    from app.models import DivisionMember, User, Duelo, DueloCalendar

    # --- 1. Locate leagues ---
    primera_lid = (
        db.session.query(DivisionMember.league_id)
        .filter(DivisionMember.division == 1)
        .group_by(DivisionMember.league_id)
        .scalar()
    )
    segunda_lid = (
        db.session.query(DivisionMember.league_id)
        .filter(DivisionMember.division == 2)
        .group_by(DivisionMember.league_id)
        .scalar()
    )
    if not primera_lid or not segunda_lid:
        raise ValueError('No se encontraron ligas de Primera (division=1) o Segunda (division=2)')

    # Fase actual (lanza ValueError si esta fase ya se cerró → evita doble halving)
    from app.history import current_fase_context, record_fase_results
    season_id, fase, last_jornada_number = current_fase_context()

    # --- 2. Standings ---
    primera_rows = _standings_with_tiebreaker(primera_lid)
    segunda_rows = _standings_with_tiebreaker(segunda_lid)

    # Snapshot de la clasificación final antes de mover a nadie ni borrar duelos
    record_fase_results(season_id, fase, last_jornada_number, [
        (primera_lid, 1, primera_rows),
        (segunda_lid, 2, segunda_rows),
    ])

    n1 = len(primera_rows)
    n2 = len(segunda_rows)

    # Carry-over: los puntos GENERALES pasan al 50%; los de división se resetean
    primera_pts = {r['user_id']: r['pts_general'] for r in primera_rows}
    segunda_pts = {r['user_id']: r['pts_general'] for r in segunda_rows}

    # --- 3. Determine Primera movements ---
    sym_ids = {r['user_id'] for r in primera_rows[:min(FASE_PRIMERA_RELEGATION - 2, n1)]}
    # Symbolic: top 2 (positions 1-2)
    sym_ids = {r['user_id'] for r in primera_rows[:2]}
    # Relegated: bottom 4 (positions 13-16 in a 16-player league)
    relegate_start = max(0, n1 - FASE_PRIMERA_RELEGATION)
    relegated_ids = {r['user_id'] for r in primera_rows[relegate_start:]}
    primera_stay_ids = {r['user_id'] for r in primera_rows} - relegated_ids

    # --- 4. Determine Segunda movements ---
    # Top 2 promote
    promoted_ids = {r['user_id'] for r in segunda_rows[:FASE_SEGUNDA_PROMOTION]}

    # Bottom 2 eliminated — prefer bots first, then worst rank (highest pos number)
    dm_segunda = {dm.user_id: dm for dm in DivisionMember.query.filter_by(league_id=segunda_lid).all()}
    elimination_sorted = sorted(
        segunda_rows,
        key=lambda x: (
            not dm_segunda[x['user_id']].is_bot,  # bots first (0=bot, 1=real)
            -x['pos'],  # higher pos = worse rank = eliminated first
        ),
    )
    to_eliminate_ids = {r['user_id'] for r in elimination_sorted[:FASE_SEGUNDA_ELIMINATION]}
    segunda_stay_ids = {r['user_id'] for r in segunda_rows} - promoted_ids - to_eliminate_ids

    # --- 5. Apply changes ---

    def _apply_offset(league_id, uid, pts_map):
        dm = DivisionMember.query.filter_by(league_id=league_id, user_id=uid).first()
        if dm:
            half = _half_general(pts_map.get(uid, 0))
            dm.points_offset = 0
            dm.total_points_offset = half
            dm.season_div_points = 0
            dm.season_total_points = half

    def _move_member(src_lid, dst_lid, uid, pts_map, division_num):
        dm_old = DivisionMember.query.filter_by(league_id=src_lid, user_id=uid).first()
        old_pts = pts_map.get(uid, 0)
        is_bot_flag = dm_old.is_bot if dm_old else False
        if dm_old:
            db.session.delete(dm_old)
            db.session.flush()
        dm_new = DivisionMember(
            league_id=dst_lid,
            user_id=uid,
            is_bot=is_bot_flag,
            division=division_num,
            points_offset=0,
            total_points_offset=_half_general(old_pts),
            season_div_points=0,
            season_total_points=_half_general(old_pts),
        )
        db.session.add(dm_new)
        u = db.session.get(User, uid)
        if u:
            u.current_division = division_num
            u.current_league_id = dst_lid

    # Primera players who stay (including symbolic promotions)
    for uid in primera_stay_ids:
        _apply_offset(primera_lid, uid, primera_pts)

    # Relegated: Primera → Segunda
    for uid in relegated_ids:
        _move_member(primera_lid, segunda_lid, uid, primera_pts, division_num=2)

    # Promoted: Segunda → Primera
    for uid in promoted_ids:
        _move_member(segunda_lid, primera_lid, uid, segunda_pts, division_num=1)

    # Eliminated from Segunda
    for uid in to_eliminate_ids:
        dm = DivisionMember.query.filter_by(league_id=segunda_lid, user_id=uid).first()
        if dm:
            db.session.delete(dm)
        u = db.session.get(User, uid)
        if u and not u.is_bot:
            u.current_league_id = None

    # Segunda players who stay
    for uid in segunda_stay_ids:
        _apply_offset(segunda_lid, uid, segunda_pts)

    db.session.flush()

    # --- 6. Add bots to Primera ---
    # Solo bots fuera de cualquier liga; nunca los recién eliminados de Segunda
    new_bots = _find_bots_for_league(primera_lid, FASE_PRIMERA_BOTS, to_eliminate_ids)
    bots_added = []
    for bot in new_bots:
        dm = DivisionMember(
            league_id=primera_lid,
            user_id=bot.id,
            is_bot=True,
            division=1,
            points_offset=0,
            season_div_points=0,
            season_total_points=0.0,
        )
        db.session.add(dm)
        bots_added.append({'user_id': bot.id, 'username': bot.username})

    # --- 7. Clear Duelos and DueloCalendar ---
    Duelo.query.filter(
        Duelo.division_league_id.in_([primera_lid, segunda_lid])
    ).delete(synchronize_session=False)
    DueloCalendar.query.filter(
        DueloCalendar.league_id.in_([primera_lid, segunda_lid])
    ).delete(synchronize_session=False)

    logger.info(
        'process_fase_close: liga %d (Primera) y %d (Segunda) procesadas. '
        'Relegados=%d, Promovidos=%d, Eliminados=%d, Bots añadidos=%d',
        primera_lid, segunda_lid,
        len(relegated_ids), len(promoted_ids), len(to_eliminate_ids), len(bots_added),
    )

    # --- Build summary (snapshot before commit) ---
    _id_to_row1 = {r['user_id']: r for r in primera_rows}
    _id_to_row2 = {r['user_id']: r for r in segunda_rows}

    return {
        'primera': {
            'league_id': primera_lid,
            'symbolic_promotions': [_id_to_row1[uid] for uid in sym_ids if uid in _id_to_row1],
            'stayed': [_id_to_row1[uid] for uid in primera_stay_ids - sym_ids if uid in _id_to_row1],
            'relegated': [_id_to_row1[uid] for uid in relegated_ids if uid in _id_to_row1],
            'incoming_from_segunda': [_id_to_row2[uid] for uid in promoted_ids if uid in _id_to_row2],
            'bots_added': bots_added,
        },
        'segunda': {
            'league_id': segunda_lid,
            'promoted_to_primera': [_id_to_row2[uid] for uid in promoted_ids if uid in _id_to_row2],
            'stayed': [_id_to_row2[uid] for uid in segunda_stay_ids if uid in _id_to_row2],
            'eliminated': [_id_to_row2[uid] for uid in to_eliminate_ids if uid in _id_to_row2],
            'incoming_from_primera': [_id_to_row1[uid] for uid in relegated_ids if uid in _id_to_row1],
        },
        'total_members_halved': len(primera_stay_ids) + len(relegated_ids) + len(segunda_stay_ids) + len(promoted_ids),
    }
