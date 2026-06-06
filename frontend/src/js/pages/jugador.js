import { api } from '../api.js';
import { formatDate } from '../ui.js';

function getActiveLeagueId() {
  const raw = localStorage.getItem('activeLeagueId');
  return raw ? parseInt(raw) : null;
}

export async function renderJugador(el, { params }) {
  const userId = parseInt(params.id);
  if (!userId) {
    el.innerHTML = '<div class="container"><p class="form__error">Usuario no válido.</p></div>';
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const leagueId = getActiveLeagueId();
    const { user, predictions } = await api.predictions.forUser(userId, leagueId);

    el.innerHTML = `
      <div class="container">
        <a class="jugador__back" href="#/ranking">← Tabla</a>

        <div class="jugador__header">
          <div class="jugador__avatar">${user.username.charAt(0).toUpperCase()}</div>
          <div class="jugador__info">
            <h1 class="jugador__name">${user.username}</h1>
            ${user.country ? `<span class="jugador__country">${user.country}</span>` : ''}
          </div>
        </div>

        <div class="jugador__stats">
          <div class="jugador__stat">
            <span class="jugador__stat-val">${user.total_points}</span>
            <span class="jugador__stat-label">Puntos</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${user.correct_results}</span>
            <span class="jugador__stat-label">1X2 acertados</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${user.exact_scores}</span>
            <span class="jugador__stat-label">Exactos</span>
          </div>
        </div>

        <h2 class="jugador__section-title">Predicciones en partidos jugados</h2>

        ${predictions.length === 0
          ? '<p class="empty">Sin pronósticos en partidos finalizados.</p>'
          : `<div class="jugador__pred-list">
              ${predictions.map(p => predRow(p)).join('')}
            </div>`
        }
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function resultLabel(result) {
  return { '1': 'Local', 'X': 'Empate', '2': 'Visitante' }[result] ?? result;
}

function predRow(p) {
  const m = p.match;
  const pts = p.total_points;
  const exact = p.pts_score > 0;
  const correct = p.pts_result > 0;

  let badge = '';
  if (exact) badge = '<span class="jugador__badge jugador__badge--exact">Exacto</span>';
  else if (correct) badge = '<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>';
  else badge = '<span class="jugador__badge jugador__badge--miss">Fallo</span>';

  return `
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${m.home_team} vs ${m.away_team}</span>
        <span class="jugador__pred-date">${formatDate(m.match_datetime)}</span>
      </div>
      <div class="jugador__pred-scores">
        <span class="jugador__pred-real">${m.home_score_90} - ${m.away_score_90}</span>
        <span class="jugador__pred-arrow">→</span>
        <span class="jugador__pred-pick">${p.predicted_home} - ${p.predicted_away}</span>
      </div>
      <div class="jugador__pred-right">
        ${badge}
        <span class="jugador__pred-pts">${pts > 0 ? `+${pts}` : '0'} pts</span>
      </div>
    </div>
  `;
}
