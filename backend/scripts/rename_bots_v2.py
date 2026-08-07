"""
Renombra los 15 bots V2 de sus nombres de leyenda a nombres realistas con punto.
Ejecutar una sola vez: python backend/scripts/rename_bots_v2.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User

RENAME_MAP = {
    'Xavi':     'Carlos_87.',
    'Iniesta':  'Miguel_23.',
    'Zidane':   'Pablo_91.',
    'Ronaldo':  'Alejandro_14.',
    'Messi':    'Sergio_06.',
    'Cruyff':   'David_99.',
    'Pelé':     'Antonio_77.',
    'Maradona': 'Javier_45.',
    'Beckham':  'Roberto_33.',
    'Rooney':   'Fernando_88.',
    'Henry':    'Ricardo_55.',
    'Lampard':  'Diego_19.',
    'Gerrard':  'Manuel_62.',
    'Pirlo':    'Alvaro_38.',
    'Buffon':   'Marcos_71.',
}


def main():
    app = create_app()
    with app.app_context():
        renamed = 0
        for old, new in RENAME_MAP.items():
            user = User.query.filter_by(username=old).first()
            if user:
                user.username = new
                user.email = f'{new.lower().rstrip(".")}@bots.pickgoal.es'
                print(f'  [ok] {old} → {new}')
                renamed += 1
            else:
                print(f'  [skip] {old} no encontrado')

        db.session.commit()
        print(f'\nListo: {renamed} bots renombrados.')


if __name__ == '__main__':
    main()
