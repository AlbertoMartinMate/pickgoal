# PickGoal v2 Updates — Phase 2: Tabla-v2 Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "General" / "Mi División" tabs to the `#/tabla-v2` page, reusing the existing `.league-tabs` CSS pattern and the existing `GET /v2/clasificacion/division` endpoint (already consumed by `duelo.js` for its standings table).

**Architecture:** Frontend-only change, no backend changes — both endpoints already exist and return exactly the data needed. `tabla-v2.js` renders two tab buttons and two `<section>` panels; General is rendered eagerly (as today), Mi División is lazy-loaded on first click (mirrors the `liga-detalle.js` tab pattern, which lazy-loads its Tablón panel the same way).

**Tech Stack:** Vanilla JS (ES modules), template-literal HTML, no framework, no test framework in this repo — verification is `npm run build` plus a manual check via the Vite dev server logged in as a real user.

---

## File Structure

- Modify: `frontend/src/js/pages/tabla-v2.js` — full rewrite to add tabs and the Mi División panel.

No SCSS changes — `.league-tabs`/`.league-tab`/`.league-tab--active` (from `frontend/src/sass/pages/_tablon.scss:280-306`) and `.hidden` (`frontend/src/sass/base/_reset.scss:75`) already exist and are page-agnostic. No backend changes — `GET /v2/clasificacion/general` and `GET /v2/clasificacion/division` (`backend/app/routes/clasificacion.py`) already return everything needed; `division` already defaults to the caller's current league when no `league_id` query param is passed.

---

### Task 1: Rewrite `tabla-v2.js` with tabs

**Files:**
- Modify: `frontend/src/js/pages/tabla-v2.js` (full file, currently 49 lines)

- [ ] **Step 1: Replace the file contents**

```js
import { api } from '../api.js';
import { auth } from '../auth.js';

export async function renderTablaV2(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { standings } = await api.clasificacion.general();
    const me = auth.getUser();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Clasificación</h1>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabGeneral">General</button>
          <button class="league-tab" id="tabMiDivision">Mi División</button>
        </div>

        <section id="panelGeneral">
          ${standings.length === 0
            ? '<p class="empty">Todavía no hay clasificación disponible.</p>'
            : `
              <div class="ranking-table-wrapper">
                <table class="ranking-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Pts jornada</th>
                      <th>Pts total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${standings.map(u => `
                      <tr class="${me && u.user_id === me.id ? 'ranking-table__row--me' : ''}">
                        <td class="ranking-table__pos" data-pos="${u.pos}">${u.pos}</td>
                        <td>
                          <span class="status-emoji" title="${u.status?.name || ''}">${u.status?.emoji || ''}</span>
                          ${u.username}
                        </td>
                        <td class="ranking-table__stat">${u.pts_jornada_actual}</td>
                        <td class="ranking-table__pts">${u.pts_general}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `
          }
        </section>

        <section id="panelMiDivision" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>
      </div>
    `;

    attachTabHandlers(me);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando la clasificación: ${err.message}</p></div>`;
  }
}

function attachTabHandlers(me) {
  const tabGeneral = document.getElementById('tabGeneral');
  const tabMiDivision = document.getElementById('tabMiDivision');
  const panelGeneral = document.getElementById('panelGeneral');
  const panelMiDivision = document.getElementById('panelMiDivision');

  if (!tabGeneral || !tabMiDivision) return;

  tabGeneral.addEventListener('click', () => {
    tabGeneral.classList.add('league-tab--active');
    tabMiDivision.classList.remove('league-tab--active');
    panelGeneral.classList.remove('hidden');
    panelMiDivision.classList.add('hidden');
  });

  tabMiDivision.addEventListener('click', () => {
    tabMiDivision.classList.add('league-tab--active');
    tabGeneral.classList.remove('league-tab--active');
    panelMiDivision.classList.remove('hidden');
    panelGeneral.classList.add('hidden');

    if (!panelMiDivision.dataset.loaded) {
      panelMiDivision.dataset.loaded = '1';
      renderMiDivision(me);
    }
  });
}

async function renderMiDivision(me) {
  const panel = document.getElementById('panelMiDivision');
  if (!panel) return;

  try {
    const { standings } = await api.clasificacion.division();

    if (standings.length === 0) {
      panel.innerHTML = '<p class="empty">Todavía no perteneces a ninguna división.</p>';
      return;
    }

    panel.innerHTML = `
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
              <tr class="${me && row.user_id === me.id ? 'ranking-table__row--me' : ''}">
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
    panel.innerHTML = `<p class="form__error">Error cargando la clasificación: ${err.message}</p>`;
  }
}
```

Notes on this implementation, so a reviewer isn't left guessing:
- `api.clasificacion.division()` is called with no `leagueId` argument — the existing `frontend/src/js/api.js` signature (`division: (leagueId) => request(...)`) omits the query param entirely when falsy, and the backend (`backend/app/routes/clasificacion.py:9-33`) already resolves the caller's current league from `DivisionMember` in that case. This is the exact same call `duelo.js:71` makes.
- The `ranking-table` markup/columns for Mi División are copied verbatim from `duelo.js:78-107` (`renderDivisionStandings`), including the `ranking-table__row--me` highlight class — same visual component, just relocated into a tab.
- `#/tabla-v2` is already a protected route requiring login (`frontend/src/js/router.js:89`), and `GET /v2/clasificacion/division` requires a JWT — no new auth gating needed.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/js/pages/tabla-v2.js
git commit -m "feat: add General/Mi División tabs to tabla-v2"
```

---

### Task 2: Build and manual verification

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
Log in, navigate to `#/tabla-v2`, confirm:
- "General" tab is active by default and shows the same table as before (pos, status emoji, usuario, pts jornada, pts total).
- Clicking "Mi División" shows a loading spinner briefly, then a table with columns `#`, Usuario, PJ, G, E, P, Pts división, with the logged-in user's row highlighted.
- Switching back to "General" and forth to "Mi División" again does not re-trigger the loading spinner (lazy-load only happens once, via `panelMiDivision.dataset.loaded`).
- If the logged-in test user has no division yet, "Mi División" shows the empty-state message styled per Phase 1 (dark card, not a jarring plain paragraph).

---

## Self-Review Notes

- **Spec coverage:** covers design doc section 2 in full — General tab unchanged, Mi División tab with PJ/G/E/P/Pts división columns and current-user highlighting, backend reused as-is.
- **Placeholder scan:** none — full working code included.
- **Type/name consistency:** `renderMiDivision`, `attachTabHandlers`, element IDs (`tabGeneral`, `tabMiDivision`, `panelGeneral`, `panelMiDivision`) are consistent between the two functions in the single file changed.
