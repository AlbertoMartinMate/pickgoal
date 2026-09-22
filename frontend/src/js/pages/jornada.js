import { api } from '../api.js';
import { showToast, formatDate, fmtPts, pointsModalHtml, attachPointsModal } from '../ui.js';

const MAX_UNITS = 20;
const MAX_UNITS_PER_MATCH = 5;

// Per-jornada state: jornadaMatchId -> { predicted_result, units }
let state = {};
let totalUnits = 0;
let lastOpenMatchId = null;
let currentJornadaData = null;
let openMatchesForSave = [];

export async function renderJornada(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { jornadas } = await api.jornada.list();

    if (!jornadas.length) {
      el.innerHTML = emptyStateHtml();
      return;
    }

    const sorted = [...jornadas].sort((a, b) => a.jornada.number - b.jornada.number);
    const liveIdx = sorted.findIndex(j => j.jornada.status === 'active' || j.jornada.status === 'upcoming');
    const activeIdx = liveIdx >= 0 ? liveIdx : sorted.length - 1;

    renderJornadaList(el, sorted, activeIdx);
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando jornadas: ${err.message}</p></div>`;
  }
}

function renderJornadaList(el, jornadas, activeIdx) {
  currentJornadaData = jornadas[activeIdx];
  const { jornada, matches, units_used } = currentJornadaData;

  state = {};
  for (const m of matches) {
    state[m.jornada_match_id] = {
      predicted_result: m.prediction?.predicted_result ?? null,
      units: m.prediction?.units_wagered ?? 0,
    };
  }
  totalUnits = units_used;

  const openMatches = matches.filter(m => !m.predict_locked);
  openMatchesForSave = openMatches;
  lastOpenMatchId = openMatches.length === 1 ? openMatches[0].jornada_match_id : null;

  const isFinished = jornada.status === 'finished';

  const tabs = jornadas.length > 1
    ? `<div class="jornada-tabs">
        ${jornadas.map((j, i) => {
          const fin = j.jornada.status === 'finished';
          const { pts, cls } = jornadaTabPts(j);
          return `
            <button class="jornada-tab jornada-tab--stacked ${i === activeIdx ? 'jornada-tab--active' : ''} ${fin ? 'jornada-tab--finished' : ''}" data-idx="${i}">
              <span class="jornada-tab__num">J${j.jornada.number}</span>
              <span class="jornada-tab__pts jornada-tab__pts--${cls}">${fmtPts(pts)}pts</span>
            </button>
          `;
        }).join('')}
       </div>`
    : '';

  el.innerHTML = `
    <div class="container">
      <div class="page-title-row">
        <h1 class="page-title">Jornada ${jornada.number} — del ${formatDayMonth(jornada.date_start)} al ${formatDayMonth(jornada.date_end)}</h1>
        <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
      </div>
      ${tabs}
      ${!isFinished ? '<div class="units-counter" id="unitsCounter"></div>' : ''}
      <div class="jornada-matches">
        ${matches.map(matchRow).join('')}
      </div>
      ${!isFinished && openMatches.length > 0 ? `
        <div class="jornada-save-all" id="jornadaSaveAll">
          <button class="jornada-save-all__btn" id="jornadaSaveAllBtn">
            💾 Guardar predicciones (0/${openMatches.length} predichos)
          </button>
        </div>
      ` : ''}
      ${pointsModalHtml()}
    </div>
  `;

  renderUnitsCounter();
  updateLastMatchWarning();
  updateSaveAllBtn();
  attachHandlers(el, jornadas, activeIdx);
  attachPointsModal(el);

  requestAnimationFrame(() => {
    el.querySelector('.jornada-tab--active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
}

function emptyStateHtml() {
  return `
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
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

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatOdds(v) {
  return v != null ? v.toFixed(2) : '—';
}

function matchTag(m) {
  if (m.jm_status === 'cancelled') {
    return '<span class="tag tag--cancelled">Suspendido</span>';
  }
  if (m.status === 'finished') {
    return `<span class="tag tag--done">Finalizado ${m.home_score_90 ?? '?'}–${m.away_score_90 ?? '?'}</span>`;
  }
  return m.predict_locked
    ? '<span class="tag tag--locked">Bloqueado</span>'
    : `<span class="tag tag--open">Abierto hasta ${formatDateTime(m.opens_until)}</span>`;
}

const KNOCKOUT_PHASES = new Set(['r32', 'r16', 'quarters', 'semis', 'third', 'final', 'no_draw']);

function calcWinPts(pred, result_90, m) {
  const oddsMap = { '1': m.odds_1, 'X': m.odds_x, '2': m.odds_2 };
  const odds = oddsMap[result_90];
  if (odds != null) return Math.round(pred.units_wagered * parseFloat(odds) * 100) / 100;
  return pred.points_earned ?? 0;
}

// Estimated points for a jornada tab:
//   unidades_sin_apostar + unidades_en_juego_si_aciertan + puntos_ya_ganados
// Finished matches count for real (or -1 penalty if never predicted); any
// other prediction (open or in play) is projected as a win at its odds,
// since the final result isn't known yet; units never wagered are credited
// 1:1 — the 20-unit baseline everyone starts a jornada with.
function calcJornadaPoints(jData) {
  let totalWagered = 0;
  let earnedOrProjected = 0;
  let penalty = 0;

  for (const m of jData.matches) {
    if (m.jm_status === 'cancelled') continue;
    const pred = m.prediction;
    const resultKnown = m.status === 'finished' && m.result_90 != null;

    if (pred && pred.units_wagered) totalWagered += pred.units_wagered;

    if (resultKnown) {
      if (!pred) { penalty += 1; continue; }
      if (pred.predicted_result === m.result_90) earnedOrProjected += calcWinPts(pred, m.result_90, m);
      continue;
    }

    if (pred && pred.units_wagered) {
      earnedOrProjected += calcWinPts(pred, pred.predicted_result, m);
    }
  }

  const unusedUnits = Math.max(0, MAX_UNITS - totalWagered);
  const total = Math.max(0, earnedOrProjected + unusedUnits - penalty);
  return Math.round(total * 100) / 100;
}

function jornadaTabPts(jData) {
  const pts = calcJornadaPoints(jData);
  const status = jData.jornada.status;
  const cls = status === 'finished' ? 'finished' : status === 'active' ? 'active' : 'upcoming';
  return { pts, cls };
}

function matchPtsLabel(m) {
  if (m.jm_status === 'cancelled') return '';
  const pred = m.prediction;
  const resultKnown = m.status === 'finished' && m.result_90 != null;

  if (resultKnown) {
    if (!pred) {
      return '<span class="jornada-pts-label jornada-pts-label--penalty">-1 pt ⚠️</span>';
    }
    if (pred.predicted_result === m.result_90) {
      const pts = calcWinPts(pred, m.result_90, m);
      return `<span class="jornada-pts-label jornada-pts-label--win">+${fmtPts(pts)} pts</span>`;
    }
    return '<span class="jornada-pts-label jornada-pts-label--loss">0 pts</span>';
  }

  if (!pred || !pred.units_wagered) return '';
  const isLive = m.predict_locked;
  return `<span class="jornada-pts-label jornada-pts-label--${isLive ? 'live' : 'pending'}">${pred.units_wagered}u${isLive ? ' en juego' : ' apostadas'}</span>`;
}

function matchRow(m) {
  const cancelled = m.jm_status === 'cancelled';
  const locked = m.predict_locked;
  const s = state[m.jornada_match_id] ?? { predicted_result: null, units: 0 };
  const isKnockout = KNOCKOUT_PHASES.has(m.phase);

  return `
    <div class="match-card jornada-match ${locked ? 'match-card--locked' : ''} ${cancelled ? 'match-card--cancelled' : ''}" data-jm-id="${m.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${formatDate(m.match_datetime)}</span>
        ${matchTag(m)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${m.home_team}</span>
        <div class="match-card__score">
          ${m.status !== 'scheduled'
            ? `<span class="score">${m.home_score_90 ?? '?'} - ${m.away_score_90 ?? '?'}</span>`
            : '<span class="score score--dash">vs</span>'
          }
          ${matchPtsLabel(m)}
        </div>
        <span class="team team--away">${m.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${formatOdds(m.odds_1)})</span>
        ${!isKnockout ? `<span class="jornada-odds__item"><b>X</b> (${formatOdds(m.odds_x)})</span>` : ''}
        <span class="jornada-odds__item"><b>2</b> (${formatOdds(m.odds_2)})</span>
      </div>
      <div class="jornada-match__controls ${locked ? 'jornada-match__controls--disabled' : ''}">
        ${isKnockout ? `<p class="jornada-match__knockout-label">Ganador</p>` : ''}
        <div class="result-selector ${isKnockout ? 'result-selector--knockout' : ''}">
          ${(isKnockout ? ['1', '2'] : ['1', 'X', '2']).map(r => `
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
      ${!locked ? `<div class="jornada-match__warning" id="warning-${m.jornada_match_id}"></div>` : ''}
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
  updateSaveAllBtn();
}

function attachHandlers(el, jornadas, activeIdx) {
  el.querySelectorAll('.jornada-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.idx);
      if (idx !== activeIdx) renderJornadaList(el, jornadas, idx);
    });
  });

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
  });

  document.getElementById('jornadaSaveAllBtn')?.addEventListener('click', saveAllPredictions);
}

