# PickGoal v2 Updates — Phase 3: Duelo Match-by-Match Pick Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the `#/duelo` page, show a per-match list below the duelo card with each jornada match, "my" pick (always visible) and the rival's pick (revealed only once that specific match has started).

**Architecture:** `GET /v2/duelo/current` (backend) gains a `matches` array nested inside the `duelo` object — one entry per `JornadaMatch` of the active jornada, carrying both players' `PredictionV2` for that match, with the rival's pick nulled out server-side (never serialized) until the match starts. `duelo.js` (frontend) renders that array as a new "Partido a partido" section using the existing `.match-card`/`.team`/`.score` components, plus a small new `.duelo-pick` component for the two pick badges. No new backend endpoints, no DB/model changes, no new dependencies.

**Tech Stack:** Flask + SQLAlchemy (backend), vanilla JS ES modules + SASS (frontend). No test framework in this repo — verification is manual: a `curl` smoke test against the running Flask dev server, `npm run build`, and a manual check in the browser with two real users sharing a duelo.

---

## File Structure

- Modify: `backend/app/routes/duelos.py` — add `matches` to `get_current_duelo()`.
- Modify: `frontend/src/js/pages/duelo.js` — render the new "Partido a partido" section.
- Modify: `frontend/src/sass/pages/_duelo.scss` — add `.duelo-pick-row`/`.duelo-pick` styles.

No new routes, no `api.js` changes needed — `api.duelo.current()` already calls `GET /v2/duelo/current` and returns the raw JSON body, so the new `matches` field just rides along inside `duelo`.

---

### Task 1: Backend — add `matches` to `GET /v2/duelo/current`

**Files:**
- Modify: `backend/app/routes/duelos.py`

- [ ] **Step 1: Add the missing imports and a `_match_started` helper**

In `backend/app/routes/duelos.py`, replace the top of the file:

```python
import random
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Duelo, Jornada, JornadaMatch, PredictionV2, DivisionMember, User

duelos_bp = Blueprint('duelos_v2', __name__)


def _get_active_jornada():
    return Jornada.query.filter_by(status='active').first()


def _get_user_jornada_points(user_id, jornada_id):
    from app.utils import calculate_jornada_points
    return calculate_jornada_points(user_id, jornada_id, commit=False)
```

with:

```python
import random
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Duelo, Jornada, JornadaMatch, Match, PredictionV2, DivisionMember, User

duelos_bp = Blueprint('duelos_v2', __name__)


def _get_active_jornada():
    return Jornada.query.filter_by(status='active').first()


def _get_user_jornada_points(user_id, jornada_id):
    from app.utils import calculate_jornada_points
    return calculate_jornada_points(user_id, jornada_id, commit=False)


def _match_started(match):
    dt_utc = match.match_datetime.replace(tzinfo=timezone.utc)
    return match.status != 'scheduled' or datetime.now(timezone.utc) >= dt_utc


def _build_duelo_matches(jornada_id, user_id, rival_id):
    """Per-match list for the duelo: my pick always visible, rival's pick
    only once that specific match has started. Never serializes the
    rival's pick before that, even if the client inspects the raw response."""
    jornada_matches = (
        JornadaMatch.query
        .filter_by(jornada_id=jornada_id)
        .join(JornadaMatch.match)
        .order_by(Match.match_datetime.asc())
        .all()
    )
    if not jornada_matches:
        return []

    jm_ids = [jm.id for jm in jornada_matches]
    my_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=user_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
    }
    rival_preds = {
        p.jornada_match_id: p
        for p in PredictionV2.query.filter_by(user_id=rival_id)
            .filter(PredictionV2.jornada_match_id.in_(jm_ids)).all()
    }

    result = []
    for jm in jornada_matches:
        match = jm.match
        started = _match_started(match)
        my_pred = my_preds.get(jm.id)
        rival_pred = rival_preds.get(jm.id) if started else None

        result.append({
            'jornada_match_id': jm.id,
            'home_team': match.home_team,
            'away_team': match.away_team,
            'match_datetime': match.match_datetime.replace(tzinfo=timezone.utc).isoformat(),
            'status': match.status,
            'home_score_90': match.home_score_90,
            'away_score_90': match.away_score_90,
            'started': started,
            'my_prediction': {
                'predicted_result': my_pred.predicted_result,
                'units_wagered': my_pred.units_wagered,
            } if my_pred else None,
            'rival_prediction': {
                'predicted_result': rival_pred.predicted_result,
                'units_wagered': rival_pred.units_wagered,
            } if rival_pred else None,
        })
    return result
```

- [ ] **Step 2: Use the helper in `get_current_duelo()`, skip it for the bye case**

Replace the return statement of `get_current_duelo()`:

```python
    return jsonify({
        'duelo': {
            **duelo.to_dict(),
            'rival': {'id': rival.id, 'username': rival.username} if rival else None,
            'my_points': round(my_points, 2),
            'rival_points': round(rival_points, 2),
            'status': status,
        }
    }), 200
```

with:

