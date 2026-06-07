"""Elimina predicciones automáticas X/0-0 generadas por saveDefaultPredictions().
Los bots se mantienen intactos.

Uso:
    DATABASE_URL=postgresql://... python scripts/clean_default_predictions.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Prediction, User
from sqlalchemy import text

app = create_app()

with app.app_context():
    bot_ids = [u.id for u in User.query.filter_by(is_bot=True).all()]

    query = Prediction.query.filter(
        Prediction.predicted_result == 'X',
        Prediction.predicted_home == 0,
        Prediction.predicted_away == 0,
    )
    if bot_ids:
        query = query.filter(~Prediction.user_id.in_(bot_ids))

    count = query.count()
    print(f"Predicciones automáticas X/0-0 a eliminar: {count}")

    if count == 0:
        print("Nada que limpiar.")
        sys.exit(0)

    confirm = input(f"¿Eliminar {count} predicciones? (s/N): ").strip().lower()
    if confirm != 's':
        print("Cancelado.")
        sys.exit(0)

    query.delete(synchronize_session=False)
    db.session.commit()
    print(f"✓ {count} predicciones eliminadas.")
