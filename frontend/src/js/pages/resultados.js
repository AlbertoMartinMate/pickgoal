import { api } from '../api.js';
import { auth } from '../auth.js';
import { formatDate, showToast } from '../ui.js';

const PHASE_SHORT_LABELS = {
  r32: 'Dieciseisavos',
  r16: 'Octavos',
  quarters: 'Cuartos',
  semis: 'Semis',
  third: '3º y 4º',
  final: 'Final',
};

let editMode = false;
let activeItem = null;

export async function renderResultados(el) {
  editMode = false;
  activeItem = null;
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { groups } = await api.matches.grouped();
    const isAdmin = auth.isAdmin();

    el.innerHTML = `
      <div class="container">
        <div class="resultados-topbar">
          <h1 class="page-title">Resultados — Mundial 2026</h1>
          ${isAdmin ? `<button class="btn btn--ghost btn--sm" id="btnEditResults">✏️ Editar resultados</button>` : ''}
        </div>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `;

    if (isAdmin) {
      document.getElementById('btnEditResults').addEventListener('click', () => {
        editMode = !editMode;
        const btn = document.getElementById('btnEditResults');
        if (editMode) {
          btn.textContent = '✅ Editando — salir';
          btn.classList.add('btn--warning');
        } else {
          btn.textContent = '✏️ Editar resultados';
          btn.classList.remove('btn--warning');
        }
        if (activeItem) renderPhaseContent(activeItem.data, activeItem.isGroup);
      });
    }

    // Event delegation for save buttons (persists across re-renders)
    document.getElementById('phaseContent').addEventListener('click', async (e) => {
      const btn = e.target.closest('.res-match__save');
      if (!btn) return;
      const matchId = parseInt(btn.dataset.id);
      const row = btn.closest('.res-match');
      const home = row.querySelector('.res-match__input-home').value;
      const away = row.querySelector('.res-match__input-away').value;
      const result90 = row.querySelector('.res-match__result90')?.value || null;
      if (home === '' || away === '') {
        showToast('Introduce ambos marcadores', 'error');
        return;
      }
      btn.disabled = true;
      try {
        await api.matches.setResult(matchId, parseInt(home), parseInt(away), result90);
        showToast(`${home} - ${away} guardado`);
        // Update local data so re-render shows the new score
        if (activeItem) {
          const m = activeItem.data.matches.find(m => m.id === matchId);
          if (m) {
            m.home_score_90 = parseInt(home);
            m.away_score_90 = parseInt(away);
            m.status = 'finished';
          }
          renderPhaseContent(activeItem.data, activeItem.isGroup);
        }
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
      }
    });

    renderPhaseNav(groups);
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error cargando los partidos: ${err.message}</p></div>`;
  }
}

function renderPhaseNav(groups) {
  const nav = document.getElementById('phaseNav');
  if (!nav) return;

  const groupPhases = groups.filter(g => g.phase === 'group');
  const knockoutPhases = groups.filter(g => g.phase !== 'group');

  const navItems = [
    ...groupPhases.map(g => ({
      key: `group_${g.group_name}`,
      label: `Grupo ${g.group_name}`,
      data: g,
      isGroup: true,
    })),
    ...knockoutPhases.map(g => ({
      key: g.phase,
      label: PHASE_SHORT_LABELS[g.phase] || g.label,
      data: g,
      isGroup: false,
    })),
  ];

  if (navItems.length === 0) return;

  nav.innerHTML = navItems.map((item, i) => `
    <button class="phase-nav__btn ${i === 0 ? 'phase-nav__btn--active' : ''}" data-key="${item.key}">
      ${item.label}
    </button>
  `).join('');

  nav.querySelector('.phase-nav__btn--active')?.scrollIntoView({ inline: 'center', behavior: 'instant', block: 'nearest' });

  nav.querySelectorAll('.phase-nav__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.phase-nav__btn').forEach(b => b.classList.remove('phase-nav__btn--active'));
      btn.classList.add('phase-nav__btn--active');
      const item = navItems.find(it => it.key === btn.dataset.key);
      if (item) {
        activeItem = item;
        renderPhaseContent(item.data, item.isGroup);
      }
    });
  });

  activeItem = navItems[0];
  renderPhaseContent(navItems[0].data, navItems[0].isGroup);
}

function renderPhaseContent(group, isGroup) {
  const content = document.getElementById('phaseContent');
  if (!content) return;

  const matchesHtml = renderMatchList(group.matches);

  if (isGroup) {
    const standings = computeStandings(group.matches);
    content.innerHTML = `
      <div class="resultados-section">
        <div class="resultados-matches">${matchesHtml}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${group.group_name}</h3>
          ${renderStandingsTable(standings)}
        </div>
      </div>
    `;
  } else {
    content.innerHTML = `<div class="resultados-matches">${matchesHtml}</div>`;
  }
}

function renderMatchList(matches) {
  if (!matches || matches.length === 0) {
    return '<p class="empty">Sin partidos en esta fase.</p>';
  }

  return matches.map(m => {
    const statusLabel = { scheduled: 'Programado', live: '🔴 En juego', finished: 'Finalizado' }[m.status] || m.status;

    let scoreHtml;
    if (editMode) {
      const homeVal = m.home_score_90 ?? '';
      const awayVal = m.away_score_90 ?? '';
      const result90Val = m.result_90 ?? '';
      scoreHtml = `
        <div class="res-match__edit-score">
          <input type="number" min="0" max="20" class="res-match__input-home" value="${homeVal}" placeholder="L" />
          <span class="res-match__edit-dash">-</span>
          <input type="number" min="0" max="20" class="res-match__input-away" value="${awayVal}" placeholder="V" />
          <select class="res-match__result90" title="Resultado 90min (vacío = automático)">
            <option value="">Auto</option>
            <option value="1" ${result90Val === '1' ? 'selected' : ''}>1</option>
            <option value="X" ${result90Val === 'X' ? 'selected' : ''}>X</option>
            <option value="2" ${result90Val === '2' ? 'selected' : ''}>2</option>
          </select>
          <button class="btn btn--primary btn--xs res-match__save" data-id="${m.id}">Guardar</button>
        </div>
      `;
    } else if (m.status !== 'scheduled') {
      scoreHtml = `<span class="res-score">${m.home_score_90 ?? '?'} - ${m.away_score_90 ?? '?'}</span>`;
    } else {
      scoreHtml = `<span class="res-score res-score--pending">vs</span>`;
    }

    return `
      <div class="res-match ${m.status === 'finished' ? 'res-match--finished' : ''} ${m.status === 'live' ? 'res-match--live' : ''} ${editMode ? 'res-match--editing' : ''}">
        <div class="res-match__meta">
          <span class="res-match__status">${statusLabel}</span>
          <span class="res-match__date">${formatDate(m.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${m.home_team}</span>
          ${scoreHtml}
          <span class="res-match__team res-match__team--away">${m.away_team}</span>
        </div>
      </div>
    `;
  }).join('');
}

function computeStandings(matches) {
  const teams = {};

  for (const m of matches) {
    if (!teams[m.home_team]) teams[m.home_team] = { name: m.home_team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
    if (!teams[m.away_team]) teams[m.away_team] = { name: m.away_team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };

    if (m.status === 'finished' && m.home_score_90 !== null && m.away_score_90 !== null) {
      const ht = teams[m.home_team];
      const at = teams[m.away_team];
      ht.pj++; at.pj++;
      ht.gf += m.home_score_90; ht.gc += m.away_score_90;
      at.gf += m.away_score_90; at.gc += m.home_score_90;

      if (m.home_score_90 > m.away_score_90) {
        ht.g++; ht.pts += 3; at.p++;
      } else if (m.home_score_90 < m.away_score_90) {
        at.g++; at.pts += 3; ht.p++;
      } else {
        ht.e++; ht.pts++; at.e++; at.pts++;
      }
    }
  }

  return Object.values(teams).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const difB = b.gf - b.gc;
    const difA = a.gf - a.gc;
    if (difB !== difA) return difB - difA;
    return b.gf - a.gf;
  });
}

function renderStandingsTable(standings) {
  if (standings.length === 0) return '<p class="empty">Sin datos de clasificación.</p>';

  const rows = standings.map((t, i) => `
    <tr class="${i < 3 ? 'standings__row--qualify' : ''}">
      <td class="standings__pos">${i + 1}</td>
      <td class="standings__team">${t.name}</td>
      <td>${t.pj}</td>
      <td>${t.g}</td>
      <td>${t.e}</td>
      <td>${t.p}</td>
      <td>${t.gf}</td>
      <td>${t.gc}</td>
      <td class="standings__pts">${t.pts}</td>
    </tr>
  `).join('');

  return `
    <table class="standings__table">
      <thead>
        <tr>
          <th>#</th>
          <th class="standings__team-header">Equipo</th>
          <th title="Partidos jugados">PJ</th>
          <th title="Ganados">G</th>
          <th title="Empatados">E</th>
          <th title="Perdidos">P</th>
          <th title="Goles a favor">GF</th>
          <th title="Goles en contra">GC</th>
          <th title="Puntos">Pts</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
