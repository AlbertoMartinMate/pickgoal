import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate } from '../ui.js';

export async function renderPerfil(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
  const user = auth.getUser();

  try {
    const [predsRes, champRes, leaguesRes] = await Promise.all([
      api.predictions.mine(),
      api.predictions.getChampion(),
      api.leagues.my(),
    ]);

    const totalPts = predsRes.predictions.reduce((acc, p) => acc + p.total_points, 0)
      + (champRes.champion_prediction?.points_earned || 0);

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

function predRow(p) {
  return `
    <div class="pred-row ${p.total_points > 0 ? 'pred-row--scored' : ''}">
      <span class="pred-row__result">${p.predicted_result}</span>
      <span class="pred-row__score">${p.predicted_home}-${p.predicted_away}</span>
      <span class="pred-row__pts">${p.total_points} pts</span>
    </div>
  `;
}
