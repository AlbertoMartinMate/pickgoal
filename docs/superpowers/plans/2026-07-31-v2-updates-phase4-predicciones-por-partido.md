# PickGoal v2 Updates — Phase 4: Predicciones por partido Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the jornada-wide "lock at first kickoff, save everything in one batch" prediction flow with a per-match model: each match opens/closes independently (closes 30 minutes before its own kickoff), and is saved individually with its own button, while the 20-unit/5-per-match jornada budget is still enforced globally.

**Architecture:** Backend: `GET /v2/jornada/current` adds `predict_locked`/`opens_until` per match (reusing the `Match.is_locked()` method that already implements the exact "match_datetime - 30min" rule elsewhere in the codebase) and drops the jornada-wide `locked`/`first_match_datetime` fields; `POST /v2/jornada/predict` changes from a batch-of-predictions payload to a single `{jornada_match_id, predicted_result, units}` payload, validated per match. Frontend: `jornada.js` renders a "Guardar" button and an "Abierto hasta HH:MM"/"Bloqueado" tag per match instead of one global button/banner, keeps the same live-recalculated units bar, and shows a one-off warning when the match being edited is the only one still open and units remain unused.

**Tech Stack:** Flask + SQLAlchemy (backend), vanilla JS ES modules + SASS (frontend). No test framework in this repo — verification is manual: static/mechanical checks (compile, import, `node --check`) during implementation, then a real browser check by the project owner once deployed (per their explicit instruction for this phase).

---

## File Structure

- Modify: `backend/app/routes/jornadas.py` — per-match locking on `GET /current`, single-prediction payload on `POST /predict`, remove the now-dead `_first_match_datetime` helper.
- Modify: `frontend/src/js/api.js` — `jornada.predict()` takes one prediction object instead of an array.
- Modify: `frontend/src/js/pages/jornada.js` — per-match save button, per-match lock tag, last-open-match warning.
- Modify: `frontend/src/sass/pages/_jornada.scss` — replace the now-dead sticky `.jornada-save-btn` rule with `.jornada-match__save-btn` for the per-match button.

No new SCSS classes needed beyond that one swap — `.tag`/`.tag--locked`, `.notice`, `.btn`/`.btn--primary`/`.btn--full`, `.match-card`/`.match-card--locked`, `.jornada-match__controls`/`--disabled` all already exist and are reused as-is.

---

### Task 1: Backend — per-match locking on `GET /current`, single-prediction `POST /predict`

**Files:**
- Modify: `backend/app/routes/jornadas.py`

- [ ] **Step 1: Replace the whole file**

Replace the entire contents of `backend/app/routes/jornadas.py` with:

```python
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Jornada, JornadaMatch, PredictionV2, Duelo, User

jornadas_bp = Blueprint('jornadas_v2', __name__)

MAX_UNITS = 20
MAX_UNITS_PER_MATCH = 5


def _get_active_jornada():
    return Jornada.query.filter_by(status='active').first()


@jornadas_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_jornada():
    user_id = int(get_jwt_identity())
    jornada = _get_active_jornada()
    if not jornada:
        next_jornada = (
            Jornada.query.filter_by(status='upcoming')
            .order_by(Jornada.date_start.asc())
            .first()
        )
        return jsonify({
            'jornada': None,
            'next_jornada': next_jornada.to_dict() if next_jornada else None,
        }), 200

    jornada_matches = JornadaMatch.query.filter_by(jornada_id=jornada.id).all()

    # Units used by this user in this jornada
    user_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=user_id).filter(
            PredictionV2.jornada_match_id.in_([jm.id for jm in jornada_matches])
        ).all()
    }
    units_used = sum(p.units_wagered for p in user_preds.values())

    matches_data = []
    for jm in jornada_matches:
        match = jm.match
        dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
        pred = user_preds.get(jm.id)
        matches_data.append({
            'jornada_match_id': jm.id,
            'match_id': match.id,
            'home_team': match.home_team,
            'away_team': match.away_team,
            'match_datetime': dt_utc.isoformat(),
            'status': match.status,
            'result_90': match.result_90,
            'home_score_90': match.home_score_90,
            'away_score_90': match.away_score_90,
            'odds_1': jm.odds_1,
            'odds_x': jm.odds_x,
            'odds_2': jm.odds_2,
            'predict_locked': match.is_locked(),
            'opens_until': (dt_utc - timedelta(minutes=30)).isoformat(),
            'prediction': pred.to_dict() if pred else None,
        })

    return jsonify({
        'jornada': jornada.to_dict(),
        'matches': matches_data,
        'units_used': units_used,
        'units_disponibles': MAX_UNITS - units_used,
    }), 200


@jornadas_bp.route('/predict', methods=['POST'])
@jwt_required()
def save_prediction():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    jornada_match_id = data.get('jornada_match_id')
    predicted_result = data.get('predicted_result')
    units = data.get('units', 1)

    jornada = _get_active_jornada()
    if not jornada:
        return jsonify({'error': 'No hay jornada activa'}), 400

    jm = JornadaMatch.query.filter_by(id=jornada_match_id, jornada_id=jornada.id).first()
    if not jm:
        return jsonify({'error': f'Partido {jornada_match_id} no pertenece a la jornada activa'}), 400

    if jm.match.is_locked():
        return jsonify({'error': 'Este partido ya está bloqueado'}), 403

    if predicted_result not in ('1', 'X', '2'):
        return jsonify({'error': 'Resultado inválido'}), 400

    if not isinstance(units, int) or units < 0 or units > MAX_UNITS_PER_MATCH:
        return jsonify({'error': f'Unidades inválidas (0-{MAX_UNITS_PER_MATCH})'}), 400

    jm_ids = [m.id for m in JornadaMatch.query.filter_by(jornada_id=jornada.id).all()]
    other_units = sum(
        p.units_wagered
        for p in PredictionV2.query.filter_by(user_id=user_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
        if p.jornada_match_id != jornada_match_id
    )
    if other_units + units > MAX_UNITS:
        return jsonify({'error': f'Total de unidades supera el máximo de {MAX_UNITS}'}), 400

    existing = PredictionV2.query.filter_by(user_id=user_id, jornada_match_id=jornada_match_id).first()
    if existing:
        existing.predicted_result = predicted_result
        existing.units_wagered = units
        pred = existing
    else:
        pred = PredictionV2(
            user_id=user_id,
            jornada_match_id=jornada_match_id,
            predicted_result=predicted_result,
            units_wagered=units,
        )
        db.session.add(pred)

    db.session.commit()
    return jsonify({'prediction': pred.to_dict()}), 200


@jornadas_bp.route('/history', methods=['GET'])
@jwt_required()
def get_jornada_history():
    user_id = int(get_jwt_identity())

    finished_jornadas = Jornada.query.filter_by(status='finished').order_by(Jornada.number.desc()).all()

    history = []
    for jornada in finished_jornadas:
        jm_ids = [jm.id for jm in JornadaMatch.query.filter_by(jornada_id=jornada.id).all()]
        preds = PredictionV2.query.filter_by(user_id=user_id).filter(
            PredictionV2.jornada_match_id.in_(jm_ids)
        ).all()

        units_used = sum(p.units_wagered for p in preds)
        points_earned = sum(p.points_earned or 0 for p in preds)
        unplayed_units = MAX_UNITS - units_used

        history.append({
            **jornada.to_dict(),
            'units_used': units_used,
            'points_from_bets': round(points_earned, 2),
            'points_from_unused_units': unplayed_units,
            'total_points': round(points_earned + unplayed_units, 2),
            'predictions_count': len(preds),
        })

    return jsonify({'history': history}), 200
```

