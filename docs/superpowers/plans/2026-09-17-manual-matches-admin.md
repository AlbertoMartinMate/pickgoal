# Partidos Manuales en Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al admin añadir partidos manuales (equipos/jugadores en texto libre, cuotas manuales, con o sin empate) a una jornada, para cubrir semanas sin datos de football-data.org, sin que el scheduler los toque ni el flujo de puntos se rompa.

**Architecture:** Se reutiliza el modelo existente `Match`/`JornadaMatch` (las cuotas ya viven en `JornadaMatch.odds_1/x/2`) añadiendo dos columnas nuevas a `Match`: `is_manual` (bool) y `result_type` (`'1X2'`/`'12'`). Los partidos manuales reciben un `api_id` sintético **negativo** (los reales de football-data.org son siempre positivos), lo que los excluye de forma natural de cualquier búsqueda por `api_id` del scheduler; aun así se añade un filtro explícito `is_manual=False` como defensa en profundidad. Las competiciones/deportes en texto libre reutilizan la tabla `Competition` existente (sin nuevas columnas), generando un `code` a partir del nombre. No se introduce ningún framework de tests nuevo: el repo no tiene ninguno (`pytest`, Jest, etc. — confirmado, cero infraestructura de test), así que la verificación de cada paso se hace con `curl` contra el backend local y comprobación manual en el navegador (`npm run dev`), documentada explícitamente en cada tarea en vez de con tests automatizados.

**Tech Stack:** Flask + SQLAlchemy + Flask-Migrate + PostgreSQL (backend) · Vanilla JS + SASS (frontend admin.js / jornada.js)

**⚠️ Aviso importante:** `backend/.env` (`DATABASE_URL`) apunta a la **misma base de datos Supabase que usa producción** (confirmado en memoria del proyecto). El paso de migración (`flask db upgrade`) modificará el esquema de esa base compartida. Es una migración aditiva (columnas nuevas con `server_default`, sin tocar datos existentes) y de bajo riesgo, pero **confirma con el usuario antes de ejecutar `flask db upgrade`** si no se ha hecho ya explícitamente para esta tarea.

---

## File Structure

**Backend — modificar:**
- `backend/app/models.py` — añadir `is_manual`, `result_type` a `Match`
- `backend/migrations/versions/<merge>_merge_heads.py` — nueva migración de merge (heads actuales: `2cce3a287f10`, `a1b2c3d4e5f6`)
- `backend/migrations/versions/<rev>_add_is_manual_result_type_to_matches.py` — nueva migración de columnas
- `backend/app/routes/admin_v2.py` — helper de competición manual, validación, `_upsert_jornada_matches`, `set_jornada_match_resultado`, `get_jornada_matches_admin`
- `backend/app/routes/jornadas.py` — `_build_jornada_payload`, `save_prediction`
- `backend/app/scheduler.py` — excluir `is_manual=True` de `sync_live_matches`

**Frontend — modificar:**
- `frontend/src/js/pages/admin.js` — formulario "Añadir partido manual", lista de manuales, `renderResultsPanel` sin opción X para `result_type='12'`
- `frontend/src/js/pages/jornada.js` — `matchRow` condiciona botones 1/X/2 vs 1/2
- `frontend/src/sass/pages/_admin.scss` — estilos del formulario manual

No se tocan `frontend/src/js/api.js` (los endpoints existentes ya aceptan payload JSON arbitrario) ni se crean archivos nuevos: cada archivo mantiene su responsabilidad actual.

---

## Task 1: Modelo `Match` — añadir `is_manual` y `result_type`

**Files:**
- Modify: `backend/app/models.py:82-99` (clase `Match`)

- [ ] **Step 1: Añadir las columnas al modelo**

En `backend/app/models.py`, dentro de la clase `Match`, justo después de `importance_score` (línea 98, antes de la relación `predictions`):

```python
    importance_score = db.Column(db.Float, nullable=True)
    is_manual = db.Column(db.Boolean, nullable=False, default=False, server_default='false')
    result_type = db.Column(db.String(3), nullable=False, default='1X2', server_default='1X2')

    predictions = db.relationship('Prediction', backref='match', lazy='dynamic', cascade='all, delete-orphan')
```

- [ ] **Step 2: Verificación manual**

No hay tests automatizados en el repo. Verifica que el modelo importa sin errores:

```bash
cd backend && source venv/bin/activate && python3 -c "from app import create_app; from app.models import Match; app = create_app(); print('OK', Match.is_manual, Match.result_type)"
```

Esperado: imprime `OK <columna is_manual> <columna result_type>` sin excepciones.

- [ ] **Step 3: Commit**

```bash
git add backend/app/models.py
git commit -m "feat: añadir is_manual y result_type al modelo Match"
```

---

## Task 2: Migraciones — merge de heads + columnas nuevas

**Files:**
- Create: `backend/migrations/versions/<merge_rev>_merge_heads.py`
- Create: `backend/migrations/versions/<add_rev>_add_is_manual_result_type_to_matches.py`

