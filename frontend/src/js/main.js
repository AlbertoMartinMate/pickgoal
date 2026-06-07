import '../sass/main.scss';
import { router } from './router.js';
import { auth } from './auth.js';
import { api } from './api.js';

let userLeagues = [];
let deferredInstallPrompt = null;

async function bootstrap() {
  await auth.init();
  router.init();
  setupNavbar();
  setupInstallBanner();
}

function isAppInstalled() {
  return localStorage.getItem('pwa_installed') === 'true'
    || window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function setupInstallBanner() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    if (isAppInstalled()) return;
    deferredInstallPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa_installed', 'true');
    deferredInstallPrompt = null;
    document.getElementById('installBanner')?.remove();
  });
}

function showInstallBanner() {
  if (isAppInstalled()) return;
  if (sessionStorage.getItem('installBannerDismissed')) return;

  const banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.className = 'install-banner';
  banner.innerHTML = `
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('installBtn').addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    banner.remove();
  });

  document.getElementById('installDismissBtn').addEventListener('click', () => {
    sessionStorage.setItem('installBannerDismissed', '1');
    banner.remove();
  });
}

function closeAllDropdowns() {
  document.getElementById('leagueDropdown')?.classList.add('hidden');
  document.getElementById('leagueBtn')?.classList.remove('navbar__dropdown-btn--open');
  document.getElementById('userDropdown')?.classList.add('hidden');
  document.getElementById('userBtn')?.classList.remove('navbar__dropdown-btn--open');
}

function setupNavbar() {
  document.addEventListener('auth:change', updateNavState);

  window.addEventListener('hashchange', () => {
    closeAllDropdowns();
    updateBottomNavActive();
  });

  // Click outside → close all dropdowns
  document.addEventListener('click', closeAllDropdowns);

  // League button toggle
  document.getElementById('leagueBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('leagueDropdown');
    const isHidden = dropdown?.classList.contains('hidden');
    closeAllDropdowns();
    if (isHidden) {
      dropdown?.classList.remove('hidden');
      document.getElementById('leagueBtn')?.classList.add('navbar__dropdown-btn--open');
    }
  });

  // League dropdown: delegation (select league or navigate to ligas)
  document.getElementById('leagueDropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('[data-league-id]');
    if (item) {
      const newId = String(item.dataset.leagueId);
      localStorage.setItem('activeLeagueId', newId);
      closeAllDropdowns();
      renderLeagueDropdown(userLeagues);
      router.resolve();  // re-render current page with new active league
      return;
    }
    // "Ver ligas disponibles" link
    if (e.target.closest('a')) {
      closeAllDropdowns();
    }
  });

  // User button toggle
  document.getElementById('userBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    const isHidden = dropdown?.classList.contains('hidden');
    closeAllDropdowns();
    if (isHidden) {
      dropdown?.classList.remove('hidden');
      document.getElementById('userBtn')?.classList.add('navbar__dropdown-btn--open');
    }
  });

  // User dropdown: stop propagation + handle items
  document.getElementById('userDropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('#navProfileLink')) {
      closeAllDropdowns();
    }
  });

  // Logout
  document.getElementById('navLogoutBtn')?.addEventListener('click', () => {
    userLeagues = [];
    localStorage.removeItem('activeLeagueId');
    closeAllDropdowns();
    auth.logout();
    router.navigate('/');
  });

  updateNavState();
}

async function updateNavState() {
  const authLinks = document.getElementById('navAuthLinks');
  const userBtn = document.getElementById('userBtn');
  const navUsername = document.getElementById('navUsername');
  const navLeague = document.getElementById('navLeague');
  const bottomNav = document.getElementById('bottomNav');
  const user = auth.getUser();

  closeAllDropdowns();

  if (user) {
    authLinks?.classList.add('hidden');
    if (navUsername) navUsername.textContent = user.username;
    // Make both buttons visible
    navLeague.style.visibility = 'visible';
    userBtn.style.visibility = 'visible';
    bottomNav?.classList.remove('hidden');
    document.body.classList.add('has-bottom-nav');

    try {
      const { leagues } = user.is_admin
        ? await api.leagues.adminAll()
        : await api.leagues.my();
      userLeagues = leagues;
    } catch {
      userLeagues = [];
    }
    renderLeagueDropdown(userLeagues);
  } else {
    authLinks?.classList.remove('hidden');
    // Keep space but hide buttons
    navLeague.style.visibility = 'hidden';
    userBtn.style.visibility = 'hidden';
    bottomNav?.classList.add('hidden');
    document.body.classList.remove('has-bottom-nav');
    userLeagues = [];
    localStorage.removeItem('activeLeagueId');
  }

  updateBottomNavActive();
}

function renderLeagueDropdown(leagues) {
  const dropdown = document.getElementById('leagueDropdown');
  const nameEl = document.getElementById('navLeagueName');
  if (!dropdown || !nameEl) return;

  let activeId = localStorage.getItem('activeLeagueId');
  let activeLeague = leagues.find(l => String(l.id) === String(activeId));

  if (!activeLeague && leagues.length > 0) {
    activeLeague = leagues[0];
    localStorage.setItem('activeLeagueId', String(activeLeague.id));
  }
  if (!activeLeague) localStorage.removeItem('activeLeagueId');

  nameEl.textContent = activeLeague ? activeLeague.name : 'Inicia Liga';

  const items = leagues.map(l => `
    <button class="navbar__dropdown-item ${String(l.id) === String(activeLeague?.id) ? 'navbar__dropdown-item--active' : ''}" data-league-id="${l.id}">${l.name}</button>
  `).join('');

  dropdown.innerHTML = `
    ${items}
    <a href="#/ligas" class="navbar__dropdown-item navbar__dropdown-item--muted">
      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      Ver ligas disponibles
    </a>
  `;
}

function updateBottomNavActive() {
  const path = window.location.hash.slice(1).split('?')[0] || '/';
  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    const route = item.dataset.route;
    const isActive = route === '/'
      ? path === '/'
      : path === route || path.startsWith(route + '/');
    item.classList.toggle('bottom-nav__item--active', isActive);
  });
}

bootstrap();
