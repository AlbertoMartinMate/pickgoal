"""
Historial persistente de jornadas y fases.

- user_jornada_stats: una fila por usuario y jornada cerrada (puntos, aciertos,
  resultado del duelo). Se escribe al cerrar/recalcular una jornada finalizada.
- fase_results: clasificación final de cada división, escrita en el cierre de
  fase ANTES de que process_fase_close borre los Duelo.

Es la fuente de datos para Stats y Logros, que no pueden depender de la tabla
duelos (se vacía en cada cierre de fase).
"""
import logging

logger = logging.getLogger(__name__)


def fase_for_jornada(season_id, jornada_number):
    """
    Fase (1, 2, 3...) a la que pertenece una jornada: 1 + número de cierres de
    fase de la temporada cuya última jornada es anterior a ésta. No asume que
    las fases duren exactamente 15 jornadas.
    """
    from app import db
    from app.models import FaseResult

    closed = (
        db.session.query(FaseResult.fase)
        .filter(
            FaseResult.season_id == season_id,
            FaseResult.last_jornada_number < jornada_number,
        )
        .distinct()
        .count()
    )
    return closed + 1


def _duel_result(duelo, user_id):
    if duelo.player1_id == duelo.player2_id:
        return 'B'
    if duelo.winner_id == user_id:
        return 'W'
    if duelo.winner_id is not None:
        return 'L'
    resolved = (duelo.div_points_p1 or 0) + (duelo.div_points_p2 or 0) > 0
    return 'D' if resolved else None


def build_jornada_stats(jornada):
    """
    Calcula (sin escribir) las filas de user_jornada_stats de una jornada.
    Devuelve lista de dicts. Participantes = usuarios con predicción o duelo.
    """
    from app import db
    from app.models import JornadaMatch, PredictionV2, Duelo, DivisionMember, User
    from app.utils import compute_jornada_score

    jm_ids = [jm.id for jm in JornadaMatch.query.filter_by(jornada_id=jornada.id).all()]
    user_ids = set()
    if jm_ids:
        user_ids = {
            uid for (uid,) in db.session.query(PredictionV2.user_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).distinct().all()
        }

    duelo_by_user = {}
    for d in Duelo.query.filter_by(jornada_id=jornada.id).all():
        duelo_by_user[d.player1_id] = d
        duelo_by_user[d.player2_id] = d
    user_ids |= set(duelo_by_user)
    if not user_ids:
        return []

    division_cache = {}

    def _division_of(league_id):
        if league_id not in division_cache:
            dm = DivisionMember.query.filter_by(league_id=league_id).first()
            division_cache[league_id] = dm.division if dm else None
        return division_cache[league_id]

    users = {u.id: u for u in User.query.filter(User.id.in_(user_ids)).all()}
    fase = fase_for_jornada(jornada.season_id, jornada.number)

    rows = []
    for uid in sorted(user_ids):
        if uid not in users:
            continue
        score = compute_jornada_score(uid, jornada.id)
        d = duelo_by_user.get(uid)
        opponent = None
        if d and d.player1_id != d.player2_id:
            opponent = d.player2_id if d.player1_id == uid else d.player1_id
        rows.append({
            'user_id': uid,
            'jornada_id': jornada.id,
            'season_id': jornada.season_id,
            'fase': fase,
            'points': score['total'],
            'hits': score['hits'],
            'matches_counted': score['matches_counted'],
            'duel_result': _duel_result(d, uid) if d else None,
            'duel_opponent_id': opponent,
            'division_league_id': d.division_league_id if d else None,
            'division': _division_of(d.division_league_id) if d else None,
            'is_bot': bool(users[uid].is_bot),
            # Solo para verificación en el backfill (no se persiste)
            '_duel_stored_points': (
                (d.points_player1 if d.player1_id == uid else d.points_player2) if d else None
            ),
        })
    return rows


def upsert_jornada_stats(rows):
    """Inserta o actualiza filas de user_jornada_stats. No hace commit."""
    from app import db
    from app.models import UserJornadaStats

    if not rows:
        return 0
    jornada_ids = {r['jornada_id'] for r in rows}
    existing = {
        (s.user_id, s.jornada_id): s
        for s in UserJornadaStats.query.filter(UserJornadaStats.jornada_id.in_(jornada_ids)).all()
    }
    for r in rows:
        data = {k: v for k, v in r.items() if not k.startswith('_')}
        obj = existing.get((r['user_id'], r['jornada_id']))
        if obj is None:
            db.session.add(UserJornadaStats(**data))
        else:
            for k, v in data.items():
                setattr(obj, k, v)
    return len(rows)


def record_jornada_stats(jornada):
    """Escribe/reescribe el historial de una jornada finalizada y hace commit."""
    from app import db

    if jornada.status != 'finished':
        return 0
    n = upsert_jornada_stats(build_jornada_stats(jornada))
    db.session.commit()
    logger.info('[history] jornada %d: %d filas en user_jornada_stats', jornada.number, n)
    return n


def current_fase_context():
    """
    (season_id, fase, last_jornada_number) para un cierre de fase, basado en la
    última jornada finalizada. Lanza ValueError si esa fase ya se cerró.
    """
    from app.models import Jornada, FaseResult

    last = (
        Jornada.query.filter_by(status='finished')
        .order_by(Jornada.date_end.desc(), Jornada.number.desc())
        .first()
    )
    if not last:
        raise ValueError('No hay jornadas finalizadas: no se puede cerrar la fase')

    already = FaseResult.query.filter(
        FaseResult.season_id == last.season_id,
        FaseResult.last_jornada_number >= last.number,
    ).first()
    if already:
        raise ValueError(
            f'La fase {already.fase} ya se cerró tras la jornada {already.last_jornada_number}; '
            'no hay jornadas nuevas desde entonces'
        )
    return last.season_id, fase_for_jornada(last.season_id, last.number), last.number


def record_fase_results(season_id, fase, last_jornada_number, divisions):
    """
    divisions: lista de (league_id, division, standings_rows) con las filas de
    _standings_with_tiebreaker (claves pos, pj, g, e, p, pts_division,
    pts_general, is_bot). No hace commit.
    """
    from app import db
    from app.models import FaseResult

    n = 0
    for league_id, division, rows in divisions:
        for r in rows:
            db.session.add(FaseResult(
                season_id=season_id,
                fase=fase,
                last_jornada_number=last_jornada_number,
                league_id=league_id,
                division=division,
                user_id=r['user_id'],
                is_bot=bool(r.get('is_bot')),
                position=r['pos'],
                pts_division=r['pts_division'],
                pj=r['pj'], g=r['g'], e=r['e'], p=r['p'],
                fase_points=r['pts_general'],
            ))
            n += 1
    logger.info('[history] fase %d (temporada %d): %d filas en fase_results', fase, season_id, n)
    return n
