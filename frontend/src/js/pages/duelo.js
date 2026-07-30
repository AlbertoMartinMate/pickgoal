import { api } from '../api.js';
import { auth } from '../auth.js';

const STATUS_META = {
  en_curso: { label: 'En curso', cls: 'duelo-status--curso' },
  ganado:   { label: 'Ganaste',  cls: 'duelo-status--ganado' },
  perdido:  { label: 'Perdiste', cls: 'duelo-status--perdido' },
  empate:   { label: 'Empate',   cls: 'duelo-status--empate' },
};

export async function renderDuelo(el) {
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
        <h1 class="page-title">Tu duelo esta jornada</h1>

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

        <h2 class="section-title">Clasificación divisional</h2>
        <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
      </div>
    `;

    renderDivisionStandings(duelo.division_league_id, me.id);

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando el duelo: ${err.message}</p></div>`;
  }
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