```python
    is_bye = duelo.player1_id == duelo.player2_id
    matches = [] if is_bye else _build_duelo_matches(jornada.id, user_id, rival_id)

    return jsonify({
        'duelo': {
            **duelo.to_dict(),
            'rival': {'id': rival.id, 'username': rival.username} if rival else None,
            'my_points': round(my_points, 2),
            'rival_points': round(rival_points, 2),
            'status': status,
            'matches': matches,
        }
    }), 200
```

- [ ] **Step 3: Manual smoke test against the running backend**

Start the backend dev server (adjust to however it's normally run in this repo, e.g. `cd backend && source venv/bin/activate && python run.py`), then in another terminal, log in as a real user that currently has an active duelo and grab a JWT:

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "<real_test_username>", "password": "<real_test_password>"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])"
```

Then call the duelo endpoint with that token:

```bash
TOKEN="<paste token from above>"
curl -s http://localhost:5000/api/v2/duelo/current -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Expected in the JSON:
- `duelo.matches` is a list with one entry per match of the active jornada, ordered by `match_datetime`.
- For any match with `"status": "scheduled"` and a future `match_datetime` (`started: false`), `rival_prediction` is `null` regardless of whether the rival actually predicted.
- For any match that has started (`started: true`), `rival_prediction` is either `null` (rival didn't predict) or `{"predicted_result": ..., "units_wagered": ...}`.
- `my_prediction` is populated whenever the logged-in user has a saved `PredictionV2` for that match, started or not.
- If the logged-in test user has a bye this jornada (`duelo.player1_id == duelo.player2_id` — check via `duelo.rival.id == <own id>` in the response, or query the DB), `duelo.matches` is `[]`.

- [ ] **Step 4: Commit**

```bash
git add backend/app/routes/duelos.py
git commit -m "feat: reveal rival picks per match once each match starts"
```

---

### Task 2: Frontend — render "Partido a partido" section in `duelo.js`

**Files:**
- Modify: `frontend/src/js/pages/duelo.js`

- [ ] **Step 1: Replace the file contents**

```js
import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate } from '../ui.js';

const STATUS_META = {
  en_curso: { label: 'En curso', cls: 'duelo-status--curso' },
  ganado:   { label: 'Ganaste',  cls: 'duelo-status--ganado' },
  perdido:  { label: 'Perdiste', cls: 'duelo-status--perdido' },
  empate:   { label: 'Empate',   cls: 'duelo-status--empate' },
};

export async function renderDuelo(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { duelo } = await api.duelo.current();
    const me = auth.getUser();

    if (!duelo) {
      el.innerHTML = `
        <div class="container">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
          </div>
        </div>
      `;
      return;
    }

    const statusMeta = STATUS_META[duelo.status] ?? STATUS_META.en_curso;
    const rivalName = duelo.rival ? duelo.rival.username : me.username;
    const isBye = !duelo.rival || duelo.rival.id === me.id;

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Tu duelo esta jornada</h1>

        <div class="duelo-card">
          <span class="duelo-status ${statusMeta.cls}">${statusMeta.label}</span>
          <div class="duelo-card__matchup">
            <div class="duelo-card__player">
              <span class="duelo-card__name">${me.username}</span>
              <span class="duelo-card__pts">${duelo.my_points}</span>
            </div>
            <span class="duelo-card__vs">VS</span>
            <div class="duelo-card__player">
              <span class="duelo-card__name">${isBye ? 'Descanso' : rivalName}</span>
              <span class="duelo-card__pts">${isBye ? '—' : duelo.rival_points}</span>
            </div>
          </div>
        </div>

        ${!isBye && duelo.matches?.length > 0 ? `
          <h2 class="section-title">Partido a partido</h2>
          <div class="duelo-matches">
            ${duelo.matches.map(m => matchPickCard(m, rivalName)).join('')}
          </div>
        ` : ''}

        <h2 class="section-title">Clasificación divisional</h2>
        <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
      </div>
    `;

    renderDivisionStandings(duelo.division_league_id, me.id);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando el duelo: ${err.message}</p></div>`;
  }
}

function matchPickCard(m, rivalName) {
  const myPick = m.my_prediction?.predicted_result;

  let rivalDisplay, rivalCls;
  if (!m.started) {
    rivalDisplay = '?';
    rivalCls = 'duelo-pick__value--hidden';
  } else if (m.rival_prediction) {
    rivalDisplay = m.rival_prediction.predicted_result;
    rivalCls = '';
  } else {
    rivalDisplay = '—';
    rivalCls = 'duelo-pick__value--empty';
  }

  return `
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${formatDate(m.match_datetime)}</span>
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
      <div class="duelo-pick-row">
        <div class="duelo-pick">
          <span class="duelo-pick__label">Tú</span>
          <span class="duelo-pick__value ${myPick ? '' : 'duelo-pick__value--empty'}">${myPick ?? '—'}</span>
        </div>
        <div class="duelo-pick">
          <span class="duelo-pick__label">${rivalName}</span>
          <span class="duelo-pick__value ${rivalCls}">${rivalDisplay}</span>
        </div>
      </div>
    </div>
  `;
}

async function renderDivisionStandings(leagueId, myUserId) {
  const container = document.getElementById('divisionStandings');
  if (!container) return;

  try {
    const { standings } = await api.clasificacion.division(leagueId);

    if (standings.length === 0) {
      container.innerHTML = '<p class="empty">Sin clasificación disponible.</p>';
      return;
    }

    container.innerHTML = `
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>Pts división</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map(row => `
              <tr class="${row.user_id === myUserId ? 'ranking-table__row--me' : ''}">
                <td class="ranking-table__pos" data-pos="${row.pos}">${row.pos}</td>
                <td>${row.username}${row.is_bot ? ' 🤖' : ''}</td>
                <td class="ranking-table__stat">${row.pj}</td>
                <td class="ranking-table__stat">${row.g}</td>
                <td class="ranking-table__stat">${row.e}</td>
                <td class="ranking-table__stat">${row.p}</td>
                <td class="ranking-table__pts">${row.pts_division}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="form__error">Error cargando la clasificación: ${err.message}</p>`;
  }
}
```

Notes on this implementation:
- `matchPickCard` reuses `.match-card`, `.match-card__header/__date/__teams`, `.team--home/--away`, `.score`/`.score--dash` verbatim from `frontend/src/js/pages/jornada.js:70-85` (`matchRow`) — same visual language as the jornada page's match list, just without the (editable) `result-selector`/units controls.
- `formatDate` is imported from `../ui.js` (already used elsewhere for full date+time formatting) — not previously imported in this file.
- `rivalDisplay`/`rivalCls` distinguish three states using the `started` flag the backend now sends: not started yet (`?`, dimmed/hidden style), started but rival has no pick for that match (`—`), started with a real pick (the letter itself, normal style). This mirrors the backend's three-way `rival_prediction` semantics (`null` pre-kickoff for privacy vs. `null` post-kickoff meaning "no pick was made").
- The whole "Partido a partido" section (title + list) is omitted entirely when `isBye` is true or when `duelo.matches` is empty, per spec section 3 ("Caso bye ... se omite la sección de comparación de picks").

- [ ] **Step 2: Commit**

```bash
git add frontend/src/js/pages/duelo.js
git commit -m "feat: show rival picks match-by-match on the duelo page"
```

---

### Task 3: SCSS — style the pick badges

**Files:**
- Modify: `frontend/src/sass/pages/_duelo.scss`

- [ ] **Step 1: Append the new styles**

Add to the end of `frontend/src/sass/pages/_duelo.scss`:

```scss
// ─── Partido a partido (picks) ────────────────────────────────────────────────
.duelo-matches {
  display: flex;
  flex-direction: column;
  gap: v.$sp-4;
  margin-bottom: v.$sp-10;
}

