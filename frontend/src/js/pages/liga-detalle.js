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

    const officialBadge = league.is_official
      ? '<span class="league-badge league-badge--official">⭐ Oficial</span>'
      : '';

    el.innerHTML = `
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${league.name} ${officialBadge}</h1>
          ${league.description ? `<p class="league-header__desc">${league.description}</p>` : ''}
          <div class="league-header__meta">
            <span>${league.is_public ? '🌍 Pública' : '🔒 Privada'}</span>
            <span>${league.member_count} participantes</span>
            ${league.prize ? `<span>🏆 ${league.prize}</span>` : ''}
          </div>
        </div>

        ${is_member && league.invite_link ? `
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${league.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share ? `<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>` : ''}
            </div>
          </div>
        ` : ''}

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

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p><a href="#/ligas">Volver</a></div>`;
  }
}
