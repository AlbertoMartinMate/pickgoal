import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export async function renderUnirse(el, { query }) {
  const codigo = (query.codigo || '').trim().toUpperCase();

  if (!codigo) {
    el.innerHTML = `<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>`;
    return;
  }

  if (!auth.isLoggedIn()) {
    // Save code and redirect to register
    sessionStorage.setItem('pendingInviteCode', codigo);
    router.navigate('/register');
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { league } = await api.leagues.joinByCode(codigo);
    showToast(`¡Te has unido a "${league.name}"!`);
    router.navigate(`/ligas/${league.id}`);
  } catch (err) {
    if (err.status === 409) {
      // Already a member — just navigate to the league
      showToast('Ya eres miembro de esta liga');
      // Fetch the league to get its ID
      try {
        const { leagues } = await api.leagues.my();
        const found = leagues.find(l => l.invite_code === codigo);
        if (found) {
          router.navigate(`/ligas/${found.id}`);
          return;
        }
      } catch (_) {}
    }
    el.innerHTML = `
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${err.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `;
  }
}
