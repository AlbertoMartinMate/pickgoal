"""
One-shot migration: create División 2 league with 15 bots.
Uses the 7 unused bots already in the DB (ids 53-59) plus creates 8 more.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models import User, League, DivisionMember
from werkzeug.security import generate_password_hash

BOT_NAMES_DIV2 = [
    'Raul_04.', 'Victor_87.', 'Ivan_32.', 'Oscar_15.', 'Adrian_58.',
    'Ruben_72.', 'Hector_46.', 'Eduardo_29.', 'Gonzalo_83.', 'Emilio_11.',
    'Jorge_64.', 'Tomas_37.', 'Esteban_92.', 'Rodrigo_56.', 'Lorenzo_21.',
]


def run():
    app = create_app()
    with app.app_context():
        # Check if División 2 already exists
        existing = League.query.filter(League.name.ilike('%división 2%')).first()
        if existing:
            print(f'División 2 ya existe: liga id={existing.id}')
            return

        # Create the División 2 league (created_by = admin user id=1)
        admin = User.query.filter_by(is_admin=True).first() or User.query.get(1)
        d2 = League(
            name='PickGoal División 2',
            is_public=True,
            is_official=True,
            created_by=admin.id,
        )
        db.session.add(d2)
        db.session.flush()
        print(f'Liga creada: id={d2.id} — {d2.name}')

        # Gather existing bots not in any division
        all_bot_ids_in_divisions = {
            dm.user_id for dm in DivisionMember.query.filter_by(is_bot=True).all()
        }
        unused_bots = (
            User.query
            .filter_by(is_bot=True)
            .filter(~User.id.in_(all_bot_ids_in_divisions))
            .all()
        )
        print(f'Bots sin división encontrados: {len(unused_bots)} → ids {[b.id for b in unused_bots]}')

        bots_for_div2 = list(unused_bots)

        # Create new bots to fill up to 15
        needed = 15 - len(bots_for_div2)
        created = 0
        for i, name in enumerate(BOT_NAMES_DIV2):
            if created >= needed:
                break
            existing_user = User.query.filter_by(username=name).first()
            if existing_user:
                bots_for_div2.append(existing_user)
            else:
                new_bot = User(
                    username=name,
                    email=f'{name.lower().rstrip(".")}@bots.pickgoal.es',
                    password_hash=generate_password_hash(os.urandom(24).hex()),
                    is_bot=True,
                )
                db.session.add(new_bot)
                db.session.flush()
                bots_for_div2.append(new_bot)
                print(f'Bot creado: {name} (id={new_bot.id})')
                created += 1

        # Add all bots to División 2
        added = 0
        for pos, bot in enumerate(bots_for_div2[:15], 1):
            already = DivisionMember.query.filter_by(league_id=d2.id, user_id=bot.id).first()
            if already:
                continue
            dm = DivisionMember(
                league_id=d2.id,
                user_id=bot.id,
                is_bot=True,
                division=2,
                position=pos,
            )
            db.session.add(dm)
            added += 1

        db.session.commit()
        print(f'\nDivisión 2 creada: liga_id={d2.id}, {added} bots añadidos.')

        # Verify
        count = DivisionMember.query.filter_by(league_id=d2.id).count()
        print(f'Verificación: {count} miembros en liga {d2.id}')


if __name__ == '__main__':
    run()