Las migraciones actuales tienen **dos heads simultáneos**: `2cce3a287f10` (add_status_to_jornada_matches) y `a1b2c3d4e5f6` (add_duelo_calendar). Hay que fusionarlos antes de encadenar la migración nueva.

- [ ] **Step 1: Confirmar los heads actuales**

```bash
cd backend && source venv/bin/activate && flask db heads
```

Esperado: dos líneas, `2cce3a287f10 (head)` y `a1b2c3d4e5f6 (head)`.

- [ ] **Step 2: Generar la migración de merge**

```bash
cd backend && source venv/bin/activate && flask db merge -m "merge heads" 2cce3a287f10 a1b2c3d4e5f6
```

Esto crea un archivo nuevo en `backend/migrations/versions/` con un `revision` autogenerado y `down_revision = ('2cce3a287f10', 'a1b2c3d4e5f6')`. Ábrelo y confirma que el contenido es equivalente a esto (el `revision` id y `Create Date` los genera Alembic, no los fuerces):

```python
"""merge heads

Revision ID: <autogenerado>
Revises: 2cce3a287f10, a1b2c3d4e5f6
Create Date: <autogenerado>

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '<autogenerado>'
down_revision = ('2cce3a287f10', 'a1b2c3d4e5f6')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
```

- [ ] **Step 3: Confirmar un único head**

```bash
cd backend && source venv/bin/activate && flask db heads
```

Esperado: una sola línea con el `revision` del merge.

- [ ] **Step 4: Generar la migración de columnas**

```bash
cd backend && source venv/bin/activate && flask db migrate -m "add is_manual and result_type to matches"
```

Abre el archivo generado en `backend/migrations/versions/` y verifica que su `upgrade()`/`downgrade()` coincide con esto (ajusta solo si Alembic generó algo distinto para las mismas dos columnas):

```python
def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('matches', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_manual', sa.Boolean(), nullable=False, server_default='false'))
        batch_op.add_column(sa.Column('result_type', sa.String(length=3), nullable=False, server_default='1X2'))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('matches', schema=None) as batch_op:
        batch_op.drop_column('result_type')
        batch_op.drop_column('is_manual')

    # ### end Alembic commands ###
```

- [ ] **Step 5: Aplicar las migraciones**

⚠️ Este comando modifica la base de datos compartida (producción + local, mismo Supabase). Confirma con el usuario si no está ya confirmado para esta tarea, luego ejecuta:

```bash
cd backend && source venv/bin/activate && flask db upgrade
```

Esperado: log de Alembic mostrando la aplicación de la migración de merge y la de columnas, sin errores. Verifica el resultado directamente:

```bash
cd backend && source venv/bin/activate && python3 -c "
from app import create_app, db
from sqlalchemy import text
app = create_app()
with app.app_context():
    r = db.session.execute(text(\"SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='matches' AND column_name IN ('is_manual','result_type')\"))
    for row in r:
        print(row)
"
```

Esperado: dos filas, `is_manual` (boolean, default false) y `result_type` (character varying, default '1X2'::character varying).

- [ ] **Step 6: Commit**

```bash
git add backend/migrations/versions/
git commit -m "feat: migración — merge heads + is_manual/result_type en matches"
```

---

## Task 3: Backend — helper de competición manual y validación

**Files:**
- Modify: `backend/app/routes/admin_v2.py:1-51` (imports y helpers)

- [ ] **Step 1: Añadir el import de `re`**

En `backend/app/routes/admin_v2.py:6`, junto a `import logging`:

```python
import logging
import re
from datetime import datetime, timezone
```

- [ ] **Step 2: Añadir `_get_or_create_manual_competition` y `_validate_manual_match`**

Justo después de `_get_or_create_competition` (`admin_v2.py:43-51`), añade:

```python
def _get_or_create_manual_competition(name):
    name = (name or 'Manual').strip()[:100]
    comp = Competition.query.filter_by(name=name).first()
    if comp:
        return comp
    base_code = re.sub(r'[^A-Z0-9]', '', name.upper())[:10] or 'MANUAL'
    code = base_code
    suffix = 1
    while Competition.query.filter_by(code=code).first():
        suffix += 1
        code = f'{base_code[:10 - len(str(suffix))]}{suffix}'
    comp = Competition(code=code, name=name, weight=5, max_per_jornada=4)
    db.session.add(comp)
    db.session.flush()
    return comp


def _generate_manual_api_id():
    """api_id sintético y negativo — nunca choca con IDs reales de football-data.org
    (siempre positivos) y queda excluido de forma natural de las búsquedas por
    api_id del scheduler."""
    lowest = db.session.query(db.func.min(Match.api_id)).scalar() or 0
    return min(lowest, 0) - 1


def _validate_manual_match(mp):
    home = (mp.get('home_team') or '').strip()
    away = (mp.get('away_team') or '').strip()
    comp_name = (mp.get('competition_name') or '').strip()
    result_type = mp.get('result_type')

    if not home or not away:
        return 'Los nombres de equipo/jugador local y visitante son obligatorios'
    if not comp_name:
        return 'La competición/deporte es obligatoria'
    if result_type not in ('1X2', '12'):
        return 'result_type debe ser "1X2" o "12"'
    try:
        datetime.fromisoformat(str(mp.get('match_datetime', '')).replace('Z', '+00:00'))
    except ValueError:
        return 'Fecha y hora del partido inválida'
    try:
        odds_1 = float(mp.get('odds_1'))
        odds_2 = float(mp.get('odds_2'))
    except (TypeError, ValueError):
        return 'Cuota 1 y Cuota 2 deben ser números'
    if odds_1 <= 1.0 or odds_2 <= 1.0:
        return 'Las cuotas deben ser mayores que 1.0'
    if result_type == '1X2':
        try:
            odds_x = float(mp.get('odds_x'))
        except (TypeError, ValueError):
            return 'Cuota X es obligatoria y debe ser un número para partidos 1X2'
        if odds_x <= 1.0:
            return 'La cuota X debe ser mayor que 1.0'
    return None
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/routes/admin_v2.py
git commit -m "feat: helpers de competición manual y validación de partido manual"
```

