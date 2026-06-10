import '../sass/main.scss';
import { router } from './router.js';
import { auth } from './auth.js';
import { api } from './api.js';

let userLeagues = [];
let deferredInstallPrompt = null;
let unreadPollInterval = null;

async function bootstrap() {
  await auth.init();
  router.init();
  setupNavbar();
  setupInstallBanner();
  setupPushNotifications();
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
  document.getElementById('userDropdown')?.classList.add('hidden');
  document.getElementById('userBtn')?.classList.remove('navbar__dropdown-btn--open');
}

async function checkTablonUnread() {
  const badge = document.getElementById('tablonBadge');
  if (!badge) return;

  const user = auth.getUser();
  if (!user) { badge.classList.add('hidden'); return; }

  const activeLeagueId = localStorage.getItem('activeLeagueId');
  if (!activeLeagueId) { badge.classList.add('hidden'); return; }

  const since = localStorage.getItem(`tablon_last_read_${activeLeagueId}`) || new Date(0).toISOString();

  try {
    const { count } = await api.board.unread(parseInt(activeLeagueId), since);
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch {
    badge.classList.add('hidden');
  }
}

function setupNavbar() {
  document.addEventListener('auth:change', updateNavState);

  window.addEventListener('hashchange', () => {
    closeAllDropdowns();
    updateBottomNavActive();
    setTimeout(checkTablonUnread, 200);
  });

  // Click outside → close all dropdowns
  document.addEventListener('click', closeAllDropdowns);

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
  const bottomNav = document.getElementById('bottomNav');
  const user = auth.getUser();

  closeAllDropdowns();

  if (user) {
    authLinks?.classList.add('hidden');
    if (navUsername) navUsername.textContent = user.username;
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
    syncActiveLeague(userLeagues);
    checkTablonUnread();
    if (unreadPollInterval) clearInterval(unreadPollInterval);
    unreadPollInterval = setInterval(checkTablonUnread, 5 * 60 * 1000);
  } else {
    authLinks?.classList.remove('hidden');
    userBtn.style.visibility = 'hidden';
    bottomNav?.classList.add('hidden');
    document.body.classList.remove('has-bottom-nav');
    userLeagues = [];
    localStorage.removeItem('activeLeagueId');
    if (unreadPollInterval) { clearInterval(unreadPollInterval); unreadPollInterval = null; }
  }

  updateBottomNavActive();
}

function syncActiveLeague(leagues) {
  const activeId = localStorage.getItem('activeLeagueId');
  const isValid = activeId && leagues.some(l => String(l.id) === String(activeId));

  // Already set to a valid league — respect the user's choice, don't overwrite
  if (isValid) return;

  // Not set or league no longer exists → fallback to first available
  if (leagues.length > 0) {
    localStorage.setItem('activeLeagueId', String(leagues[0].id));
  } else {
    localStorage.removeItem('activeLeagueId');
  }
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

// ──────────────────────────────────────────────────────────────────────────────
// Web Push
// ──────────────────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function setupPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');

    // Subscribe only when a user is logged in
    document.addEventListener('auth:change', async (e) => {
      if (!e.detail) return; // logged out
      await trySubscribePush(reg);
    });

    // Also try immediately if already logged in
    if (auth.getUser()) await trySubscribePush(reg);
  } catch (_) {}
}

async function trySubscribePush(registration) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Re-send to backend in case the token changed
      await api.notifications.subscribe(existing.toJSON());
      return;
    }

    const { public_key } = await api.notifications.vapidPublicKey();
    if (!public_key) return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key),
    });

    await api.notifications.subscribe(subscription.toJSON());
  } catch (_) {}
}

bootstrap();
