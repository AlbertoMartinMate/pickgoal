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
    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${user ? `
          <section class="section">
            <h2>Mis ligas</h2>
            ${myRes.leagues.length
              ? `<div class="leagues-grid">${myRes.leagues.map(leagueCard).join('')}</div>`
              : '<p class="empty">No perteneces a ninguna liga aún.</p>'
            }
          </section>

          <section class="section">
            <h2>Unirse con código</h2>
            <form class="form form--inline" id="joinCodeForm">
              <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
              <button class="btn btn--primary" type="submit">Unirse</button>
            </form>
          </section>

          <section class="section">
            <h2>Crear nueva liga</h2>
            <form class="form" id="createLeagueForm">
              <div class="form__group">
                <label class="form__label" for="leagueName">Nombre</label>
                <input class="form__input" type="text" id="leagueName" placeholder="Mi Liga Épica" required maxlength="100" />
              </div>
              <div class="form__group form__group--checkbox">
                <input type="checkbox" id="isPublic" />
                <label for="isPublic">Liga pública (visible para todos)</label>
              </div>
              <button class="btn btn--primary" type="submit">Crear liga</button>
            </form>
          </section>
        ` : '<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>Ligas públicas</h2>
          ${publicRes.leagues.length
            ? `<div class="leagues-grid">${publicRes.leagues.map(leagueCard).join('')}</div>`
            : '<p class="empty">No hay ligas públicas aún.</p>'
          }
        </section>
      </div>
    `;

    el.querySelectorAll('.league-card').forEach(card => {
      card.addEventListener('click', () => {
        router.navigate(`/ligas/${card.dataset.id}`);
      });
    });

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
