import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export async function renderLigaDetalle(el, { params }) {
  const leagueId = parseInt(params.id);
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { league, ranking, is_member } = await api.leagues.get(leagueId);
    const user = auth.getUser();

    el.innerHTML = `
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${league.name}</h1>
          <div class="league-header__meta">
            <span>${league.is_public ? '🌍 Pública' : '🔒 Privada'}</span>
            <span>${league.member_count} participantes</span>
            ${league.invite_code ? `<span class="invite-code">Código: <strong>${league.invite_code}</strong></span>` : ''}
          </div>
        </div>

        ${is_member
          ? `<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>`
          : user
            ? `<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>`
            : ''
        }

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

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p><a href="#/ligas">Volver</a></div>`;
  }
}
