import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger

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
                    # Don't overwrite a known team name with TBD — API can temporarily
                    # return null for knockout teams already resolved in a prior sync
                    if home_team != 'TBD' or existing.home_team == 'TBD':
                        existing.home_team = home_team
                    if away_team != 'TBD' or existing.away_team == 'TBD':
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
        from app.utils import (fetch_live_matches, fetch_match_by_api_id,
                               map_api_status, compute_result_90,
                               recalculate_match_predictions)
        try:
            live_data = fetch_live_matches()
            live_api_ids = {m['id'] for m in live_data}

            # Fetch individually any match that is 'live' in our DB but no longer
            # appears in the IN_PLAY/PAUSED feed — it has likely just finished
            db_live = Match.query.filter_by(status='live').all()
            for db_match in db_live:
                if db_match.api_id not in live_api_ids:
                    try:
                        fetched = fetch_match_by_api_id(db_match.api_id)
                        if fetched:
                            live_data.append(fetched)
                    except Exception as e:
                        logger.error('Error fetching match api_id=%s: %s', db_match.api_id, e)

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
                    from app.utils import recalculate_v2_for_match
                    recalculate_v2_for_match(existing)
                    # Continue — don't return; there may be other live matches to process

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


# ---------------------------------------------------------------------------
# V2 scheduler jobs
# ---------------------------------------------------------------------------

def publicar_jornadas_draft(app):
    """
    Lunes 08:00 UTC — publica jornadas en draft cuya date_start cae
    dentro de los próximos 7 días. Si no hay ninguna, ejecuta la
    selección automática como fallback.
    """
    logger.info('JOB publicar_jornadas_draft — inicio')
    with app.app_context():
        from app import db
        from app.models import Jornada, JornadaMatch, DivisionMember
        from app.utils import calculate_odds
        from app.routes.duelos import assign_duelos

        try:
            now = datetime.now(timezone.utc)
            deadline = now + timedelta(days=7)

            drafts = Jornada.query.filter(
                Jornada.status == 'draft',
                Jornada.date_start <= deadline,
            ).order_by(Jornada.number.asc()).all()

            if not drafts:
                logger.info('No hay jornadas draft → ejecutando selección automática')
                _auto_seleccionar_jornada(app)
                return

            for jornada in drafts:
                jm_list = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()
                for jm in jm_list:
                    if jm.odds_1 is None:
                        try:
                            o1, ox, o2 = calculate_odds(jm.match)
                        except Exception:
                            o1, ox, o2 = 2.50, 3.20, 2.80
                        jm.odds_1 = o1
                        jm.odds_x = ox
                        jm.odds_2 = o2
                        jm.calculated_at = now

                jornada.status = 'upcoming'
                db.session.commit()

                active_league_ids = {dm.league_id for dm in DivisionMember.query.all()}
                for lid in active_league_ids:
                    try:
                        assign_duelos(jornada.id, lid)
                    except Exception as e:
                        logger.error('Error asignando duelos liga %d jornada %d: %s', lid, jornada.id, e)

                _push_jornada_published(app, jornada)
                logger.info('Jornada %d publicada (%d partidos)', jornada.number, len(jm_list))

        except Exception as e:
            logger.error('Error en publicar_jornadas_draft: %s', e)
            db.session.rollback()


def _push_jornada_published(app, jornada):
    """Envía push a todos los usuarios notificando la nueva jornada."""
    try:
        from app.models import PushSubscription
        from app.routes.notifications import _send_push

        subs = PushSubscription.query.all()
        payload = {
            'title': '⚽ PickGoal League — Nueva jornada disponible',
            'body': f'La jornada {jornada.number} ya está abierta. ¡Haz tus predicciones!',
        }
        for sub in subs:
            try:
                _send_push(sub, payload)
            except Exception:
                pass
        logger.info('Push enviado a %d suscriptores', len(subs))
    except Exception as e:
        logger.warning('Error enviando push de jornada publicada: %s', e)


