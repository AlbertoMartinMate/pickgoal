import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate } from '../ui.js';

export async function renderQuiniela(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const [{ groups }, predictionsRes] = await Promise.all([
      api.matches.grouped(),
      auth.isLoggedIn() ? api.predictions.mine() : Promise.resolve({ predictions: [] }),
    ]);

    const predMap = {};
    for (const p of predictionsRes.predictions) {
      predMap[p.match_id] = p;
    }

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Quiniela — Mundial 2026</h1>
        ${!auth.isLoggedIn() ? '<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>' : ''}
        <div id="quinielaContent"></div>
      </div>
    `;

    const content = document.getElementById('quinielaContent');
    const phaseOrder = ['group', 'r32', 'r16', 'quarters', 'semis', 'third', 'final'];

    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'phase-section';
      const label = group.group_name ? `${group.label} — Grupo ${group.group_name}` : group.label;

      section.innerHTML = `<h2 class="phase-section__title">${label}</h2>
        <div class="matches-grid">${group.matches.map(m => matchCard(m, predMap[m.id])).join('')}</div>`;
      content.appendChild(section);

      if (auth.isLoggedIn()) {
        section.querySelectorAll('.prediction-form').forEach(form => {
          attachPredictionForm(form, predMap);
        });
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando los partidos: ${err.message}</p></div>`;
  }
}

function matchCard(match, prediction) {
  const locked = match.is_locked;
  const pts = prediction ? `<span class="pts-badge">${prediction.total_points} pts</span>` : '';
  const statusLabel = { scheduled: 'Programado', live: '🔴 En juego', finished: 'Finalizado' }[match.status];

  return `
    <div class="match-card ${locked ? 'match-card--locked' : ''}" data-match-id="${match.id}">
      <div class="match-card__header">
        <span class="match-card__status">${statusLabel}</span>
        <span class="match-card__date">${formatDate(match.match_datetime)}</span>
        ${pts}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${match.home_team}</span>
        <div class="match-card__score">
          ${match.status !== 'scheduled'
            ? `<span class="score">${match.home_score_90 ?? '?'} - ${match.away_score_90 ?? '?'}</span>`
            : '<span class="score score--dash">vs</span>'
          }
        </div>
        <span class="team team--away">${match.away_team}</span>
      </div>
      ${!locked && auth.isLoggedIn()
        ? predictionForm(match, prediction)
        : locked && prediction
          ? `<div class="prediction-result">
               Tu predicción: <strong>${prediction.predicted_home}-${prediction.predicted_away}</strong>
               (${prediction.predicted_result}) · ${prediction.total_points} pts
             </div>`
          : ''
      }
    </div>
  `;
}

function predictionForm(match, prediction) {
  const home = prediction?.predicted_home ?? '';
  const away = prediction?.predicted_away ?? '';
  return `
    <form class="prediction-form" data-match-id="${match.id}">
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${home}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${away}" placeholder="0" required />
      </div>
      <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
    </form>
  `;
}

function attachPredictionForm(form, predMap) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchId = parseInt(form.dataset.matchId);
    const home = parseInt(form.querySelector('[name=predicted_home]').value);
    const away = parseInt(form.querySelector('[name=predicted_away]').value);

    if (isNaN(home) || isNaN(away)) return;

    let result = '1';
    if (home === away) result = 'X';
    else if (away > home) result = '2';

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const { prediction } = await api.predictions.save({
        match_id: matchId,
        predicted_result: result,
        predicted_home: home,
        predicted_away: away,
      });
      predMap[matchId] = prediction;
      showToast('Predicción guardada');
      btn.textContent = '✓ Guardado';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Guardar'; }, 2000);
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar';
    }
  });
}
