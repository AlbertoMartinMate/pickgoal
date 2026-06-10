import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def sync_full_calendar(app):
    logger.info('JOB sync_full_calendar — inicio')
    with app.app_context():
        from app import db
        from app.models import Match
        from app.utils import (fetch_wc_matches, map_api_phase, map_api_status,
                               parse_match_datetime, compute_result_90)
        try:
            matches_data = fetch_wc_matches()
            for m in matches_data:
                api_id = m['id']
                existing = Match.query.filter_by(api_id=api_id).first()
                stage = m.get('stage', 'GROUP_STAGE')
                phase = map_api_phase(stage)
                group_name = m.get('group')
                home_team = m['homeTeam'].get('name') or 'TBD'
                away_team = m['awayTeam'].get('name') or 'TBD'
                dt = parse_match_datetime(m['utcDate'])
                status = map_api_status(m['status'])

                score = m.get('score', {})
                ht_score = score.get('fullTime', {})
                home_90 = ht_score.get('home')
                away_90 = ht_score.get('away')
                penalties = score.get('penalties', {})
                home_final = penalties.get('home') if penalties.get('home') is not None else home_90
                away_final = penalties.get('away') if penalties.get('away') is not None else away_90

                # Si hay penaltis, sumar 1 gol simbólico al ganador en el marcador final
                if penalties.get('home') is not None:
                    if penalties['home'] > penalties['away']:
                        home_final = (home_90 or 0) + 1
                        away_final = away_90
                    else:
                        away_final = (away_90 or 0) + 1
                        home_final = home_90

                result = compute_result_90(home_90, away_90) if home_90 is not None and status == 'finished' else None

                if existing:
                    existing.phase = phase
                    existing.group_name = group_name
                    existing.home_team = home_team
                    existing.away_team = away_team
                    existing.match_datetime = dt
                    existing.status = status
                    existing.home_score_90 = home_90
                    existing.away_score_90 = away_90
                    existing.home_score_final = home_final
                    existing.away_score_final = away_final
                    existing.result_90 = result
                else:
                    new_match = Match(
                        api_id=api_id, phase=phase, group_name=group_name,
                        home_team=home_team, away_team=away_team,
                        match_datetime=dt, status=status,
                        home_score_90=home_90, away_score_90=away_90,
                        home_score_final=home_final, away_score_final=away_final,
                        result_90=result,
                    )
                    db.session.add(new_match)

            db.session.commit()
            logger.info('Calendario sincronizado: %d partidos procesados', len(matches_data))
        except Exception as e:
            logger.error('Error sincronizando calendario: %s', e)
            db.session.rollback()


def sync_live_matches(app):
    logger.info('JOB sync_live_matches — inicio')
    with app.app_context():
        from app import db
        from app.models import Match
        from app.utils import (fetch_live_matches, map_api_status,
                               compute_result_90, recalculate_match_predictions)
        try:
            live_data = fetch_live_matches()
            for m in live_data:
                existing = Match.query.filter_by(api_id=m['id']).first()
                if not existing:
                    continue
                prev_status = existing.status
                existing.status = map_api_status(m['status'])
                score = m.get('score', {}).get('fullTime', {})
                existing.home_score_90 = score.get('home')
                existing.away_score_90 = score.get('away')
                if existing.home_score_90 is not None:
                    existing.result_90 = compute_result_90(
                        existing.home_score_90, existing.away_score_90
                    )
                if prev_status != 'finished' and existing.status == 'finished':
                    db.session.commit()
                    recalculate_match_predictions(existing)
                    return
            db.session.commit()
        except Exception as e:
            logger.error('Error actualizando partidos en vivo: %s', e)
            db.session.rollback()


# FIFA ranking aproximado (menor = mejor) para los equipos del Mundial 2026
FIFA_RANKINGS = {
    'Argentina': 1, 'France': 2, 'England': 3, 'Belgium': 4, 'Brazil': 5,
    'Portugal': 6, 'Netherlands': 7, 'Spain': 8, 'Italy': 9, 'Germany': 10,
    'Croatia': 11, 'Uruguay': 12, 'United States': 13, 'Mexico': 14,
    'Colombia': 15, 'Senegal': 16, 'Denmark': 17, 'Austria': 18,
    'Switzerland': 19, 'Japan': 20, 'Morocco': 21, 'Ecuador': 22,
    'South Korea': 23, 'Canada': 24, 'Australia': 25, 'Peru': 26,
    'Poland': 27, 'Tunisia': 28, 'Cameroon': 29, 'Nigeria': 30,
    'Serbia': 31, 'Czech Republic': 32, 'Hungary': 33, 'Chile': 34,
    'Venezuela': 35, 'Ukraine': 36, 'Saudi Arabia': 37, 'Algeria': 38,
    'Paraguay': 39, 'Slovenia': 40, 'Bolivia': 41, 'Egypt': 42,
    'Costa Rica': 43, 'Jamaica': 44, 'Panama': 45, 'Honduras': 46,
    'Ivory Coast': 47, 'South Africa': 48,
}
DEFAULT_RANKING = 50  # equipos desconocidos


