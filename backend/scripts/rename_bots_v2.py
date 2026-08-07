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
    'Xavi_Bot':     'Carlos_87.',
    'Iniesta_Bot':  'Miguel_23.',
    'Zidane_Bot':   'Pablo_91.',
    'Ronaldo_Bot':  'Alejandro_14.',
    'Messi_Bot':    'Sergio_06.',
    'Cruyff_Bot':   'David_99.',
    'Pele_Bot':     'Antonio_77.',
    'Maradona_Bot': 'Javier_45.',
    'Beckham_Bot':  'Roberto_33.',
    'Rooney_Bot':   'Fernando_88.',
    'Henry_Bot':    'Ricardo_55.',
    'Lampard_Bot':  'Diego_19.',
    'Gerrard_Bot':  'Manuel_62.',
    'Pirlo_Bot':    'Alvaro_38.',
    'Buffon_Bot':   'Marcos_71.',
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
