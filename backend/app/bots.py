import os
import random
import string
import logging

logger = logging.getLogger(__name__)

BOT_NAMES_V2 = [
    'Carlos_87.', 'Miguel_23.', 'Pablo_91.', 'Alejandro_14.', 'Sergio_06.',
    'David_99.', 'Antonio_77.', 'Javier_45.', 'Roberto_33.', 'Fernando_88.',
    'Ricardo_55.', 'Diego_19.', 'Manuel_62.', 'Alvaro_38.', 'Marcos_71.',
]

_OLD_BOT_NAMES = [
    'Xavi_Bot', 'Iniesta_Bot', 'Zidane_Bot', 'Ronaldo_Bot', 'Messi_Bot',
    'Cruyff_Bot', 'Pele_Bot', 'Maradona_Bot', 'Beckham_Bot', 'Rooney_Bot',
    'Henry_Bot', 'Lampard_Bot', 'Gerrard_Bot', 'Pirlo_Bot', 'Buffon_Bot',
]

MAX_UNITS = 20
MAX_PER_MATCH = 5


def _ensure_bots_exist():
    """Creates/renames all V2 bot users. Returns list of Users."""
    import os
    from app import db
    from app.models import User
    from werkzeug.security import generate_password_hash

    # Rename old bots to new names in case they already exist
    for old, new in zip(_OLD_BOT_NAMES, BOT_NAMES_V2):
        old_user = User.query.filter_by(username=old).first()
        if old_user:
            old_user.username = new
            old_user.email = f'{new.lower().rstrip(".")}@bots.pickgoal.es'
            db.session.flush()
            logger.info('Bot renombrado: %s → %s', old, new)

    bots = []
    for name in BOT_NAMES_V2:
        user = User.query.filter_by(username=name).first()
        if not user:
            user = User(
                username=name,
                email=f'{name.lower().rstrip(".")}@bots.pickgoal.es',
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


def displace_bot(league_id, new_user_id=None):
    """
    Remove the lowest-ranked bot from league_id when a real user joins.
    If new_user_id is provided, creates a DivisionMember for them inheriting
    the bot's division and position.
    Returns a dict with displacement info, or None if no bots found.
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
    inherited_division = worst_bot.division
    inherited_position = worst_bot.position

    db.session.delete(worst_bot)

    if new_user_id:
        already = DivisionMember.query.filter_by(
            league_id=league_id, user_id=new_user_id
        ).first()
        if not already:
            dm = DivisionMember(
                league_id=league_id,
                user_id=new_user_id,
                is_bot=False,
                division=inherited_division,
                position=inherited_position,
            )
            db.session.add(dm)

    db.session.commit()
    logger.info(
        'Bot %d desplazado de liga %d; nuevo usuario: %s',
        displaced_id, league_id, new_user_id,
    )
    return {
        'displaced_bot_id': displaced_id,
        'league_id': league_id,
        'new_user_id': new_user_id,
    }


def replace_user_with_bot(user_id):
    """
    Replace a departing user with a new bot in all their division memberships.
    Transfers Duelo and PredictionV2 records to the bot so division standings
    remain visually unchanged. Returns list of new bot user_ids created.
    Call this BEFORE deleting the user account.
    """
    from app import db
    from app.models import User, DivisionMember, Duelo, PredictionV2
    from werkzeug.security import generate_password_hash
    from sqlalchemy import or_

    user = db.session.get(User, user_id)
    if not user or user.is_bot:
        logger.warning('replace_user_with_bot: usuario %d no válido', user_id)
        return []

    memberships = DivisionMember.query.filter_by(user_id=user_id).all()
    created_bot_ids = []
    first_bot_id = None

    for dm in memberships:
        # Generate a unique bot name derived from the replaced user
        base = (user.username[:8]).rstrip('_').rstrip('.')
        while True:
            suffix = ''.join(random.choices(string.digits, k=2))
            bot_name = f'{base}_{suffix}.'
            if not User.query.filter_by(username=bot_name).first():
                break

        bot = User(
            username=bot_name,
            email=f'{bot_name.lower().rstrip(".")}@bots.pickgoal.es',
            password_hash=generate_password_hash(os.urandom(24).hex()),
            is_bot=True,
        )
        db.session.add(bot)
        db.session.flush()

        # Bot inherits the user's stored position and accumulated points
        new_dm = DivisionMember(
            league_id=dm.league_id,
            user_id=bot.id,
            is_bot=True,
            division=dm.division,
            position=dm.position,
            season_div_points=dm.season_div_points,
            season_total_points=dm.season_total_points,
        )
        db.session.add(new_dm)

        # Transfer Duelo records so computed standings don't change
        for duelo in Duelo.query.filter(
            Duelo.division_league_id == dm.league_id,
            Duelo.player1_id == user_id,
        ).all():
            duelo.player1_id = bot.id

        for duelo in Duelo.query.filter(
            Duelo.division_league_id == dm.league_id,
            Duelo.player2_id == user_id,
        ).all():
            duelo.player2_id = bot.id

        db.session.delete(dm)
        created_bot_ids.append(bot.id)

        if first_bot_id is None:
            first_bot_id = bot.id

        logger.info(
            'Bot %d (%s) reemplaza a usuario %d en liga %d',
            bot.id, bot_name, user_id, dm.league_id,
        )

    # Transfer all PredictionV2 records to the first (usually only) bot
    if first_bot_id is not None:
        for pred in PredictionV2.query.filter_by(user_id=user_id).all():
            pred.user_id = first_bot_id

    db.session.commit()
    logger.info('replace_user_with_bot: usuario %d → %d bots creados', user_id, len(created_bot_ids))
    return created_bot_ids
