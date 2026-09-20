import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast } from '../ui.js';

export async function renderAdmin(el) {
  if (!auth.isAdmin()) {
    el.innerHTML = '<div class="container"><p class="form__error">Acceso denegado.</p></div>';
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { users } = await api.auth.users();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section" id="weeklyChecklistSection">
          <h2 class="admin-section__title">Estado de la semana</h2>
          <div id="weeklyChecklistContent">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Scheduler</h2>
          <p class="admin-section__desc">Sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
          <p class="admin-section__desc" style="margin-top:12px">
            El scheduler de Render (plan gratuito) no siempre despierta a tiempo — usa este botón si alguna
            jornada se queda sin predicciones de bots.
          </p>
          <button class="btn btn--ghost" id="btnGenerateBots">🤖 Generar predicciones bots</button>
          <div id="generateBotsResult"></div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Notificaciones push</h2>
          <form class="form" id="pushForm">
            <div class="form__group">
              <label class="form__label">Título</label>
              <input class="form__input" type="text" id="pushTitle" placeholder="PickGoal" maxlength="80" />
            </div>
            <div class="form__group">
              <label class="form__label">Mensaje</label>
              <input class="form__input" type="text" id="pushBody" placeholder="Texto de la notificación" maxlength="200" />
            </div>
            <div class="form__group">
              <label class="form__label">Destinatario</label>
              <select class="form__input" id="pushTarget">
                <option value="all">Todos los usuarios</option>
                <option value="league">Liga (por ID)</option>
                <option value="user">Usuario (por ID)</option>
              </select>
            </div>
            <div class="form__group hidden" id="pushTargetIdGroup">
              <label class="form__label">ID</label>
              <input class="form__input" type="number" id="pushTargetId" placeholder="ID de liga o usuario" min="1" />
            </div>
            <button class="btn btn--primary" type="submit">Enviar notificación</button>
            <span id="pushResult" style="margin-left:12px;font-size:13px;"></span>
          </form>
        </section>

        <section class="section admin-section" id="jornadasV2Section">
          <h2 class="admin-section__title">Gestión de Jornadas v2</h2>
          <div id="jornadasV2Content">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Cerrar temporada</h2>
          <p class="admin-section__desc">Marca la temporada actual como finalizada. Esta acción es irreversible.</p>
          <button class="btn btn--danger" id="btnCloseSeason">Cerrar temporada</button>
          <span id="closeSeasonResult" style="margin-left:12px;font-size:13px;"></span>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Usuarios (${users.length})</h2>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Muted</th><th>Acción</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${users.map(userRow).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;

    attachEvents(el);
    loadJornadasV2(el);
    loadWeeklyChecklist(el);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function attachEvents(el) {
  document.getElementById('btnSync')?.addEventListener('click', async () => {
    const res = document.getElementById('syncResult');
    res.textContent = 'Sincronizando…';
    try {
      await api.matches.sync();
      res.textContent = '✓ Sincronización completada';
      showToast('Sincronización completada');
    } catch (err) {
      res.textContent = `Error: ${err.message}`;
      showToast(err.message, 'error');
    }
  });

  document.getElementById('btnGenerateBots')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnGenerateBots');
    const res = document.getElementById('generateBotsResult');
    btn.disabled = true;
    res.textContent = 'Generando…';
    try {
      const { message } = await api.adminV2.generateBots();
      res.textContent = `✓ ${message}`;
      showToast(message);
    } catch (err) {
      res.textContent = `Error: ${err.message}`;
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  const pushTarget = document.getElementById('pushTarget');
  const pushTargetIdGroup = document.getElementById('pushTargetIdGroup');
  pushTarget?.addEventListener('change', () => {
    pushTargetIdGroup.classList.toggle('hidden', pushTarget.value === 'all');
  });

  document.getElementById('pushForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawTitle = document.getElementById('pushTitle').value.trim() || 'Aviso';
    const body = document.getElementById('pushBody').value.trim();
    const target = pushTarget.value;
    const targetId = parseInt(document.getElementById('pushTargetId').value) || null;
    const resultEl = document.getElementById('pushResult');

    const payload = { title: `📣 PickGoal — ${rawTitle}`, body };
    if (target === 'league' && targetId) payload.league_id = targetId;
    if (target === 'user' && targetId) payload.user_id = targetId;

    resultEl.textContent = 'Enviando…';
    try {
      const { sent } = await api.notifications.send(payload);
      resultEl.textContent = `✓ Enviada a ${sent} suscripción(es)`;
      showToast(`Notificación enviada a ${sent} suscripción(es)`);
    } catch (err) {
      resultEl.textContent = `Error: ${err.message}`;
      showToast(err.message, 'error');
    }
  });

  document.getElementById('btnCloseSeason')?.addEventListener('click', async () => {
    if (!confirm('¿Cerrar la temporada actual? Esta acción es irreversible.')) return;
    const btn = document.getElementById('btnCloseSeason');
    const msg = document.getElementById('closeSeasonResult');
    btn.disabled = true;
    msg.textContent = 'Cerrando…';
    try {
      const { message } = await api.post('/v2/admin/season/1/close');
      msg.textContent = `✓ ${message || 'Temporada cerrada'}`;
      showToast('Temporada cerrada');
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
      showToast(err.message, 'error');
      btn.disabled = false;
    }
  });

  document.getElementById('usersTableBody')?.addEventListener('click', async (e) => {
    const adminBtn = e.target.closest('.toggle-admin');
    if (adminBtn) {
      const uid = parseInt(adminBtn.dataset.id);
      try {
        const { user } = await api.auth.toggleAdmin(uid);
        adminBtn.closest('tr').querySelector('.admin-badge').textContent = user.is_admin ? 'Sí' : 'No';
        showToast(`${user.username} ${user.is_admin ? 'ahora es admin' : 'ya no es admin'}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
      return;
    }

    const muteBtn = e.target.closest('.toggle-mute');
    if (muteBtn) {
      const uid = parseInt(muteBtn.dataset.id);
      try {
        const { user } = await api.auth.toggleMute(uid);
        const tr = muteBtn.closest('tr');
        tr.querySelector('.mute-badge').textContent = user.is_muted ? 'Sí' : 'No';
        muteBtn.textContent = user.is_muted ? 'Activar' : 'Silenciar';
        showToast(`${user.username} ${user.is_muted ? 'silenciado' : 'activado'}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

function userRow(u) {
  return `
    <tr>
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.country || '—'}</td>
      <td><span class="admin-badge">${u.is_admin ? 'Sí' : 'No'}</span></td>
      <td><span class="mute-badge">${u.is_muted ? 'Sí' : 'No'}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn--ghost btn--xs toggle-admin" data-id="${u.id}">
          ${u.is_admin ? 'Quitar admin' : 'Hacer admin'}
        </button>
        <button class="btn btn--ghost btn--xs toggle-mute" data-id="${u.id}">
          ${u.is_muted ? 'Activar' : 'Silenciar'}
        </button>
      </td>
    </tr>
  `;
}

// ─── Estado de la semana (checklist) ─────────────────────────────────────────

async function loadWeeklyChecklist(el) {
  const container = document.getElementById('weeklyChecklistContent');
  if (!container) return;
  try {
    const { checklist } = await api.adminV2.weeklyChecklist();
    container.innerHTML = renderChecklist(checklist);
  } catch (err) {
    container.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
  }
}

function checklistItem(ok, label, detalle) {
  return `
    <div class="jv2-checklist__item ${ok ? 'jv2-checklist__item--ok' : 'jv2-checklist__item--pending'}">
      <span class="jv2-checklist__icon">${ok ? '✅' : '⏳'}</span>
      <span class="jv2-checklist__label">${label}</span>
      <span class="jv2-checklist__detail">${detalle}</span>
    </div>
  `;
}

function renderChecklist(c) {
  return `
    <div class="jv2-checklist">
      ${checklistItem(c.jornada_publicada.ok, 'Jornada actual publicada', c.jornada_publicada.detalle)}
      ${checklistItem(c.predicciones_bots.ok, 'Predicciones bots generadas', c.predicciones_bots.detalle)}
      ${checklistItem(c.jornada_anterior_cerrada.ok, 'Jornada anterior cerrada', c.jornada_anterior_cerrada.detalle)}
      ${checklistItem(c.resultados_sincronizados.ok, 'Resultados sincronizados', c.resultados_sincronizados.detalle)}
    </div>
  `;
}

// ─── Gestión de Jornadas V2 ──────────────────────────────────────────────────

const COMP_LABELS = {
  PD:  '🇪🇸 LaLiga',
  PL:  '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
  CL:  '⭐ Champions League',
  SA:  '🇮🇹 Serie A',
  BL1: '🇩🇪 Bundesliga',
  FL1: '🇫🇷 Ligue 1',
  PPL: '🇵🇹 Primeira Liga',
  DED: '🇳🇱 Eredivisie',
  ELC: '🇪🇸 LaLiga 2',
  CDR: '🇪🇸 Copa del Rey',
  UNL: '🌍 UEFA Nations League',
  EC2024: '🌍 Eliminatorias Europa',
  CLI: '🌎 Amistosos internacionales',
  BSA: '🇧🇷 Brasileirao',
  MLS: '🇺🇸 MLS',
};

const COMP_GROUPS = [
  { key: 'principales',  label: '📌 Principales',  expandable: false, defaultChecked: true,  codes: ['PD', 'PL', 'CL'] },
  { key: 'europa',       label: '🌍 Europa',       expandable: true,  defaultChecked: false, codes: ['BL1', 'SA', 'FL1', 'PPL', 'DED'] },
  { key: 'espana',       label: '🇪🇸 España',       expandable: true,  defaultChecked: false, codes: ['ELC', 'CDR'] },
  { key: 'selecciones',  label: '🌎 Selecciones',  expandable: true,  defaultChecked: false, codes: ['UNL', 'EC2024', 'CLI'] },
  { key: 'otras',        label: '⚽ Otras ligas',   expandable: true,  defaultChecked: false, codes: ['BSA', 'MLS'] },
];

let _selectedMatches = [];   // {api_id, home_team, away_team, match_datetime, competition_code}
let _editingJornadaId = null;

async function loadJornadasV2(el) {
  const container = document.getElementById('jornadasV2Content');
  if (!container) return;
  try {
    const { jornadas } = await api.adminV2.jornadas();
    container.innerHTML = renderJornadasPanel(jornadas);
    attachJornadasEvents(container);
  } catch (err) {
    container.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
  }
}

function renderJornadasPanel(jornadas) {
  return `
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${jornadas.length === 0
          ? '<p class="admin-section__desc">No hay jornadas creadas.</p>'
          : jornadas.map(jornadaRow).join('')}
      </div>

      <div class="jv2-form" id="jv2Form" style="display:none">
        <h3 class="jv2-form__title" id="jv2FormTitle">Nueva jornada</h3>
        <input type="hidden" id="jv2EditId" value="" />

        <div class="jv2-form__row">
          <div class="form__group">
            <label class="form__label">Nº jornada</label>
            <input class="form__input" type="number" id="jv2Number" min="1" placeholder="1" style="width:90px" />
          </div>
          <div class="form__group">
            <label class="form__label">Fecha inicio</label>
            <input class="form__input" type="datetime-local" id="jv2DateStart" />
          </div>
          <div class="form__group">
            <label class="form__label">Fecha fin</label>
            <input class="form__input" type="datetime-local" id="jv2DateEnd" />
          </div>
        </div>

        <div class="jv2-form__week-row">
          <label class="form__label">Buscar partidos por rango de fechas</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="form__group" style="min-width:0">
              <label class="form__label" style="font-size:11px">Desde</label>
              <input class="form__input" type="date" id="jv2DateFrom" style="width:150px" />
            </div>
            <div class="form__group" style="min-width:0">
              <label class="form__label" style="font-size:11px">Hasta</label>
              <input class="form__input" type="date" id="jv2DateTo" style="width:150px" />
            </div>
          </div>

          <div class="jv2-comp-filter-groups" id="jv2CompGroups">
            ${renderCompFilterGroups()}
          </div>

          <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button" style="align-self:flex-start">Buscar partidos</button>
        </div>

        <div id="jv2MatchPicker" style="display:none">
          <div class="jv2-counter">
            Seleccionados: <strong id="jv2Count">0</strong>
          </div>
          <div id="jv2MatchList" class="jv2-match-list"></div>
        </div>

        <div class="jv2-form__footer">
          <button class="btn btn--primary btn--sm" id="btnGuardarJornada">Guardar como borrador</button>
          <button class="btn btn--ghost btn--sm" id="btnCancelarJornada">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}

function renderCompFilterGroups() {
  return COMP_GROUPS.map(g => {
    const chips = g.codes.map(c => `<span class="jv2-comp-filter-chip">${COMP_LABELS[c] || c}</span>`).join('');
    const check = `
      <label class="jv2-comp-filter-check">
        <input type="checkbox" class="jv2-group-check" data-group="${g.key}" ${g.defaultChecked ? 'checked' : ''} />
        <span>${g.label}</span>
      </label>
    `;
    if (!g.expandable) {
      return `
        <div class="jv2-comp-filter-group jv2-comp-filter-group--main">
          ${check}
          <div class="jv2-comp-filter-group__list">${chips}</div>
        </div>
      `;
    }
    return `
      <details class="jv2-comp-filter-group jv2-comp-filter-group--collapsible">
        <summary class="jv2-comp-filter-group__summary">${check}</summary>
        <div class="jv2-comp-filter-group__list">${chips}</div>
      </details>
    `;
  }).join('');
}

function jornadaRow(j) {
  const statusBadge = {
    draft:    '<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',
    upcoming: '<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',
    active:   '<span class="admin-match-badge admin-match-badge--done">Activa</span>',
    finished: '<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>',
  }[j.status] || `<span class="admin-match-badge">${j.status}</span>`;

  const d = (iso) => iso ? new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit' }) : '—';
  const canEditResults = j.status === 'draft' || j.status === 'upcoming' || j.status === 'active' || j.status === 'finished';
  const terminada = j.date_end && new Date(j.date_end) < new Date();
  const cerrable = terminada && (j.status === 'upcoming' || j.status === 'active');
  const canEdit = j.status !== 'finished';
  const canDelete = j.status !== 'finished';

  return `
    <div class="jv2-row" data-jornada-id="${j.id}">
      <div class="jv2-row__info">
        <span class="jv2-row__num">J${j.number}</span>
        <span class="jv2-row__dates">${d(j.date_start)} – ${d(j.date_end)}</span>
        ${statusBadge}
        <span class="jv2-row__matches">${j.match_count} partidos</span>
      </div>
      <div class="jv2-row__actions">
        ${j.status === 'draft' ? `
          <button class="btn btn--primary btn--xs jv2-pub-btn" data-id="${j.id}" data-num="${j.number}">Publicar</button>
        ` : ''}
        ${canEdit ? `
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${j.id}">Editar</button>
        ` : ''}
        ${canEditResults ? `
          <button class="btn btn--ghost btn--xs jv2-results-btn" data-id="${j.id}" data-num="${j.number}">Resultados</button>
        ` : ''}
        ${cerrable ? `
          <button class="btn btn--danger btn--xs jv2-close-btn" data-id="${j.id}" data-num="${j.number}">Cerrar jornada</button>
        ` : ''}
        ${canDelete ? `
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${j.id}" data-num="${j.number}">🗑️ Eliminar</button>
        ` : ''}
      </div>
    </div>
    <div class="jv2-results-panel" id="jv2-results-${j.id}" style="display:none"></div>
  `;
}

function attachJornadasEvents(container) {
  container.querySelector('#btnNuevaJornada')?.addEventListener('click', () => {
    _editingJornadaId = null;
    _selectedMatches = [];
    document.getElementById('jv2FormTitle').textContent = 'Nueva jornada';
    document.getElementById('jv2EditId').value = '';
    document.getElementById('jv2Number').value = '';
    document.getElementById('jv2DateStart').value = '';
    document.getElementById('jv2DateEnd').value = '';
    document.getElementById('jv2DateFrom').value = '';
    document.getElementById('jv2DateTo').value = '';
    document.getElementById('jv2MatchPicker').style.display = 'none';
    document.getElementById('jv2Form').style.display = 'block';
    updateCounter();
  });

  container.querySelector('#btnCancelarJornada')?.addEventListener('click', () => {
    document.getElementById('jv2Form').style.display = 'none';
    _selectedMatches = [];
    _editingJornadaId = null;
  });

  container.querySelector('#btnBuscarPartidos')?.addEventListener('click', buscarPartidos);

  container.querySelector('#btnGuardarJornada')?.addEventListener('click', guardarJornada);

  container.querySelectorAll('.jv2-results-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleResultsPanel(btn.dataset.id, btn));
  });

  container.querySelectorAll('.jv2-pub-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Publicar jornada ${btn.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)) return;
      btn.disabled = true;
      btn.textContent = 'Publicando…';
      try {
        const res = await api.adminV2.publishJornada(btn.dataset.id);
        showToast(`Jornada ${btn.dataset.num} publicada — push enviado a ${res.push_sent} suscriptores`);
        await loadJornadasV2(document.getElementById('jornadasV2Section'));
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Publicar';
      }
    });
  });

  container.querySelectorAll('.jv2-close-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Cerrar jornada ${btn.dataset.num}? Se calcularán los puntos y se resolverán los duelos. Esta acción es irreversible.`)) return;
      btn.disabled = true;
      btn.textContent = 'Cerrando…';
      try {
        const res = await api.adminV2.closeJornada(btn.dataset.id);
        showToast(res.message || `Jornada ${btn.dataset.num} cerrada`);
        await loadJornadasV2(document.getElementById('jornadasV2Section'));
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Cerrar jornada';
      }
    });
  });

  container.querySelectorAll('.jv2-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => abrirEdicion(btn.dataset.id, container));
  });

  container.querySelectorAll('.jv2-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar la jornada ${btn.dataset.num}?`)) return;
      if (!confirm('¿Seguro? Esta acción eliminará la jornada y todos sus partidos')) return;
      btn.disabled = true;
      btn.textContent = 'Eliminando…';
      try {
        await api.adminV2.deleteJornada(btn.dataset.id);
        showToast('Jornada eliminada');
        await loadJornadasV2(document.getElementById('jornadasV2Section'));
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = '🗑️ Eliminar';
      }
    });
  });

  container.querySelector('#jv2DateStart')?.addEventListener('input', syncDateRangeDefaults);
  container.querySelector('#jv2DateEnd')?.addEventListener('input', syncDateRangeDefaults);

  container.querySelectorAll('.jv2-group-check').forEach(cb => {
    cb.addEventListener('click', (e) => e.stopPropagation());
  });
}

