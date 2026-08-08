import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast } from '../ui.js';

export async function renderPerfil(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
  const user = auth.getUser();

  try {
    const [predsRes, divRes, meRes, adminLeaguesRes] = await Promise.all([
      api.predictions.mine(null),
      api.clasificacion.division(),
      api.auth.me(),
      user?.is_admin ? api.leagues.adminAll() : Promise.resolve({ leagues: [] }),
    ]);

    const meUser = meRes.user;
    const status = meUser.status;
    const allTimePts = meUser.total_points_all_time;
    const myDivRow = divRes.standings?.find(r => r.user_id === meUser.id);

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Mi Perfil</h1>

        ${user?.is_admin ? `
          <a href="#/admin" class="admin-shortcut">
            🛠️ Panel de Administración
          </a>
        ` : ''}

        <section class="profile-card section">
          <div class="profile-card__info">
            <div class="profile-card__avatar">${user.username[0].toUpperCase()}</div>
            <div>
              <h2>${user.username}</h2>
              <p>${user.email}</p>
              <p>${user.country || 'Sin país'}</p>
            </div>
          </div>
          ${statusProgressHtml(status, allTimePts)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${predsRes.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${myDivRow ? `${myDivRow.pos}º` : '—'}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${myDivRow?.pts_division ?? '—'}</span>
              <span class="stat__label">Pts división</span>
            </div>
          </div>
        </section>

        <section class="section prize-banner">
          <span class="prize-banner__icon">🏆</span>
          <div>
            <strong>Premio temporada 26/27</strong>
            <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
          </div>
        </section>

        <section class="section">
          <h2>Mi División</h2>
          ${myDivRow
            ? `<div class="division-info">
                 <p class="division-info__name">${divRes.league_name || 'PickGoal División'}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${myDivRow.pos}º</span>
                     <small>de ${divRes.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${myDivRow.pts_division}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${myDivRow.pts_general}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${myDivRow.pj}</span>
                     <small>partidos</small>
                   </div>
                 </div>
                 <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla completa</a>
               </div>`
            : '<p class="empty">No perteneces a ninguna división todavía.</p>'
          }
        </section>

        ${predsRes.predictions.length > 0 ? `
          <section class="section">
            <h2>Mis predicciones</h2>
            <div class="predictions-list">${predsRes.predictions.map(predRow).join('')}</div>
          </section>
        ` : ''}

        <section class="section section--danger">
          <h2>Zona de peligro</h2>
          <button class="btn btn--danger btn--sm" id="btnDeleteAccount">Cerrar cuenta</button>
        </section>

        ${user?.is_admin && adminLeaguesRes.leagues.length ? `
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${adminLeaguesRes.leagues.map(l => `
                <li>
                  <span>${l.is_official ? '⭐ ' : ''}${l.name}</span>
                  <span class="tag">${l.is_public ? 'Pública' : 'Privada'}</span>
                  <a href="#/ligas/${l.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}
      </div>
    `;

    el.querySelector('#btnLogoutPerfil')?.addEventListener('click', () => {
      auth.logout();
      window.location.hash = '/';
    });

    el.querySelector('#btnDeleteAccount')?.addEventListener('click', () => {
      showDeleteConfirm();
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function statusProgressHtml(status, allTimePts) {
  const isMax = status.next_threshold === null;
  if (isMax) {
    return `
      <div class="level-progress">
        <div class="level-progress__header">
          <span class="status-badge">${status.emoji} ${status.name}</span>
          <span class="level-progress__label">¡Nivel máximo alcanzado!</span>
        </div>
        <div class="level-progress__bar"><div class="level-progress__fill" style="width:100%"></div></div>
      </div>`;
  }
  const pct = Math.min(100, Math.round(
    ((allTimePts - status.threshold) / (status.next_threshold - status.threshold)) * 100
  ));
  return `
    <div class="level-progress">
      <div class="level-progress__header">
        <span class="status-badge">${status.emoji} ${status.name}</span>
        <span class="level-progress__label">${allTimePts} / ${status.next_threshold} pts → ${status.next_emoji || ''} ${status.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${pct}%"></div></div>
    </div>`;
}

function predRow(p) {
  return `
    <div class="pred-row ${p.total_points > 0 ? 'pred-row--scored' : ''}">
      <span class="pred-row__result">${p.predicted_result}</span>
      <span class="pred-row__score">${p.predicted_home}-${p.predicted_away}</span>
      <span class="pred-row__pts">${p.total_points} pts</span>
    </div>
  `;
}

function showDeleteConfirm() {
  const modal = document.createElement('div');
  modal.className = 'delete-modal';
  modal.innerHTML = `
    <div class="delete-modal__overlay" id="deleteOverlay"></div>
    <div class="delete-modal__box">
      <h3 class="delete-modal__title">⚠️ Cerrar cuenta</h3>
      <p class="delete-modal__text">
        Esta acción es irreversible. Tu posición en la división será ocupada por un bot.
      </p>
      <p class="delete-modal__confirm-label">Escribe <strong>CERRAR</strong> para confirmar:</p>
      <input class="form__input" id="deleteConfirmInput" type="text" placeholder="CERRAR" autocomplete="off" />
      <div class="delete-modal__actions">
        <button class="btn btn--ghost btn--sm" id="deleteCancelBtn">Cancelar</button>
        <button class="btn btn--danger btn--sm" id="deleteConfirmBtn" disabled>Cerrar mi cuenta</button>
      </div>
      <p id="deleteError" class="form__error hidden"></p>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('delete-modal--open'));

  const input = modal.querySelector('#deleteConfirmInput');
  const confirmBtn = modal.querySelector('#deleteConfirmBtn');
  const cancelBtn = modal.querySelector('#deleteCancelBtn');
  const overlay = modal.querySelector('#deleteOverlay');
  const errorEl = modal.querySelector('#deleteError');

  function close() {
    modal.classList.remove('delete-modal--open');
    document.body.style.overflow = '';
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
  }

  input.addEventListener('input', () => {
    confirmBtn.disabled = input.value.trim() !== 'CERRAR';
  });

  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Cerrando…';
    errorEl.classList.add('hidden');

    try {
      await api.auth.deleteAccount();
      close();
      auth.logout();
      showToast('Cuenta cerrada. Hasta pronto.');
      window.location.hash = '/';
    } catch (err) {
      errorEl.textContent = err.message || 'Error al cerrar la cuenta';
      errorEl.classList.remove('hidden');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Cerrar mi cuenta';
    }
  });
}