.duelo-pick-row {
  display: flex;
  justify-content: space-around;
  gap: v.$sp-4;
  padding-top: v.$sp-4;
  border-top: 1px solid v.$border;
}

.duelo-pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: v.$sp-2;

  &__label {
    font-size: v.$fs-xs;
    font-weight: v.$fw-semi;
    color: v.$text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__value {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 v.$sp-2;
    border-radius: v.$r-md;
    font-size: v.$fs-sm;
    font-weight: v.$fw-bold;
    background: v.$accent-dim;
    color: v.$accent;

    &--hidden {
      background: v.$bg-surface;
      color: v.$text-dim;
    }

    &--empty {
      background: v.$bg-surface;
      color: v.$text-dim;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/sass/pages/_duelo.scss
git commit -m "style: add pick badges for duelo match-by-match reveal"
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

```bash
cd frontend && npm run dev
```

With the backend also running locally, log in as a user who has an active duelo (not a bye) this jornada, navigate to `#/duelo`, and confirm:
- Below the duelo card, a "Partido a partido" section lists every match of the active jornada, in kickoff order, using the same card look as the jornada page's match list.
- For matches that haven't started yet: "Tú" shows your pick (or `—` if you haven't predicted that match), the rival's badge shows `?` in the dimmed style.
- For matches that have already started or finished (adjust a match's `match_datetime`/`status` in the DB if none are live yet, to check this state): the rival's badge shows their actual pick letter (`1`/`X`/`2`), or `—` if they didn't predict.
- Log in as the rival in a second browser/incognito window and confirm the reveal state is symmetric (each side sees the other's pick only for started matches).
- Log in as a user with a bye this jornada (`isBye`) and confirm the "Partido a partido" section does not render at all.

---

## Self-Review Notes

- **Spec coverage:** covers design doc section 3 in full — backend adds `matches` to `GET /v2/duelo/current` with `jornada_match_id`, match data, always-visible own pick, rival pick gated on `match.status != 'scheduled' or now >= match.match_datetime`, and omits the comparison entirely for the bye case; frontend renders team/pick/`?` list below the duelo card.
- **Placeholder scan:** none — full working code included in every step.
- **Type/name consistency:** `_match_started`/`_build_duelo_matches` (backend) and `matchPickCard` (frontend) are used consistently with the field names they produce (`started`, `my_prediction`, `rival_prediction`) — checked against both the Task 1 backend code and the Task 2 frontend code that consumes it.
