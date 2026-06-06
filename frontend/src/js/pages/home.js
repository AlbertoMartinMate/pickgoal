import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate } from '../ui.js';

export async function renderHome(el) {
  const user = auth.getUser();

  if (!user) {
    renderGuest(el);
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { leagues_summary, upcoming_matches } = await api.home.summary();

    if (leagues_summary.length === 0) {
      renderNoLeague(el);
      return;
    }

    const activeId = (() => { const r = localStorage.getItem('activeLeagueId'); return r ? parseInt(r) : null; })();
    // Ordenar: liga activa primero
    const sorted = [...leagues_summary].sort((a, b) =>
      a.league_id === activeId ? -1 : b.league_id === activeId ? 1 : 0
    );

    el.innerHTML = `
      <div class="home-dashboard container">
        <div class="home-dashboard__leagues">
          ${sorted.map(s => leagueCard(s)).join('')}
        </div>
        ${upcomingSection(upcoming_matches)}
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando el inicio: ${err.message}</p></div>`;
  }
}

function renderGuest(el) {
  el.innerHTML = `
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
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

function renderNoLeague(el) {
  el.innerHTML = `
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `;
}

function ordinal(n) {
  return `${n}º`;
}

function leagueCard(s) {
  const nextHtml = s.next_to_predict
    ? `<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${s.next_to_predict.home_team} vs ${s.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${formatDate(s.next_to_predict.match_datetime)}</span>
       </div>`
    : `<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`;

  return `
    <div class="league-card">
      <div class="league-card__header">
        <h2 class="league-card__name">${s.league_name}</h2>
        <span class="league-card__rank">${ordinal(s.rank)} de ${s.member_count}</span>
      </div>
      <div class="league-card__stats">
        <div class="league-card__stat">
          <span class="league-card__stat-val">${s.total_points}</span>
          <span class="league-card__stat-label">Puntos</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${s.correct_results}/${s.predictions_made}</span>
          <span class="league-card__stat-label">1X2</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${s.exact_scores}/${s.predictions_made}</span>
          <span class="league-card__stat-label">Exactos</span>
        </div>
      </div>
      ${nextHtml}
      <a class="league-card__cta btn btn--ghost btn--sm" href="#/ranking">Ver clasificación</a>
    </div>
  `;
}

function upcomingSection(matches) {
  if (!matches.length) return '';
  return `
    <section class="upcoming-matches">
      <h2 class="upcoming-matches__title">Próximos partidos</h2>
      <div class="upcoming-matches__list">
        ${matches.map(({ match: m, has_prediction }) => `
          <div class="upcoming-match">
            <div class="upcoming-match__teams">
              <span>${m.home_team}</span>
              <span class="upcoming-match__vs">vs</span>
              <span>${m.away_team}</span>
            </div>
            <div class="upcoming-match__meta">
              <span class="upcoming-match__date">${formatDate(m.match_datetime)}</span>
              ${has_prediction
                ? '<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>'
                : '<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'
              }
            </div>
          </div>
        `).join('')}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `;
}
