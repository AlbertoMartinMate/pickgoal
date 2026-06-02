import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def sync_full_calendar(app):
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
                home_team = m['homeTeam']['name']
                away_team = m['awayTeam']['name']
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
    scheduler.start()
    logger.info('Scheduler iniciado')
