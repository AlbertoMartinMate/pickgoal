import random
import logging

logger = logging.getLogger(__name__)

BOT_NAMES_V2 = [
    'Xavi_Bot', 'Iniesta_Bot', 'Zidane_Bot', 'Ronaldo_Bot', 'Messi_Bot',
    'Cruyff_Bot', 'Pele_Bot', 'Maradona_Bot', 'Beckham_Bot', 'Rooney_Bot',
    'Henry_Bot', 'Lampard_Bot', 'Gerrard_Bot', 'Pirlo_Bot', 'Buffon_Bot',
]

MAX_UNITS = 20
MAX_PER_MATCH = 5


def _ensure_bots_exist():
    """Creates all V2 bot users if they don't exist yet. Returns list of Users."""
    import os
    from app import db
    from app.models import User
    from werkzeug.security import generate_password_hash

    bots = []
    for name in BOT_NAMES_V2:
        user = User.query.filter_by(username=name).first()
        if not user:
            user = User(
                username=name,
                email=f'{name.lower()}@bots.pickgoal.es',
                password_hash=generate_password_hash(os.urandom(24).hex()),
                is_bot=True,
            )
            db.session.add(user)
            db.session.flush()
            logger.info('Bot V2 creado: %s (id=%d)', name, user.id)
        bots.append(user)
    return bots


def create_bots_for_league(league_id, n=15):
    """Create n V2 bots and add them to division_members for league_id."""
    from app import db
    from app.models import DivisionMember

    bots = _ensure_bots_exist()
    bots_to_add = bots[:n]

    existing_count = DivisionMember.query.filter_by(league_id=league_id).count()

    added = 0
    for bot in bots_to_add:
        already = DivisionMember.query.filter_by(
            league_id=league_id, user_id=bot.id
        ).first()
        if not already:
            dm = DivisionMember(
                league_id=league_id,
                user_id=bot.id,
                is_bot=True,
                division=1,
                position=existing_count + added + 1,
            )
            db.session.add(dm)
            added += 1

    db.session.commit()
    logger.info('Bots V2: %d añadidos a liga %d', added, league_id)
    return added


def _random_units(n_matches=10, total=20, max_per=5):
    """Distribute total units across n_matches (0-max_per each, sum=total)."""
    units = [0] * n_matches
    remaining = total
    indices = list(range(n_matches))
    random.shuffle(indices)

    for i, idx in enumerate(indices):
        slots_left = len(indices) - i - 1
        max_here = min(max_per, remaining)
        min_here = max(0, remaining - slots_left * max_per)
        u = random.randint(min_here, max_here)
        units[idx] = u
        remaining -= u
        if remaining == 0:
            break

    return units


def _pick_result_by_odds(jornada_match, rng):
    """Pick 1/X/2 weighted by inverse odds (lower odds → higher probability)."""
    o1 = jornada_match.odds_1 or 2.0
    ox = jornada_match.odds_x or 3.0
    o2 = jornada_match.odds_2 or 3.5

    w1 = 1 / o1
    wx = 1 / ox
    w2 = 1 / o2
    total = w1 + wx + w2

    roll = rng.random() * total
    if roll < w1:
        return '1'
    elif roll < w1 + wx:
        return 'X'
    return '2'


def generate_bot_predictions_v2(jornada_id):
    """Generate V2 predictions for all bots for the given jornada."""
    from app import db
    from app.models import User, JornadaMatch, PredictionV2, DivisionMember

    jornada_matches = JornadaMatch.query.filter_by(jornada_id=jornada_id).all()
    if not jornada_matches:
        logger.warning('generate_bot_predictions_v2: no hay partidos en jornada %d', jornada_id)
        return

    jm_ids = [jm.id for jm in jornada_matches]

    # All V2 bots: prefer DivisionMember records, fall back to all bot users
    bot_ids_from_divisions = {
        dm.user_id for dm in DivisionMember.query.filter_by(is_bot=True).all()
    }
    if bot_ids_from_divisions:
        bot_ids = bot_ids_from_divisions
    else:
        bot_ids = {u.id for u in User.query.filter_by(is_bot=True).all()}

    saved = 0
    for bot_id in bot_ids:
        already_predicted = PredictionV2.query.filter_by(user_id=bot_id).filter(
            PredictionV2.jornada_match_id.in_(jm_ids)
        ).count()
        if already_predicted == len(jornada_matches):
            continue

        rng = random.Random(bot_id * 1000 + jornada_id)
        units = _random_units(len(jornada_matches), MAX_UNITS, MAX_PER_MATCH)

        for jm, u in zip(jornada_matches, units):
            existing = PredictionV2.query.filter_by(
                user_id=bot_id, jornada_match_id=jm.id
            ).first()
            if existing:
                continue

            result = _pick_result_by_odds(jm, rng)
            db.session.add(PredictionV2(
                user_id=bot_id,
                jornada_match_id=jm.id,
                predicted_result=result,
                units_wagered=u,
            ))
            saved += 1

    db.session.commit()
    logger.info('Bot V2 predictions: %d generadas para jornada %d', saved, jornada_id)


def displace_bot(league_id):
    """
    Remove the lowest-ranked bot from league_id when a real user joins.
    Returns the displaced user_id, or None if no bots found.
    """
    from app import db
    from app.models import DivisionMember

    worst_bot = (
        DivisionMember.query
        .filter_by(league_id=league_id, is_bot=True)
        .order_by(
            DivisionMember.season_div_points.asc(),
            DivisionMember.season_total_points.asc(),
        )
        .first()
    )

    if not worst_bot:
        logger.info('displace_bot: no hay bots en liga %d', league_id)
        return None

    displaced_id = worst_bot.user_id
    db.session.delete(worst_bot)
    db.session.commit()
    logger.info('Bot %d desplazado de liga %d', displaced_id, league_id)
    return displaced_id
