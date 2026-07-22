import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast } from '../ui.js';

const PHASES = [
  { key: 'group',    label: 'Grupos'        },
  { key: 'r32',      label: 'Dieciseisavos' },
  { key: 'r16',      label: 'Octavos'       },
  { key: 'quarters', label: 'Cuartos'       },
  { key: 'semis',    label: 'Semis'         },
  { key: 'third',    label: '3er y 4to'     },
  { key: 'final',    label: 'Final'         },
];

export async function renderAdmin(el) {
  if (!auth.isAdmin()) {
    el.innerHTML = '<div class="container"><p class="form__error">Acceso denegado.</p></div>';
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const [{ users }, { groups }] = await Promise.all([
      api.auth.users(),
      api.matches.grouped(),
    ]);

    const phaseMatches = buildPhaseMatches(groups);

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
          <h2 class="admin-section__title">Premiar campeón</h2>
          <form class="form form--inline" id="awardForm">
            <input class="form__input" type="text" id="winnerTeam" placeholder="Equipo campeón" />
            <button class="btn btn--primary" type="submit">Premiar (+10 pts)</button>
          </form>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Gestión de resultados</h2>
          ${buildResultSection(phaseMatches)}
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
          <h2 class="admin-section__title">Usuarios (${users.length})</h2>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
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

function buildPhaseMatches(groups) {
  const map = {};
  for (const group of groups) {
    const key = group.phase;
    if (!map[key]) map[key] = [];
    map[key].push(...group.matches);
  }
  return map;
}

function buildResultSection(phaseMatches) {
  const available = PHASES.filter(p => phaseMatches[p.key]?.length);
  if (!available.length) return '<p class="admin-section__desc">No hay partidos cargados.</p>';

  const tabs = available.map((p, i) => `
    <button class="admin-result-tab${i === 0 ? ' admin-result-tab--active' : ''}" data-phase="${p.key}">
      ${p.label}
    </button>
  `).join('');

  const panels = available.map((p, i) => `
    <div class="admin-result-panel${i === 0 ? '' : ' admin-result-panel--hidden'}" data-phase="${p.key}">
      ${(phaseMatches[p.key] || []).map(matchRow).join('')}
    </div>
  `).join('');

  return `
    <div class="admin-result-tabs">${tabs}</div>
    <div id="resultPanels">${panels}</div>
    <div class="admin-result-footer">
      <button class="btn btn--danger" id="btnRecalcAll">Recalcular todos los puntos</button>
      <span id="recalcResult" class="admin-result-footer__msg"></span>
    </div>
  `;
}

function matchRow(m) {
  const isFinished = m.status === 'finished';
  const homeVal = isFinished && m.home_score_90 != null ? m.home_score_90 : '';
  const awayVal = isFinished && m.away_score_90 != null ? m.away_score_90 : '';
  const result90Val = isFinished && m.result_90 ? m.result_90 : '';
  const badge = isFinished
    ? '<span class="admin-match-badge admin-match-badge--done">Terminado</span>'
    : '<span class="admin-match-badge admin-match-badge--pending">Pendiente</span>';
  const date = shortDate(m.match_datetime);

  return `
    <div class="admin-match-row" data-id="${m.id}">
      <div class="admin-match-row__info">
        <span class="admin-match-row__teams">${m.home_team} vs ${m.away_team}</span>
        <span class="admin-match-row__date">${date}</span>
        ${badge}
      </div>
      <div class="admin-match-row__score">
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${homeVal}" placeholder="L" />
        <span class="admin-match-row__dash">-</span>
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${awayVal}" placeholder="V" />
        <select class="admin-match-row__result90" title="Resultado 90min (vacío = automático)">
          <option value="">Auto</option>
          <option value="1" ${result90Val === '1' ? 'selected' : ''}>1</option>
          <option value="X" ${result90Val === 'X' ? 'selected' : ''}>X</option>
          <option value="2" ${result90Val === '2' ? 'selected' : ''}>2</option>
        </select>
        <button class="btn btn--primary btn--xs admin-match-row__save">Guardar</button>
      </div>
    </div>
  `;
}

function shortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
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

  document.getElementById('awardForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const team = document.getElementById('winnerTeam').value.trim();
    if (!team) return;
    try {
      const { message } = await api.predictions.awardChampion(team);
      showToast(message);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Phase tabs
  el.querySelectorAll('.admin-result-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.admin-result-tab').forEach(t => t.classList.remove('admin-result-tab--active'));
      el.querySelectorAll('.admin-result-panel').forEach(p => p.classList.add('admin-result-panel--hidden'));
      tab.classList.add('admin-result-tab--active');
      el.querySelector(`.admin-result-panel[data-phase="${tab.dataset.phase}"]`)
        ?.classList.remove('admin-result-panel--hidden');
    });
  });

  // Save per match
  document.getElementById('resultPanels')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.admin-match-row__save');
    if (!btn) return;
    const row = btn.closest('.admin-match-row');
    const matchId = parseInt(row.dataset.id);
    const inputs = row.querySelectorAll('.admin-match-row__input');
    const home = inputs[0].value;
    const away = inputs[1].value;
    const result90 = row.querySelector('.admin-match-row__result90')?.value || null;
    if (home === '' || away === '') {
      showToast('Introduce ambos marcadores', 'error');
      return;
    }
    btn.disabled = true;
    try {
      await api.matches.setResult(matchId, parseInt(home), parseInt(away), result90);
      const badge = row.querySelector('.admin-match-badge');
      if (badge) {
        badge.className = 'admin-match-badge admin-match-badge--done';
        badge.textContent = 'Terminado';
      }
      showToast(`Resultado ${home}-${away} guardado`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // Recalculate all
  document.getElementById('btnRecalcAll')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnRecalcAll');
    const msg = document.getElementById('recalcResult');
    btn.disabled = true;
    msg.textContent = 'Recalculando…';
    try {
      const { message } = await api.matches.recalculate();
      msg.textContent = `✓ ${message}`;
      showToast(message);
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // Push notifications
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

  document.getElementById('usersTableBody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.toggle-admin');
    if (!btn) return;
    const uid = parseInt(btn.dataset.id);
    try {
      const { user } = await api.auth.toggleAdmin(uid);
      btn.closest('tr').querySelector('.admin-badge').textContent = user.is_admin ? 'Sí' : 'No';
      showToast(`${user.username} ${user.is_admin ? 'ahora es admin' : 'ya no es admin'}`);
    } catch (err) {
      showToast(err.message, 'error');
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
      <td>
        <button class="btn btn--ghost btn--xs toggle-admin" data-id="${u.id}">
          ${u.is_admin ? 'Quitar admin' : 'Hacer admin'}
        </button>
      </td>
    </tr>
  `;
}

// ─── Gestión de Jornadas V2 ──────────────────────────────────────────────────

const COMP_LABELS = { PD: '🇪🇸 LaLiga', PL: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', CL: '⭐ Champions League' };
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
  const yyyy = today.getFullYear();
  const ww = String(isoWeek(today)).padStart(2, '0');
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

  return `
    <div class="jv2-row">
      <div class="jv2-row__info">
        <span class="jv2-row__num">J${j.number}</span>
        <span class="jv2-row__dates">${d(j.date_start)} – ${d(j.date_end)}</span>
        ${statusBadge}
        <span class="jv2-row__matches">${j.match_count} partidos</span>
      </div>
      <div class="jv2-row__actions">
        ${j.status === 'draft' ? `
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${j.id}">Editar</button>
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${j.id}" data-num="${j.number}">Eliminar</button>
        ` : ''}
      </div>
    </div>
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