function syncDateRangeDefaults() {
  const start = document.getElementById('jv2DateStart')?.value;
  const end = document.getElementById('jv2DateEnd')?.value;
  const from = document.getElementById('jv2DateFrom');
  const to = document.getElementById('jv2DateTo');
  if (from && start) from.value = start.slice(0, 10);
  if (to && end) to.value = end.slice(0, 10);
}

async function abrirEdicion(id) {
  const { jornadas } = await api.adminV2.jornadas();
  const j = jornadas.find(x => String(x.id) === String(id));
  if (!j) return;

  _editingJornadaId = j.id;
  _selectedMatches = [];
  document.getElementById('jv2FormTitle').textContent = `Editar jornada ${j.number}`;
  document.getElementById('jv2EditId').value = j.id;
  document.getElementById('jv2Number').value = j.number;
  if (j.date_start) document.getElementById('jv2DateStart').value = j.date_start.slice(0, 16);
  if (j.date_end)   document.getElementById('jv2DateEnd').value   = j.date_end.slice(0, 16);
  if (j.date_start) document.getElementById('jv2DateFrom').value = j.date_start.slice(0, 10);
  if (j.date_end)   document.getElementById('jv2DateTo').value   = j.date_end.slice(0, 10);
  document.getElementById('jv2MatchPicker').style.display = 'none';
  document.getElementById('jv2Form').style.display = 'block';
  updateCounter();
}

