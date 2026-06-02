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
          <h2>Scheduler</h2>
          <p>El scheduler sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
        </section>

        <section class="section admin-section">
          <h2>Premiar campeón</h2>
          <form class="form form--inline" id="awardForm">
            <input class="form__input" type="text" id="winnerTeam" placeholder="Equipo campeón" />
            <button class="btn btn--primary" type="submit">Premiar (+10 pts)</button>
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
