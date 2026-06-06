import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export async function renderLigas(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const [publicRes, myRes] = await Promise.all([
      api.leagues.public(),
      auth.isLoggedIn() ? api.leagues.my() : Promise.resolve({ leagues: [] }),
    ]);

    const user = auth.getUser();
    const myIds = new Set(myRes.leagues.map(l => l.id));
    const available = publicRes.leagues.filter(l => !myIds.has(l.id));

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${user && myRes.leagues.length > 0 ? `
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${myRes.leagues.map(leagueCard).join('')}</div>
          </section>
        ` : ''}

        ${user ? `
          <section class="section ligas-actions">
            <div class="ligas-actions__row">
              <button class="btn btn--primary" id="btnShowCreate">+ Crear liga</button>
              <form class="form form--inline" id="joinCodeForm">
                <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
                <button class="btn btn--outline" type="submit">Unirse</button>
              </form>
            </div>
            <div class="create-league-panel hidden" id="createLeaguePanel">
              <form class="form" id="createLeagueForm">
                <div class="form__group">
                  <label class="form__label" for="leagueName">Nombre de la liga</label>
                  <input class="form__input" type="text" id="leagueName" placeholder="Mi Liga Épica" required maxlength="100" />
                </div>
                <div class="form__group form__group--checkbox">
                  <input type="checkbox" id="isPublic" />
                  <label for="isPublic">Liga pública (visible para todos)</label>
                </div>
                <div class="form__actions">
                  <button class="btn btn--primary" type="submit">Crear liga</button>
                  <button class="btn btn--ghost" type="button" id="btnCancelCreate">Cancelar</button>
                </div>
              </form>
            </div>
          </section>
        ` : '<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>Ligas disponibles</h2>
          ${available.length
            ? `<div class="leagues-grid">${available.map(leagueCard).join('')}</div>`
            : myRes.leagues.length > 0
              ? '<p class="empty">Estás en todas las ligas públicas disponibles.</p>'
              : '<p class="empty">No hay ligas públicas aún. ¡Crea la primera!</p>'
          }
        </section>
      </div>
    `;

    // League card clicks
    el.querySelectorAll('.league-card').forEach(card => {
      card.addEventListener('click', () => router.navigate(`/ligas/${card.dataset.id}`));
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
      const name = document.getElementById('leagueName').value.trim();
      const is_public = document.getElementById('isPublic').checked;
      try {
        const { league } = await api.leagues.create({ name, is_public });
        showToast(`Liga "${league.name}" creada`);
        router.navigate(`/ligas/${league.id}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function leagueCard(league) {
  return `
    <div class="league-card" data-id="${league.id}">
      <div class="league-card__name">${league.name}</div>
      <div class="league-card__meta">
        <span>${league.is_public ? '🌍 Pública' : '🔒 Privada'}</span>
        <span>${league.member_count} participantes</span>
      </div>
      <div class="league-card__creator">por ${league.creator_username}</div>
    </div>
  `;
}
