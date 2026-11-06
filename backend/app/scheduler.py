import logging
import time
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def _recalculate_finished_match(match):
    from app import db
    from app.utils import recalculate_match_predictions, recalculate_v2_for_match
    db.session.commit()
    recalculate_match_predictions(match)
    recalculate_v2_for_match(match)
    close_completed_jornadas(match.id)


def sync_full_calendar(app):
    logger.info('JOB sync_full_calendar — inicio')
    with app.app_context():
        from app import db
        from app.models import Match
        from app.utils import (fetch_wc_matches, map_api_phase, map_api_status,
                               parse_match_datetime, parse_api_score,
                               apply_api_result, apply_api_crests)
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
                    apply_api_crests(existing, m)
                    # Finished matches keep their stored result (points already awarded)
                    if not existing.is_manual and existing.status != 'finished':
                        apply_api_result(existing, m)
                        if existing.status == 'finished':
                            _recalculate_finished_match(existing)
                else:
                    status = map_api_status(m['status'])
                    home_90, away_90, home_final, away_final, result = parse_api_score(m, phase)
                    new_match = Match(
                        api_id=api_id, phase=phase, group_name=group_name,
                        home_team=home_team, away_team=away_team,
                        match_datetime=dt, status=status,
                        home_score_90=home_90, away_score_90=away_90,
                        home_score_final=home_final, away_score_final=away_final,
                        result_90=result if status == 'finished' else None,
                        is_manual=False, result_type='1X2',
                    )
                    apply_api_crests(new_match, m)
                    db.session.add(new_match)

            db.session.commit()
            logger.info('Calendario sincronizado: %d partidos procesados', len(matches_data))
        except Exception as e:
            logger.error('Error sincronizando calendario: %s', e)
            db.session.rollback()

        _sync_tracked_league_matches()


def _sync_tracked_league_matches():
    """Refresh date, crests and result of league matches already in our DB.

    Only matches imported by the admin are touched — full league calendars are
    never imported. One API call per competition with pending matches.
    """
    from app import db
    from app.models import Match, Competition
    from app.utils import (TRACKED_COMPETITIONS, API_THROTTLE_SECONDS, fetch_competition_matches,
                           parse_match_datetime, apply_api_result, apply_api_crests)

    since = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=3)
    calls = 0
    for code in TRACKED_COMPETITIONS:
        try:
            pending = (
                Match.query.join(Competition, Match.competition_id == Competition.id)
                .filter(Competition.code == code,
                        Match.api_id > 0,
                        Match.is_manual.is_(False),
                        Match.status != 'finished',
                        Match.match_datetime >= since)
                .all()
            )
            if not pending:
                continue

            if calls:
                time.sleep(API_THROTTLE_SECONDS)
            calls += 1
            date_from = min(p.match_datetime for p in pending).date()
            date_to = max(p.match_datetime for p in pending).date()
            api_by_id = {m['id']: m for m in fetch_competition_matches(code, date_from, date_to)}

            updated = 0
            for match in pending:
                m = api_by_id.get(match.api_id)
                if not m:
                    continue
                match.match_datetime = parse_match_datetime(m['utcDate'])
                apply_api_crests(match, m)
                apply_api_result(match, m)
                if match.status == 'finished':
                    _recalculate_finished_match(match)
                updated += 1
            db.session.commit()
            logger.info('Liga %s sincronizada: %d/%d partidos actualizados', code, updated, len(pending))
        except Exception as e:
            logger.error('Error sincronizando liga %s: %s', code, e)
            db.session.rollback()


def sync_live_matches(app):
    logger.info('JOB sync_live_matches — inicio')
    with app.app_context():
        from app import db
        from app.models import Match
        from app.utils import (fetch_live_matches, fetch_match_by_api_id,
                               apply_api_result, apply_api_crests)
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
                if existing.is_manual:
                    continue
                prev_status = existing.status
                apply_api_crests(existing, m)
                apply_api_result(existing, m)
                if prev_status != 'finished' and existing.status == 'finished':
                    _recalculate_finished_match(existing)
                    # Continue — don't return; there may be other live matches to process

            db.session.commit()
        except Exception as e:
            logger.error('Error actualizando partidos en vivo: %s', e)
            db.session.rollback()