async function buscarPartidos() {
  const btn = document.getElementById('btnBuscarPartidos');
  const dateFrom = document.getElementById('jv2DateFrom').value;
  const dateTo = document.getElementById('jv2DateTo').value;
  if (!dateFrom || !dateTo) { showToast('Selecciona el rango de fechas (Desde / Hasta)', 'error'); return; }
  if (dateFrom > dateTo) { showToast('"Desde" no puede ser posterior a "Hasta"', 'error'); return; }

  const selectedGroupKeys = Array.from(document.querySelectorAll('.jv2-group-check:checked')).map(cb => cb.dataset.group);
  const codes = COMP_GROUPS.filter(g => selectedGroupKeys.includes(g.key)).flatMap(g => g.codes);
  if (codes.length === 0) { showToast('Selecciona al menos un grupo de competiciones', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'Buscando…';
  try {
    const { matches } = await api.adminV2.partidos(dateFrom, dateTo, codes);
    renderMatchPicker(matches);
    document.getElementById('jv2MatchPicker').style.display = 'block';
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Buscar partidos';
  }
}

function renderMatchPicker(matchesByComp) {
  const list = document.getElementById('jv2MatchList');
  const total = Object.values(matchesByComp).flat().length;

  if (total === 0) {
    list.innerHTML = '<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';
    return;
  }

  list.innerHTML = Object.entries(matchesByComp).map(([code, matches]) => {
    if (!matches.length) return '';
    return `
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${COMP_LABELS[code] || code}</div>
        ${matches.map(m => `
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(m)}' />
            <span class="jv2-match-item__teams">${m.home_team} vs ${m.away_team}</span>
            <span class="jv2-match-item__date">${shortDate(m.match_datetime)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }).join('');

  list.querySelectorAll('.jv2-match-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const matchData = JSON.parse(cb.dataset.match);
      if (cb.checked) {
        if (_selectedMatches.length >= 10) {
          cb.checked = false;
          showToast('Máximo 10 partidos', 'error');
          return;
        }
        _selectedMatches.push(matchData);
      } else {
        _selectedMatches = _selectedMatches.filter(m => m.api_id !== matchData.api_id);
      }
      updateCounter();
    });
  });
}

