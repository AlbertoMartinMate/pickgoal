import '../sass/main.scss';
import { router } from './router.js';
import { auth } from './auth.js';
import { api } from './api.js';
import { formatDate } from './ui.js';

let userLeagues = [];
let deferredInstallPrompt = null;
let unreadPollInterval = null;
let notifPanelOpen = false;

async function bootstrap() {
  document.documentElement.dataset.build = __BUILD_DATE__;
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
    <span class="install-banner__text">📱 Instala PickGoal en tu móvil</span>
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

async function checkProfileBadge() {
  const badge = document.getElementById('perfilBadge');
  const navDot = document.getElementById('navMensajesDot');

  const user = auth.getUser();
  if (!user) {
    badge?.classList.add('hidden');
    navDot?.classList.add('hidden');
    return;
  }

  try {
    const since = localStorage.getItem('tablon_general_last_read') || new Date(0).toISOString();
    const [mentionsRes, pmRes] = await Promise.all([
      api.board.mentions(since).catch(e => { console.warn('[perfilBadge] mentions error:', e); return { count: 0 }; }),
      api.messages.unread().catch(e => { console.warn('[perfilBadge] pm unread error:', e); return { count: 0 }; }),
    ]);
    const mentionCount = mentionsRes.count || 0;
    const pmCount = pmRes.count || 0;
    console.log('[perfilBadge] mentions:', mentionCount, 'pm:', pmCount);
    badge?.classList.toggle('hidden', mentionCount + pmCount === 0);
    navDot?.classList.toggle('hidden', pmCount === 0);
  } catch (e) {
    console.warn('[perfilBadge] error:', e);
    badge?.classList.add('hidden');
    navDot?.classList.add('hidden');
  }
}

async function checkTablonUnread() {
  const badge = document.getElementById('tablonBadge');
  if (!badge) return;

  const user = auth.getUser();
  if (!user) { badge.classList.add('hidden'); return; }

  const since = localStorage.getItem('tablon_general_last_read') || new Date(0).toISOString();

  try {
    const { count } = await api.board.unread(null, since);
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
    setTimeout(checkProfileBadge, 200);
  });

  document.addEventListener('tablon:read', () => {
    checkProfileBadge();
    checkTablonUnread();
  });

  document.addEventListener('messages:read', () => {
    checkProfileBadge();
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

  // Mensajes link: open notifications panel
  document.getElementById('navMensajesLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllDropdowns();
    if (notifPanelOpen) {
      closeNotifPanel();
    } else {
      await openNotifPanel();
    }
  });

  // Close notif panel on click outside
  document.addEventListener('click', (e) => {
    if (notifPanelOpen && !e.target.closest('#notifPanel') && !e.target.closest('#navMensajesLink')) {
      closeNotifPanel();
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
    console.log('[navbar] userBtn visibility:', userBtn.style.visibility, 'computed:', getComputedStyle(userBtn).visibility, 'offsetWidth:', userBtn.offsetWidth, 'right rect:', userBtn.getBoundingClientRect().right);
    bottomNav?.classList.remove('hidden');
    document.body.classList.add('has-bottom-nav');
    document.getElementById('navAdminLink')?.classList.toggle('hidden', !user.is_admin);

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
    checkProfileBadge();
    if (unreadPollInterval) clearInterval(unreadPollInterval);
    unreadPollInterval = setInterval(() => { checkTablonUnread(); checkProfileBadge(); }, 5 * 60 * 1000);
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

// ──────────────────────────────────────────────────────────────────────────────
// Notif Panel
// ──────────────────────────────────────────────────────────────────────────────

function closeNotifPanel() {
  document.getElementById('notifPanel')?.classList.add('hidden');
  notifPanelOpen = false;
}

async function openNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const body = document.getElementById('notifPanelBody');
  if (!panel || !body) return;

  notifPanelOpen = true;
  panel.classList.remove('hidden');
  body.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    // Use last 30 days as window for notable tablón messages
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [convRes, boardRes, mentionsRes] = await Promise.all([
      api.messages.list().catch(() => ({ conversations: [] })),
      api.board.messages(1, null).catch(() => ({ messages: [] })),
      api.board.mentions(since30d).catch(() => ({ messages: [] })),
    ]);

    const convs = (convRes.conversations || []).slice(0, 5);
    const boardMsgs = (boardRes.messages || []).slice(0, 5);
    const notableIds = new Set((mentionsRes.messages || []).map(m => m.id));

    body.innerHTML = buildNotifPanelHtml(convs, boardMsgs, notableIds);

    body.querySelectorAll('.notif-item[data-nav]').forEach(item => {
      item.addEventListener('click', () => {
        closeNotifPanel();
        window.location.hash = item.dataset.nav;
      });
    });

  } catch {
    body.innerHTML = '<p class="notif-panel__empty">Error cargando notificaciones</p>';
  }
}

function buildNotifPanelHtml(convs, boardMsgs, notableIds) {
  const pmHtml = convs.length === 0
    ? '<p class="notif-panel__empty">Aún no tienes mensajes</p>'
    : convs.map(c => `
        <div class="notif-item" data-nav="/mensajes/${c.user_id}">
          <div class="notif-item__avatar">${notifEscHtml(c.username[0].toUpperCase())}</div>
          <div class="notif-item__content">
            <div class="notif-item__header">
              <strong class="notif-item__name">${notifEscHtml(c.username)}</strong>
              ${c.unread_count > 0 ? `<span class="notif-item__badge">${c.unread_count}</span>` : ''}
            </div>
            <p class="notif-item__text">${notifEscHtml((c.last_message || '').slice(0, 70))}${(c.last_message || '').length > 70 ? '…' : ''}</p>
          </div>
        </div>
      `).join('') + `<a class="notif-panel__link" href="#/mensajes">Ver todos los mensajes →</a>`;

  const boardHtml = boardMsgs.length === 0
    ? '<p class="notif-panel__empty">Aún no hay mensajes en el tablón</p>'
    : boardMsgs.map(m => {
        const notable = notableIds.has(m.id);
        return `
          <div class="notif-item${notable ? ' notif-item--notable' : ''}" data-nav="/tabla-v2?tab=tablon">
            <div class="notif-item__avatar">${notifEscHtml(m.username[0].toUpperCase())}</div>
            <div class="notif-item__content">
              <div class="notif-item__header">
                <strong class="notif-item__name">${notifEscHtml(m.username)}</strong>
                ${notable ? '<span class="notif-item__mention">@tú / admin</span>' : ''}
                <span class="notif-item__time">${formatDate(m.created_at)}</span>
              </div>
              <p class="notif-item__text">${notifEscHtml((m.message || '').slice(0, 80))}${(m.message || '').length > 80 ? '…' : ''}</p>
            </div>
          </div>
        `;
      }).join('') + `<a class="notif-panel__link" href="#/tabla-v2?tab=tablon">Ver tablón →</a>`;

  return `
    <div class="notif-panel__section">
      <h4 class="notif-panel__title">💬 Mensajes privados</h4>
      ${pmHtml}
    </div>
    <div class="notif-panel__section">
      <h4 class="notif-panel__title">📣 Tablón general</h4>
      ${boardHtml}
    </div>
  `;
}

function notifEscHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

bootstrap();