Notes on this implementation, so a reviewer isn't left guessing:
- `match.is_locked()` is an existing method on `Match` (`backend/app/models.py:105-107`): `return self.status != 'scheduled' or datetime.now(timezone.utc) >= dt_utc - timedelta(minutes=30)`. This is the *exact* "closes 30 minutes before kickoff" rule the design spec asks for — reusing it means `predict_locked` and the `POST /predict` lock check can never drift apart, since both call the same method on the same `Match` instance. No new locking helper is written in this file.
- `_first_match_datetime()` (the old jornada-wide lock helper) and the `locked`/`first_match_datetime` response fields are deleted outright — nothing else in the codebase references them (verified: only this file and `frontend/src/js/pages/jornada.js` used them, and the frontend task in this same plan removes the frontend usage). This is not dead-code-left-around; it's a full removal.
- `get_jornada_history` is copied verbatim, unchanged — it doesn't touch locking or the predict payload shape.
- The `Duelo, User` imports on line 5 are pre-existing, already-unused imports from before this change (verify yourself: neither name appears anywhere else in the original file). They are **not** part of this task's scope — leave them exactly as they were, don't remove them as a "while I'm here" cleanup.
- `POST /predict`'s budget check ("Suma de unidades ya usadas en la jornada (excluyendo esta predicción si ya existía) + units de esta petición <= 20") is implemented by summing every other `PredictionV2` this user has in this jornada (`if p.jornada_match_id != jornada_match_id`) and adding the incoming `units` — this correctly handles both a brand-new prediction and an edit of an existing one without double-counting the match being saved.
- Validation order matches the spec's own ordering: jornada exists → match belongs to jornada → match not locked → `predicted_result` valid → `units` valid → budget not exceeded.

- [ ] **Step 2: Sanity-check the change**

No automated test suite exists in this repo (backend or frontend) — manual/mechanical verification only, per the project's established convention. Do not attempt to start a full local server + real DB for this step.

```bash
cd backend && python3 -m py_compile app/routes/jornadas.py
cd backend && venv/bin/python -c "from app.routes import jornadas"
```
Expected: both succeed with no output/errors (the second command needs an app context import to work — if it errors on missing Flask app context rather than a syntax/import error in the file itself, that's expected and fine; the goal is confirming there's no `NameError`/`ImportError`/`SyntaxError` in this file specifically).

Also grep to confirm nothing else in the repo references the removed names:
```bash
grep -rn "_first_match_datetime\|'locked'\|first_match_datetime" backend/app/ frontend/src/js/
```
Expected: no remaining references (frontend still has zero at this point since Task 2/3 haven't run yet — if you see a hit in `frontend/src/js/pages/jornada.js`, that's expected and will be fixed by a separate task, not yours to fix here).

- [ ] **Step 3: Commit**

```bash
git add backend/app/routes/jornadas.py
git commit -m "feat: lock and save jornada predictions per match instead of jornada-wide"
```

---

### Task 2: Frontend — per-match save/lock in `jornada.js` (+ `api.js` signature change)

**Files:**
- Modify: `frontend/src/js/api.js`
- Modify: `frontend/src/js/pages/jornada.js`

- [ ] **Step 1: Update `api.js`'s `jornada.predict`**

In `frontend/src/js/api.js`, find:

```js
  jornada: {
    current: () => request('/v2/jornada/current'),
    predict: (predictions) => request('/v2/jornada/predict', { method: 'POST', body: JSON.stringify({ predictions }) }),
    history: () => request('/v2/jornada/history'),
  },
```

Replace with:

```js
  jornada: {
    current: () => request('/v2/jornada/current'),
    predict: (prediction) => request('/v2/jornada/predict', { method: 'POST', body: JSON.stringify(prediction) }),
    history: () => request('/v2/jornada/history'),
  },
```

- [ ] **Step 2: Replace the whole `jornada.js` file**

Replace the entire contents of `frontend/src/js/pages/jornada.js` with:

```js
import { api } from '../api.js';
import { showToast, formatDate } from '../ui.js';

const MAX_UNITS = 20;
const MAX_UNITS_PER_MATCH = 5;

// jornada_match_id -> { predicted_result, units }
let state = {};
let totalUnits = 0;
let lastOpenMatchId = null;

export async function renderJornada(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const data = await api.jornada.current();

    if (!data.jornada) {
      el.innerHTML = emptyStateHtml(data.next_jornada);
      return;
    }

    const { jornada, matches, units_used } = data;
    state = {};
    for (const m of matches) {
      state[m.jornada_match_id] = {
        predicted_result: m.prediction?.predicted_result ?? null,
        units: m.prediction?.units_wagered ?? 0,
      };
    }
    totalUnits = units_used;

    const openMatches = matches.filter(m => !m.predict_locked);
    lastOpenMatchId = openMatches.length === 1 ? openMatches[0].jornada_match_id : null;

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Jornada ${jornada.number} — del ${formatDayMonth(jornada.date_start)} al ${formatDayMonth(jornada.date_end)}</h1>
        <div class="units-counter" id="unitsCounter"></div>
        <div class="jornada-matches">
          ${matches.map(matchRow).join('')}
        </div>
      </div>
    `;

    renderUnitsCounter();
    updateLastMatchWarning();
    attachHandlers(el);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando la jornada: ${err.message}</p></div>`;
  }
}

function emptyStateHtml(nextJornada) {
  return `
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornada activa esta semana</h2>
        ${nextJornada
          ? `<p class="jornada-empty__text">Próxima jornada: <strong>Jornada ${nextJornada.number}</strong> — ${formatDate(nextJornada.date_start)}</p>`
          : '<p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>'
        }
      </div>
    </div>
  `;
}

function formatDayMonth(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatOdds(v) {
  return v != null ? v.toFixed(2) : '—';
}

function matchRow(m) {
  const locked = m.predict_locked;
  const s = state[m.jornada_match_id] ?? { predicted_result: null, units: 0 };

  return `
    <div class="match-card jornada-match ${locked ? 'match-card--locked' : ''}" data-jm-id="${m.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${formatDate(m.match_datetime)}</span>
        ${locked
          ? '<span class="tag tag--locked">Bloqueado</span>'
          : `<span class="tag">Abierto hasta ${formatTime(m.opens_until)}</span>`
        }
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${m.home_team}</span>
        <div class="match-card__score">
          ${m.status !== 'scheduled'
            ? `<span class="score">${m.home_score_90 ?? '?'} - ${m.away_score_90 ?? '?'}</span>`
            : '<span class="score score--dash">vs</span>'
          }
        </div>
        <span class="team team--away">${m.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${formatOdds(m.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${formatOdds(m.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${formatOdds(m.odds_2)})</span>
      </div>
      <div class="jornada-match__controls ${locked ? 'jornada-match__controls--disabled' : ''}">
        <div class="result-selector">
          ${['1', 'X', '2'].map(r => `
            <label class="result-selector__option">
              <input type="radio" name="result-${m.jornada_match_id}" value="${r}" ${s.predicted_result === r ? 'checked' : ''} ${locked ? 'disabled' : ''} />
              ${r}
            </label>
          `).join('')}
        </div>
        <div class="jornada-units">
          <label class="jornada-units__label" for="units-${m.jornada_match_id}">Unidades</label>
          <input type="number" id="units-${m.jornada_match_id}" class="jornada-units__input" min="0" max="${MAX_UNITS_PER_MATCH}" value="${s.units}" ${locked ? 'disabled' : ''} />
        </div>
      </div>
      ${!locked ? `
        <div class="jornada-match__warning" id="warning-${m.jornada_match_id}"></div>
        <button class="btn btn--primary btn--full jornada-match__save-btn" data-jm-id="${m.jornada_match_id}">Guardar</button>
      ` : ''}
    </div>
  `;
}

function renderUnitsCounter() {
  const el = document.getElementById('unitsCounter');
  if (!el) return;
  const over = totalUnits > MAX_UNITS;
  el.innerHTML = `
    <div class="units-counter__bar">
      <div class="units-counter__fill ${over ? 'units-counter__fill--over' : ''}" style="width:${Math.min(100, (totalUnits / MAX_UNITS) * 100)}%"></div>
    </div>
    <span class="units-counter__label ${over ? 'units-counter__label--over' : ''}">${totalUnits}/${MAX_UNITS} unidades usadas</span>
  `;
}

function updateLastMatchWarning() {
  if (!lastOpenMatchId) return;
  const el = document.getElementById(`warning-${lastOpenMatchId}`);
  if (!el) return;
  const remaining = MAX_UNITS - totalUnits;
  el.innerHTML = remaining > 0
    ? `<p class="notice">Te quedan ${remaining} unidades — es tu último partido.</p>`
    : '';
}

function recalcTotalUnits() {
  totalUnits = Object.values(state).reduce((sum, s) => sum + (s.predicted_result ? s.units : 0), 0);
  renderUnitsCounter();
  updateLastMatchWarning();
}

function attachHandlers(el) {
  el.querySelectorAll('.jornada-match').forEach(card => {
    const jmId = parseInt(card.dataset.jmId);

    card.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        state[jmId].predicted_result = radio.value;
        recalcTotalUnits();
      });
    });

    const unitsInput = card.querySelector('.jornada-units__input');
    unitsInput?.addEventListener('input', () => {
      let v = parseInt(unitsInput.value);
      if (isNaN(v)) v = 0;
      v = Math.max(0, Math.min(MAX_UNITS_PER_MATCH, v));
      state[jmId].units = v;
      recalcTotalUnits();
    });

    card.querySelector('.jornada-match__save-btn')?.addEventListener('click', () => savePrediction(jmId));
  });
}

async function savePrediction(jmId) {
  const s = state[jmId];

  if (!s.predicted_result) {
    showToast('Selecciona un resultado 1X2', 'error');
    return;
  }
  if (totalUnits > MAX_UNITS) {
    showToast(`Superas el máximo de ${MAX_UNITS} unidades`, 'error');
    return;
  }

  const btn = document.querySelector(`.jornada-match__save-btn[data-jm-id="${jmId}"]`);
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  try {
    await api.jornada.predict({
      jornada_match_id: jmId,
      predicted_result: s.predicted_result,
      units: s.units,
    });
    showToast('Predicción guardada');
    if (btn) btn.textContent = '✓ Guardada';
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      setTimeout(() => { if (btn) btn.textContent = 'Guardar'; }, 2000);
    }
  }
}
```

Notes on this implementation:
- `lastOpenMatchId` is computed once per render from the `predict_locked` flags the backend sends, mirroring the spec's "el partido que se está editando es el único aún abierto" — since a jornada can have at most one still-open match near the end, this is simply "is there exactly one match with `predict_locked === false`". It's recomputed only on a full `renderJornada()` call (i.e. on page load/reload), not on every keystroke, matching how `predict_locked` itself only changes with the passage of time or a full page refresh — not something client-side input events affect.
- `updateLastMatchWarning()` is called both right after the initial render and from `recalcTotalUnits()` (which already runs on every radio/units change) — so the warning is live as the user edits the last open match's stake, and also shows immediately on page load if that condition is already true without any interaction.
- No "forced last match" logic exists anywhere — per spec section 4, this is "solo aviso en frontend", never a save-blocking rule. `savePrediction()` only blocks on missing `predicted_result` or the jornada-wide 20-unit budget, exactly as before.
- The per-match save button (`.jornada-match__save-btn`, `data-jm-id="..."`) replaces the old single full-jornada `#jornadaSaveBtn`/`.jornada-save-btn`. Button feedback (disable while saving → `✓ Guardada` → revert to `Guardar` after 2s) mirrors the old global button's UX, just scoped to one match.
- The old `${jornada.locked ? '<p class="notice">...' : ''}` global banner and the `!jornada.locked` gating on `attachHandlers`/the save button are both gone — locking is now purely a per-match concern (`locked` inside `matchRow`, driven by `m.predict_locked`), matching spec section 4's "Se retira el estado de 'jornada bloqueada' global".
- `.jornada-match__controls--disabled` (opacity dimming) and `disabled` attributes on the radio/units inputs are kept exactly as before, just driven by `m.predict_locked` instead of a client-side `new Date()` comparison — the backend is now the single source of truth for the lock boundary, matching how `duelo.js` (previous phase) also consumes a backend-computed boolean rather than recomputing it in JS.
- `.tag` (no modifier) is reused as-is for the "Abierto hasta HH:MM" state — it already has accent-colored styling from `frontend/src/sass/base/_reset.scss:133-143`, no new SCSS needed for that state; `.tag--locked` (already in `_jornada.scss`) is reused unchanged for "Bloqueado".
- `.notice` (no modifier) is reused as-is for the warning banner — it already exists in `frontend/src/sass/base/_reset.scss:101-111` and needs no changes.

- [ ] **Step 3: Verify with `node --check` (no test suite in this repo)**

```bash
cd frontend && node --check src/js/pages/jornada.js && node --check src/js/api.js
```
Expected: both exit 0, no output.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/js/api.js frontend/src/js/pages/jornada.js
git commit -m "feat: save and lock jornada predictions per match in the UI"
```

---

### Task 3: SCSS — replace the dead global save-button style with a per-match one

**Files:**
- Modify: `frontend/src/sass/pages/_jornada.scss`

- [ ] **Step 1: Replace `.jornada-save-btn` with `.jornada-match__save-btn`**

In `frontend/src/sass/pages/_jornada.scss`, find:

```scss
.jornada-save-btn {
  position: sticky;
  bottom: calc(v.$bottom-nav-h + v.$sp-4);
  margin-top: v.$sp-2;
}
```

Replace with:

```scss
.jornada-match__save-btn {
  margin-top: v.$sp-4;
}
```

This class is now dead — the markup that used it (the single jornada-wide "Guardar predicciones" button, `#jornadaSaveBtn`/`.jornada-save-btn`) was removed from `frontend/src/js/pages/jornada.js` in Task 2, replaced by one `.jornada-match__save-btn` per match card, which needs plain top spacing (not sticky-to-viewport positioning — with one button per match card, a sticky button per card would overlap every other card while scrolling).

- [ ] **Step 2: Commit**

```bash
git add frontend/src/sass/pages/_jornada.scss
git commit -m "style: replace sticky global save button with per-match save button spacing"
```

---

### Task 4: Build and manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the Vite build**

```bash
cd frontend && npm run build
```
Expected: exit code 0, no errors.

- [ ] **Step 2: Manual check in the browser**

The project owner will perform this step once the change is deployed (per their explicit instruction). Leave this step unchecked until they confirm; do not attempt to fabricate or assume a result.

```bash
cd frontend && npm run dev
```

With the backend also running, log in as a user in an active jornada with at least two matches (ideally one already within 30 minutes of kickoff or started, and at least one still open) and confirm:
- Each match shows its own "Abierto hasta HH:MM" or "Bloqueado" tag, matching that match's actual kickoff time minus 30 minutes.
- Each open match has its own "Guardar" button; saving one match doesn't affect or require the others.
- The units bar at the top updates live as `1`/`X`/`2` and unit values are changed on any open match, before saving.
- Saving a match persists correctly — refresh the page and confirm the saved pick/units are still shown and that match's radio/units inputs reflect them.
- Saving with no result selected on that match shows an error toast and does not call the API.
- Saving a total over 20 units (across all matches combined, whether saved yet or not) shows an error toast and does not call the API.
- When only one match remains open and there are unused units left in the 20-unit budget, that match's card shows "Te quedan X unidades — es tu último partido." and the Guardar button still works normally (no forced save, no blocking).
- Once a match passes its lock boundary (or you manually adjust its `match_datetime`/`status` in the DB to simulate it), reloading the page shows it as "Bloqueado" with disabled inputs and no Guardar button, while other open matches are unaffected.

---

## Self-Review Notes

- **Spec coverage:** covers design doc section 4 in full — `predict_locked`/`opens_until` per match on `GET /current` (reusing `Match.is_locked()`'s existing `match_datetime - 30min` rule), single-prediction `POST /predict` payload with all five listed validations in spec order, no forced-last-match logic (warning only), per-match "Abierto hasta HH:MM"/"Bloqueado" tags, per-match save buttons replacing the single jornada button, live-recalculated units bar, last-open-match warning, and removal of the jornada-wide `locked` state end to end (backend response field, frontend banner/gating, and the now-dead SCSS rule).
- **Placeholder scan:** none — full working code included in every step.
- **Type/name consistency:** backend response fields (`predict_locked`, `opens_until`, `prediction`) match exactly what `jornada.js` reads (`m.predict_locked`, `m.opens_until`, `m.prediction`); the `POST /predict` request body shape (`jornada_match_id`, `predicted_result`, `units`) matches exactly what `savePrediction()` sends and what `api.js`'s new `predict(prediction)` signature forwards — checked across Task 1 (backend) and Task 2 (frontend) together.