---

## Task 4: Backend — validar y guardar partidos manuales en `create_jornada`/`update_jornada`/`_upsert_jornada_matches`

**Files:**
- Modify: `backend/app/routes/admin_v2.py:362-406` (`create_jornada`)
- Modify: `backend/app/routes/admin_v2.py:411-444` (`update_jornada`)
- Modify: `backend/app/routes/admin_v2.py:583-617` (`_upsert_jornada_matches`)

- [ ] **Step 1: Validar partidos manuales en `create_jornada`**

En `admin_v2.py:377-378`, justo después de la comprobación de longitud:

```python
    if not matches_payload or len(matches_payload) != 10:
        return jsonify({'error': 'Debes seleccionar exactamente 10 partidos'}), 400

    for mp in matches_payload:
        if mp.get('is_manual'):
            err_msg = _validate_manual_match(mp)
            if err_msg:
                return jsonify({'error': err_msg}), 400
```

- [ ] **Step 2: Validar partidos manuales en `update_jornada`**

En `admin_v2.py:433-435`:

```python
    matches_payload = data.get('matches')
    if matches_payload is not None:
        if len(matches_payload) != 10:
            return jsonify({'error': 'Debes seleccionar exactamente 10 partidos'}), 400
        for mp in matches_payload:
            if mp.get('is_manual'):
                err_msg = _validate_manual_match(mp)
                if err_msg:
                    return jsonify({'error': err_msg}), 400
```

- [ ] **Step 3: Reescribir `_upsert_jornada_matches` para soportar partidos manuales**

Reemplaza la función completa (`admin_v2.py:583-617`):

```python
def _upsert_jornada_matches(jornada_id, matches_payload):
    for mp in matches_payload:
        if mp.get('is_manual'):
            comp = _get_or_create_manual_competition(mp.get('competition_name'))
            dt_str = mp.get('match_datetime', '')
            try:
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00')).replace(tzinfo=None)
            except (ValueError, AttributeError):
                dt = datetime.now(timezone.utc).replace(tzinfo=None)
            result_type = mp.get('result_type', '1X2')

            match = Match(
                api_id=_generate_manual_api_id(),
                phase='group',
                home_team=mp.get('home_team', 'TBD'),
                away_team=mp.get('away_team', 'TBD'),
                match_datetime=dt,
                status='scheduled',
                competition_id=comp.id,
                is_manual=True,
                result_type=result_type,
            )
            db.session.add(match)
            db.session.flush()

            jm = JornadaMatch(jornada_id=jornada_id, match_id=match.id)
            jm.odds_1 = float(mp['odds_1'])
            jm.odds_x = float(mp['odds_x']) if result_type == '1X2' else None
            jm.odds_2 = float(mp['odds_2'])
            jm.calculated_at = datetime.now(timezone.utc)
            db.session.add(jm)
            continue

        api_id = mp['api_id']
        comp_code = mp.get('competition_code', 'PD')
        comp = _get_or_create_competition(comp_code)

        match = Match.query.filter_by(api_id=api_id).first()
        if not match:
            dt_str = mp.get('match_datetime', '')
            try:
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00')).replace(tzinfo=None)
            except (ValueError, AttributeError):
                dt = datetime.now(timezone.utc).replace(tzinfo=None)

            match = Match(
                api_id=api_id,
                phase='group',
                home_team=mp.get('home_team', 'TBD'),
                away_team=mp.get('away_team', 'TBD'),
                match_datetime=dt,
                status='scheduled',
                competition_id=comp.id,
            )
            db.session.add(match)
            db.session.flush()
        else:
            if comp.id and match.competition_id != comp.id:
                match.competition_id = comp.id

        if not JornadaMatch.query.filter_by(jornada_id=jornada_id, match_id=match.id).first():
            db.session.add(JornadaMatch(
                jornada_id=jornada_id,
                match_id=match.id,
            ))
```

- [ ] **Step 4: Verificación manual con curl**

Arranca el backend local (`cd backend && source venv/bin/activate && flask run`) y, con un JWT de admin válido, crea una jornada de prueba con 9 partidos reales cualquiera (o dummies con `api_id` positivos únicos) + 1 manual:

