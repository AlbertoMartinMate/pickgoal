"""Backfill total_points_all_time para todos los usuarios.

Suma todos los puntos ganados en predicciones de partidos finalizados
más los puntos de predicción de campeón, y los escribe en la columna
total_points_all_time (que arrancó en 0 tras la migración).

Idempotente: muestra el estado antes/después y sobreescribe el valor.

Uso:
    DATABASE_URL=postgresql://... python scripts/backfill_all_time_points.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Prediction, ChampionPrediction

app = create_app()

with app.app_context():
    users = User.query.all()

    rows = []
    for u in users:
        pred_pts = db.session.query(
            db.func.coalesce(db.func.sum(Prediction.total_points), 0)
        ).filter_by(user_id=u.id).scalar()

        champ_pts = db.session.query(
            db.func.coalesce(db.func.sum(ChampionPrediction.points_earned), 0)
        ).filter_by(user_id=u.id).scalar()

        total = int(pred_pts) + int(champ_pts)
        rows.append((u, total))

    print(f"\n{'Usuario':<25} {'Actual':>8} {'Nuevo':>8}")
    print("─" * 45)
    for u, total in rows:
        print(f"{u.username:<25} {u.total_points_all_time or 0:>8} {total:>8}")

    print(f"\nTotal usuarios: {len(rows)}")
    confirm = input("¿Aplicar backfill? (s/N): ").strip().lower()
    if confirm != 's':
        print("Cancelado.")
        sys.exit(0)

    updated = 0
    for u, total in rows:
        u.total_points_all_time = total
        updated += 1

    db.session.commit()
    print(f"✓ {updated} usuarios actualizados.")
