import '../sass/main.scss';
import { router } from './router.js';
import { auth } from './auth.js';

async function bootstrap() {
  await auth.init();
  router.init();
  setupNavbar();
}

function setupNavbar() {
  document.addEventListener('auth:change', updateNavState);
  window.addEventListener('hashchange', updateBottomNavActive);
  updateNavState();
}

function updateNavState() {
  const authLinks = document.getElementById('navAuthLinks');
  const navUsername = document.getElementById('navUsername');
  const bottomNav = document.getElementById('bottomNav');
  const user = auth.getUser();

  if (user) {
    authLinks?.classList.add('hidden');
    navUsername?.classList.remove('hidden');
    if (navUsername) navUsername.textContent = user.username;
    bottomNav?.classList.remove('hidden');
    document.body.classList.add('has-bottom-nav');
  } else {
    authLinks?.classList.remove('hidden');
    navUsername?.classList.add('hidden');
    bottomNav?.classList.add('hidden');
    document.body.classList.remove('has-bottom-nav');
  }

  updateBottomNavActive();
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