function updateSaveAllBtn() {
  const btn = document.getElementById('jornadaSaveAllBtn');
  if (!btn) return;
  const predicted = openMatchesForSave.filter(m => state[m.jornada_match_id]?.predicted_result).length;
  const total = openMatchesForSave.length;
  btn.textContent = `💾 Guardar predicciones (${predicted}/${total} predichos)`;
}

async function saveAllPredictions() {
  const missing = openMatchesForSave.filter(m => !state[m.jornada_match_id]?.predicted_result);
  if (missing.length > 0) {
    const confirmed = confirm(
      `⚠️ Te quedan ${missing.length} partido${missing.length !== 1 ? 's' : ''} sin predecir (−1 pt cada uno).\n\n¿Guardar igualmente?`
    );
    if (!confirmed) return;
  }

  if (totalUnits > MAX_UNITS) {
    showToast(`Superas el máximo de ${MAX_UNITS} unidades`, 'error');
    return;
  }

  const toPred = openMatchesForSave.filter(m => state[m.jornada_match_id]?.predicted_result);
  if (!toPred.length) {
    showToast('No hay predicciones que guardar', 'error');
    return;
  }

  const btn = document.getElementById('jornadaSaveAllBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  const results = await Promise.allSettled(
    toPred.map(m => api.jornada.predict({
      jornada_match_id: m.jornada_match_id,
      predicted_result: state[m.jornada_match_id].predicted_result,
      units: state[m.jornada_match_id].units,
    }))
  );

  const errors = results.filter(r => r.status === 'rejected').length;
  if (errors === 0) {
    showToast(`${toPred.length} predicción${toPred.length !== 1 ? 'es' : ''} guardadas ✓`);
  } else {
    showToast(`${errors} error${errors !== 1 ? 'es' : ''} al guardar`, 'error');
  }

  if (btn) {
    btn.disabled = false;
    updateSaveAllBtn();
  }
}
