import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate, fmtPts } from '../ui.js';

export async function renderPerfil(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
  const user = auth.getUser();

  try {
    const [divRes, meRes, adminLeaguesRes] = await Promise.all([
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
              <div class="profile-card__email-row">
                <p id="emailDisplay">${meUser.email}</p>
                <button class="btn btn--ghost btn--xs" id="btnEditEmail" title="Cambiar email">✏️</button>
              </div>
              <div class="profile-card__email-edit hidden" id="emailEditForm">
                <input class="form__input" type="email" id="emailInput" value="${meUser.email}" autocomplete="email" />
                <div class="profile-card__email-actions">
                  <button class="btn btn--primary btn--xs" id="btnSaveEmail">Guardar</button>
                  <button class="btn btn--ghost btn--xs" id="btnCancelEmail">Cancelar</button>
                </div>
                <p class="form__error hidden" id="emailError"></p>
              </div>
              <p>${user.country || 'Sin país'}</p>
            </div>
          </div>
          ${statusProgressHtml(status, allTimePts)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${myDivRow ? `${myDivRow.pos}º` : '—'}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${myDivRow ? fmtPts(myDivRow.pts_division) : '—'}</span>
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
                     <span>${fmtPts(myDivRow.pts_division)}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${fmtPts(myDivRow.pts_general)}</span>
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

        <section class="section" id="predStatsSection">
          <h2>Mis predicciones</h2>
          <div id="predStatsWrap"><div class="loading"><div class="loading__spinner"></div></div></div>
        </section>

        <section class="section">
          <div class="mensajes-header">
            <h2>💬 Mensajes privados</h2>
            <a href="#/mensajes" class="btn btn--ghost btn--xs">Ver todos</a>
          </div>
          <div id="conversacionesList"><div class="loading"><div class="loading__spinner"></div></div></div>

          <div class="mensajes-header" style="margin-top:1.5rem">
            <h3 style="font-size:1rem;font-weight:600">📣 Menciones en tablón</h3>
            <a href="#/tabla-v2?tab=tablon" class="btn btn--ghost btn--xs">Ver tablón</a>
          </div>
          <div id="mencionesTablon"><div class="loading"><div class="loading__spinner"></div></div></div>
        </section>

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

    el.querySelector('#btnEditEmail')?.addEventListener('click', () => {
      el.querySelector('#emailEditForm').classList.remove('hidden');
      el.querySelector('#emailInput').focus();
    });

    el.querySelector('#btnCancelEmail')?.addEventListener('click', () => {
      el.querySelector('#emailEditForm').classList.add('hidden');
      el.querySelector('#emailError').classList.add('hidden');
    });

    el.querySelector('#btnSaveEmail')?.addEventListener('click', async () => {
      const newEmail = el.querySelector('#emailInput').value.trim();
      const errEl = el.querySelector('#emailError');
      errEl.classList.add('hidden');

      if (!newEmail) {
        errEl.textContent = 'El email no puede estar vacío';
        errEl.classList.remove('hidden');
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        errEl.textContent = 'Formato de email inválido';
        errEl.classList.remove('hidden');
        return;
      }

      try {
        const { user: updatedUser } = await api.auth.updateEmail(newEmail);
        auth.setUser(updatedUser, localStorage.getItem('token'));
        el.querySelector('#emailDisplay').textContent = updatedUser.email;
        el.querySelector('#emailEditForm').classList.add('hidden');
        showToast('Email actualizado');
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    });

    el.querySelector('#btnDeleteAccount')?.addEventListener('click', () => {
      showDeleteConfirm();
    });

    // Load async sections
    loadPredStats(el);
    loadConversaciones(el);
    loadMenciones(el);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadConversaciones(el) {
  const container = el.querySelector('#conversacionesList');
  if (!container) return;
  try {
    const { conversations } = await api.messages.list();
    if (!conversations.length) {
      container.innerHTML = '<p class="empty">Sin conversaciones aún.</p>';
      return;
    }
    container.innerHTML = conversations.slice(0, 5).map(c => `
      <a href="#/mensajes/${c.user_id}" class="mensajes-item">
        <div class="mensajes-item__avatar">${escapeHtml(c.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${escapeHtml(c.username)}</strong>
            ${c.unread_count > 0 ? `<span class="mensajes-item__badge">${c.unread_count}</span>` : ''}
          </div>
          <p class="mensajes-item__preview">${escapeHtml(c.last_message)}</p>
        </div>
      </a>
    `).join('');
  } catch {
    container.innerHTML = '<p class="empty">Sin conversaciones aún.</p>';
  }
}

async function loadMenciones(el) {
  const container = el.querySelector('#mencionesTablon');
  if (!container) return;
  try {
    const since = localStorage.getItem('tablon_general_last_read') || new Date(0).toISOString();
    const { messages } = await api.board.mentions(since);
    if (!messages || !messages.length) {
      container.innerHTML = '<p class="empty">Sin menciones recientes.</p>';
      return;
    }
    container.innerHTML = messages.slice(0, 5).map(m => `
      <a href="#/tabla-v2?tab=tablon" class="mensajes-item">
        <div class="mensajes-item__avatar">${escapeHtml(m.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${escapeHtml(m.username)}</strong>
            <span class="mensajes-item__time">${formatDate(m.created_at)}</span>
          </div>
          <p class="mensajes-item__preview">${escapeHtml(m.message)}</p>
        </div>
      </a>
    `).join('');
  } catch {
    container.innerHTML = '<p class="empty">Sin menciones recientes.</p>';
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
        <span class="level-progress__label">${fmtPts(allTimePts)} / ${status.next_threshold} pts → ${status.next_emoji || ''} ${status.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${pct}%"></div></div>
    </div>`;
}

async function loadPredStats(el) {
  const wrap = el.querySelector('#predStatsWrap');
  if (!wrap) return;
  try {
    const { total_predictions, correct_results, predictions } = await api.jornada.myStats();
    if (total_predictions === 0) {
      wrap.innerHTML = '<p class="empty">Aún no tienes predicciones en esta temporada.</p>';
      return;
    }
    const pct = Math.round((correct_results / total_predictions) * 100);
    const R = 50;
    const C = +(2 * Math.PI * R).toFixed(2);
    const filled = +((pct / 100) * C).toFixed(2);
    const empty = +(C - filled).toFixed(2);

    wrap.innerHTML = `
      <div class="pred-circle-wrap" id="predCircleBtn" role="button" tabindex="0" title="Ver detalle">
        <div class="pred-circle__chart">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="${R}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
            <circle cx="60" cy="60" r="${R}" fill="none" stroke="#39FF14" stroke-width="12"
              stroke-dasharray="${filled} ${empty}" stroke-linecap="round"
              transform="rotate(-90 60 60)" class="pred-circle__arc"/>
          </svg>
          <div class="pred-circle__label">
            <span class="pred-circle__pct">${pct}%</span>
          </div>
        </div>
        <p class="pred-circle__sub">${total_predictions} predicciones · ${correct_results} acertadas</p>
        <span class="btn btn--ghost btn--xs" style="margin-top:4px">Ver detalle →</span>
      </div>
    `;

    wrap.querySelector('#predCircleBtn')?.addEventListener('click', () => {
      showPredModal(predictions);
    });
    wrap.querySelector('#predCircleBtn')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') showPredModal(predictions);
    });
  } catch {
    wrap.innerHTML = '<p class="empty">No se pudieron cargar las predicciones.</p>';
  }
}

function showPredModal(allPreds) {
  let filter = 'all';

  const modal = document.createElement('div');
  modal.className = 'pred-modal';
  modal.innerHTML = `
    <div class="pred-modal__overlay" id="predModalOverlay"></div>
    <div class="pred-modal__box">
      <div class="pred-modal__header">
        <h3 class="pred-modal__title">Mis predicciones</h3>
        <button class="pred-modal__close" id="predModalClose" aria-label="Cerrar">✕</button>
      </div>
      <div class="pred-modal__filters">
        <button class="pred-filter pred-filter--active" data-filter="all">Todos</button>
        <button class="pred-filter" data-filter="correct">✅ Acertados</button>
        <button class="pred-filter" data-filter="wrong">❌ Fallados</button>
      </div>
      <div class="pred-modal__list" id="predModalList"></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('pred-modal--open'));

  function renderList() {
    const filtered = filter === 'all' ? allPreds
      : filter === 'correct' ? allPreds.filter(p => p.is_correct)
      : allPreds.filter(p => p.result_known && !p.is_correct);

    const listEl = document.getElementById('predModalList');
    if (!listEl) return;
    if (!filtered.length) {
      listEl.innerHTML = '<p class="empty" style="text-align:center;padding:1rem">Sin predicciones en este filtro.</p>';
      return;
    }
    listEl.innerHTML = filtered.map(p => {
      const icon = !p.result_known ? '⏳' : p.is_correct ? '✅' : '❌';
      const scoreStr = p.score ? `${p.score}` : '—';
      const ptsStr = p.result_known ? `+${fmtPts(p.points_earned)} pts` : '—';
      return `
        <div class="pred-item ${p.is_correct ? 'pred-item--correct' : p.result_known ? 'pred-item--wrong' : ''}">
          <span class="pred-item__icon">${icon}</span>
          <div class="pred-item__body">
            <p class="pred-item__teams">${escapeHtml(p.home_team)} vs ${escapeHtml(p.away_team)}</p>
            <div class="pred-item__row">
              <span class="pred-item__pred">Pred: <strong>${p.predicted_result}</strong></span>
              ${p.actual_result ? `<span class="pred-item__actual">Real: <strong>${p.actual_result}</strong> (${scoreStr})</span>` : '<span class="pred-item__actual">Sin resultado</span>'}
              <span class="pred-item__pts ${p.is_correct ? 'pred-item__pts--ok' : ''}">${ptsStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderList();

  modal.querySelectorAll('.pred-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.pred-filter').forEach(b => b.classList.remove('pred-filter--active'));
      btn.classList.add('pred-filter--active');
      filter = btn.dataset.filter;
      renderList();
    });
  });

  function close() {
    modal.classList.remove('pred-modal--open');
    document.body.style.overflow = '';
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
  }

  document.getElementById('predModalClose')?.addEventListener('click', close);
  document.getElementById('predModalOverlay')?.addEventListener('click', close);
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
