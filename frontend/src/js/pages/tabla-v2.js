import { api } from '../api.js';
import { auth } from '../auth.js';

export async function renderTablaV2(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { standings } = await api.clasificacion.general();
    const me = auth.getUser();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Clasificación general</h1>
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
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando la clasificación: ${err.message}</p></div>`;
  }
}