# Matches older than this are not retried (e.g. postponed with no new date)
STUCK_LOOKBACK_DAYS = 14


def sync_stuck_matches(app):
    """Matches still 'scheduled' 2h after kick-off — the live job missed them."""
    logger.info('JOB sync_stuck_matches — inicio')
    with app.app_context():
        from app import db
        from app.models import Match
        from app.utils import (API_THROTTLE_SECONDS, fetch_match_by_api_id,
                               apply_api_result, apply_api_crests)

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        stuck = Match.query.filter(
            Match.status == 'scheduled',
            Match.api_id > 0,
            Match.is_manual.is_(False),
            Match.match_datetime < now - timedelta(hours=2),
            Match.match_datetime >= now - timedelta(days=STUCK_LOOKBACK_DAYS),
        ).all()
        logger.info('Partidos colgados encontrados: %d', len(stuck))

        for i, match in enumerate(stuck):
            if i:
                time.sleep(API_THROTTLE_SECONDS)
            try:
                m = fetch_match_by_api_id(match.api_id)
                if m.get('status') not in ('FINISHED', 'AWARDED'):
                    continue
                apply_api_crests(match, m)
                apply_api_result(match, m)
                _recalculate_finished_match(match)
                logger.info('Partido colgado actualizado: %s vs %s (api_id=%s) %s-%s',
                            match.home_team, match.away_team, match.api_id,
                            match.home_score_90, match.away_score_90)
            except Exception as e:
                logger.error('Error actualizando partido colgado api_id=%s: %s', match.api_id, e)
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
        from app.routes.notifications import send_push_notification

        user_ids = {uid for (uid,) in db.session.query(PushSubscription.user_id).distinct().all()}
        title = '⚽ PickGoal League — Nueva jornada disponible'
        body = f'La jornada {jornada.number} ya está abierta. ¡Haz tus predicciones!'
        sent = 0
        for uid in user_ids:
            try:
                sent += send_push_notification(uid, title, body)
            except Exception:
                pass
        logger.info('Push enviado a %d suscriptores', sent)
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
    """Schedule bot-prediction jobs for a jornada.

    Runs immediately for any matches whose 1-hour-before trigger has already
    passed, and schedules future jobs for the rest.
    """
    from app.models import JornadaMatch

    jm_list = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()
    scheduled = set()
    now = datetime.now(timezone.utc)
    needs_immediate = False

    for jm in jm_list:
        match = jm.match
        dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
        trigger_time = dt_utc - timedelta(hours=1)

        if trigger_time <= now:
            # Trigger already passed — run immediately once for the whole jornada
            needs_immediate = True
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

    if needs_immediate:
        logger.info('Bot predictions V2 inmediatas: jornada %d (trigger ya pasó)', jornada.id)
        _run_bot_predictions_v2(app, jornada.id)


def _run_bot_predictions_v2(app, jornada_id):
    logger.info('JOB bot_predictions_v2 — jornada %d', jornada_id)
    with app.app_context():
        from app.bots import generate_bot_predictions_v2
        try:
            generate_bot_predictions_v2(jornada_id)
        except Exception as e:
            logger.error('Error en bot_predictions_v2 jornada %d: %s', jornada_id, e)


def _recalculate_all_points(jornada):
    """
    Recalcula los puntos de todos los participantes (predicciones + duelos) de
    una jornada y actualiza las posiciones de división. No toca jornada.status.
    Asume estar dentro de un app_context.
    """
    from app import db
    from app.models import PredictionV2, Duelo
    from app.utils import calculate_jornada_points

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


