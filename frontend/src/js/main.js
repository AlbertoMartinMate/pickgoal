import '../sass/main.scss';
import { router } from './router.js';
import { auth } from './auth.js';

async function bootstrap() {
  await auth.init();
  router.init();
  setupNavbar();
}

function setupNavbar() {
  const btnLogout = document.getElementById('btnLogout');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  btnLogout?.addEventListener('click', () => {
    auth.logout();
    router.navigate('/');
  });

  navToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('navbar__menu--open');
  });

  document.addEventListener('auth:change', updateNavState);
  updateNavState();
}

function updateNavState() {
  const authLinks = document.getElementById('navAuthLinks');
  const userLinks = document.getElementById('navUserLinks');
  const adminLink = document.getElementById('navAdminLink');
  const user = auth.getUser();

  if (user) {
    authLinks?.classList.add('hidden');
    userLinks?.classList.remove('hidden');
    if (user.is_admin && !adminLink) {
      const li = document.createElement('li');
      li.id = 'navAdminLink';
      li.innerHTML = '<a href="#/admin" class="nav-link nav-link--admin">Admin</a>';
      userLinks?.parentNode?.insertBefore(li, userLinks.nextSibling);
    }
  } else {
    authLinks?.classList.remove('hidden');
    userLinks?.classList.add('hidden');
    adminLink?.remove();
  }
}

bootstrap();
