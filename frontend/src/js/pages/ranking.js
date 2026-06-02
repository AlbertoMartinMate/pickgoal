import { api } from '../api.js';
import { auth } from '../auth.js';

export async function renderRanking(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { ranking } = await api.auth.ranking();
    const currentUser = auth.getUser();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Clasificación General</h1>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>País</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              ${ranking.map(u => `
                <tr class="${currentUser && u.id === currentUser.id ? 'ranking-table__row--me' : ''}">
                  <td class="ranking-table__pos">${u.position}</td>
                  <td>${u.username}</td>
                  <td>${u.country || '—'}</td>
                  <td class="ranking-table__pts">${u.total_points}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}