def _rank(team_name):
    return FIFA_RANKINGS.get(team_name, DEFAULT_RANKING)


def _bot_pick(home_team, away_team, rng):
    """Devuelve (predicted_home, predicted_away, predicted_result) para un bot."""
    import random
    r_home = _rank(home_team)
    r_away = _rank(away_team)

    # Probabilidad de victoria local proporcional a la diferencia de ranking
    diff = r_away - r_home  # positivo → favorito local
    # Mapear diferencia a probabilidad [0.2, 0.7]
    p_home = max(0.2, min(0.7, 0.45 + diff * 0.012))
    p_draw = 0.22
    p_away = max(0.1, 1.0 - p_home - p_draw)

    # Normalizar
    total = p_home + p_draw + p_away
    p_home /= total
    p_draw /= total
    p_away /= total

    roll = rng.random()
    if roll < p_home:
        result = '1'
    elif roll < p_home + p_draw:
        result = 'X'
    else:
        result = '2'

    # Generar marcador coherente
    if result == '1':
        home_g = rng.choices([1, 2, 3, 4], weights=[40, 35, 18, 7])[0]
        away_g = rng.choices([0, 1, 2], weights=[50, 35, 15])[0]
        away_g = min(away_g, home_g - 1)
    elif result == 'X':
        goals = rng.choices([0, 1, 2, 3], weights=[25, 40, 25, 10])[0]
        home_g = away_g = goals
    else:
        away_g = rng.choices([1, 2, 3, 4], weights=[40, 35, 18, 7])[0]
        home_g = rng.choices([0, 1, 2], weights=[50, 35, 15])[0]
        home_g = min(home_g, away_g - 1)

    return home_g, away_g, result


def generate_bot_predictions(app):
    """Genera predicciones para todos los bots en todos los partidos no bloqueados."""
    logger.info('JOB generate_bot_predictions — inicio')
    with app.app_context():
        import random
        from datetime import datetime, timezone, timedelta
        from app import db
        from app.models import User, Match, Prediction, LeagueMember

        try:
            bots = User.query.filter_by(is_bot=True).all()
            if not bots:
                logger.info('No hay bots en la BD')
                return

            now = datetime.now(timezone.utc)
            matches = Match.query.filter_by(status='scheduled').all()
            open_matches = [
                m for m in matches
                if now < m.match_datetime.replace(tzinfo=timezone.utc) - timedelta(minutes=30)
            ]

            if not open_matches:
                logger.info('No hay partidos abiertos para bots')
                return

            saved = 0
            for bot in bots:
                rng = random.Random(bot.id)  # semilla por bot para reproducibilidad
                # ligas del bot
                memberships = LeagueMember.query.filter_by(user_id=bot.id).all()
                league_ids = [m.league_id for m in memberships] or [None]

                for match in open_matches:
                    home_g, away_g, result = _bot_pick(match.home_team, match.away_team, rng)
                    for lid in league_ids:
                        existing = Prediction.query.filter_by(
                            user_id=bot.id, match_id=match.id, league_id=lid
                        ).first()
                        if existing:
                            continue
                        db.session.add(Prediction(
                            user_id=bot.id,
                            match_id=match.id,
                            league_id=lid,
                            predicted_result=result,
                            predicted_home=home_g,
                            predicted_away=away_g,
                        ))
                        saved += 1

            db.session.commit()
            logger.info('Bot predictions generadas: %d nuevas', saved)
        except Exception as e:
            logger.error('Error generando bot predictions: %s', e)
            db.session.rollback()


def init_scheduler(app):
    if scheduler.running:
        return

    scheduler.add_job(
        func=sync_full_calendar,
        args=[app],
        trigger=IntervalTrigger(hours=24),
        id='sync_full_calendar',
        replace_existing=True,
    )
    scheduler.add_job(
        func=sync_live_matches,
        args=[app],
        trigger=IntervalTrigger(minutes=5),
        id='sync_live_matches',
        replace_existing=True,
    )
    scheduler.add_job(
        func=generate_bot_predictions,
        args=[app],
        trigger=IntervalTrigger(hours=6),
        id='generate_bot_predictions',
        replace_existing=True,
    )
    scheduler.start()
    logger.info('Scheduler iniciado — jobs registrados: %s', [j.id for j in scheduler.get_jobs()])