```bash
curl -s -X POST http://localhost:5000/api/v2/admin/jornada \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{
    "number": 9999,
    "date_start": "2026-09-21T00:00:00Z",
    "date_end": "2026-09-27T23:59:00Z",
    "matches": [
      {"is_manual": true, "home_team": "Lakers", "away_team": "Celtics",
       "match_datetime": "2026-09-22T20:00:00Z", "competition_name": "NBA",
       "result_type": "12", "odds_1": 1.85, "odds_2": 1.95}
    ]
  }'
```

(completa hasta 10 partidos con dummies API-style para pasar la validación de longitud). Esperado: `201` con `jornada` en la respuesta. Luego:

```bash
curl -s http://localhost:5000/api/v2/admin/jornada/<id>/matches -H "Authorization: Bearer <TOKEN_ADMIN>" | python3 -m json.tool
```

Comprueba que el partido manual aparece con `odds_1: 1.85`, `odds_2: 1.95` y (tras el Task 5) `result_type: "12"`. Borra la jornada de prueba con `DELETE /api/v2/admin/jornada/<id>` al terminar.

- [ ] **Step 5: Commit**

```bash
git add backend/app/routes/admin_v2.py
git commit -m "feat: guardar partidos manuales en create/update jornada"
```

---

## Task 5: Backend — `result_type` en resultados admin (validación + payload)

**Files:**
- Modify: `backend/app/routes/admin_v2.py:509-550` (`set_jornada_match_resultado`)
- Modify: `backend/app/routes/admin_v2.py:474-504` (`get_jornada_matches_admin`)

- [ ] **Step 1: Validar `result_90` según `result_type` en `set_jornada_match_resultado`**

Reemplaza el cuerpo de la función (`admin_v2.py:511-550`) por:

```python
def set_jornada_match_resultado(jm_id):
    user, err, code = _require_admin()
    if err:
        return err, code

    jm = db.session.get(JornadaMatch, jm_id)
    if not jm:
        return jsonify({'error': 'Partido no encontrado'}), 404
    if jm.status == 'cancelled':
        return jsonify({'error': 'El partido está cancelado'}), 400

    data = request.get_json() or {}
    home = data.get('home_score')
    away = data.get('away_score')
    result_90_override = data.get('result_90')

    if home is None or away is None:
        return jsonify({'error': 'Se requieren home_score y away_score'}), 400
    try:
        home, away = int(home), int(away)
    except (TypeError, ValueError):
        return jsonify({'error': 'Los marcadores deben ser números enteros'}), 400

    match = jm.match
    valid_results = ('1', '2') if match.result_type == '12' else ('1', 'X', '2')
    if result_90_override is not None and result_90_override not in valid_results:
        return jsonify({'error': f'result_90 debe ser {" o ".join(valid_results)}'}), 400
    if match.result_type == '12' and result_90_override is None and home == away:
        return jsonify({'error': 'Este partido no admite empate — indica el ganador en result_90 (1 o 2)'}), 400

    from app.utils import recalculate_v2_for_match, compute_result_90

    match.home_score_90 = home
    match.away_score_90 = away
    match.home_score_final = home
    match.away_score_final = away
    match.result_90 = result_90_override if result_90_override is not None else compute_result_90(home, away)
    match.status = 'finished'
    jm.status = 'finished'
    db.session.commit()

    recalculate_v2_for_match(match)

    return jsonify({'message': 'Resultado guardado y puntos recalculados'}), 200
```

- [ ] **Step 2: Exponer `result_type` en `get_jornada_matches_admin`**

En `admin_v2.py:489-503`, dentro del `matches_data.append({...})`, añade el campo:

```python
        matches_data.append({
            'jornada_match_id': jm.id,
            'match_id': m.id,
            'home_team': m.home_team,
            'away_team': m.away_team,
            'match_datetime': m.match_datetime.replace(tzinfo=timezone.utc).isoformat(),
            'status': m.status,
            'jm_status': jm.status,
            'result_type': m.result_type,
            'home_score_90': m.home_score_90,
            'away_score_90': m.away_score_90,
            'result_90': m.result_90,
            'odds_1': jm.odds_1,
            'odds_x': jm.odds_x,
            'odds_2': jm.odds_2,
        })
```

- [ ] **Step 3: Verificación manual**

Con el partido manual `result_type='12'` creado en el Task 4, prueba a forzar un empate (debe fallar) y luego un resultado válido:

```bash
curl -s -X POST http://localhost:5000/api/v2/admin/jornada-match/<jm_id>/resultado \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{"home_score": 100, "away_score": 100}'
# Esperado: 400 "Este partido no admite empate..."

curl -s -X POST http://localhost:5000/api/v2/admin/jornada-match/<jm_id>/resultado \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{"home_score": 105, "away_score": 98, "result_90": "X"}'
# Esperado: 400 "result_90 debe ser 1 o 2"

curl -s -X POST http://localhost:5000/api/v2/admin/jornada-match/<jm_id>/resultado \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{"home_score": 105, "away_score": 98}'
# Esperado: 200 "Resultado guardado y puntos recalculados"
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/routes/admin_v2.py
git commit -m "feat: validar result_type (1X2/12) al guardar resultados de admin"
```