def _close_single_jornada(jornada):
    """
    Cierra una jornada concreta: marca status='finished', recalcula puntos y
    posiciones de división y, si toca, ejecuta la rotación de divisiones.
    Asume estar dentro de un app_context.
    """
    from app import db
    from app.models import Jornada

    # Atomic open -> finished: if the cron, the admin and a sync job race,
    # only one of them closes (and rotates divisions).
    claimed = (
        Jornada.query
        .filter(Jornada.id == jornada.id, Jornada.status.in_(['upcoming', 'active']))
        .update({'status': 'finished'}, synchronize_session=False)
    )
    db.session.commit()
    if not claimed:
        logger.info('Jornada %d ya estaba cerrada', jornada.number)
        return False

    _recalculate_all_points(jornada)
    logger.info('Jornada %d cerrada', jornada.number)

    # Rotación de divisiones al final de cada vuelta (cada 15 jornadas)
    from app.divisions import ROTATION_JORNADAS, TOTAL_JORNADAS, process_rotation
    if jornada.number % ROTATION_JORNADAS == 0:
        season = jornada.season
        if season and season.status == 'active':
            vuelta = jornada.number // ROTATION_JORNADAS
            is_final = (jornada.number >= TOTAL_JORNADAS)

            # Sustituir usuarios inactivos antes de calcular ascensos/descensos
            # para que el bot herede la posición correcta en process_rotation.
            from app.models import Duelo
            jornada_ids_in_season = [j.id for j in season.jornadas.all()]
            division_league_ids = {
                d.division_league_id
                for jid in jornada_ids_in_season
                for d in Duelo.query.filter_by(jornada_id=jid).all()
            }
            from app.bots import replace_inactive_users
            for lid in division_league_ids:
                try:
                    replace_inactive_users(lid, vuelta)
                except Exception:
                    logger.exception(
                        '[close] replace_inactive_users falló para liga %d vuelta %d', lid, vuelta
                    )
                    db.session.rollback()

            logger.info(
                'Jornada %d — rotación de divisiones (temporada %d, final=%s)',
                jornada.number, season.id, is_final,
            )
            process_rotation(season.id, close_season=is_final)

    return True


def _jornada_is_complete(jornada):
    """True when every non-cancelled match of the jornada has its final result."""
    jms = [jm for jm in jornada.jornada_matches.all() if jm.status != 'cancelled']
    return bool(jms) and all(
        jm.match.status == 'finished' and jm.match.result_90 is not None for jm in jms
    )


def close_completed_jornadas(match_id):
    """
    Called whenever a match gets its result (admin or sync jobs): closes every
    open jornada containing it once all of that jornada's matches are resolved.
    Assumes an app_context.
    """
    from app import db
    from app.models import Jornada, JornadaMatch

    jornada_ids = {jm.jornada_id for jm in JornadaMatch.query.filter_by(match_id=match_id).all()}
    if not jornada_ids:
        return
    open_jornadas = Jornada.query.filter(
        Jornada.id.in_(jornada_ids), Jornada.status.in_(['upcoming', 'active'])
    ).all()
    for jornada in open_jornadas:
        if not _jornada_is_complete(jornada):
            continue
        logger.info('Jornada %d: todos los partidos con resultado — cierre automático', jornada.number)
        try:
            _close_single_jornada(jornada)
        except Exception as e:
            logger.error('Error en cierre automático de jornada %d: %s', jornada.id, e)
            db.session.rollback()


def cerrar_jornada(app):
    logger.info('JOB cerrar_jornada — inicio')
    with app.app_context():
        from app import db
        from app.models import Jornada

        try:
            now = datetime.now(timezone.utc)
            # Cierra toda jornada activa o próxima cuya fecha de fin ya pasó.
            # (Antes solo miraba status='active' y una sola jornada, así que las
            #  jornadas que se quedaban en 'upcoming' nunca se cerraban.)
            pendientes = (
                Jornada.query
                .filter(
                    Jornada.status.in_(['active', 'upcoming']),
                    Jornada.date_end < now,
                )
                .order_by(Jornada.number.asc())
                .all()
            )
            if not pendientes:
                logger.info('cerrar_jornada: no hay jornadas pendientes de cierre')
                return

            for jornada in pendientes:
                try:
                    _close_single_jornada(jornada)
                except Exception as e:
                    logger.error('Error cerrando jornada %d: %s', jornada.id, e)
                    db.session.rollback()
        except Exception as e:
            logger.error('Error en cerrar_jornada: %s', e)
            db.session.rollback()


