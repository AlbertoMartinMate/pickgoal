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
    const { leagues_summary, division_summary, upcoming_matches } = await api.home.summary();

    if (division_summary) {
      el.innerHTML = `
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${divisionCard(division_summary)}
          ${prizeBanner()}
          ${upcomingSection(upcoming_matches)}
        </div>
        ${pointsModalHtml()}
      `;
      attachPointsModal(el);
      return;
    }

    if (!leagues_summary || leagues_summary.length === 0) {
      renderNoLeague(el);
      return;
    }

    const activeId = (() => { const r = localStorage.getItem('activeLeagueId'); return r ? parseInt(r) : null; })();
    const sorted = [...leagues_summary].sort((a, b) =>
      a.league_id === activeId ? -1 : b.league_id === activeId ? 1 : 0
    );

    el.innerHTML = `
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${sorted.map(s => leagueCard(s)).join('')}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
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

async function renderGuest(el) {
  const LAUNCH_DATE = new Date('2026-08-15T00:00:00Z');
  const isLaunched = new Date() >= LAUNCH_DATE;

  let jornadaInfo = null;
  if (isLaunched) {
    try { jornadaInfo = await api.jornada.info(); } catch (_) {}
  }

  el.innerHTML = `
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/icon-512-v2.png" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>

    <div class="container">
      ${pickgoalLeagueCard(jornadaInfo, isLaunched)}
    </div>

    <section class="how-it-works container">
      <h2 class="how-it-works__title">¿Cómo funciona?</h2>
      <div class="how-it-works__grid">
        <div class="how-step">
          <span class="how-step__icon">⚽</span>
          <div class="how-step__num">1</div>
          <h3 class="how-step__title">Predice los partidos</h3>
          <p class="how-step__desc">Elige el resultado 1X2 de LaLiga, Premier League y Champions cada jornada</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">⚔️</span>
          <div class="how-step__num">2</div>
          <h3 class="how-step__title">Gana duelos 1vs1</h3>
          <p class="how-step__desc">Cada jornada te enfrentas a un rival de tu división para sumar puntos</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">👑</span>
          <div class="how-step__num">3</div>
          <h3 class="how-step__title">Sube de división</h3>
          <p class="how-step__desc">Los mejores ascienden. ¿Llegarás a lo más alto de la PickGoal League?</p>
        </div>
      </div>
    </section>
  `;
}

function renderNoLeague(el) {
  el.innerHTML = `
    <div class="home-dashboard container">
      ${pickgoalLeagueCard()}
    </div>
  `;
}

function divisionCard(div) {
  const zoneLabels = { promotion: '⬆️ Zona ascenso', relegation: '⬇️ Zona descenso', mid: '' };
  const zoneBadge = zoneLabels[div.zone]
    ? `<span class="div-card__zone div-card__zone--${div.zone}">${zoneLabels[div.zone]}</span>`
    : '';

  return `
    <div class="div-card">
      <div class="div-card__header">
        <div>
          <span class="div-card__league">${div.league_name}</span>
          <div class="div-card__pos-row">
            <span class="div-card__pos">${div.rank ?? '—'}º</span>
            <span class="div-card__of">de ${div.member_count}</span>
            ${zoneBadge}
          </div>
        </div>
        <div class="div-card__pts-block">
          <span class="div-card__pts-val">${div.pts_division}</span>
          <span class="div-card__pts-label">pts división</span>
        </div>
      </div>
      <div class="div-card__record">
        <div class="div-card__stat"><span>${div.pj}</span><small>PJ</small></div>
        <div class="div-card__stat"><span>${div.g}</span><small>G</small></div>
        <div class="div-card__stat"><span>${div.e}</span><small>E</small></div>
        <div class="div-card__stat"><span>${div.p}</span><small>P</small></div>
        <div class="div-card__stat div-card__stat--general"><span>${div.pts_general}</span><small>Pts total</small></div>
      </div>
      <div class="div-card__actions">
        <a href="#/jornada" class="btn btn--primary btn--sm">Predecir jornada</a>
        <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla</a>
      </div>
    </div>
  `;
}

function daysUntil(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function pickgoalLeagueCard(jornadaInfo = null, isLaunched = false) {
  let headerRight;
  let badge;

  if (isLaunched && jornadaInfo?.jornada_number) {
    badge = 'Temporada 26/27 · En curso';
    headerRight = `
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${jornadaInfo.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;
  } else if (isLaunched) {
    badge = 'Temporada 26/27 · En curso';
    headerRight = `<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>`;
  } else {
    const days = daysUntil('2026-08-15');
    badge = 'Temporada 26/27 · Próximamente';
    headerRight = days > 0
      ? `<div class="pg-league-card__countdown">
           <span class="pg-league-card__countdown-num">${days}</span>
           <span class="pg-league-card__countdown-label">días para el inicio</span>
         </div>`
      : `<div class="pg-league-card__countdown pg-league-card__countdown--soon">¡Lanzamiento inminente!</div>`;
  }

  return `
    <div class="pg-league-card">
      <div class="pg-league-card__header">
        <div>
          <span class="pg-league-card__badge">${badge}</span>
          <h2 class="pg-league-card__name">PickGoal League</h2>
        </div>
        ${headerRight}
      </div>
      <div class="pg-league-card__features">
        <div class="pg-league-card__feature">⚽ LaLiga · Premier League · Champions League</div>
        <div class="pg-league-card__feature">🏆 Sistema de divisiones y duelos 1vs1</div>
        <div class="pg-league-card__feature">📅 Temporada 26/27 · agosto 2026</div>
      </div>
      <div class="pg-league-card__actions">
        <a href="#/register" class="btn btn--primary btn--sm">Inscribirme</a>
      </div>
    </div>
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
    <div class="league-card league-card--finished" data-league-id="${s.league_id}">
      <div class="league-card__header">
        <h2 class="league-card__name">${s.league_name}</h2>
        <span class="league-card__finished-badge">Finalizada 🏁</span>
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
      <a class="btn btn--ghost btn--sm" href="#/jornada">Ver jornada actual</a>
    </section>
  `;
}

function prizeBanner() {
  return `
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `;
}