---

## Task 6: Backend — `result_type` en Pronósticos (`jornadas.py`)

**Files:**
- Modify: `backend/app/routes/jornadas.py:53-70` (`_build_jornada_payload`)
- Modify: `backend/app/routes/jornadas.py:149-150` (`save_prediction`)

- [ ] **Step 1: Exponer `result_type` al usuario**

En `jornadas.py:53-70`, dentro de `matches_data.append({...})`, añade el campo junto a `result_90`:

```python
        matches_data.append({
            'jornada_match_id': jm.id,
            'match_id': match.id,
            'home_team': match.home_team,
            'away_team': match.away_team,
            'match_datetime': dt_utc.isoformat(),
            'status': match.status,
            'jm_status': jm.status,
            'result_type': match.result_type,
            'result_90': match.result_90,
            'home_score_90': match.home_score_90,
            'away_score_90': match.away_score_90,
            'odds_1': jm.odds_1,
            'odds_x': jm.odds_x,
            'odds_2': jm.odds_2,
            'predict_locked': match.is_locked() or jm.status == 'cancelled',
            'opens_until': (dt_utc - timedelta(minutes=30)).isoformat(),
            'prediction': pred.to_dict() if pred else None,
        })
```

- [ ] **Step 2: Rechazar `predicted_result='X'` en partidos sin empate**

En `jornadas.py:149-150`, reemplaza:

```python
    if predicted_result not in ('1', 'X', '2'):
        return jsonify({'error': 'Resultado inválido'}), 400
```

por:

```python
    valid_results = ('1', '2') if jm.match.result_type == '12' else ('1', 'X', '2')
    if predicted_result not in valid_results:
        return jsonify({'error': 'Resultado inválido'}), 400
```

- [ ] **Step 3: Verificación manual**

```bash
curl -s -X POST http://localhost:5000/api/v2/jornada/predict \
  -H "Authorization: Bearer <TOKEN_USER>" -H "Content-Type: application/json" \
  -d '{"jornada_match_id": <jm_id_manual_12>, "predicted_result": "X", "units": 1}'
# Esperado: 400 "Resultado inválido"

curl -s -X POST http://localhost:5000/api/v2/jornada/predict \
  -H "Authorization: Bearer <TOKEN_USER>" -H "Content-Type: application/json" \
  -d '{"jornada_match_id": <jm_id_manual_12>, "predicted_result": "1", "units": 1}'
# Esperado: 200 con la predicción guardada
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/routes/jornadas.py
git commit -m "feat: exponer result_type y validar predicciones sin empate"
```

---

## Task 7: Scheduler — excluir partidos manuales de la sincronización

**Files:**
- Modify: `backend/app/scheduler.py:99-112` (`sync_live_matches`)

- [ ] **Step 1: Filtrar `is_manual=False`**

En `backend/app/scheduler.py:99` y `:110`, cambia:

```python
            db_live = Match.query.filter_by(status='live').all()
```

por:

```python
            db_live = Match.query.filter_by(status='live', is_manual=False).all()
```

y:

```python
            for m in live_data:
                existing = Match.query.filter_by(api_id=m['id']).first()
```

por:

```python
            for m in live_data:
                existing = Match.query.filter_by(api_id=m['id'], is_manual=False).first()
```

- [ ] **Step 2: Verificación manual**

```bash
cd backend && source venv/bin/activate && python3 -c "
from app import create_app
from app.scheduler import sync_live_matches
app = create_app()
sync_live_matches(app)
print('sync_live_matches ejecutado sin excepciones')
"
```

Esperado: se ejecuta sin excepciones y (revisando logs) no toca el partido manual de prueba del Task 4 (su `status` sigue en `scheduled`/`finished` según lo dejaste, no cambia por la sync).

- [ ] **Step 3: Commit**

```bash
git add backend/app/scheduler.py
git commit -m "fix: excluir partidos is_manual de la sincronización del scheduler"
```

---

## Task 8: Frontend — formulario "Añadir partido manual" en admin.js

**Files:**
- Modify: `frontend/src/js/pages/admin.js:299` (comentario de `_selectedMatches`)
- Modify: `frontend/src/js/pages/admin.js:314-381` (`renderJornadasPanel`)
- Modify: `frontend/src/js/pages/admin.js:454-546` (`attachJornadasEvents`)

- [ ] **Step 1: Actualizar el comentario de `_selectedMatches` y añadir contador de ids manuales**

En `admin.js:299`, reemplaza:

```js
let _selectedMatches = [];   // {api_id, home_team, away_team, match_datetime, competition_code}
let _editingJornadaId = null;
```

por:

```js
let _selectedMatches = [];   // API: {api_id, home_team, away_team, match_datetime, competition_code}
                              // Manual: {is_manual:true, client_id, home_team, away_team, match_datetime,
                              //          competition_name, result_type, odds_1, odds_x, odds_2}
let _editingJornadaId = null;
let _manualClientIdSeq = 0;
```

