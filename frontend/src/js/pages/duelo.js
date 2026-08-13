import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate, pointsModalHtml, attachPointsModal } from '../ui.js';

let _trackerInterval = null;

function stopTracker() {
  if (_trackerInterval) { clearInterval(_trackerInterval); _trackerInterval = null; }
}

const STATUS_META = {
  en_curso: { label: 'En curso', cls: 'duelo-status--curso' },
  ganado:   { label: 'Ganaste',  cls: 'duelo-status--ganado' },
  perdido:  { label: 'Perdiste', cls: 'duelo-status--perdido' },
  empate:   { label: 'Empate',   cls: 'duelo-status--empate' },
};

export async function renderDuelo(el) {
  stopTracker();
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { duelo } = await api.duelo.current();
    const me = auth.getUser();

    if (!duelo) {
      el.innerHTML = `
        <div class="container">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
          </div>
        </div>
      `;
      return;
    }

    const statusMeta = STATUS_META[duelo.status] ?? STATUS_META.en_curso;
    const rivalName = duelo.rival ? duelo.rival.username : me.username;
    const isBye = !duelo.rival || duelo.rival.id === me.id;

    el.innerHTML = `
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>

        <div class="duelo-card">
          <span class="duelo-status ${statusMeta.cls}">${statusMeta.label}</span>
          <div class="duelo-card__matchup">
            <div class="duelo-card__player">
              <span class="duelo-card__name">${me.username}</span>
              <span class="duelo-card__pts">${duelo.my_points}</span>
            </div>
            <span class="duelo-card__vs">VS</span>
            <div class="duelo-card__player">
              <span class="duelo-card__name">${isBye ? 'Descanso' : rivalName}</span>
              <span class="duelo-card__pts">${isBye ? '—' : duelo.rival_points}</span>
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
        ${pointsModalHtml()}
      </div>
    `;

    attachPointsModal(el);
    renderDivisionStandings(duelo.division_league_id, me.id);

    if (!isBye) {
      refreshTracker(me.username, rivalName);
      _trackerInterval = setInterval(() => refreshTracker(me.username, rivalName), 60_000);
    }

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando el duelo: ${err.message}</p></div>`;
  }
}

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

async function refreshTracker(myName, rivalName) {
  const container = document.getElementById('dueloTracker');
  if (!container) { stopTracker(); return; }

  try {
    const { detail } = await api.duelo.detail();
    if (!detail) return;
    container.innerHTML = buildTrackerHtml(detail, myName, rivalName);
  } catch (_) {}
}

function buildTrackerHtml(detail, myName, rivalName) {
  const { me, rival } = detail;

  function col(name, d, isMe) {
    const unbet = isMe
      ? d.units_unbet
      : (d.units_unbet != null ? d.units_unbet : null);
    return `
      <div class="duelo-tracker__col">
        <div class="duelo-tracker__player">${name}</div>
        <div class="duelo-tracker__pts">${(d.points_earned).toFixed(2)}</div>
        <div class="duelo-tracker__rows">
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">✅</span>
            <span class="duelo-tracker__label">Ganados</span>
            <span class="duelo-tracker__val">${d.points_earned.toFixed(2)}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">⏳</span>
            <span class="duelo-tracker__label">En juego</span>
            <span class="duelo-tracker__val">${d.units_at_stake + ' u'}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">💰</span>
            <span class="duelo-tracker__label">Sin apostar</span>
            <span class="duelo-tracker__val">${unbet != null ? unbet + ' u' : '?'}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="duelo-tracker__inner">
      ${col(myName, me, true)}
      <div class="duelo-tracker__divider">VS</div>
      ${col(rivalName, rival ?? { points_earned: 0, units_at_stake: 0, units_unbet: null }, false)}
    </div>
    <div class="duelo-tracker__note">Actualizado hace unos segundos · se refresca cada minuto</div>
  `;
}

async function renderDivisionStandings(leagueId, myUserId) {
  const container = document.getElementById('divisionStandings');
  if (!container) return;

  try {
    const { standings } = await api.clasificacion.division(leagueId);

    if (standings.length === 0) {
      container.innerHTML = '<p class="empty">Sin clasificación disponible.</p>';
      return;
    }

    container.innerHTML = `
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>Pts división</th>
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
                <td class="ranking-table__pts">${row.pts_division}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="form__error">Error cargando la clasificación: ${err.message}</p>`;
  }
}
