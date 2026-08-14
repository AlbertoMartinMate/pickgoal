import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate, fmtPts, pointsModalHtml, attachPointsModal } from '../ui.js';

let _trackerInterval = null;

function stopTracker() {
  if (_trackerInterval) { clearInterval(_trackerInterval); _trackerInterval = null; }
}

const STATUS_META = {
  en_curso: { label: 'En curso',  cls: 'duelo-status--curso'  },
  ganado:   { label: 'Ganaste',   cls: 'duelo-status--ganado'  },
  perdido:  { label: 'Perdiste',  cls: 'duelo-status--perdido' },
  empate:   { label: 'Empate',    cls: 'duelo-status--empate'  },
};

const RESULT_BADGE = {
  ganado:  '🏆 Victoria',
  perdido: '💔 Derrota',
  empate:  '🤝 Empate',
};

function fmtDayMonth(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function renderDuelo(el) {
  stopTracker();
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const [{ duelos }, me] = await Promise.all([api.duelo.list(), Promise.resolve(auth.getUser())]);

    if (!duelos.length) {
      el.innerHTML = `
        <div class="container">
          <h1 class="page-title">Duelos</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes duelos todavía.</p>
          </div>
        </div>
      `;
      return;
    }

    // Default: active/upcoming jornada; fallback to most recent
    const activeIdx = duelos.findIndex(d =>
      d.jornada_status === 'active' || d.jornada_status === 'upcoming'
    );
    const defaultIdx = activeIdx >= 0 ? activeIdx : duelos.length - 1;

    const tabs = duelos.map((d, i) => `
      <button class="jornada-tab ${i === defaultIdx ? 'jornada-tab--active' : ''}" data-idx="${i}">
        J${d.jornada_number} · ${fmtDayMonth(d.jornada_date_start)}–${fmtDayMonth(d.jornada_date_end)}
      </button>
    `).join('');

    el.innerHTML = `
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Duelos</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>
        <div class="jornada-tabs">${tabs}</div>
        <div id="dueloContent"></div>
        ${pointsModalHtml()}
      </div>
    `;

    attachPointsModal(el);

    el.querySelectorAll('.jornada-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.jornada-tab').forEach(t => t.classList.remove('jornada-tab--active'));
        tab.classList.add('jornada-tab--active');
        loadDueloJornada(el, duelos[parseInt(tab.dataset.idx)], me);
      });
    });

    await loadDueloJornada(el, duelos[defaultIdx], me);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando duelos: ${err.message}</p></div>`;
  }
}

// ─── Load content for a specific jornada tab ─────────────────────────────────

async function loadDueloJornada(el, jornadaInfo, me) {
  stopTracker();
  const content = el.querySelector('#dueloContent');
  if (!content) return;
  content.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  const isLive = jornadaInfo.jornada_status === 'active' || jornadaInfo.jornada_status === 'upcoming';

  if (isLive) {
    try {
      const { duelo } = await api.duelo.current(jornadaInfo.jornada_id);
      if (!duelo) {
        content.innerHTML = emptyDueloHtml();
        return;
      }
      content.innerHTML = buildActiveDueloHtml(duelo, me);
      renderDivisionStandings(content, duelo.division_league_id, me.id);

      if (!jornadaInfo.is_bye) {
        const rivalName = jornadaInfo.rival?.username ?? '—';
        refreshTracker(jornadaInfo.jornada_id, me.username, rivalName);
        _trackerInterval = setInterval(() => refreshTracker(jornadaInfo.jornada_id, me.username, rivalName), 60_000);
      }
    } catch (err) {
      content.innerHTML = `<p class="form__error">Error: ${err.message}</p>`;
    }
  } else {
    content.innerHTML = buildPastDueloHtml(jornadaInfo, me);
    renderDivisionStandings(content, jornadaInfo.division_league_id, me.id);
  }
}

// ─── Active jornada HTML ──────────────────────────────────────────────────────

function buildActiveDueloHtml(duelo, me) {
  const statusMeta = STATUS_META[duelo.status] ?? STATUS_META.en_curso;
  const rivalName = duelo.rival ? duelo.rival.username : me.username;
  const isBye = !duelo.rival || duelo.rival.id === me.id;

  return `
    <div class="duelo-card">
      <span class="duelo-status ${statusMeta.cls}">${statusMeta.label}</span>
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${me.username}</span>
          <span class="duelo-card__pts">${fmtPts(duelo.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${isBye ? 'Descanso' : rivalName}</span>
          <span class="duelo-card__pts">${isBye ? '—' : fmtPts(duelo.rival_points)}</span>
        </div>
      </div>
    </div>

    ${!isBye ? '<div class="duelo-tracker" id="dueloTracker"></div>' : ''}

    ${!isBye && duelo.matches?.length > 0 ? `
      <h2 class="section-title">Partido a partido</h2>
      <div class="duelo-matches">
        ${duelo.matches.map(m => matchPickCard(m, rivalName)).join('')}
      </div>
    ` : ''}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `;
}

// ─── Past jornada HTML ────────────────────────────────────────────────────────

function buildPastDueloHtml(info, me) {
  const rivalName = info.rival?.username ?? (info.is_bye ? 'Descanso' : '—');
  const resultBadge = RESULT_BADGE[info.status];

  return `
    <div class="duelo-card duelo-card--finished">
      ${resultBadge ? `<span class="duelo-result-badge duelo-result-badge--${info.status}">${resultBadge}</span>` : ''}
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${me.username}</span>
          <span class="duelo-card__pts">${fmtPts(info.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${rivalName}</span>
          <span class="duelo-card__pts">${info.is_bye ? '—' : fmtPts(info.rival_points)}</span>
        </div>
      </div>
    </div>

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `;
}

function emptyDueloHtml() {
  return `
    <div class="duelo-empty">
      <div class="duelo-empty__icon">🤝</div>
      <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
    </div>
  `;
}

// ─── Tracker ──────────────────────────────────────────────────────────────────

async function refreshTracker(jornadaId, myName, rivalName) {
  const container = document.getElementById('dueloTracker');
  if (!container) { stopTracker(); return; }

  try {
    const { detail } = await api.duelo.detail(jornadaId);
    if (!detail) return;
    container.innerHTML = buildTrackerHtml(detail, myName, rivalName);
  } catch (_) {}
}

function buildTrackerHtml(detail, myName, rivalName) {
  const { me, rival } = detail;

  function col(name, d) {
    return `
      <div class="duelo-tracker__col">
        <div class="duelo-tracker__player">${name}</div>
        <div class="duelo-tracker__pts">${fmtPts(d.points_earned)}</div>
        <div class="duelo-tracker__rows">
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">✅</span>
            <span class="duelo-tracker__label">Ganados</span>
            <span class="duelo-tracker__val">${fmtPts(d.points_earned)}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">⏳</span>
            <span class="duelo-tracker__label">En juego</span>
            <span class="duelo-tracker__val">${d.units_at_stake + ' u'}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">💰</span>
            <span class="duelo-tracker__label">Sin apostar</span>
            <span class="duelo-tracker__val">${d.units_unbet != null ? d.units_unbet + ' u' : '?'}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="duelo-tracker__inner">
      ${col(myName, me)}
      <div class="duelo-tracker__divider">VS</div>
      ${col(rivalName, rival ?? { points_earned: 0, units_at_stake: 0, units_unbet: null })}
    </div>
    <div class="duelo-tracker__note">Actualizado hace unos segundos · se refresca cada minuto</div>
  `;
}

// ─── Match pick card ──────────────────────────────────────────────────────────

function matchPickCard(m, rivalName) {
  const myPick = m.my_prediction?.predicted_result;

  let rivalDisplay, rivalCls;
  if (!m.started) {
    rivalDisplay = '?';
    rivalCls = 'duelo-pick__value--hidden';
  } else if (m.rival_prediction) {
    rivalDisplay = m.rival_prediction.predicted_result;
    rivalCls = '';
  } else {
    rivalDisplay = '—';
    rivalCls = 'duelo-pick__value--empty';
  }

  return `
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${formatDate(m.match_datetime)}</span>
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${m.home_team}</span>
        <div class="match-card__score">
          ${m.status !== 'scheduled'
            ? `<span class="score">${m.home_score_90 ?? '?'} - ${m.away_score_90 ?? '?'}</span>`
            : '<span class="score score--dash">vs</span>'
          }
        </div>
        <span class="team team--away">${m.away_team}</span>
      </div>
      <div class="duelo-pick-row">
        <div class="duelo-pick">
          <span class="duelo-pick__label">Tú</span>
          <span class="duelo-pick__value ${myPick ? '' : 'duelo-pick__value--empty'}">${myPick ?? '—'}</span>
        </div>
        <div class="duelo-pick">
          <span class="duelo-pick__label">${rivalName}</span>
          <span class="duelo-pick__value ${rivalCls}">${rivalDisplay}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Division standings ────────────────────────────────────────────────────────

async function renderDivisionStandings(container, leagueId, myUserId) {
  const el = container.querySelector('#divisionStandings');
  if (!el) return;

  try {
    const { standings } = await api.clasificacion.division(leagueId);

    if (!standings.length) {
      el.innerHTML = '<p class="empty">Sin clasificación disponible.</p>';
      return;
    }

    el.innerHTML = `
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts división</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map(row => `
              <tr class="${row.user_id === myUserId ? 'ranking-table__row--me' : ''}">
                <td class="ranking-table__pos" data-pos="${row.pos}">${row.pos}</td>
                <td>${row.username}${row.is_bot ? ' 🤖' : ''}</td>
                <td class="ranking-table__stat">${row.pj}</td>
                <td class="ranking-table__stat">${row.g}</td>
                <td class="ranking-table__stat">${row.e}</td>
                <td class="ranking-table__stat">${row.p}</td>
                <td class="ranking-table__pts">${fmtPts(row.pts_division)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<p class="form__error">Error cargando la clasificación: ${err.message}</p>`;
  }
}