def _auto_seleccionar_jornada(app):
    """Fallback: selección automática de partidos para la semana siguiente."""
    with app.app_context():
        from app import db
        from app.models import Season, Jornada, Match, JornadaMatch, DivisionMember
        from app.utils import calculate_odds, select_jornada_matches
        from app.routes.duelos import assign_duelos

        try:
            season = Season.query.filter_by(status='active').first()
            if not season:
                logger.warning('_auto_seleccionar_jornada: no hay temporada activa')
                return

            now = datetime.now(timezone.utc)
            days_to_tue = (1 - now.weekday()) % 7 or 7
            tue_start = (now + timedelta(days=days_to_tue)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            sun_end = tue_start + timedelta(days=5, hours=23, minutes=59, seconds=59)

            candidates = Match.query.filter(
                Match.status == 'scheduled',
                Match.match_datetime >= tue_start,
                Match.match_datetime <= sun_end,
            ).all()

            if not candidates:
                logger.warning('_auto_seleccionar_jornada: sin partidos candidatos')
                return

            last = Jornada.query.filter_by(season_id=season.id).order_by(
                Jornada.number.desc()
            ).first()
            next_number = (last.number + 1) if last else 1

            jornada = Jornada(
                season_id=season.id,
                number=next_number,
                date_start=tue_start,
                date_end=sun_end,
                status='upcoming',
            )
            db.session.add(jornada)
            db.session.flush()

            selected_ids = select_jornada_matches(jornada, candidates)
            for match_id in selected_ids:
                match = db.session.get(Match, match_id)
                try:
                    o1, ox, o2 = calculate_odds(match)
                except Exception:
                    o1, ox, o2 = 2.50, 3.20, 2.80
                db.session.add(JornadaMatch(
                    jornada_id=jornada.id, match_id=match_id,
                    odds_1=o1, odds_x=ox, odds_2=o2,
                    calculated_at=datetime.now(timezone.utc),
                ))

            db.session.commit()

            active_league_ids = {dm.league_id for dm in DivisionMember.query.all()}
            for lid in active_league_ids:
                try:
                    assign_duelos(jornada.id, lid)
                except Exception as e:
                    logger.error('Error asignando duelos liga %d: %s', lid, e)

            logger.info('Jornada %d auto-creada: %d partidos', next_number, len(selected_ids))
        except Exception as e:
            logger.error('Error en _auto_seleccionar_jornada: %s', e)
            db.session.rollback()


def seleccionar_jornada_semanal(app):
    """Alias mantenido por compatibilidad — delega en publicar_jornadas_draft."""
    publicar_jornadas_draft(app)


def activar_jornada(app):
    logger.info('JOB activar_jornada — inicio')
    with app.app_context():
        from app import db
        from app.models import Jornada

        try:
            jornada = (
                Jornada.query.filter_by(status='upcoming')
                .order_by(Jornada.number.asc())
                .first()
            )
            if not jornada:
                logger.info('activar_jornada: no hay jornada upcoming')
                return

            jornada.status = 'active'
            db.session.commit()

            _schedule_bot_predictions_for_jornada(app, jornada)
            logger.info('Jornada %d activada', jornada.number)
        except Exception as e:
            logger.error('Error en activar_jornada: %s', e)
            db.session.rollback()


def _schedule_bot_predictions_for_jornada(app, jornada):
    """Schedule one bot-prediction job per match, 1 hour before kick-off."""
    from app.models import JornadaMatch

    jm_list = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()
    scheduled = set()

    for jm in jm_list:
        match = jm.match
        dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
        trigger_time = dt_utc - timedelta(hours=1)

        if trigger_time <= datetime.now(timezone.utc):
            continue

        # One job per kick-off hour (avoids duplicates for same-time matches)
        slot = trigger_time.replace(minute=0, second=0, microsecond=0)
        if slot in scheduled:
            continue
        scheduled.add(slot)

        job_id = f'bot_v2_{jornada.id}_{slot.strftime("%Y%m%d%H")}'
        scheduler.add_job(
            func=_run_bot_predictions_v2,
            args=[app, jornada.id],
            trigger=DateTrigger(run_date=trigger_time),
            id=job_id,
            replace_existing=True,
        )
        logger.info('Bot predictions V2 programadas: jornada %d a las %s', jornada.id, trigger_time)


def _run_bot_predictions_v2(app, jornada_id):
    logger.info('JOB bot_predictions_v2 — jornada %d', jornada_id)
    with app.app_context():
        from app.bots import generate_bot_predictions_v2
        try:
            generate_bot_predictions_v2(jornada_id)
        except Exception as e:
            logger.error('Error en bot_predictions_v2 jornada %d: %s', jornada_id, e)


def cerrar_jornada(app):
    logger.info('JOB cerrar_jornada — inicio')
    with app.app_context():
        from app import db
        from app.models import Jornada, PredictionV2, Duelo
        from app.utils import calculate_jornada_points

        try:
            jornada = Jornada.query.filter_by(status='active').first()
            if not jornada:
                logger.info('cerrar_jornada: no hay jornada activa')
                return

            jornada.status = 'finished'
            db.session.commit()

            jm_ids = [jm.id for jm in jornada.jornada_matches.all()]

            # All users with predictions or in duelos
            user_ids = {
                p.user_id for p in
                PredictionV2.query.filter(
                    PredictionV2.jornada_match_id.in_(jm_ids)
                ).all()
            }
            for duelo in Duelo.query.filter_by(jornada_id=jornada.id).all():
                user_ids.add(duelo.player1_id)
                user_ids.add(duelo.player2_id)

            for uid in user_ids:
                try:
                    calculate_jornada_points(uid, jornada.id, commit=False)
                except Exception as e:
                    logger.error('Error puntos user %d jornada %d: %s', uid, jornada.id, e)

            db.session.commit()
            _update_division_positions(jornada.id)
            logger.info('Jornada %d cerrada', jornada.number)
        except Exception as e:
            logger.error('Error en cerrar_jornada: %s', e)
            db.session.rollback()


def _update_division_positions(jornada_id):
    """Cache division standings positions and season accumulators after jornada close."""
    from app import db
    from app.models import Duelo, DivisionMember
    from app.divisions import get_division_standings

    league_ids = {
        d.division_league_id
        for d in Duelo.query.filter_by(jornada_id=jornada_id).all()
    }

    for lid in league_ids:
        standings = get_division_standings(lid)
        for row in standings:
            dm = DivisionMember.query.filter_by(
                league_id=lid, user_id=row['user_id']
            ).first()
            if dm:
                dm.position = row['pos']
                dm.season_div_points = row['pts_division']
                dm.season_total_points = row['pts_general']

    db.session.commit()


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

    # V2 weekly jobs
    scheduler.add_job(
        func=publicar_jornadas_draft,
        args=[app],
        trigger=CronTrigger(day_of_week='mon', hour=8, minute=0, timezone='UTC'),
        id='publicar_jornadas_draft',
        replace_existing=True,
    )
    scheduler.add_job(
        func=activar_jornada,
        args=[app],
        trigger=CronTrigger(day_of_week='tue', hour=10, minute=0, timezone='UTC'),
        id='activar_jornada',
        replace_existing=True,
    )
    scheduler.add_job(
        func=cerrar_jornada,
        args=[app],
        trigger=CronTrigger(day_of_week='sun', hour=23, minute=59, timezone='UTC'),
        id='cerrar_jornada',
        replace_existing=True,
    )

    scheduler.start()
    logger.info('Scheduler iniciado — jobs registrados: %s', [j.id for j in scheduler.get_jobs()])
