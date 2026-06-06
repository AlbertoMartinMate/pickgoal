import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate, leagueGateHtml } from '../ui.js';

export async function renderQuiniela(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    // Gate: logged-in users must be in at least one league
    if (auth.isLoggedIn()) {
      const { leagues } = await api.leagues.my();
      if (leagues.length === 0) {
        el.innerHTML = leagueGateHtml();
        return;
      }
    }

    const [{ groups }, predictionsRes] = await Promise.all([
      api.matches.grouped(),
      auth.isLoggedIn() ? api.predictions.mine() : Promise.resolve({ predictions: [] }),
    ]);

    const predMap = {};
    for (const p of predictionsRes.predictions) {
      predMap[p.match_id] = p;
    }

    // Aplanar todos los partidos (ya vienen ordenados por fecha)
    const allMatches = groups.flatMap(g => g.matches);

    // Agrupar por fecha local
    const byDay = new Map();
    for (const m of allMatches) {
      const key = localDateKey(m.match_datetime);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(m);
    }
    const days = [...byDay.keys()].sort();

    // Día por defecto: el más próximo con partidos (hoy o futuro), si no el primero
    const todayKey = localDateKey(new Date().toISOString());
    const defaultDay = days.find(d => d >= todayKey) ?? days[0];

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${!auth.isLoggedIn() ? '<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>' : ''}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `;

    renderDateNav(days, defaultDay, byDay, predMap);

    if (auth.isLoggedIn()) {
      saveDefaultPredictions(allMatches, predMap);
    }

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando los partidos: ${err.message}</p></div>`;
  }
}

function renderDateNav(days, activeDay, byDay, predMap) {
  const nav = document.getElementById('dateNav');
  if (!nav) return;

  nav.innerHTML = days.map(day => `
    <button class="date-nav__btn ${day === activeDay ? 'date-nav__btn--active' : ''}" data-day="${day}">
      ${formatDayLabel(day)}
    </button>
  `).join('');

  // Hacer scroll al día activo
  nav.querySelector('.date-nav__btn--active')?.scrollIntoView({ inline: 'center', behavior: 'instant', block: 'nearest' });

  nav.querySelectorAll('.date-nav__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.date-nav__btn').forEach(b => b.classList.remove('date-nav__btn--active'));
      btn.classList.add('date-nav__btn--active');
      renderMatches(byDay.get(btn.dataset.day) ?? [], predMap);
    });
  });

  renderMatches(byDay.get(activeDay) ?? [], predMap);
}

function renderMatches(matches, predMap) {
  const content = document.getElementById('matchesContent');
  if (!content) return;

  if (matches.length === 0) {
    content.innerHTML = '<p class="empty">Sin partidos este día.</p>';
    return;
  }

  content.innerHTML = `<div class="matches-grid">${matches.map(m => matchCard(m, predMap[m.id])).join('')}</div>`;

  if (auth.isLoggedIn()) {
    content.querySelectorAll('.prediction-form').forEach(form => {
      attachPredictionForm(form, predMap);
    });
  }
}

function localDateKey(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
  const home = prediction?.predicted_home ?? 0;
  const away = prediction?.predicted_away ?? 0;
  const result = prediction?.predicted_result ?? 'X';
  return `
    <form class="prediction-form" data-match-id="${match.id}">
      <div class="result-selector">
        ${['1', 'X', '2'].map(r => `
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${r}" ${result === r ? 'checked' : ''} required />
            ${r}
          </label>
        `).join('')}
      </div>
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

async function saveDefaultPredictions(allMatches, predMap) {
  const pending = allMatches.filter(m => !m.is_locked && !predMap[m.id]);
  for (const match of pending) {
    try {
      const { prediction } = await api.predictions.save({
        match_id: match.id,
        predicted_result: 'X',
        predicted_home: 0,
        predicted_away: 0,
      });
      predMap[match.id] = prediction;
    } catch (_) {
      // silencioso — no bloquear el resto
    }
  }
}

function attachPredictionForm(form, predMap) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchId = parseInt(form.dataset.matchId);
    const home = parseInt(form.querySelector('[name=predicted_home]').value);
    const away = parseInt(form.querySelector('[name=predicted_away]').value);
    const result = form.querySelector('[name=predicted_result]:checked')?.value;

    if (isNaN(home) || isNaN(away) || !result) return;

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