def check_inactive_users(app):
    """
    Run after each jornada closes. Users with 4+ consecutive jornadas
    without predictions are replaced by a bot and their account deleted.
    Users with exactly 3 consecutive misses receive a push warning.
    """
    logger.info('JOB check_inactive_users — inicio')
    with app.app_context():
        from app import db
        from app.models import User, DivisionMember, Jornada, JornadaMatch, PredictionV2, PushSubscription

        try:
            # Last 4 finished jornadas, most recent first
            recent = (
                Jornada.query
                .filter_by(status='finished')
                .order_by(Jornada.number.desc())
                .limit(4)
                .all()
            )
            if not recent:
                logger.info('check_inactive_users: sin jornadas terminadas')
                return

            # Precompute jm_ids per jornada
            jornada_jm_ids = {}
            for j in recent:
                jornada_jm_ids[j.id] = [
                    jm.id for jm in JornadaMatch.query.filter_by(jornada_id=j.id).all()
                ]

            real_user_ids = {
                dm.user_id
                for dm in DivisionMember.query.filter_by(is_bot=False).all()
            }

            for user_id in real_user_ids:
                consecutive_misses = 0
                for j in recent:
                    jm_ids = jornada_jm_ids.get(j.id, [])
                    if not jm_ids:
                        continue
                    has_pred = PredictionV2.query.filter(
                        PredictionV2.user_id == user_id,
                        PredictionV2.jornada_match_id.in_(jm_ids),
                    ).first() is not None
                    if has_pred:
                        break
                    consecutive_misses += 1

                if consecutive_misses >= 4:
                    user = db.session.get(User, user_id)
                    if user and not user.is_bot:
                        logger.info(
                            'Eliminando usuario %d (%s) por %d jornadas inactivo',
                            user_id, user.username, consecutive_misses,
                        )
                        try:
                            from app.bots import replace_user_with_bot
                            from app.routes.auth import _purge_user
                            replace_user_with_bot(user_id)
                            _purge_user(user_id)
                        except Exception as e:
                            logger.error('Error eliminando usuario %d: %s', user_id, e)
                            db.session.rollback()

                elif consecutive_misses == 3:
                    user = db.session.get(User, user_id)
                    if user:
                        _push_inactivity_warning(user)

        except Exception as e:
            logger.error('Error en check_inactive_users: %s', e)
            db.session.rollback()


def _push_inactivity_warning(user):
    """Send a push notification warning the user they are about to be removed."""
    try:
        from app.routes.notifications import send_push_notification

        title = '⚠️ PickGoal — Aviso de inactividad'
        body = (
            f'Hola {user.username}, llevas 3 jornadas sin predecir. '
            'Si no participas en la próxima serás reemplazado.'
        )
        sent = send_push_notification(user.id, title, body)
        logger.info('Push inactividad enviado a usuario %d (%d suscripciones)', user.id, sent)
    except Exception as e:
        logger.warning('Error enviando push inactividad a usuario %d: %s', user.id, e)


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


def _ensure_bot_predictions_v2(app):
    """Fallback: run bot predictions for any active/upcoming jornada that needs them."""
    with app.app_context():
        from app.models import Jornada
        jornada = (
            Jornada.query
            .filter(Jornada.status.in_(['active', 'upcoming']))
            .order_by(Jornada.date_start.asc())
            .first()
        )
        if jornada:
            logger.info('ensure_bot_predictions_v2: ejecutando para jornada %d', jornada.id)
            _run_bot_predictions_v2(app, jornada.id)