function updateCounter() {
  const el = document.getElementById('jv2Count');
  if (el) el.textContent = _selectedMatches.length;
}

async function guardarJornada() {
  const number = parseInt(document.getElementById('jv2Number').value);
  const date_start = document.getElementById('jv2DateStart').value;
  const date_end   = document.getElementById('jv2DateEnd').value;
  const editId     = document.getElementById('jv2EditId').value;

  if (!number || !date_start || !date_end) {
    showToast('Completa número y fechas', 'error'); return;
  }
  const payload = {
    number,
    date_start: new Date(date_start).toISOString(),
    date_end:   new Date(date_end).toISOString(),
  };
  if (_selectedMatches.length > 0) {
    payload.matches = _selectedMatches;
  }

  const btn = document.getElementById('btnGuardarJornada');
  btn.disabled = true;
  try {
    if (editId) {
      await api.adminV2.updateJornada(editId, payload);
      showToast(`Jornada ${number} actualizada`);
    } else {
      await api.adminV2.createJornada(payload);
      showToast(`Jornada ${number} guardada como borrador`);
    }
    document.getElementById('jv2Form').style.display = 'none';
    _selectedMatches = [];
    _editingJornadaId = null;
    await loadJornadasV2(document.getElementById('jornadasV2Section'));
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

function shortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

// ─── Panel de Resultados Jornada V2 ─────────────────────────────────────────

async function toggleResultsPanel(jornadaId, btn) {
  const panel = document.getElementById(`jv2-results-${jornadaId}`);
  if (!panel) return;

  if (panel.style.display !== 'none') {
    panel.style.display = 'none';
    btn.textContent = 'Resultados';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Cargando…';
  try {
    const { matches } = await api.adminV2.jornadaMatches(jornadaId);
    panel.innerHTML = renderResultsPanel(matches, jornadaId);
    panel.style.display = 'block';
    attachResultsEvents(panel, jornadaId);
    btn.textContent = 'Ocultar';
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    btn.textContent = 'Resultados';
  } finally {
    btn.disabled = false;
  }
}

function matchStatusBadge(m) {
  if (m.jm_status === 'cancelled') {
    return '<span class="admin-match-badge admin-match-badge--cancelled">🔴 Suspendido</span>';
  }
  if (m.jm_status === 'finished') {
    const score = (m.home_score_90 != null && m.away_score_90 != null)
      ? ` ${m.home_score_90}–${m.away_score_90}`
      : '';
    const manualTag = m.is_manual ? ' <span class="admin-match-badge admin-match-badge--manual">🔒 Manual</span>' : '';
    return `<span class="admin-match-badge admin-match-badge--done">🟢 Finalizado${score}</span>${manualTag}`;
  }
  const now = Date.now();
  const kickoff = new Date(m.match_datetime).getTime();
  const twoHoursAfter = kickoff + 2 * 60 * 60 * 1000;
  if (now >= kickoff && now <= twoHoursAfter) {
    return '<span class="admin-match-badge admin-match-badge--live">🔵 En juego</span>';
  }
  if (now > twoHoursAfter) {
    return '<span class="admin-match-badge admin-match-badge--stale">⚠️ ¿Ya se jugó? Introduce el resultado manualmente</span>';
  }
  return '<span class="admin-match-badge admin-match-badge--pending">🟡 Pendiente</span>';
}

function fmtAdminDt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function renderResultsPanel(matches, jornadaId) {
  const sorted = [...matches].sort((a, b) => new Date(b.match_datetime) - new Date(a.match_datetime));
  return `
    <div class="jv2-results-toolbar">
      <button class="btn btn--ghost btn--xs jv2-sync-btn" data-jornada-id="${jornadaId}">🔄 Sincronizar resultados ahora</button>
      <button class="btn btn--ghost btn--xs jv2-add-manual-btn">➕ Partido manual</button>
    </div>
    <div class="jv2-manual-form" style="display:none">
      <div class="jv2-manual-form__fields">
        <input type="text" class="form__input jv2-manual-home" placeholder="Equipo / Jugador local" maxlength="60" />
        <span class="jv2-manual-form__vs">vs</span>
        <input type="text" class="form__input jv2-manual-away" placeholder="Equipo / Jugador visitante" maxlength="60" />
        <input type="datetime-local" class="form__input jv2-manual-dt" />
      </div>
      <div class="jv2-manual-form__type-row">
        <label class="jv2-manual-form__type-label">Tipo:</label>
        <label class="jv2-manual-form__type-option">
          <input type="radio" name="jv2-manual-type-${jornadaId}" class="jv2-manual-type" value="1x2" checked /> 1X2 (con empate)
        </label>
        <label class="jv2-manual-form__type-option">
          <input type="radio" name="jv2-manual-type-${jornadaId}" class="jv2-manual-type" value="12" /> 12 (sin empate — tenis, NBA…)
        </label>
      </div>
      <div class="jv2-manual-form__odds-row">
        <span class="jv2-manual-form__odds-label">Cuotas:</span>
        <label class="jv2-manual-form__odds-item">
          <span>1</span>
          <input type="number" class="form__input jv2-manual-odds1" step="0.01" min="1" max="99" placeholder="2.50" style="width:72px" />
        </label>
        <label class="jv2-manual-form__odds-item jv2-manual-oddsx-wrap">
          <span>X</span>
          <input type="number" class="form__input jv2-manual-oddsx" step="0.01" min="1" max="99" placeholder="3.20" style="width:72px" />
        </label>
        <label class="jv2-manual-form__odds-item">
          <span>2</span>
          <input type="number" class="form__input jv2-manual-odds2" step="0.01" min="1" max="99" placeholder="2.80" style="width:72px" />
        </label>
      </div>
      <div class="jv2-manual-form__actions">
        <button class="btn btn--primary btn--xs jv2-manual-save-btn">Añadir</button>
        <button class="btn btn--ghost btn--xs jv2-manual-cancel-btn">Cancelar</button>
      </div>
    </div>
    <div class="jv2-results-table">
      ${sorted.map(m => {
        const isCancelled = m.jm_status === 'cancelled';
        return `
          <div class="jv2-results-row ${isCancelled ? 'jv2-results-row--cancelled' : ''}" data-jm-id="${m.jornada_match_id}">
            <div class="jv2-results-row__meta">
              <span class="jv2-results-row__datetime">${fmtAdminDt(m.match_datetime)}</span>
              <div class="jv2-results-row__teams">
                <span>${m.home_team}</span>
                <span class="jv2-results-row__vs">vs</span>
                <span>${m.away_team}</span>
              </div>
              ${matchStatusBadge(m)}
            </div>
            <div class="jv2-results-row__controls">
              ${isCancelled ? '<span style="color:var(--text-muted)">—</span>' : `
                <input type="number" class="form__input jv2-score-input" data-side="home" min="0" max="99" value="${m.home_score_90 ?? ''}" placeholder="L" style="width:52px" />
                <span style="padding:0 4px">–</span>
                <input type="number" class="form__input jv2-score-input" data-side="away" min="0" max="99" value="${m.away_score_90 ?? ''}" placeholder="V" style="width:52px" />
                <select class="form__input jv2-r90-select" style="width:68px">
                  <option value="" ${!m.result_90 ? 'selected' : ''}>Auto</option>
                  <option value="1" ${m.result_90 === '1' ? 'selected' : ''}>1</option>
                  <option value="X" ${m.result_90 === 'X' ? 'selected' : ''}>X</option>
                  <option value="2" ${m.result_90 === '2' ? 'selected' : ''}>2</option>
                </select>
                <select class="form__input jv2-result-type-select" style="width:72px" title="Tipo de resultado">
                  <option value="90min" ${(m.result_type ?? '90min') === '90min' ? 'selected' : ''}>90 min</option>
                  <option value="et" ${m.result_type === 'et' ? 'selected' : ''}>Prórroga</option>
                  <option value="pen" ${m.result_type === 'pen' ? 'selected' : ''}>Penaltis</option>
                </select>
                <button class="btn btn--primary btn--xs jv2-save-result-btn" data-jm-id="${m.jornada_match_id}">Guardar</button>
                <button class="btn btn--danger btn--xs jv2-cancel-match-btn" data-jm-id="${m.jornada_match_id}" data-home="${m.home_team}" data-away="${m.away_team}">Cancelar</button>
                ${m.is_manual ? `<button class="btn btn--danger btn--xs jv2-delete-manual-btn" data-jm-id="${m.jornada_match_id}" data-home="${m.home_team}" data-away="${m.away_team}">🗑️ Eliminar</button>` : ''}
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function attachResultsEvents(panel, jornadaId) {
  panel.querySelector('.jv2-add-manual-btn')?.addEventListener('click', () => {
    const form = panel.querySelector('.jv2-manual-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });

  panel.querySelector('.jv2-manual-cancel-btn')?.addEventListener('click', () => {
    panel.querySelector('.jv2-manual-form').style.display = 'none';
  });

  // Toggle odds_x visibility when type changes
  panel.querySelectorAll('.jv2-manual-type').forEach(radio => {
    radio.addEventListener('change', () => {
      const noX = panel.querySelector('.jv2-manual-type:checked')?.value === '12';
      const xWrap = panel.querySelector('.jv2-manual-oddsx-wrap');
      if (xWrap) xWrap.style.display = noX ? 'none' : '';
    });
  });

  panel.querySelector('.jv2-manual-save-btn')?.addEventListener('click', async () => {
    const home    = panel.querySelector('.jv2-manual-home').value.trim();
    const away    = panel.querySelector('.jv2-manual-away').value.trim();
    const dt      = panel.querySelector('.jv2-manual-dt').value;
    const noDraw  = panel.querySelector('.jv2-manual-type:checked')?.value === '12';
    const odds1   = panel.querySelector('.jv2-manual-odds1').value;
    const oddsx   = panel.querySelector('.jv2-manual-oddsx').value;
    const odds2   = panel.querySelector('.jv2-manual-odds2').value;

    if (!home || !away) { showToast('Introduce los dos equipos', 'error'); return; }
    if (!dt)             { showToast('Introduce la fecha y hora', 'error'); return; }

    const saveBtn = panel.querySelector('.jv2-manual-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = '…';
    try {
      const payload = {
        home_team: home,
        away_team: away,
        match_datetime: new Date(dt).toISOString(),
        no_draw: noDraw,
      };
      if (odds1) payload.odds_1 = parseFloat(odds1);
      if (!noDraw && oddsx) payload.odds_x = parseFloat(oddsx);
      if (odds2) payload.odds_2 = parseFloat(odds2);

      await api.adminV2.addManualMatch(jornadaId, payload);
      showToast('Partido manual añadido');
      await reloadResultsPanel(jornadaId);
    } catch (err) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Añadir';
    }
  });

  panel.querySelector('.jv2-sync-btn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = '⏳ Sincronizando…';
    try {
      await api.matches.sync();
      showToast('Sincronización completada');
      await reloadResultsPanel(jornadaId);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '🔄 Sincronizar resultados ahora';
    }
  });

  panel.querySelectorAll('.jv2-save-result-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const jmId = btn.dataset.jmId;
      const row = panel.querySelector(`.jv2-results-row[data-jm-id="${jmId}"]`);
      const homeVal       = row.querySelector('.jv2-score-input[data-side="home"]')?.value;
      const awayVal       = row.querySelector('.jv2-score-input[data-side="away"]')?.value;
      const r90Val        = row.querySelector('.jv2-r90-select')?.value || undefined;
      const resultTypeVal = row.querySelector('.jv2-result-type-select')?.value || '90min';

      if (homeVal === '' || awayVal === '') {
        showToast('Introduce los dos marcadores', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = '…';
      try {
        const payload = { home_score: parseInt(homeVal), away_score: parseInt(awayVal), result_type: resultTypeVal };
        if (r90Val) payload.result_90 = r90Val;
        await api.adminV2.setResultado(jmId, payload);
        showToast('Resultado guardado y puntos recalculados');
        await reloadResultsPanel(jornadaId);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Guardar';
      }
    });
  });

  panel.querySelectorAll('.jv2-cancel-match-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { jmId, home, away } = btn.dataset;
      if (!confirm(`¿Cancelar el partido ${home} vs ${away}? Las unidades apostadas se devolverán a los usuarios.`)) return;
      btn.disabled = true;
      btn.textContent = '…';
      try {
        const { message } = await api.adminV2.cancelMatch(jmId);
        showToast(message);
        await reloadResultsPanel(jornadaId);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Cancelar';
      }
    });
  });

  panel.querySelectorAll('.jv2-delete-manual-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { jmId, home, away } = btn.dataset;
      if (!confirm(`¿Eliminar el partido manual ${home} vs ${away}? Se borrarán todas las predicciones asociadas.`)) return;
      btn.disabled = true;
      btn.textContent = '…';
      try {
        const { message } = await api.adminV2.deleteManualMatch(jmId);
        showToast(message);
        await reloadResultsPanel(jornadaId);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = '🗑️ Eliminar';
      }
    });
  });
}

async function reloadResultsPanel(jornadaId) {
  const panel = document.getElementById(`jv2-results-${jornadaId}`);
  if (!panel || panel.style.display === 'none') return;
  try {
    const { matches } = await api.adminV2.jornadaMatches(jornadaId);
    panel.innerHTML = renderResultsPanel(matches, jornadaId);
    attachResultsEvents(panel, jornadaId);
  } catch (err) {
    showToast(`Error recargando: ${err.message}`, 'error');
  }
}
