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

        <section class="section admin-section">
          <h2 class="admin-section__title">Scheduler</h2>
          <p class="admin-section__desc">Sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
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

// ─── Gestión de Jornadas V2 ──────────────────────────────────────────────────

const COMP_LABELS = {
  PD:  '🇪🇸 LaLiga',
  PL:  '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
  CL:  '⭐ Champions League',
  SA:  '🇮🇹 Serie A',
  BL1: '🇩🇪 Bundesliga',
  FL1: '🇫🇷 Ligue 1',
  PPL: '🇵🇹 Primeira Liga',
};
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
  const today = new Date();
  const nextWeek = nextIsoWeek(today);

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
          <label class="form__label">Semana de partidos</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="form__input" type="week" id="jv2Week" value="${nextWeek}" style="width:180px" />
            <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button">Buscar partidos</button>
          </div>
        </div>

        <div id="jv2MatchPicker" style="display:none">
          <div class="jv2-counter">
            Seleccionados: <strong id="jv2Count">0</strong> / 10
            <span id="jv2CountWarn" class="jv2-counter__warn" style="display:none">Selecciona exactamente 10</span>
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

function jornadaRow(j) {
  const statusBadge = {
    draft:    '<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',
    upcoming: '<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',
    active:   '<span class="admin-match-badge admin-match-badge--done">Activa</span>',
    finished: '<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>',
  }[j.status] || `<span class="admin-match-badge">${j.status}</span>`;

  const d = (iso) => iso ? new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit' }) : '—';
  const canEditResults = j.status === 'upcoming' || j.status === 'active' || j.status === 'finished';

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
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${j.id}">Editar</button>
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${j.id}" data-num="${j.number}">Eliminar</button>
        ` : ''}
        ${canEditResults ? `
          <button class="btn btn--ghost btn--xs jv2-results-btn" data-id="${j.id}" data-num="${j.number}">Resultados</button>
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

  container.querySelectorAll('.jv2-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => abrirEdicion(btn.dataset.id, container));
  });

  container.querySelectorAll('.jv2-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar jornada ${btn.dataset.num}?`)) return;
      try {
        await api.adminV2.deleteJornada(btn.dataset.id);
        showToast('Jornada eliminada');
        loadJornadasV2(document.querySelector('#jornadasV2Content').parentElement.parentElement);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
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
  document.getElementById('jv2MatchPicker').style.display = 'none';
  document.getElementById('jv2Form').style.display = 'block';
  updateCounter();
}

async function buscarPartidos() {
  const btn = document.getElementById('btnBuscarPartidos');
  const semana = document.getElementById('jv2Week').value;
  if (!semana) { showToast('Selecciona una semana', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'Buscando…';
  try {
    const { matches } = await api.adminV2.partidos(semana);
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
  const warn = document.getElementById('jv2CountWarn');
  if (el) el.textContent = _selectedMatches.length;
  if (warn) warn.style.display = (_selectedMatches.length > 0 && _selectedMatches.length !== 10) ? 'inline' : 'none';
}

async function guardarJornada() {
  const number = parseInt(document.getElementById('jv2Number').value);
  const date_start = document.getElementById('jv2DateStart').value;
  const date_end   = document.getElementById('jv2DateEnd').value;
  const editId     = document.getElementById('jv2EditId').value;

  if (!number || !date_start || !date_end) {
    showToast('Completa número y fechas', 'error'); return;
  }
  if (_selectedMatches.length !== 10) {
    showToast('Selecciona exactamente 10 partidos', 'error'); return;
  }

  const payload = {
    number,
    date_start: new Date(date_start).toISOString(),
    date_end:   new Date(date_end).toISOString(),
    matches: _selectedMatches,
  };

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
    panel.innerHTML = renderResultsPanel(matches);
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

function renderResultsPanel(matches) {
  return `
    <div class="jv2-results-table">
      <div class="jv2-results-table__header">
        <span>Partido</span>
        <span>Estado</span>
        <span>Marcador</span>
        <span>1X2</span>
        <span>Acciones</span>
      </div>
      ${matches.map(m => {
        const isCancelled = m.jm_status === 'cancelled';
        const isFinished  = m.jm_status === 'finished';
        const jmStatusBadge = isCancelled
          ? '<span class="admin-match-badge" style="background:rgba(255,60,60,0.12);color:#ff5c5c;border:1px solid rgba(255,60,60,0.3)">Suspendido</span>'
          : isFinished
            ? '<span class="admin-match-badge admin-match-badge--done">Finalizado</span>'
            : '<span class="admin-match-badge admin-match-badge--pending">Pendiente</span>';

        return `
          <div class="jv2-results-row ${isCancelled ? 'jv2-results-row--cancelled' : ''}" data-jm-id="${m.jornada_match_id}">
            <div class="jv2-results-row__teams">
              <span>${m.home_team}</span>
              <span class="jv2-results-row__vs">vs</span>
              <span>${m.away_team}</span>
            </div>
            <div>${jmStatusBadge}</div>
            <div class="jv2-results-row__score">
              ${isCancelled ? '—' : `
                <input type="number" class="form__input jv2-score-input" data-side="home" min="0" max="99" value="${m.home_score_90 ?? ''}" placeholder="L" style="width:52px" ${isCancelled ? 'disabled' : ''} />
                <span style="padding:0 4px">–</span>
                <input type="number" class="form__input jv2-score-input" data-side="away" min="0" max="99" value="${m.away_score_90 ?? ''}" placeholder="V" style="width:52px" ${isCancelled ? 'disabled' : ''} />
              `}
            </div>
            <div class="jv2-results-row__r90">
              ${isCancelled ? '—' : `
                <select class="form__input jv2-r90-select" style="width:72px" ${isCancelled ? 'disabled' : ''}>
                  <option value="" ${!m.result_90 ? 'selected' : ''}>Auto</option>
                  <option value="1" ${m.result_90 === '1' ? 'selected' : ''}>1</option>
                  <option value="X" ${m.result_90 === 'X' ? 'selected' : ''}>X</option>
                  <option value="2" ${m.result_90 === '2' ? 'selected' : ''}>2</option>
                </select>
              `}
            </div>
            <div class="jv2-results-row__actions" style="display:flex;gap:6px;flex-wrap:wrap">
              ${isCancelled ? '' : `
                <button class="btn btn--primary btn--xs jv2-save-result-btn" data-jm-id="${m.jornada_match_id}">Guardar</button>
              `}
              ${isCancelled ? '' : `
                <button class="btn btn--danger btn--xs jv2-cancel-match-btn" data-jm-id="${m.jornada_match_id}" data-home="${m.home_team}" data-away="${m.away_team}">Cancelar</button>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function attachResultsEvents(panel, jornadaId) {
  panel.querySelectorAll('.jv2-save-result-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const jmId = btn.dataset.jmId;
      const row = panel.querySelector(`.jv2-results-row[data-jm-id="${jmId}"]`);
      const homeVal = row.querySelector('.jv2-score-input[data-side="home"]')?.value;
      const awayVal = row.querySelector('.jv2-score-input[data-side="away"]')?.value;
      const r90Val  = row.querySelector('.jv2-r90-select')?.value || undefined;

      if (homeVal === '' || awayVal === '') {
        showToast('Introduce los dos marcadores', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = '…';
      try {
        const payload = { home_score: parseInt(homeVal), away_score: parseInt(awayVal) };
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
}

async function reloadResultsPanel(jornadaId) {
  const panel = document.getElementById(`jv2-results-${jornadaId}`);
  if (!panel || panel.style.display === 'none') return;
  try {
    const { matches } = await api.adminV2.jornadaMatches(jornadaId);
    panel.innerHTML = renderResultsPanel(matches);
    attachResultsEvents(panel, jornadaId);
  } catch (err) {
    showToast(`Error recargando: ${err.message}`, 'error');
  }
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function nextIsoWeek(date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 7);
  const yyyy = next.getFullYear();
  const ww = String(isoWeek(next)).padStart(2, '0');
  return `${yyyy}-W${ww}`;
}
