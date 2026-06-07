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
    // Gate: logged-in users must be in at least one league
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

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">${title}</h1>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>País</th>
                <th>Puntos</th>
                <th title="Pronósticos 1X2 acertados">1X2</th>
                <th title="Resultados exactos acertados">Exactos</th>
              </tr>
            </thead>
            <tbody>
              ${ranking.map(u => `
                <tr class="${currentUser && u.id === currentUser.id ? 'ranking-table__row--me' : ''}">
                  <td class="ranking-table__pos" data-pos="${u.position}">${u.position}</td>
                  <td>
                    <a class="ranking-table__link" href="#/jugador/${u.id}">
                      <span class="status-emoji" title="${u.status?.name || ''}">${u.status?.emoji || ''}</span>${u.username}
                    </a>
                  </td>
                  <td>${u.country || '—'}</td>
                  <td class="ranking-table__pts">${u.total_points}</td>
                  <td class="ranking-table__stat">${u.correct_results}</td>
                  <td class="ranking-table__stat">${u.exact_scores}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}
