import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export async function renderLigas(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const user = auth.getUser();
    const isAdmin = user?.is_admin;

    const [allRes, myRes] = await Promise.all([
      isAdmin ? api.leagues.adminAll() : api.leagues.all(),
      auth.isLoggedIn() && !isAdmin ? api.leagues.my() : Promise.resolve({ leagues: [] }),
    ]);

    const myIds = new Set(myRes.leagues.map(l => l.id));
    const available = isAdmin
      ? allRes.leagues  // admin sees all leagues
      : allRes.leagues.filter(l => !myIds.has(l.id));

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${isAdmin ? `
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        ` : ''}

        ${user && !isAdmin && myRes.leagues.length > 0 ? `
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${myRes.leagues.map(l => leagueCard(l, true)).join('')}</div>
          </section>
        ` : ''}

        ${user ? `
          <section class="section ligas-actions">
            <div class="ligas-actions__row">
              <button class="btn btn--primary" id="btnShowCreate">+ Crear liga</button>
              ${!isAdmin ? `
              <form class="form form--inline" id="joinCodeForm">
                <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
                <button class="btn btn--outline" type="submit">Unirse</button>
              </form>` : ''}
            </div>
            <div class="create-league-panel hidden" id="createLeaguePanel">
              <form class="form" id="createLeagueForm">
                <div class="form__group">
                  <label class="form__label" for="leagueName">Nombre de la liga</label>
                  <input class="form__input" type="text" id="leagueName" placeholder="Mi Liga Épica" required maxlength="100" />
                </div>
                <div class="form__group">
                  <label class="form__label" for="leagueDesc">Descripción (opcional)</label>
                  <input class="form__input" type="text" id="leagueDesc" placeholder="Una liga entre amigos..." maxlength="300" />
                </div>
                <div class="form__group">
                  <label class="form__label" for="leaguePrize">Premio (opcional)</label>
                  <input class="form__input" type="text" id="leaguePrize" placeholder="Una cena, un trofeo..." maxlength="200" />
                </div>
                <div class="form__group form__group--checkbox">
                  <input type="checkbox" id="isPublic" checked />
                  <label for="isPublic">Liga pública (visible para todos)</label>
                </div>
                ${user.is_admin ? `
                  <div class="form__group form__group--checkbox">
                    <input type="checkbox" id="isOfficial" />
                    <label for="isOfficial">⭐ Liga Oficial</label>
                  </div>
                ` : ''}
                <div class="form__actions">
                  <button class="btn btn--primary" type="submit" id="createBtn">Crear liga</button>
                  <button class="btn btn--ghost" type="button" id="btnCancelCreate">Cancelar</button>
                </div>
              </form>
            </div>
          </section>
        ` : '<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>${isAdmin ? 'Todas las ligas' : 'Ligas disponibles'}</h2>
          ${available.length
            ? `<div class="leagues-grid">${available.map(l => leagueCard(l, false, myIds, isAdmin)).join('')}</div>`
            : isAdmin
              ? '<p class="empty">No hay ligas creadas aún.</p>'
              : myRes.leagues.length > 0
                ? '<p class="empty">Ya participas en todas las ligas disponibles.</p>'
                : '<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'
          }
        </section>
      </div>
    `;

    // Card navigation (only to leagues the user is member of, or public ones)
    el.querySelectorAll('.league-card[data-navigate="true"]').forEach(card => {
      card.addEventListener('click', () => router.navigate(`/ligas/${card.dataset.id}`));
    });

    // "Unirse" buttons on public leagues
    el.querySelectorAll('.btn-join-league').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const leagueId = parseInt(btn.dataset.id);
        btn.disabled = true;
        btn.textContent = '…';
        try {
          const { league } = await api.leagues.join({ league_id: leagueId });
          showToast(`¡Te has unido a "${league.name}"!`);
          router.navigate(`/ligas/${league.id}`);
        } catch (err) {
          showToast(err.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Unirse';
        }
      });
    });

    // "Solicitar enlace" buttons on private leagues
    el.querySelectorAll('.btn-private-info').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.', 'info');
      });
    });

    // Toggle create panel
    document.getElementById('btnShowCreate')?.addEventListener('click', () => {
      document.getElementById('createLeaguePanel')?.classList.remove('hidden');
      document.getElementById('btnShowCreate')?.classList.add('hidden');
    });
    document.getElementById('btnCancelCreate')?.addEventListener('click', () => {
      document.getElementById('createLeaguePanel')?.classList.add('hidden');
      document.getElementById('btnShowCreate')?.classList.remove('hidden');
    });

    // Join by code
    document.getElementById('joinCodeForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('inviteCode').value.trim().toUpperCase();
      if (!code) return;
      try {
        const { league } = await api.leagues.join({ invite_code: code });
        showToast(`Te has unido a "${league.name}"`);
        router.navigate(`/ligas/${league.id}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Create league
    document.getElementById('createLeagueForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('createBtn');
      btn.disabled = true;
      btn.textContent = 'Creando…';

      const name = document.getElementById('leagueName').value.trim();
      const description = document.getElementById('leagueDesc').value.trim();
      const prize = document.getElementById('leaguePrize').value.trim();
      const is_public = document.getElementById('isPublic').checked;
      const is_official = document.getElementById('isOfficial')?.checked ?? false;

      try {
        const { league } = await api.leagues.create({ name, description, prize, is_public, is_official });
        showInviteSuccess(league);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Crear liga';
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function leagueCard(league, isMine = false, myIds = new Set(), isAdmin = false) {
  const officialBadge = league.is_official
    ? '<span class="league-badge league-badge--official">⭐ Oficial</span>'
    : '';
  const visibilityIcon = league.is_public ? '🌍' : '🔒';

  const actionBtn = isAdmin
    ? `<button class="btn btn--sm btn--outline btn-admin-view" data-id="${league.id}">Ver (admin)</button>`
    : isMine
      ? `<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${league.id}'">Ver liga</button>`
      : league.is_public
        ? `<button class="btn btn--sm btn--primary btn-join-league" data-id="${league.id}">Unirse</button>`
        : `<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>`;

  return `
    <div class="league-card ${isMine ? 'league-card--mine' : ''}" data-id="${league.id}" data-navigate="${isMine || isAdmin}">
      <div class="league-card__top">
        <div class="league-card__name">${league.name} ${officialBadge}</div>
      </div>
      ${league.description ? `<p class="league-card__desc">${league.description}</p>` : ''}
      <div class="league-card__meta">
        <span>${visibilityIcon} ${league.is_public ? 'Pública' : 'Privada'}</span>
        <span>${league.member_count} participantes</span>
        ${league.prize ? `<span>🏆 ${league.prize}</span>` : ''}
      </div>
      <div class="league-card__footer">
        <span class="league-card__creator">por ${league.creator_username}</span>
        ${actionBtn}
      </div>
    </div>
  `;
}

function showInviteSuccess(league) {
  const inviteLink = league.invite_link || '';
  const panel = document.getElementById('createLeaguePanel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="invite-success">
      <div class="invite-success__title">✅ Liga "${league.name}" creada</div>
      <p class="invite-success__text">Comparte este enlace para invitar a tus amigos:</p>
      <div class="invite-link-box">
        <span class="invite-link-box__url" id="inviteLinkText">${inviteLink}</span>
        <button class="btn btn--sm btn--outline" id="btnCopyLink">Copiar</button>
      </div>
      ${navigator.share ? `<button class="btn btn--primary" id="btnShare">Compartir</button>` : ''}
      <a href="#/ligas/${league.id}" class="btn btn--ghost">Ir a la liga</a>
    </div>
  `;

  document.getElementById('btnCopyLink')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast('Enlace copiado');
    } catch {
      showToast('No se pudo copiar', 'error');
    }
  });

  document.getElementById('btnShare')?.addEventListener('click', async () => {
    try {
      await navigator.share({ title: `Únete a ${league.name} en PickGoal`, url: inviteLink });
    } catch (_) {}
  });
}