def notificar_jornada_disponible(app):
    """Lunes 10:00 UTC — push a todos los usuarios: nueva jornada disponible."""
    with app.app_context():
        try:
            from app import db
            from app.models import User, Jornada
            from app.routes.notifications import send_push_notification

            jornada = (
                Jornada.query
                .filter(Jornada.status.in_(['active', 'upcoming']))
                .order_by(Jornada.date_start.asc())
                .first()
            )
            if not jornada:
                logger.info('notificar_jornada_disponible: no hay jornada activa/próxima')
                return

            users = User.query.filter_by(is_bot=False).all()
            title = '⚽ PickGoal — Nueva jornada disponible'
            body = '¡Ya puedes hacer tus pronósticos para esta semana!'
            total = 0
            for user in users:
                total += send_push_notification(user.id, title, body)
            logger.info('notificar_jornada_disponible: %d push enviados para jornada %d', total, jornada.id)
        except Exception as e:
            logger.error('Error en notificar_jornada_disponible: %s', e)


def notificar_primer_partido(app):
    """Viernes 18:00 UTC — push si el primer partido de la jornada es hoy."""
    with app.app_context():
        try:
            from app import db
            from app.models import User, Jornada, JornadaMatch
            from app.routes.notifications import send_push_notification

            jornada = (
                Jornada.query
                .filter(Jornada.status.in_(['active', 'upcoming']))
                .order_by(Jornada.date_start.asc())
                .first()
            )
            if not jornada:
                logger.info('notificar_primer_partido: no hay jornada activa/próxima')
                return

            first_match = (
                JornadaMatch.query
                .filter_by(jornada_id=jornada.id)
                .filter(JornadaMatch.status == 'scheduled')
                .order_by(JornadaMatch.match_id.asc())
                .first()
            )
            if not first_match:
                logger.info('notificar_primer_partido: no hay partidos programados')
                return

            users = User.query.filter_by(is_bot=False).all()
            title = '🔔 PickGoal — ¡Último aviso!'
            body = 'El primer partido de la jornada empieza hoy. Última oportunidad para predecir.'
            total = 0
            for user in users:
                total += send_push_notification(user.id, title, body)
            logger.info('notificar_primer_partido: %d push enviados para jornada %d', total, jornada.id)
        except Exception as e:
            logger.error('Error en notificar_primer_partido: %s', e)


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
        func=sync_stuck_matches,
        args=[app],
        trigger=IntervalTrigger(hours=6),
        id='sync_stuck_matches',
        replace_existing=True,
    )
    scheduler.add_job(
        func=generate_bot_predictions,
        args=[app],
        trigger=IntervalTrigger(hours=6),
        id='generate_bot_predictions',
        replace_existing=True,
    )
    scheduler.add_job(
        func=_ensure_bot_predictions_v2,
        args=[app],
        trigger=IntervalTrigger(hours=12),
        id='ensure_bot_predictions_v2',
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
    # Runs 5 min after cerrar_jornada so positions are already updated
    scheduler.add_job(
        func=check_inactive_users,
        args=[app],
        trigger=CronTrigger(day_of_week='mon', hour=0, minute=5, timezone='UTC'),
        id='check_inactive_users',
        replace_existing=True,
    )
    scheduler.add_job(
        func=notificar_jornada_disponible,
        args=[app],
        trigger=CronTrigger(day_of_week='mon', hour=10, minute=0, timezone='UTC'),
        id='notificar_jornada_disponible',
        replace_existing=True,
    )
    scheduler.add_job(
        func=notificar_primer_partido,
        args=[app],
        trigger=CronTrigger(day_of_week='fri', hour=18, minute=0, timezone='UTC'),
        id='notificar_primer_partido',
        replace_existing=True,
    )

    scheduler.start()
    logger.info('Scheduler iniciado — jobs registrados: %s', [j.id for j in scheduler.get_jobs()])
