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
    const [{ users }, { matches: todayMatches }] = await Promise.all([
      api.auth.users(),
      api.matches.today(),
    ]);

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section">
          <h2>Scheduler</h2>
          <p>El scheduler sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <button class="btn btn--secondary" id="btnRecalculate" style="margin-left:8px">Recalcular puntos</button>
          <div id="syncResult"></div>
        </section>

        <section class="section admin-section">
          <h2>Resultados de hoy</h2>
          ${todayMatches.length === 0
            ? '<p>No hay partidos pendientes hoy.</p>'
            : `<div id="todayMatchesList">${todayMatches.map(matchResultRow).join('')}</div>`
          }
        </section>

        <section class="section admin-section">
          <h2>Premiar campeón</h2>
          <form class="form form--inline" id="awardForm">
            <input class="form__input" type="text" id="winnerTeam" placeholder="Equipo campeón" />
            <button class="btn btn--primary" type="submit">Premiar (+10 pts)</button>
          </form>
        </section>

        <section class="section admin-section">
          <h2>Notificaciones push</h2>
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
          <h2>Usuarios (${users.length})</h2>
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
        </section>
      </div>
    `;

    document.getElementById('btnSync').addEventListener('click', async () => {
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

    document.getElementById('btnRecalculate').addEventListener('click', async () => {
      const res = document.getElementById('syncResult');
      res.textContent = 'Recalculando puntos…';
      try {
        const { message } = await api.matches.recalculate();
        res.textContent = `✓ ${message}`;
        showToast(message);
      } catch (err) {
        res.textContent = `Error: ${err.message}`;
        showToast(err.message, 'error');
      }
    });

    const todayList = document.getElementById('todayMatchesList');
    if (todayList) {
      todayList.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-save-result');
        if (!btn) return;
        const matchId = parseInt(btn.dataset.id);
        const row = btn.closest('.match-result-row');
        const home = parseInt(row.querySelector('.input-home').value);
        const away = parseInt(row.querySelector('.input-away').value);
        if (isNaN(home) || isNaN(away)) {
          showToast('Introduce marcadores válidos', 'error');
          return;
        }
        btn.disabled = true;
        try {
          const { message } = await api.matches.setResult(matchId, home, away);
          row.querySelector('.result-status').textContent = '✓ Guardado';
          showToast(message);
        } catch (err) {
          row.querySelector('.result-status').textContent = `Error: ${err.message}`;
          showToast(err.message, 'error');
          btn.disabled = false;
        }
      });
    }

    document.getElementById('awardForm').addEventListener('submit', async (e) => {
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

    // Push notification form
    const pushTarget = document.getElementById('pushTarget');
    const pushTargetIdGroup = document.getElementById('pushTargetIdGroup');
    pushTarget.addEventListener('change', () => {
      pushTargetIdGroup.classList.toggle('hidden', pushTarget.value === 'all');
    });

    document.getElementById('pushForm').addEventListener('submit', async (e) => {
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

    document.getElementById('usersTableBody').addEventListener('click', async (e) => {
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

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function matchResultRow(m) {
  const time = new Date(m.match_datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const homeVal = m.home_score_90 ?? '';
  const awayVal = m.away_score_90 ?? '';
  return `
    <div class="match-result-row" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
      <span style="min-width:50px;font-size:13px;color:var(--color-text-muted)">${time}</span>
      <span style="flex:1;min-width:120px">${m.home_team}</span>
      <input class="form__input input-home" type="number" min="0" value="${homeVal}" placeholder="0" style="width:52px;text-align:center" />
      <span>–</span>
      <input class="form__input input-away" type="number" min="0" value="${awayVal}" placeholder="0" style="width:52px;text-align:center" />
      <span style="flex:1;min-width:120px">${m.away_team}</span>
      <button class="btn btn--primary btn--xs btn-save-result" data-id="${m.id}">Guardar</button>
      <span class="result-status" style="font-size:13px"></span>
    </div>
  `;
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
