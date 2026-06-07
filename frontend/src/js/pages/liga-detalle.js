import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export async function renderLigaDetalle(el, { params }) {
  const leagueId = parseInt(params.id);
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const response = await api.leagues.get(leagueId);
    console.log('[liga-detalle] API response for league', leagueId, ':', JSON.stringify(response));
    const { league, ranking, is_member, is_admin_view } = response;
    const user = auth.getUser();
    console.log('[liga-detalle] user:', JSON.stringify(user));

    const officialBadge = league.is_official
      ? '<span class="league-badge league-badge--official">⭐ Oficial</span>'
      : '';

    el.innerHTML = `
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${is_admin_view ? `
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        ` : ''}

        <div class="league-header">
          <h1 class="page-title">${league.name} ${officialBadge}</h1>
          ${league.description ? `<p class="league-header__desc">${league.description}</p>` : ''}
          <div class="league-header__meta">
            <span>${league.is_public ? '🌍 Pública' : '🔒 Privada'}</span>
            <span>${league.member_count} participantes</span>
            ${league.prize ? `<span>🏆 ${league.prize}</span>` : ''}
          </div>
        </div>

        ${(is_member || user?.is_admin) && league.invite_link ? `
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${league.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share ? `<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>` : ''}
            </div>
          </div>
        ` : ''}

        <div class="league-actions">
          ${is_member
            ? `<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>`
            : !user?.is_admin && user
              ? `<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>`
              : ''
          }
          ${(() => {
            const canEdit = user?.is_admin || (is_member && user && league.created_by === user.id);
            console.log('[liga-detalle] canEdit:', canEdit, '| user.is_admin:', user?.is_admin, '| is_member:', is_member, '| created_by:', league.created_by, '| user.id:', user?.id);
            return canEdit ? `<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>` : '';
          })()}
        </div>

        <section class="section">
          <h2>Clasificación</h2>
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>País</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              ${ranking.map(u => `
                <tr class="${user && u.id === user.id ? 'ranking-table__row--me' : ''}">
                  <td>${u.position}</td>
                  <td>${u.username}</td>
                  <td>${u.country || '—'}</td>
                  <td class="ranking-table__pts">${u.total_points}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
    `;

    document.getElementById('btnCopyInvite')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(league.invite_link);
        showToast('Enlace copiado');
      } catch {
        showToast('No se pudo copiar', 'error');
      }
    });

    document.getElementById('btnShareInvite')?.addEventListener('click', async () => {
      try {
        await navigator.share({ title: `Únete a ${league.name} en PickGoal`, url: league.invite_link });
      } catch (_) {}
    });

    document.getElementById('btnLeave')?.addEventListener('click', async () => {
      if (!confirm('¿Seguro que quieres abandonar esta liga?')) return;
      try {
        await api.leagues.leave(leagueId);
        showToast('Has abandonado la liga');
        router.navigate('/ligas');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btnJoin')?.addEventListener('click', async () => {
      try {
        await api.leagues.join({ league_id: leagueId });
        showToast('¡Te has unido a la liga!');
        router.navigate(`/ligas/${leagueId}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btnEditLeague')?.addEventListener('click', () => {
      openEditModal(league, leagueId, user);
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p><a href="#/ligas">Volver</a></div>`;
  }
}

function openEditModal(league, leagueId, user) {
  const existing = document.getElementById('editLeagueModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'editLeagueModal';
  modal.className = 'edit-league-modal';
  modal.innerHTML = `
    <div class="edit-league-modal__overlay"></div>
    <div class="edit-league-modal__box">
      <h2 class="edit-league-modal__title">Editar liga</h2>
      <form class="form" id="editLeagueForm">
        <div class="form__group">
          <label class="form__label" for="editName">Nombre</label>
          <input class="form__input" type="text" id="editName" value="${league.name}" required maxlength="100" />
        </div>
        <div class="form__group">
          <label class="form__label" for="editDesc">Descripción</label>
          <input class="form__input" type="text" id="editDesc" value="${league.description || ''}" maxlength="300" />
        </div>
        <div class="form__group">
          <label class="form__label" for="editPrize">Premio</label>
          <input class="form__input" type="text" id="editPrize" value="${league.prize || ''}" maxlength="200" />
        </div>
        <div class="form__group form__group--checkbox">
          <input type="checkbox" id="editPublic" ${league.is_public ? 'checked' : ''} />
          <label for="editPublic">Liga pública</label>
        </div>
        ${user?.is_admin ? `
          <div class="form__group form__group--checkbox">
            <input type="checkbox" id="editOfficial" ${league.is_official ? 'checked' : ''} />
            <label for="editOfficial">⭐ Liga Oficial</label>
          </div>
        ` : ''}
        <div class="form__actions">
          <button class="btn btn--primary" type="submit" id="btnSaveEdit">Guardar cambios</button>
          <button class="btn btn--ghost" type="button" id="btnCancelEdit">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('edit-league-modal--open'));

  const close = () => {
    modal.classList.remove('edit-league-modal--open');
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
  };

  modal.querySelector('.edit-league-modal__overlay').addEventListener('click', close);
  document.getElementById('btnCancelEdit').addEventListener('click', close);

  document.getElementById('editLeagueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSaveEdit');
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    const payload = {
      name: document.getElementById('editName').value.trim(),
      description: document.getElementById('editDesc').value.trim(),
      prize: document.getElementById('editPrize').value.trim(),
      is_public: document.getElementById('editPublic').checked,
    };
    if (user?.is_admin) {
      payload.is_official = document.getElementById('editOfficial').checked;
    }

    try {
      await api.leagues.update(leagueId, payload);
      showToast('Liga actualizada');
      close();
      router.navigate(`/ligas/${leagueId}`);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
    }
  });
}
