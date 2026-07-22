"""
Migración de usuarios v1 → v2.

Uso:
  cd backend && source venv/bin/activate
  DATABASE_URL=$(grep ^DATABASE_URL .env | cut -d= -f2-) python scripts/migrate_users_v2.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import date
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import User, League, DivisionMember, Season

# ──────────────────────────────────────────────────────────────
# Configuración
# ──────────────────────────────────────────────────────────────

SEASON_NAME       = '26/27'
SEASON_START      = date(2026, 8, 15)
SEASON_END        = date(2027, 5, 31)
SEASON_STATUS     = 'upcoming'

LEAGUE_NAME       = 'PickGoal Liga Oficial'
DIVISION          = 1

BOT_NAMES = [
    'Xavi', 'Iniesta', 'Zidane', 'Ronaldo', 'Messi',
    'Cruyff', 'Pelé', 'Maradona', 'Beckham', 'Rooney',
    'Henry', 'Lampard', 'Gerrard', 'Pirlo', 'Buffon',
]


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def _get_admin_id():
    admin = User.query.filter_by(is_admin=True).first()
    if admin:
        return admin.id
    first = User.query.order_by(User.id).first()
    if first:
        return first.id
    raise RuntimeError('No hay ningún usuario en la BD para usar como created_by.')


def _collect_preview():
    old_bots   = User.query.filter_by(is_bot=True).all()
    real_users = (
        User.query
        .filter_by(is_bot=False, is_admin=False)
        .order_by(User.total_points_all_time.desc())
        .all()
    )
    existing_season = Season.query.filter_by(name=SEASON_NAME).first()
    existing_league = League.query.filter_by(name=LEAGUE_NAME).first()
    return old_bots, real_users, existing_season, existing_league


def _print_summary(old_bots, real_users, existing_season, existing_league):
    print('\n══════════════════════════════════════════════')
    print('  RESUMEN DE LA MIGRACIÓN')
    print('══════════════════════════════════════════════')

    print(f'\n[Temporada]  {SEASON_NAME}  ({SEASON_START} → {SEASON_END})')
    if existing_season:
        print(f'  ⚠️  Ya existe (id={existing_season.id}) — se reutilizará')
    else:
        print('  → Se creará nueva')

    print(f'\n[Liga]  "{LEAGUE_NAME}"')
    if existing_league:
        print(f'  ⚠️  Ya existe (id={existing_league.id}) — se reutilizará')
    else:
        print('  → Se creará nueva')

    print(f'\n[Bots antiguos a eliminar]  {len(old_bots)}')
    for b in old_bots:
        print(f'  - {b.username} (id={b.id})')

    print(f'\n[Bots nuevos a crear]  {len(BOT_NAMES)}')
    for name in BOT_NAMES:
        print(f'  - {name}  ({name.lower()}@pickgoal.es)')

    print(f'\n[Usuarios reales a migrar]  {len(real_users)}')
    for i, u in enumerate(real_users, 1):
        print(f'  {i:>3}. {u.username:<30}  pts={u.total_points_all_time}')

    total = len(BOT_NAMES) + len(real_users)
    print(f'\n[Total en liga]  {total}  → todos en División {DIVISION}')
    print('══════════════════════════════════════════════\n')


# ──────────────────────────────────────────────────────────────
# Operaciones
# ──────────────────────────────────────────────────────────────

def _get_or_create_season():
    season = Season.query.filter_by(name=SEASON_NAME).first()
    if not season:
        season = Season(
            name=SEASON_NAME,
            start_date=SEASON_START,
            end_date=SEASON_END,
            status=SEASON_STATUS,
        )
        db.session.add(season)
        db.session.flush()
        print(f'✓ Temporada creada: {SEASON_NAME} (id={season.id})')
    else:
        print(f'  Temporada ya existe (id={season.id}), sin cambios')
    return season


def _get_or_create_league(admin_id):
    league = League.query.filter_by(name=LEAGUE_NAME).first()
    if not league:
        league = League(
            name=LEAGUE_NAME,
            is_public=True,
            is_official=True,
            created_by=admin_id,
        )
        db.session.add(league)
        db.session.flush()
        print(f'✓ Liga creada: "{LEAGUE_NAME}" (id={league.id})')
    else:
        print(f'  Liga ya existe (id={league.id}), sin cambios')
    return league


def _delete_old_bots(old_bots):
    if not old_bots:
        print('  Sin bots antiguos que eliminar')
        return
    for bot in old_bots:
        # Limpiar DivisionMember primero para respetar FK
        DivisionMember.query.filter_by(user_id=bot.id).delete()
        db.session.delete(bot)
    db.session.flush()
    print(f'✓ {len(old_bots)} bots antiguos eliminados')


def _create_new_bots():
    bots = []
    created = 0
    for name in BOT_NAMES:
        user = User.query.filter_by(username=name).first()
        if not user:
            user = User(
                username=name,
                email=f'{name.lower()}@pickgoal.es',
                password_hash=generate_password_hash(os.urandom(24).hex()),
                is_bot=True,
                current_division=DIVISION,
            )
            db.session.add(user)
            db.session.flush()
            created += 1
        bots.append(user)
    print(f'✓ {created} bots nuevos creados ({len(BOT_NAMES) - created} ya existían)')
    return bots


def _add_to_league(league_id, users, is_bot, start_position):
    added = 0
    skipped = 0
    pos = start_position
    for user in users:
        existing = DivisionMember.query.filter_by(
            league_id=league_id, user_id=user.id
        ).first()
        if existing:
            skipped += 1
            pos += 1
            continue
        dm = DivisionMember(
            league_id=league_id,
            user_id=user.id,
            is_bot=is_bot,
            division=DIVISION,
            position=pos,
            season_div_points=0,
            season_total_points=0.0,
        )
        db.session.add(dm)
        user.current_division = DIVISION
        user.current_league_id = league_id
        added += 1
        pos += 1
    return added, skipped, pos


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main():
    app = create_app()
    with app.app_context():
        old_bots, real_users, existing_season, existing_league = _collect_preview()
        _print_summary(old_bots, real_users, existing_season, existing_league)

        resp = input('¿Ejecutar migración? [s/N] ').strip().lower()
        if resp != 's':
            print('Migración cancelada.')
            return

        print('\nEjecutando...\n')

        admin_id = _get_admin_id()

        season = _get_or_create_season()       # noqa: F841 — creado para BD
        league = _get_or_create_league(admin_id)

        _delete_old_bots(old_bots)
        bots = _create_new_bots()

        # Usuarios reales primero (posiciones 1..N), bots al final
        next_pos = 1
        real_added, real_skipped, next_pos = _add_to_league(
            league.id, real_users, is_bot=False, start_position=next_pos
        )
        bot_added, bot_skipped, _ = _add_to_league(
            league.id, bots, is_bot=True, start_position=next_pos
        )

        db.session.commit()

        print(f'\n✓ Usuarios reales añadidos: {real_added}  (ya estaban: {real_skipped})')
        print(f'✓ Bots añadidos:            {bot_added}  (ya estaban: {bot_skipped})')
        print(f'\n✅ Migración completada.')
        print(f'   Temporada: {SEASON_NAME}')
        print(f'   Liga id:   {league.id}  —  "{LEAGUE_NAME}"')
        print(f'   Miembros:  {real_added + bot_added} nuevos')


if __name__ == '__main__':
    main()
