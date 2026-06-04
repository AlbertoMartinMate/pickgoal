"""
Ejecuta una sincronización completa del calendario del Mundial 2026
desde football-data.org y muestra cuántos partidos se han procesado.

Uso:  cd backend && python scripts/sync_matches.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models import Match
from app.scheduler import sync_full_calendar

app = create_app()

before = 0
with app.app_context():
    before = Match.query.count()

print(f"Partidos en BD antes de la sync: {before}")
print("Sincronizando con football-data.org...")

sync_full_calendar(app)

with app.app_context():
    after = Match.query.count()

inserted = after - before
print(f"Partidos en BD después de la sync: {after}")
print(f"Partidos nuevos insertados: {inserted}")
print(f"Partidos actualizados: {after - inserted}")
