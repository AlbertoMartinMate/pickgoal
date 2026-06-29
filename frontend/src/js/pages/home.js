import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';
import { formatDate, pointsModalHtml, attachPointsModal } from '../ui.js';

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
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>
        <div class="home-dashboard__leagues">
          ${sorted.map(s => leagueCard(s)).join('')}
        </div>
        ${upcomingSection(upcoming_matches)}
      </div>
      ${pointsModalHtml()}
    `;
    attachPointsModal(el);

    el.querySelectorAll('.league-card[data-league-id]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-go-ranking]') || e.target.closest('a')) return;
        localStorage.setItem('activeLeagueId', card.dataset.leagueId);
        router.navigate(`/ligas/${card.dataset.leagueId}`);
      });
    });

    el.querySelectorAll('[data-go-ranking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        localStorage.setItem('activeLeagueId', btn.dataset.goRanking);
        router.navigate('/ranking');
      });
    });
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

    <section class="how-it-works container">
      <h2 class="how-it-works__title">¿Cómo funciona?</h2>
      <div class="how-it-works__grid">
        <div class="how-step">
          <span class="how-step__icon">🏆</span>
          <div class="how-step__num">1</div>
          <h3 class="how-step__title">Únete a una liga</h3>
          <p class="how-step__desc">Crea tu propia liga o únete a una pública o privada</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">⚽</span>
          <div class="how-step__num">2</div>
          <h3 class="how-step__title">Predice los partidos</h3>
          <p class="how-step__desc">Elige el resultado 1X2 y el marcador exacto de cada partido del Mundial</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">🎯</span>
          <div class="how-step__num">3</div>
          <h3 class="how-step__title">Acumula puntos</h3>
          <p class="how-step__desc">Gana puntos por cada acierto. Más puntos cuanto más avanza el torneo</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">👑</span>
          <div class="how-step__num">4</div>
          <h3 class="how-step__title">Gana el Mundial</h3>
          <p class="how-step__desc">El mejor pronosticador de tu liga gana. Liga oficial con premio camiseta</p>
        </div>
      </div>

      <div class="points-table">
        <h3 class="points-table__title">Sistema de puntos</h3>
        <div class="points-table__grid">
          <div class="points-pill">
            <span class="points-pill__phase">Grupos</span>
            <span class="points-pill__pts">1<span class="points-pill__sep">+</span>1</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Dieciseisavos</span>
            <span class="points-pill__pts">2<span class="points-pill__sep">+</span>2</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Octavos</span>
            <span class="points-pill__pts">3<span class="points-pill__sep">+</span>3</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Cuartos</span>
            <span class="points-pill__pts">4<span class="points-pill__sep">+</span>4</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Semis</span>
            <span class="points-pill__pts">5<span class="points-pill__sep">+</span>5</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Final</span>
            <span class="points-pill__pts">6<span class="points-pill__sep">+</span>6</span>
          </div>
          <div class="points-pill points-pill--champion">
            <span class="points-pill__phase">Campeón</span>
            <span class="points-pill__pts">+10</span>
          </div>
        </div>
        <p class="points-table__legend">Puntos por resultado 1X2 <span class="points-table__plus">+</span> puntos extra por marcador exacto</p>
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

  const pm = s.predictions_made ?? 0;
  const mp = s.matches_played ?? 0;

  return `
    <div class="league-card" data-league-id="${s.league_id}">
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
          <span class="league-card__stat-val">${s.correct_results}/${pm}</span>
          <span class="league-card__stat-label">1X2</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${s.exact_scores}/${pm}</span>
          <span class="league-card__stat-label">Exactos</span>
        </div>
      </div>
      <div class="league-card__pred-row">
        Pronósticos realizados: <strong>${pm}/${mp}</strong> partidos
      </div>
      ${nextHtml}
      <button class="league-card__cta btn btn--ghost btn--sm" data-go-ranking="${s.league_id}">Ver clasificación</button>
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
