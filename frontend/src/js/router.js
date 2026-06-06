import { auth } from './auth.js';
import { renderHome } from './pages/home.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderQuiniela } from './pages/quiniela.js';
import { renderRanking } from './pages/ranking.js';
import { renderTablon } from './pages/tablon.js';
import { renderLigas } from './pages/ligas.js';
import { renderLigaDetalle } from './pages/liga-detalle.js';
import { renderPerfil } from './pages/perfil.js';
import { renderCampeon } from './pages/campeon.js';
import { renderAdmin } from './pages/admin.js';
import { renderForgotPassword } from './pages/forgot-password.js';
import { renderResetPassword } from './pages/reset-password.js';
import { renderResultados } from './pages/resultados.js';

const routes = {
  '/': renderHome,
  '/login': renderLogin,
  '/register': renderRegister,
  '/quiniela': renderQuiniela,
  '/resultados': renderResultados,
  '/ranking': renderRanking,
  '/tablon': renderTablon,
  '/ligas': renderLigas,
  '/ligas/:id': renderLigaDetalle,
  '/perfil': renderPerfil,
  '/campeon': renderCampeon,
  '/admin': renderAdmin,
  '/forgot-password': renderForgotPassword,
  '/reset-password': renderResetPassword,
};

function matchRoute(path) {
  for (const [pattern, handler] of Object.entries(routes)) {
    const paramNames = [];
    const regex = new RegExp(
      '^' + pattern.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      }) + '$'
    );
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { handler, params };
    }
  }
  return null;
}

const container = () => document.getElementById('mainContent');

export const router = {
  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },

  navigate(path) {
    window.location.hash = path;
  },

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryStr] = hash.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryStr || ''));

    const matched = matchRoute(path);
    if (!matched) {
      container().innerHTML = '<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';
      return;
    }

    const { handler, params } = matched;

    // Rutas protegidas
    const protectedRoutes = ['/perfil', '/campeon', '/admin'];
    if (protectedRoutes.includes(path) && !auth.isLoggedIn()) {
      this.navigate('/login');
      return;
    }
    if (path === '/admin' && !auth.isAdmin()) {
      this.navigate('/');
      return;
    }

    const el = container();
    el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
    handler(el, { params, query });
  },
};
