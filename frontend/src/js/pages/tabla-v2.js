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
          <button class="league-tab" id="tabDivisiones">Divisiones</button>
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

        <section id="panelDivisiones" class="hidden">
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
  const tabs = {
    general:     { btn: document.getElementById('tabGeneral'),    panel: document.getElementById('panelGeneral') },
    miDivision:  { btn: document.getElementById('tabMiDivision'), panel: document.getElementById('panelMiDivision') },
    divisiones:  { btn: document.getElementById('tabDivisiones'), panel: document.getElementById('panelDivisiones') },
  };

  function activate(key) {
    for (const [k, { btn, panel }] of Object.entries(tabs)) {
      btn.classList.toggle('league-tab--active', k === key);
      panel.classList.toggle('hidden', k !== key);
    }
  }

  tabs.general.btn.addEventListener('click', () => activate('general'));

  tabs.miDivision.btn.addEventListener('click', () => {
    activate('miDivision');
    if (!tabs.miDivision.panel.dataset.loaded) {
      tabs.miDivision.panel.dataset.loaded = '1';
      renderMiDivision(me);
    }
  });

  tabs.divisiones.btn.addEventListener('click', () => {
    activate('divisiones');
    if (!tabs.divisiones.panel.dataset.loaded) {
      tabs.divisiones.panel.dataset.loaded = '1';
      renderDivisiones(me);
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
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${standings.map(row => divisionRow(row, me)).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
  }
}

async function renderDivisiones(me) {
  const panel = document.getElementById('panelDivisiones');
  if (!panel) return;

  try {
    const { divisions } = await api.clasificacion.allDivisions();

    if (!divisions.length) {
      panel.innerHTML = '<p class="empty">No hay divisiones activas.</p>';
      return;
    }

    panel.innerHTML = divisions.map(div => divisionAccordion(div, me)).join('');

    // Accordion expand/collapse
    panel.querySelectorAll('.div-accordion__header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const open = body.classList.toggle('hidden');
        header.querySelector('.div-accordion__chevron').textContent = open ? '▶' : '▼';
      });
    });

  } catch (err) {
    panel.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
  }
}

function divisionAccordion(div, me) {
  const myInDiv = div.standings.some(r => me && r.user_id === me.id);
  return `
    <div class="div-accordion ${myInDiv ? 'div-accordion--mine' : ''}">
      <button class="div-accordion__header">
        <span class="div-accordion__title">División ${div.division_number} · Grupo ${div.division_number}</span>
        ${myInDiv ? '<span class="div-accordion__badge">Tú</span>' : ''}
        <span class="div-accordion__chevron">▼</span>
      </button>
      <div class="div-accordion__body">
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
            </thead>
            <tbody>
              ${div.standings.map(row => divisionRow(row, me)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function divisionRow(row, me) {
  const isMe = me && row.user_id === me.id;
  const zoneStyle = row.zone === 'promotion'
    ? 'background:rgba(0,255,135,0.08)'
    : row.zone === 'relegation'
      ? 'background:rgba(255,56,96,0.08)'
      : '';

  const separatorBefore = row.pos === 5
    ? '<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>'
    : row.pos === 13
      ? '<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>'
      : '';

  return `
    ${separatorBefore}
    <tr class="${isMe ? 'ranking-table__row--me' : ''}" style="${zoneStyle}">
      <td class="ranking-table__pos" data-pos="${row.pos}">${row.pos}</td>
      <td>${row.username}${row.is_bot ? ' 🤖' : ''}</td>
      <td class="ranking-table__stat">${row.pj}</td>
      <td class="ranking-table__stat">${row.g}</td>
      <td class="ranking-table__stat">${row.e}</td>
      <td class="ranking-table__stat">${row.p}</td>
      <td class="ranking-table__pts">${row.pts_division}</td>
    </tr>
  `;
}