- [ ] **Step 2: Añadir el bloque HTML del formulario manual**

En `admin.js:363-366`, entre el botón "Buscar partidos" y el contenedor `jv2MatchPicker`:

```js
          <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button" style="align-self:flex-start">Buscar partidos</button>
        </div>

        <div class="jv2-manual-form">
          <label class="form__label">Añadir partido manual</label>
          <div class="jv2-form__row">
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Local</label>
              <input class="form__input" type="text" id="jv2ManHome" placeholder="Equipo/Jugador local" />
            </div>
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Visitante</label>
              <input class="form__input" type="text" id="jv2ManAway" placeholder="Equipo/Jugador visitante" />
            </div>
          </div>
          <div class="jv2-form__row">
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Fecha y hora</label>
              <input class="form__input" type="datetime-local" id="jv2ManDatetime" />
            </div>
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Competición/Deporte</label>
              <input class="form__input" type="text" id="jv2ManComp" placeholder="Ej: NBA, ATP Tenis" />
            </div>
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Tipo de resultado</label>
              <select class="form__input" id="jv2ManResultType">
                <option value="1X2">1X2 (con empate)</option>
                <option value="12">1 o 2 (sin empate)</option>
              </select>
            </div>
          </div>
          <div class="jv2-form__row">
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Cuota 1</label>
              <input class="form__input" type="number" step="0.01" min="1.01" id="jv2ManOdds1" style="width:80px" />
            </div>
            <div class="form__group" id="jv2ManOddsXGroup">
              <label class="form__label" style="font-size:11px">Cuota X</label>
              <input class="form__input" type="number" step="0.01" min="1.01" id="jv2ManOddsX" style="width:80px" />
            </div>
            <div class="form__group">
              <label class="form__label" style="font-size:11px">Cuota 2</label>
              <input class="form__input" type="number" step="0.01" min="1.01" id="jv2ManOdds2" style="width:80px" />
            </div>
          </div>
          <button class="btn btn--ghost btn--sm" id="btnAnadirManual" type="button">Añadir partido</button>
          <div id="jv2ManualList" class="jv2-manual-list"></div>
        </div>

        <div id="jv2MatchPicker" style="display:none">
```

- [ ] **Step 3: Renderizar la lista de manuales añadidos**

Añade esta función nueva justo antes de `function updateCounter()` (`admin.js:644`):

```js
function renderManualList() {
  const el = document.getElementById('jv2ManualList');
  if (!el) return;
  const manuales = _selectedMatches.filter(m => m.is_manual);
  if (manuales.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = manuales.map(m => `
    <div class="jv2-manual-item" data-client-id="${m.client_id}">
      <span class="jv2-manual-item__teams">${m.home_team} vs ${m.away_team}</span>
      <span class="jv2-manual-item__meta">${m.competition_name} · ${m.result_type === '12' ? '1 o 2' : '1X2'} · ${shortDate(m.match_datetime)}</span>
      <button class="btn btn--danger btn--xs jv2-manual-remove" data-client-id="${m.client_id}" type="button">✕</button>
    </div>
  `).join('');
  el.querySelectorAll('.jv2-manual-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const cid = Number(btn.dataset.clientId);
      _selectedMatches = _selectedMatches.filter(m => m.client_id !== cid);
      renderManualList();
      updateCounter();
    });
  });
}
```

- [ ] **Step 4: Wiring del formulario manual en `attachJornadasEvents`**

En `admin.js:454`, dentro de `attachJornadasEvents(container)`, añade (junto a los demás listeners, por ejemplo tras la línea del `#btnBuscarPartidos`):

```js
  container.querySelector('#jv2ManResultType')?.addEventListener('change', (e) => {
    const oddsXGroup = document.getElementById('jv2ManOddsXGroup');
    if (oddsXGroup) oddsXGroup.style.display = e.target.value === '12' ? 'none' : '';
  });

  container.querySelector('#btnAnadirManual')?.addEventListener('click', () => {
    const home = document.getElementById('jv2ManHome').value.trim();
    const away = document.getElementById('jv2ManAway').value.trim();
    const dt = document.getElementById('jv2ManDatetime').value;
    const comp = document.getElementById('jv2ManComp').value.trim();
    const resultType = document.getElementById('jv2ManResultType').value;
    const odds1 = document.getElementById('jv2ManOdds1').value;
    const oddsX = document.getElementById('jv2ManOddsX').value;
    const odds2 = document.getElementById('jv2ManOdds2').value;

    if (!home || !away) { showToast('Indica equipo/jugador local y visitante', 'error'); return; }
    if (!dt) { showToast('Indica la fecha y hora del partido', 'error'); return; }
    if (!comp) { showToast('Indica la competición/deporte', 'error'); return; }
    if (!odds1 || !odds2 || (resultType === '1X2' && !oddsX)) {
      showToast('Completa todas las cuotas requeridas', 'error'); return;
    }
    if (_selectedMatches.length >= 10) {
      showToast('Máximo 10 partidos', 'error'); return;
    }

    _selectedMatches.push({
      is_manual: true,
      client_id: ++_manualClientIdSeq,
      home_team: home,
      away_team: away,
      match_datetime: new Date(dt).toISOString(),
      competition_name: comp,
      result_type: resultType,
      odds_1: parseFloat(odds1),
      odds_x: resultType === '1X2' ? parseFloat(oddsX) : null,
      odds_2: parseFloat(odds2),
    });

    document.getElementById('jv2ManHome').value = '';
    document.getElementById('jv2ManAway').value = '';
    document.getElementById('jv2ManDatetime').value = '';
    document.getElementById('jv2ManComp').value = '';
    document.getElementById('jv2ManOdds1').value = '';
    document.getElementById('jv2ManOddsX').value = '';
    document.getElementById('jv2ManOdds2').value = '';

    renderManualList();
    updateCounter();
  });
```

