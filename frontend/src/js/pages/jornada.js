import { api } from '../api.js';
import { showToast, formatDate } from '../ui.js';

const MAX_UNITS = 20;
const MAX_UNITS_PER_MATCH = 5;

// jornada_match_id -> { predicted_result, units }
let state = {};
let totalUnits = 0;

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

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Jornada ${jornada.number} — del ${formatDayMonth(jornada.date_start)} al ${formatDayMonth(jornada.date_end)}</h1>
        ${jornada.locked ? '<p class="notice">⚠️ El plazo de predicción ha cerrado (ya empezó el primer partido).</p>' : ''}
        <div class="units-counter" id="unitsCounter"></div>
        <div class="jornada-matches">
          ${matches.map(matchRow).join('')}
        </div>
        ${!jornada.locked ? '<button class="btn btn--primary btn--full jornada-save-btn" id="jornadaSaveBtn">Guardar predicciones</button>' : ''}
      </div>
    `;

    renderUnitsCounter();
    attachHandlers(el, jornada.locked);

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

function formatOdds(v) {
  return v != null ? v.toFixed(2) : '—';
}

function matchRow(m) {
  const locked = m.status !== 'scheduled' || new Date(m.match_datetime) <= new Date();
  const s = state[m.jornada_match_id] ?? { predicted_result: null, units: 0 };

  return `
    <div class="match-card jornada-match ${locked ? 'match-card--locked' : ''}" data-jm-id="${m.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${formatDate(m.match_datetime)}</span>
        ${locked ? '<span class="tag tag--locked">Bloqueado</span>' : ''}
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

function recalcTotalUnits() {
  totalUnits = Object.values(state).reduce((sum, s) => sum + (s.predicted_result ? s.units : 0), 0);
  renderUnitsCounter();
}

function attachHandlers(el, jornadaLocked) {
  if (jornadaLocked) return;

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

  document.getElementById('jornadaSaveBtn')?.addEventListener('click', savePredictions);
}

async function savePredictions() {
  const btn = document.getElementById('jornadaSaveBtn');

  const predictions = Object.entries(state)
    .filter(([, s]) => s.predicted_result)
    .map(([jmId, s]) => ({
      jornada_match_id: parseInt(jmId),
      predicted_result: s.predicted_result,
      units: s.units,
    }));

  if (predictions.length === 0) {
    showToast('Selecciona al menos un resultado 1X2', 'error');
    return;
  }
  if (totalUnits > MAX_UNITS) {
    showToast(`Superas el máximo de ${MAX_UNITS} unidades`, 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = '…';

  try {
    await api.jornada.predict(predictions);
    showToast('Predicciones guardadas');
    btn.textContent = '✓ Guardadas';
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  } finally {
    btn.disabled = false;
    setTimeout(() => { if (btn) btn.textContent = 'Guardar predicciones'; }, 2000);
  }
}
