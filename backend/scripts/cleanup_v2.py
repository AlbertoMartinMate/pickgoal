"""
Limpieza de usuarios v2 + redistribución de divisiones.

Criterios de borrado:
  - is_bot=False, is_admin=False
  - Sin predicciones (predictions + predictions_v2)
  - Sin mensajes en board_messages
  - FORZADO: id=28 y id=40 (usuarios con HTML/script injection)

Redistribución:
  - Una sola liga (PickGoal Liga Oficial, id=4)
  - Top usuarios reales por pts + bots hasta completar 16

Uso:
  cd backend && source venv/bin/activate
  DATABASE_URL=$(grep ^DATABASE_URL .env | cut -d= -f2-) python scripts/cleanup_v2.py
"""

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models import (
    User, Prediction, PredictionV2, BoardMessage,
    DivisionMember, LeagueMember, League,
)

OFFICIAL_LEAGUE_ID = 4
DIVISION = 1
LEAGUE_SIZE = 16
FORCED_DELETE_IDS = {28, 40}   # HTML/script injection


# ─────────────────────────────────────────────
# Análisis (solo lectura)
# ─────────────────────────────────────────────

def _collect():
    candidates = User.query.filter_by(is_bot=False, is_admin=False).all()
    to_delete, to_keep = [], []

    for u in candidates:
        forced = u.id in FORCED_DELETE_IDS
        n_pred    = Prediction.query.filter_by(user_id=u.id).count()
        n_pred_v2 = PredictionV2.query.filter_by(user_id=u.id).count()
        n_msgs    = BoardMessage.query.filter_by(user_id=u.id).count()
        empty     = (n_pred == 0 and n_pred_v2 == 0 and n_msgs == 0)
        if forced or empty:
            to_delete.append((u, forced, n_pred, n_pred_v2, n_msgs))
        else:
            to_keep.append(u)

    bots = User.query.filter_by(is_bot=True).order_by(User.id).all()
    return to_delete, to_keep, bots


def _build_redistribution(to_keep, bots):
    """
    Returns (real_members, bot_members) lists for the single official league.
    real_members sorted by pts DESC, bots fill to LEAGUE_SIZE.
    """
    real_sorted = sorted(to_keep, key=lambda u: u.total_points_all_time, reverse=True)
    spots_for_bots = max(0, LEAGUE_SIZE - len(real_sorted))
    return real_sorted, bots[:spots_for_bots]


def _print_summary(to_delete, to_keep, bots, real_members, bot_members):
    print('\n══════════════════════════════════════════════════════════')
    print('  RESUMEN DE LIMPIEZA V2')
    print('══════════════════════════════════════════════════════════')

    print(f'\n🗑  USUARIOS A ELIMINAR ({len(to_delete)})')
    print(f"  {'ID':>5}  {'username':<35}  {'forced':>6}  preds  preds_v2  msgs")
    print('  ' + '-'*75)
    for u, forced, np, npv2, nm in to_delete:
        tag = '⚠ FORZADO' if forced else ''
        print(f"  {u.id:>5}  {u.username:<35}  {tag:>9}  {np:>5}  {npv2:>8}  {nm:>4}")

    print(f'\n✅ USUARIOS A CONSERVAR ({len(to_keep)})')
    for u in sorted(to_keep, key=lambda x: x.total_points_all_time, reverse=True):
        print(f"  id={u.id:<4}  {u.username:<35}  {u.total_points_all_time} pts")

    league = League.query.get(OFFICIAL_LEAGUE_ID)
    league_name = league.name if league else f'id={OFFICIAL_LEAGUE_ID}'
    total = len(real_members) + len(bot_members)
    print(f'\n🏆 REDISTRIBUCIÓN — Liga "{league_name}" (id={OFFICIAL_LEAGUE_ID}), División {DIVISION}')
    print(f'   {total} miembros: {len(real_members)} reales + {len(bot_members)} bots')
    print(f'\n  pos  tipo   username')
    print('  ' + '-'*40)
    for i, u in enumerate(real_members, 1):
        print(f"  {i:>3}  real   {u.username}  ({u.total_points_all_time} pts)")
    for i, u in enumerate(bot_members, len(real_members) + 1):
        print(f"  {i:>3}  bot    {u.username}")

    unused = len(bots) - len(bot_members)
    if unused > 0:
        names = ', '.join(b.username for b in bots[len(bot_members):])
        print(f'\n  (Bots sin asignar: {names})')

    print('\n══════════════════════════════════════════════════════════\n')


# ─────────────────────────────────────────────
# Ejecución
# ─────────────────────────────────────────────

def _delete_users(to_delete):
    for u, forced, *_ in to_delete:
        # Eliminar relaciones sin cascade explícito
        DivisionMember.query.filter_by(user_id=u.id).delete()
        LeagueMember.query.filter_by(user_id=u.id).delete()
        # Las relaciones con cascade (predictions, board_messages, etc.) se
        # eliminan al borrar el usuario
        db.session.delete(u)
    db.session.flush()
    print(f'✓ {len(to_delete)} usuarios eliminados')


def _rebuild_division(real_members, bot_members):
    # Limpiar division_members actuales de la liga oficial
    deleted = DivisionMember.query.filter_by(league_id=OFFICIAL_LEAGUE_ID).delete()
    db.session.flush()
    print(f'✓ {deleted} registros division_members anteriores eliminados')

    pos = 1
    for u in real_members:
        db.session.add(DivisionMember(
            league_id=OFFICIAL_LEAGUE_ID,
            user_id=u.id,
            is_bot=False,
            division=DIVISION,
            position=pos,
            season_div_points=0,
            season_total_points=0.0,
        ))
        u.current_division = DIVISION
        u.current_league_id = OFFICIAL_LEAGUE_ID
        pos += 1

    for u in bot_members:
        db.session.add(DivisionMember(
            league_id=OFFICIAL_LEAGUE_ID,
            user_id=u.id,
            is_bot=True,
            division=DIVISION,
            position=pos,
            season_div_points=0,
            season_total_points=0.0,
        ))
        u.current_division = DIVISION
        u.current_league_id = OFFICIAL_LEAGUE_ID
        pos += 1

    db.session.flush()
    print(f'✓ {pos - 1} miembros añadidos a liga {OFFICIAL_LEAGUE_ID} (División {DIVISION})')


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    app = create_app()
    with app.app_context():
        to_delete, to_keep, bots = _collect()
        real_members, bot_members = _build_redistribution(to_keep, bots)
        _print_summary(to_delete, to_keep, bots, real_members, bot_members)

        resp = input('¿Ejecutar limpieza y redistribución? [s/N] ').strip().lower()
        if resp != 's':
            print('Operación cancelada.')
            return

        print('\nEjecutando...\n')
        _delete_users(to_delete)
        _rebuild_division(real_members, bot_members)
        db.session.commit()
        print('\n✅ Limpieza y redistribución completadas.')
        print(f'   Liga {OFFICIAL_LEAGUE_ID}: {len(real_members)} reales + {len(bot_members)} bots = {len(real_members)+len(bot_members)} miembros')


if __name__ == '__main__':
    main()