- [ ] **Step 5: Reiniciar la lista manual al abrir "Nueva jornada" y al cancelar**

En `admin.js:455-468` (handler de `#btnNuevaJornada`), añade `renderManualList();` justo después de `updateCounter();`:

```js
  container.querySelector('#btnNuevaJornada')?.addEventListener('click', () => {
    _editingJornadaId = null;
    _selectedMatches = [];
    document.getElementById('jv2FormTitle').textContent = 'Nueva jornada';
    document.getElementById('jv2EditId').value = '';
    document.getElementById('jv2Number').value = '';
    document.getElementById('jv2DateStart').value = '';
    document.getElementById('jv2DateEnd').value = '';
    document.getElementById('jv2DateFrom').value = '';
    document.getElementById('jv2DateTo').value = '';
    document.getElementById('jv2MatchPicker').style.display = 'none';
    document.getElementById('jv2Form').style.display = 'block';
    updateCounter();
    renderManualList();
  });
```

En `admin.js:470-474` (handler de `#btnCancelarJornada`):

```js
  container.querySelector('#btnCancelarJornada')?.addEventListener('click', () => {
    document.getElementById('jv2Form').style.display = 'none';
    _selectedMatches = [];
    _editingJornadaId = null;
    renderManualList();
  });
```

Y en `abrirEdicion()` (`admin.js:573`), tras `updateCounter();`:

```js
  document.getElementById('jv2MatchPicker').style.display = 'none';
  document.getElementById('jv2Form').style.display = 'block';
  updateCounter();
  renderManualList();
}
```

- [ ] **Step 6: Verificación manual en navegador**

```bash
cd frontend && npm run dev
```

Abre el panel admin → "+ Nueva jornada" → rellena el formulario "Añadir partido manual" con `result_type='12'` (comprueba que el campo Cuota X se oculta) → pulsa "Añadir partido" → verifica que aparece en la lista con botón ✕ y que el contador "Seleccionados: X/10" sube. Completa hasta 10 (combinando búsqueda API + manuales) y guarda — comprueba en Network que el `POST /jornada` incluye el objeto `is_manual: true` con los campos esperados.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/js/pages/admin.js
git commit -m "feat: formulario de partido manual en admin (nueva jornada)"
```

---

## Task 9: Frontend — panel de resultados sin opción X para partidos sin empate

**Files:**
- Modify: `frontend/src/js/pages/admin.js:759-799` (`renderResultsPanel`)

- [ ] **Step 1: Condicionar el `<select>` de `result_90`**

En `admin.js:784-789`, reemplaza:

```js
                <select class="form__input jv2-r90-select" style="width:68px">
                  <option value="" ${!m.result_90 ? 'selected' : ''}>Auto</option>
                  <option value="1" ${m.result_90 === '1' ? 'selected' : ''}>1</option>
                  <option value="X" ${m.result_90 === 'X' ? 'selected' : ''}>X</option>
                  <option value="2" ${m.result_90 === '2' ? 'selected' : ''}>2</option>
                </select>
```

por:

```js
                <select class="form__input jv2-r90-select" style="width:68px">
                  <option value="" ${!m.result_90 ? 'selected' : ''}>Auto</option>
                  <option value="1" ${m.result_90 === '1' ? 'selected' : ''}>1</option>
                  ${m.result_type !== '12' ? `<option value="X" ${m.result_90 === 'X' ? 'selected' : ''}>X</option>` : ''}
                  <option value="2" ${m.result_90 === '2' ? 'selected' : ''}>2</option>
                </select>
```

- [ ] **Step 2: Verificación manual en navegador**

Con la jornada de prueba del Task 4 (partido manual `result_type='12'`), abre "Resultados" en el panel admin y comprueba que el `<select>` de ese partido no tiene opción "X"; para un partido normal (1X2) sí la tiene.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/js/pages/admin.js
git commit -m "feat: ocultar opción X en resultados de partidos sin empate"
```

---

## Task 10: Frontend — botones 1/X/2 condicionales en Pronósticos (jornada.js)

**Files:**
- Modify: `frontend/src/js/pages/jornada.js:146-154` (`matchRow`)

- [ ] **Step 1: Condicionar las opciones del selector de resultado**

