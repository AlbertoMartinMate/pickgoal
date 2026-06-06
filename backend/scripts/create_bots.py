"""Script para crear los 20 usuarios bot y añadirlos a sus ligas."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, League, LeagueMember
from werkzeug.security import generate_password_hash

BOTS = [
    # (username, league_id)
    ('CarlosDelPotro',    1),
    ('MiguelTorres9',     1),
    ('SergioVilaFC',      1),
    ('AndresMaestro',     1),
    ('JavierCampo10',     1),
    ('PabloArenas7',      1),
    ('DiegoNavajas',      1),
    ('RubenEscobar',      1),
    ('MarcosSolano',      1),
    ('AlexQuintero',      1),
    ('Mou',               2),
    ('Cr7',               2),
    ('AlvaroCR',          2),
    ('LuisPedrerol',      2),
    ('MiguelAngelMarin',  2),
    ('Pichaminga',        2),
    ('Neveras',           2),
    ('Elisa',             2),
    ('AitanaBonmati',     2),
    ('PacoJo',            2),
]


def main():
    app = create_app()
    with app.app_context():
        created = 0
        for username, league_id in BOTS:
            email = f'{username.lower()}@pickgoal.es'

            existing = User.query.filter_by(username=username).first()
            if existing:
                print(f'  [skip] {username} ya existe')
                user = existing
            else:
                user = User(
                    username=username,
                    email=email,
                    password_hash=generate_password_hash(os.urandom(24).hex()),
                    is_bot=True,
                )
                db.session.add(user)
                db.session.flush()  # get user.id
                created += 1
                print(f'  [ok]   {username} creado (id={user.id})')

            # Ensure league membership
            league = League.query.get(league_id)
            if not league:
                print(f'  [warn] Liga {league_id} no existe, saltando membresía')
                continue

            membership = LeagueMember.query.filter_by(
                league_id=league_id, user_id=user.id
            ).first()
            if not membership:
                db.session.add(LeagueMember(league_id=league_id, user_id=user.id))
                print(f'         → añadido a liga {league_id} ({league.name})')
            else:
                print(f'         → ya es miembro de liga {league_id}')

        db.session.commit()
        print(f'\nListo: {created} bots creados.')


if __name__ == '__main__':
    main()
