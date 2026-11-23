import { api } from '../api.js';
import { auth } from '../auth.js';
import { renderTablon } from './tablon.js';
import { pointsModalHtml, attachPointsModal, fmtPts } from '../ui.js';

export async function renderTablaV2(el, { query = {} } = {}) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { standings } = await api.clasificacion.general();
    const me = auth.getUser();

    // Tuesday = show Total by default; otherwise show Jornada
    const isTuesday = new Date().getDay() === 2;
    const defaultSubTab = isTuesday ? 'total' : 'jornada';

    el.innerHTML = `
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Clasificación</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabGeneral">General</button>
          <button class="league-tab" id="tabMiDivision">Mi División</button>
          <button class="league-tab" id="tabDivisiones">Divisiones</button>
          <button class="league-tab" id="tabTablon">
            Tablón<span class="tablon-tab-dot hidden" id="tablonTabDot">●</span>
          </button>
        </div>

        <section id="panelGeneral">
          <div class="ranking-subtabs">
            <button class="ranking-subtab ${defaultSubTab === 'total' ? 'ranking-subtab--active' : ''}" data-subtab="total">Total</button>
            <button class="ranking-subtab ${defaultSubTab === 'jornada' ? 'ranking-subtab--active' : ''}" data-subtab="jornada" id="subtabJornada">Jornada</button>
          </div>

          <div id="subpanelTotal" class="${defaultSubTab === 'total' ? '' : 'hidden'}">
            ${standings.length === 0
              ? '<p class="empty">Todavía no hay clasificación disponible.</p>'
              : `
                <div class="ranking-table-wrapper">
                  <table class="ranking-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th title="Puntos de la jornada actual">Pts J.</th>
                        <th title="Puntos acumulados totales">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${standings.map(u => `
                        <tr class="${me && u.user_id === me.id ? 'ranking-table__row--me' : ''}">
                          <td class="ranking-table__pos" data-pos="${u.pos}">${u.pos}</td>
                          <td class="ranking-table__user-cell">
                            <span class="status-emoji" title="${u.status?.name || ''}">${u.status?.emoji || ''}</span>
                            ${u.is_bot || (me && u.user_id === me.id)
                              ? `<span class="ranking-table__username">${escapeHtml(u.username)}</span>`
                              : `<button class="user-link ranking-table__username" data-user-id="${u.user_id}">${escapeHtml(u.username)}</button>`
                            }
                          </td>
                          <td class="ranking-table__stat">${fmtPts(u.pts_jornada_actual)}</td>
                          <td class="ranking-table__pts">${fmtPts(u.pts_general)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
            }
          </div>

          <div id="subpanelJornada" class="${defaultSubTab === 'jornada' ? '' : 'hidden'}">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
        </section>

        <section id="panelMiDivision" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>

        <section id="panelDivisiones" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>

        <section id="panelTablon" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>
        ${pointsModalHtml()}
      </div>
    `;

    attachTabHandlers(me, query.tab);
    attachPointsModal(el);
    checkTablonGeneralUnread();
    setupUserContextMenu(el, me);
    setupGeneralSubTabs(el, me, defaultSubTab);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando la clasificación: ${err.message}</p></div>`;
  }
}

function setupGeneralSubTabs(el, me, defaultSubTab) {
  let jornadaList = null;
  let currentJornadaIdx = -1;
  let jornadaLoaded = false;

  const subtabTotal = el.querySelector('[data-subtab="total"]');
  const subtabJornada = el.querySelector('[data-subtab="jornada"]');
  const subpanelTotal = el.querySelector('#subpanelTotal');
  const subpanelJornada = el.querySelector('#subpanelJornada');

  function activateSubTab(view) {
    subtabTotal.classList.toggle('ranking-subtab--active', view === 'total');
    subtabJornada.classList.toggle('ranking-subtab--active', view === 'jornada');
    subpanelTotal.classList.toggle('hidden', view !== 'total');
    subpanelJornada.classList.toggle('hidden', view !== 'jornada');
    if (view === 'jornada' && !jornadaLoaded) {
      jornadaLoaded = true;
      loadJornadaView();
    }
  }

  async function loadJornadaView() {
    try {
      const { jornadas } = await api.clasificacion.jornadas();
      jornadaList = jornadas.sort((a, b) => a.number - b.number);

      const activeIdx = jornadaList.findIndex(j => j.status === 'active');
      if (activeIdx >= 0) {
        currentJornadaIdx = activeIdx;
      } else {
        for (let i = jornadaList.length - 1; i >= 0; i--) {
          if (jornadaList[i].status === 'finished') { currentJornadaIdx = i; break; }
        }
        if (currentJornadaIdx < 0) currentJornadaIdx = jornadaList.length - 1;
      }

      await renderJornadaStandings();
    } catch (err) {
      subpanelJornada.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
    }
  }

  async function renderJornadaStandings() {
    if (!jornadaList || currentJornadaIdx < 0) return;
    const jornada = jornadaList[currentJornadaIdx];

    subpanelJornada.innerHTML = `<div class="loading"><div class="loading__spinner"></div></div>`;

    try {
      const { standings, jornada_number, jornada_status } =
        await api.clasificacion.jornadaStandings(jornada.id);

      const hasPrev = currentJornadaIdx > 0;
      const hasNext = currentJornadaIdx < jornadaList.length - 1;

      subtabJornada.textContent = `J${jornada_number}`;

      subpanelJornada.innerHTML = `
        <div class="jornada-rank-nav">
          <button class="jornada-rank-nav__btn" id="jrNavPrev" ${!hasPrev ? 'disabled' : ''}>
            ← ${hasPrev ? `J${jornadaList[currentJornadaIdx - 1].number}` : ''}
          </button>
          <span class="jornada-rank-nav__title">
            J${jornada_number}${jornada_status === 'active' ? ' · en curso' : ''}
          </span>
          <button class="jornada-rank-nav__btn" id="jrNavNext" ${!hasNext ? 'disabled' : ''}>
            ${hasNext ? `J${jornadaList[currentJornadaIdx + 1].number}` : ''} →
          </button>
        </div>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th title="Puntos conseguidos en esta jornada">Pts</th>
              </tr>
            </thead>
            <tbody>
              ${standings.map(u => `
                <tr class="${me && u.user_id === me.id ? 'ranking-table__row--me' : ''}">
                  <td class="ranking-table__pos" data-pos="${u.pos}">${u.pos}</td>
                  <td class="ranking-table__user-cell">
                    <span class="status-emoji" title="${u.status?.name || ''}">${u.status?.emoji || ''}</span>
                    ${u.is_bot || (me && u.user_id === me.id)
                      ? `<span class="ranking-table__username">${escapeHtml(u.username)}</span>`
                      : `<button class="user-link ranking-table__username" data-user-id="${u.user_id}">${escapeHtml(u.username)}</button>`
                    }
                  </td>
                  <td class="ranking-table__pts">${fmtPts(u.pts)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      subpanelJornada.querySelector('#jrNavPrev')?.addEventListener('click', () => {
        if (currentJornadaIdx > 0) { currentJornadaIdx--; renderJornadaStandings(); }
      });
      subpanelJornada.querySelector('#jrNavNext')?.addEventListener('click', () => {
        if (currentJornadaIdx < jornadaList.length - 1) { currentJornadaIdx++; renderJornadaStandings(); }
      });

      setupUserContextMenu(subpanelJornada, me);
    } catch (err) {
      subpanelJornada.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
    }
  }

  subtabTotal.addEventListener('click', () => activateSubTab('total'));
  subtabJornada.addEventListener('click', () => activateSubTab('jornada'));

  activateSubTab(defaultSubTab);
}

async function checkTablonGeneralUnread() {
  const dot = document.getElementById('tablonTabDot');
  if (!dot) return;
  const user = auth.getUser();
  if (!user) { dot.classList.add('hidden'); return; }
  const since = localStorage.getItem('tablon_general_last_read') || new Date(0).toISOString();
  try {
    const { count } = await api.board.unread(null, since);
    dot.classList.toggle('hidden', count === 0);
  } catch (e) {
    dot.classList.add('hidden');
  }
}

function attachTabHandlers(me, initialTab) {
  const tabs = {
    general:     { btn: document.getElementById('tabGeneral'),    panel: document.getElementById('panelGeneral') },
    miDivision:  { btn: document.getElementById('tabMiDivision'), panel: document.getElementById('panelMiDivision') },
    divisiones:  { btn: document.getElementById('tabDivisiones'), panel: document.getElementById('panelDivisiones') },
    tablon:      { btn: document.getElementById('tabTablon'),     panel: document.getElementById('panelTablon') },
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

  function activateTablon() {
    activate('tablon');
    localStorage.setItem('tablon_general_last_read', new Date().toISOString());
    document.getElementById('tablonTabDot')?.classList.add('hidden');
    document.dispatchEvent(new CustomEvent('tablon:read'));
    if (!tabs.tablon.panel.dataset.loaded) {
      tabs.tablon.panel.dataset.loaded = '1';
      renderTablon(tabs.tablon.panel, { forceGeneral: true });
    }
  }

  tabs.tablon.btn.addEventListener('click', activateTablon);

  if (initialTab === 'tablon') {
    activateTablon();
  }
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
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts</th></tr>
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
              <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts</th></tr>
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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupUserContextMenu(container, me) {
  let menu = document.getElementById('userCtxMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'userCtxMenu';
    menu.className = 'user-ctx-menu hidden';
    menu.innerHTML = `
      <a class="user-ctx-menu__item" id="ctxProfile" href="#">👤 Ver jugador</a>
      <button class="user-ctx-menu__item" id="ctxMessage">💬 Enviar mensaje</button>
    `;
    document.body.appendChild(menu);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#userCtxMenu') && !e.target.closest('.user-link')) {
        menu.classList.add('hidden');
      }
    }, true);
  }

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.user-link');
    if (!btn) return;
    e.stopPropagation();

    const userId = btn.dataset.userId;
    const rect = btn.getBoundingClientRect();

    menu.querySelector('#ctxProfile').href = `#/jugador/${userId}`;
    menu.querySelector('#ctxMessage').onclick = () => {
      menu.classList.add('hidden');
      window.location.hash = `/mensajes/${userId}`;
    };

    menu.classList.remove('hidden');
    const menuW = 180;
    let left = rect.left;
    if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${left}px`;
  });
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
      <td class="ranking-table__user-cell">${isMe || row.is_bot
        ? `<span class="ranking-table__username">${escapeHtml(row.username)}</span>`
        : `<button class="user-link ranking-table__username" data-user-id="${row.user_id}">${escapeHtml(row.username)}</button>`
      }</td>
      <td class="ranking-table__stat">${row.pj}</td>
      <td class="ranking-table__stat">${row.g}</td>
      <td class="ranking-table__stat">${row.e}</td>
      <td class="ranking-table__stat">${row.p}</td>
      <td class="ranking-table__pts">${fmtPts(row.pts_division)}</td>
    </tr>
  `;
}
