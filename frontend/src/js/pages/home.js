import { auth } from '../auth.js';

export function renderHome(el) {
  const user = auth.getUser();
  el.innerHTML = `
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">⚽ PickGoal</h1>
        <p class="hero__subtitle">La quiniela oficial del Mundial de Fútbol 2026</p>
        ${user
          ? `<div class="hero__cta">
               <a href="#/quiniela" class="btn btn--primary btn--lg">Ver Quiniela</a>
               <a href="#/campeon" class="btn btn--secondary btn--lg">Predecir Campeón</a>
             </div>`
          : `<div class="hero__cta">
               <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
               <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
             </div>`
        }
      </div>
    </section>

    <section class="features container">
      <div class="features__grid">
        <div class="feature-card">
          <span class="feature-card__icon">📋</span>
          <h3>Quiniela completa</h3>
          <p>Predice los 104 partidos del Mundial, desde grupos hasta la final.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">🏆</span>
          <h3>Ligas privadas y públicas</h3>
          <p>Compite con amigos en ligas privadas o únete a ligas públicas.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">⚡</span>
          <h3>Resultados en tiempo real</h3>
          <p>Los puntos se calculan automáticamente al terminar cada partido.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">🌟</span>
          <h3>Predice el campeón</h3>
          <p>Gana 10 puntos extra si aciertas el campeón del mundo antes del inicio.</p>
        </div>
      </div>
    </section>
  `;
}
