import { api } from '../api.js';
import { auth } from '../auth.js';
import { leagueGateHtml } from '../ui.js';

function getActiveLeagueId() {
  const raw = localStorage.getItem('activeLeagueId');
  return raw ? parseInt(raw) : null;
}

export async function renderRanking(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    if (auth.isLoggedIn()) {
      const { leagues } = await api.leagues.my();
      if (leagues.length === 0) {
        el.innerHTML = leagueGateHtml();
        return;
      }
    }

    const leagueId = getActiveLeagueId();
    const [{ ranking }, leaguesRes] = await Promise.all([
      api.auth.ranking(leagueId),
      auth.isLoggedIn() ? api.leagues.my() : Promise.resolve({ leagues: [] }),
    ]);
    const currentUser = auth.getUser();
    const activeLeague = leaguesRes.leagues.find(l => l.id === leagueId);
    const title = activeLeague ? activeLeague.name : 'Clasificación General';

    const matchesPlayed = ranking[0]?.matches_played ?? 0;

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">${title}</h1>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Status</th>
                <th title="Predicciones hechas / partidos jugados">Pronósticos</th>
                <th title="Resultados 1X2 acertados / predicciones hechas">1X2</th>
                <th title="Marcadores exactos acertados / predicciones hechas">Exactos</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              ${ranking.map(u => {
                const pm = u.predictions_made ?? 0;
                const pronosticos = `${pm}/${matchesPlayed}`;
                const ox2 = `${u.correct_results ?? 0}/${pm}`;
                const exactos = `${u.exact_scores ?? 0}/${pm}`;
                const isMe = currentUser && u.id === currentUser.id;
                return `
                  <tr class="${isMe ? 'ranking-table__row--me' : ''}">
                    <td class="ranking-table__pos" data-pos="${u.position}">${u.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${u.id}">
                        <span class="status-emoji" title="${u.status?.name || ''}">${u.status?.emoji || ''}</span>${u.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${u.status?.name || '—'}</td>
                    <td class="ranking-table__stat">${pronosticos}</td>
                    <td class="ranking-table__stat">${ox2}</td>
                    <td class="ranking-table__stat">${exactos}</td>
                    <td class="ranking-table__pts">${u.total_points}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}
