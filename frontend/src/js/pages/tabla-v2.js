import { api } from '../api.js';
import { auth } from '../auth.js';

export async function renderTablaV2(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { standings } = await api.clasificacion.general();
    const me = auth.getUser();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Clasificación</h1>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabGeneral">General</button>
          <button class="league-tab" id="tabMiDivision">Mi División</button>
        </div>

        <section id="panelGeneral">
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
        </section>

        <section id="panelMiDivision" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>
      </div>
    `;

    attachTabHandlers(me);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando la clasificación: ${err.message}</p></div>`;
  }
}

function attachTabHandlers(me) {
  const tabGeneral = document.getElementById('tabGeneral');
  const tabMiDivision = document.getElementById('tabMiDivision');
  const panelGeneral = document.getElementById('panelGeneral');
  const panelMiDivision = document.getElementById('panelMiDivision');

  if (!tabGeneral || !tabMiDivision) return;

  tabGeneral.addEventListener('click', () => {
    tabGeneral.classList.add('league-tab--active');
    tabMiDivision.classList.remove('league-tab--active');
    panelGeneral.classList.remove('hidden');
    panelMiDivision.classList.add('hidden');
  });

  tabMiDivision.addEventListener('click', () => {
    tabMiDivision.classList.add('league-tab--active');
    tabGeneral.classList.remove('league-tab--active');
    panelMiDivision.classList.remove('hidden');
    panelGeneral.classList.add('hidden');

    if (!panelMiDivision.dataset.loaded) {
      panelMiDivision.dataset.loaded = '1';
      renderMiDivision(me);
    }
  });
}

async function renderMiDivision(me) {
  const panel = document.getElementById('panelMiDivision');
  if (!panel) return;

  try {
    const { standings } = await api.clasificacion.division();

    if (standings.length === 0) {
      panel.innerHTML = '<p class="empty">Todavía no perteneces a ninguna división.</p>';
      return;
    }

    panel.innerHTML = `
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>Pts división</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map(row => `
              <tr class="${me && row.user_id === me.id ? 'ranking-table__row--me' : ''}">
                <td class="ranking-table__pos" data-pos="${row.pos}">${row.pos}</td>
                <td>${row.username}${row.is_bot ? ' 🤖' : ''}</td>
                <td class="ranking-table__stat">${row.pj}</td>
                <td class="ranking-table__stat">${row.g}</td>
                <td class="ranking-table__stat">${row.e}</td>
                <td class="ranking-table__stat">${row.p}</td>
                <td class="ranking-table__pts">${row.pts_division}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="form__error">Error cargando la clasificación: ${err.message}</p>`;
  }
}
