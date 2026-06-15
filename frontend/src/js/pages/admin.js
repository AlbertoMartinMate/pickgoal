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
    if (home === '' || away === '') {
      showToast('Introduce ambos marcadores', 'error');
      return;
    }
    btn.disabled = true;
    try {
      await api.matches.setResult(matchId, parseInt(home), parseInt(away));
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
