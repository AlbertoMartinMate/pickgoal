import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate } from '../ui.js';

export async function renderPerfil(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
  const user = auth.getUser();

  try {
    const leagueId = (() => { const r = localStorage.getItem('activeLeagueId'); return r ? parseInt(r) : null; })();
    const [predsRes, champRes, leaguesRes, meRes, adminLeaguesRes] = await Promise.all([
      api.predictions.mine(leagueId),
      api.predictions.getChampion(leagueId),
      api.leagues.my(),
      api.auth.me(),
      user?.is_admin ? api.leagues.adminAll() : Promise.resolve({ leagues: [] }),
    ]);

    const totalPts = predsRes.predictions.reduce((acc, p) => acc + p.total_points, 0)
      + (champRes.champion_prediction?.points_earned || 0);

    const meUser = meRes.user;
    const status = meUser.status;
    const allTimePts = meUser.total_points_all_time;

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Mi Perfil</h1>

        <section class="profile-card section">
          <div class="profile-card__info">
            <div class="profile-card__avatar">${user.username[0].toUpperCase()}</div>
            <div>
              <h2>${user.username}</h2>
              <p>${user.email}</p>
              <p>${user.country || 'Sin país'}</p>
            </div>
          </div>
          ${statusProgressHtml(status, allTimePts)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${totalPts}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${predsRes.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${leaguesRes.leagues.length}</span>
              <span class="stat__label">Ligas</span>
            </div>
          </div>
        </section>

        ${champRes.champion_prediction
          ? `<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="champion-pick">
                 🏆 <strong>${champRes.champion_prediction.team_name}</strong>
                 — ${champRes.champion_prediction.points_earned} puntos
               </p>
             </section>`
          : `<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="notice">Aún no has predicho el campeón. <a href="#/campeon">Hacerlo ahora</a></p>
             </section>`
        }

        <section class="section">
          <h2>Mis predicciones</h2>
          ${predsRes.predictions.length
            ? `<div class="predictions-list">${predsRes.predictions.map(predRow).join('')}</div>`
            : '<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'
          }
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${leaguesRes.leagues.length
            ? `<ul class="leagues-list">${leaguesRes.leagues.map(l =>
                `<li><a href="#/ligas/${l.id}">${l.name}</a> <span class="tag">${l.is_public ? 'Pública' : 'Privada'}</span></li>`
              ).join('')}</ul>`
            : '<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'
          }
        </section>

        ${user?.is_admin && adminLeaguesRes.leagues.length ? `
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${adminLeaguesRes.leagues.map(l => `
                <li>
                  <span>${l.is_official ? '⭐ ' : ''}${l.name}</span>
                  <span class="tag">${l.is_public ? 'Pública' : 'Privada'}</span>
                  <a href="#/ligas/${l.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}
      </div>
    `;
    el.querySelector('#btnLogoutPerfil')?.addEventListener('click', () => {
      auth.logout();
      window.location.hash = '/';
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function statusProgressHtml(status, allTimePts) {
  const isMax = status.next_threshold === null;
  if (isMax) {
    return `
      <div class="level-progress">
        <div class="level-progress__header">
          <span class="status-badge">${status.emoji} ${status.name}</span>
          <span class="level-progress__label">¡Nivel máximo alcanzado!</span>
        </div>
        <div class="level-progress__bar"><div class="level-progress__fill" style="width:100%"></div></div>
      </div>`;
  }
  const pct = Math.min(100, Math.round(
    ((allTimePts - status.threshold) / (status.next_threshold - status.threshold)) * 100
  ));
  return `
    <div class="level-progress">
      <div class="level-progress__header">
        <span class="status-badge">${status.emoji} ${status.name}</span>
        <span class="level-progress__label">${allTimePts} / ${status.next_threshold} pts → ${status.next_emoji || ''} ${status.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${pct}%"></div></div>
    </div>`;
}

function predRow(p) {
  return `
    <div class="pred-row ${p.total_points > 0 ? 'pred-row--scored' : ''}">
      <span class="pred-row__result">${p.predicted_result}</span>
      <span class="pred-row__score">${p.predicted_home}-${p.predicted_away}</span>
      <span class="pred-row__pts">${p.total_points} pts</span>
    </div>
  `;
}
