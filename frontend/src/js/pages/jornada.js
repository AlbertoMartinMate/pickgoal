import { api } from '../api.js';
import { showToast, formatDate, pointsModalHtml, attachPointsModal } from '../ui.js';

const MAX_UNITS = 20;
const MAX_UNITS_PER_MATCH = 5;

// Per-jornada state: jornadaMatchId -> { predicted_result, units }
let state = {};
let totalUnits = 0;
let lastOpenMatchId = null;
let currentJornadaData = null;

export async function renderJornada(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { jornadas } = await api.jornada.list();

    if (!jornadas.length) {
      el.innerHTML = emptyStateHtml();
      return;
    }

    renderJornadaList(el, jornadas, 0);
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
  lastOpenMatchId = openMatches.length === 1 ? openMatches[0].jornada_match_id : null;

  const tabs = jornadas.length > 1
    ? `<div class="jornada-tabs">
        ${jornadas.map((j, i) => `
          <button class="jornada-tab ${i === activeIdx ? 'jornada-tab--active' : ''}" data-idx="${i}">
            J${j.jornada.number} · ${formatDayMonth(j.jornada.date_start)}–${formatDayMonth(j.jornada.date_end)}
          </button>
        `).join('')}
       </div>`
    : '';

  el.innerHTML = `
    <div class="container">
      <div class="page-title-row">
        <h1 class="page-title">Jornada ${jornada.number} — del ${formatDayMonth(jornada.date_start)} al ${formatDayMonth(jornada.date_end)}</h1>
        <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
      </div>
      ${tabs}
      <div class="units-counter" id="unitsCounter"></div>
      <div class="jornada-matches">
        ${matches.map(matchRow).join('')}
      </div>
      ${pointsModalHtml()}
    </div>
  `;

  renderUnitsCounter();
  updateLastMatchWarning();
  attachHandlers(el, jornadas, activeIdx);
  attachPointsModal(el);
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

function matchRow(m) {
  const cancelled = m.jm_status === 'cancelled';
  const locked = m.predict_locked;
  const s = state[m.jornada_match_id] ?? { predicted_result: null, units: 0 };

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
