"""Backfill de user_jornada_stats para todas las jornadas finalizadas.

Recalcula la puntuación de cada participante con compute_jornada_score (función
pura: NO modifica PredictionV2 ni Duelo) y la escribe en user_jornada_stats.
Los resultados de duelo solo se pueden reconstruir para jornadas cuyos Duelo
siguen existiendo (el cierre de fase los borra).

Verificación: compara el total recalculado con el guardado en Duelo y lista
las discrepancias (p. ej. cuotas o resultados editados a posteriori).

Idempotente (upsert por user_id + jornada_id). Por defecto es dry-run.

Uso:
    python scripts/backfill_history.py            # dry-run, no escribe
    python scripts/backfill_history.py --apply    # escribe en la BD
"""
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Jornada
from app.history import build_jornada_stats, upsert_jornada_stats

APPLY = '--apply' in sys.argv

app = create_app()

with app.app_context():
    jornadas = (
        Jornada.query.filter_by(status='finished')
        .order_by(Jornada.season_id.asc(), Jornada.number.asc())
        .all()
    )
    print(f"\nModo: {'APPLY (escribe)' if APPLY else 'DRY-RUN (no escribe)'}")
    print(f'Jornadas finalizadas: {len(jornadas)}\n')
    print(f"{'Temp':>4} {'J':>3} {'Fase':>4} {'Filas':>5} {'Humanos':>7} {'Duelos':>6} "
          f"{'W/D/L/B':>11} {'MaxPts':>7} {'Discrep.':>8}")
    print('─' * 66)

    total_rows = 0
    mismatches = []

    for j in jornadas:
        rows = build_jornada_stats(j)
        res = Counter(r['duel_result'] for r in rows if r['duel_result'])
        humans = sum(1 for r in rows if not r['is_bot'])
        with_duel = sum(1 for r in rows if r['duel_result'])
        max_pts = max((r['points'] for r in rows), default=0)

        n_mis = 0
        for r in rows:
            stored = r['_duel_stored_points']
            if stored is not None and abs((stored or 0) - r['points']) > 0.01:
                n_mis += 1
                mismatches.append((j.number, r['user_id'], stored, r['points']))

        wdlb = f"{res['W']}/{res['D']}/{res['L']}/{res['B']}"
        fase = rows[0]['fase'] if rows else '-'
        print(f'{j.season_id:>4} {j.number:>3} {fase:>4} {len(rows):>5} {humans:>7} {with_duel:>6} '
              f'{wdlb:>11} {max_pts:>7.2f} {n_mis:>8}')

        total_rows += len(rows)
        if APPLY:
            upsert_jornada_stats(rows)
            db.session.commit()

    print('─' * 66)
    print(f'Total filas: {total_rows}')

    if mismatches:
        print(f'\n⚠️  {len(mismatches)} discrepancias entre Duelo guardado y recalculado '
              '(se escribe el recalculado):')
        for num, uid, stored, new in mismatches[:50]:
            print(f'   J{num} user {uid}: duelo={stored} recalculado={new}')

    if not APPLY:
        db.session.rollback()
        print('\nDry-run: nada escrito. Ejecuta con --apply para persistir.')
    else:
        print('\n✅ Backfill completado.')