En `jornada.js:146-154`, reemplaza:

```js
      <div class="jornada-match__controls ${locked ? 'jornada-match__controls--disabled' : ''}">
        <div class="result-selector">
          ${['1', 'X', '2'].map(r => `
            <label class="result-selector__option">
              <input type="radio" name="result-${m.jornada_match_id}" value="${r}" ${s.predicted_result === r ? 'checked' : ''} ${locked ? 'disabled' : ''} />
              ${r}
            </label>
          `).join('')}
        </div>
```

por:

```js
      <div class="jornada-match__controls ${locked ? 'jornada-match__controls--disabled' : ''}">
        <div class="result-selector">
          ${(m.result_type === '12' ? ['1', '2'] : ['1', 'X', '2']).map(r => `
            <label class="result-selector__option">
              <input type="radio" name="result-${m.jornada_match_id}" value="${r}" ${s.predicted_result === r ? 'checked' : ''} ${locked ? 'disabled' : ''} />
              ${r}
            </label>
          `).join('')}
        </div>
```

- [ ] **Step 2: Ajustar el bloque de cuotas para no mostrar "X (—)" en partidos sin empate**

En `jornada.js:141-145`, reemplaza:

```js
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${formatOdds(m.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${formatOdds(m.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${formatOdds(m.odds_2)})</span>
      </div>
```

por:

```js
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${formatOdds(m.odds_1)})</span>
        ${m.result_type !== '12' ? `<span class="jornada-odds__item"><b>X</b> (${formatOdds(m.odds_x)})</span>` : ''}
        <span class="jornada-odds__item"><b>2</b> (${formatOdds(m.odds_2)})</span>
      </div>
```

- [ ] **Step 3: Verificación manual en navegador**

Con la jornada de prueba publicada (Task 4/5), entra en "Pronósticos" como usuario normal y comprueba que el partido manual `result_type='12'` muestra solo botones "1" y "2" (sin "X" ni cuota X), y que un partido 1X2 normal sigue mostrando los tres.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/js/pages/jornada.js
git commit -m "feat: ocultar opción X en Pronósticos para partidos sin empate"
```

---

## Task 11: Estilos SCSS del formulario manual

**Files:**
- Modify: `frontend/src/sass/pages/_admin.scss` (junto al bloque `.jv2-match-list`, línea ~509-514)

- [ ] **Step 1: Añadir las clases nuevas**

Justo después de `.jv2-match-list { ... }` (`_admin.scss:509-514`), añade:

```scss
.jv2-manual-form {
  display: flex;
  flex-direction: column;
  gap: v.$sp-2;
  border: 1px dashed v.$border;
  border-radius: v.$r-md;
  padding: v.$sp-3;
  background: v.$bg-surface;
  margin-top: v.$sp-3;
}

.jv2-manual-list {
  display: flex;
  flex-direction: column;
  gap: v.$sp-2;
}

.jv2-manual-item {
  display: flex;
  align-items: center;
  gap: v.$sp-2;
  font-size: v.$fs-sm;
  padding: v.$sp-2;
  border: 1px solid v.$border;
  border-radius: v.$r-md;

  &__teams { font-weight: v.$fw-semi; }
  &__meta { color: v.$text-muted; flex: 1; }
}
```

- [ ] **Step 2: Verificación manual**

```bash
cd frontend && npm run build
```

Esperado: compila sin errores de SASS (variables `v.$sp-2`, `v.$sp-3`, `v.$border`, `v.$r-md`, `v.$bg-surface`, `v.$fs-sm`, `v.$fw-semi` ya existen en el proyecto — usadas en las reglas vecinas).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/sass/pages/_admin.scss
git commit -m "style: estilos del formulario de partido manual"
```

---

## Task 12: Verificación end-to-end y push

**Files:** ninguno (solo verificación y publicación)

- [ ] **Step 1: Flujo completo en local**

1. `cd backend && source venv/bin/activate && flask run`
2. `cd frontend && npm run dev`
3. En el admin: crear una jornada con 9 partidos normales + 1 manual (`result_type='12'`, ej. "Lakers vs Celtics — NBA").
4. Publicar la jornada — comprobar que `calculate_odds()` **no** sobreescribe las cuotas manuales (quedan las introducidas a mano, porque `publish_jornada` solo calcula si `jm.odds_1 is None`).
5. Como usuario, entrar en Pronósticos, comprobar que el partido manual solo muestra botones 1/2, apostar.
6. En el admin, introducir el resultado del partido manual (marcador que no empate) — comprobar que los puntos se recalculan (`GET /api/v2/jornada/my-stats` refleja el resultado).
7. Esperar (o forzar) un ciclo del scheduler (`sync_live_matches`) y comprobar en logs que el partido manual no se toca.
8. Borrar la jornada de prueba.

- [ ] **Step 2: Revisar el diff completo antes de subir**

```bash
git status
git log --oneline -15
```

Confirma que todos los commits de las Tasks 1-11 están presentes y no hay cambios sin commitear relacionados con esta feature.

- [ ] **Step 3: Push**

```bash
git push
```
