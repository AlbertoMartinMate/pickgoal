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

function pointsModalHtml() {
  return `
    <div class="points-modal" id="pointsModal" aria-hidden="true">
      <div class="points-modal__overlay" id="pointsOverlay"></div>
      <div class="points-modal__box" role="dialog" aria-modal="true" aria-label="Sistema de puntos">
        <button class="points-modal__close" id="pointsClose" aria-label="Cerrar">✕</button>

        <h2 class="points-modal__heading">📊 Sistema de puntos</h2>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Fase de grupos</h3>
          <ul class="points-modal__list">
            <li><span class="pts-tag">+1</span> por acertar el resultado 1X2</li>
            <li><span class="pts-tag">+1</span> extra por acertar el marcador exacto</li>
            <li class="points-modal__note">Máximo 2 puntos por partido</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Eliminatorias (desde dieciseisavos)</h3>
          <ul class="points-modal__list">
            <li>El <strong>1X2</strong> se refiere al resultado <strong>a 90 minutos</strong> — puede haber empate (el partido continúa en prórroga o penaltis)</li>
            <li>El <strong>marcador exacto</strong> tiene en cuenta prórroga y penaltis: si el partido acaba 2-2 y gana el local en penaltis, el resultado de quiniela es <strong>3-2</strong> (el ganador suma 1 gol simbólico)</li>
          </ul>
          <div class="points-modal__example">
            <span class="points-modal__example-label">Ejemplo</span>
            Predices 2-3 → el visitante gana en penaltis desde 1-1 → resultado quiniela: 1-2 → no acertaste el exacto
          </div>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Puntos por fase</h3>
          <div class="points-modal__phases">
            ${[
              ['Grupos',        '1+1'],
              ['Dieciseisavos', '2+2'],
              ['Octavos',       '3+3'],
              ['Cuartos',       '4+4'],
              ['Semis',         '5+5'],
              ['3º y 4º',       '5+5'],
              ['Final',         '6+6'],
            ].map(([phase, pts]) => `
              <div class="points-modal__phase-pill">
                <span class="points-modal__phase-name">${phase}</span>
                <span class="points-modal__phase-pts">${pts}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Campeón del Mundial</h3>
          <ul class="points-modal__list">
            <li><span class="pts-tag pts-tag--gold">+10</span> puntos extra por acertar el campeón</li>
            <li class="points-modal__note">Solo se puede predecir antes del inicio del torneo, o una vez si te unes con el torneo ya empezado</li>
          </ul>
        </div>

        <div class="points-modal__max">
          <span class="points-modal__max-label">Puntuación máxima posible</span>
          <span class="points-modal__max-val">292 pts</span>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Desempate</h3>
          <ol class="points-modal__list points-modal__list--ordered">
            <li>Quién acertó el campeón del Mundial</li>
            <li>Más resultados exactos en total</li>
            <li>Resultados exactos por fase (Final › Semis › Cuartos…)</li>
            <li>Fecha de registro — quien antes se registró</li>
          </ol>
        </div>
      </div>
    </div>
  `;
}

function attachPointsModal(el) {
  const modal   = el.querySelector('#pointsModal');
  const btnOpen = el.querySelector('#btnPointsInfo');
  const btnClose = el.querySelector('#pointsClose');
  const overlay = el.querySelector('#pointsOverlay');

  function open()  { modal.classList.add('points-modal--open'); document.body.style.overflow = 'hidden'; }
  function close() { modal.classList.remove('points-modal--open'); document.body.style.overflow = ''; }

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: false });
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
