import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast } from '../ui.js';

// 11 junio 2026 a las 21:00 UTC — primer partido del torneo
const TOURNAMENT_START = new Date('2026-06-11T21:00:00Z');

const WC_2026_TEAMS = [
  'Argentina', 'Brasil', 'Francia', 'España', 'Inglaterra', 'Alemania',
  'Portugal', 'Países Bajos', 'Italia', 'Bélgica', 'Uruguay', 'Colombia',
  'México', 'Estados Unidos', 'Canadá', 'Marruecos', 'Senegal', 'Nigeria',
  'Japón', 'Corea del Sur', 'Australia', 'Arabia Saudí', 'Irán', 'Qatar',
  'Ecuador', 'Chile', 'Perú', 'Venezuela', 'Bolivia', 'Paraguay',
  'Costa Rica', 'Honduras', 'Panamá', 'Jamaica', 'Trinidad y Tobago', 'Guatemala',
  'Turquía', 'Polonia', 'Croacia', 'Serbia', 'República Checa', 'Eslovaquia',
  'Austria', 'Suiza', 'Dinamarca', 'Suecia', 'Noruega', 'Escocia',
  'Ucrania', 'Rumanía', 'Hungría', 'Grecia',
  'Egipto', 'Camerún', 'Ghana', 'Costa de Marfil', 'Túnez', 'Argelia',
  'China', 'India', 'Irak', 'Uzbekistán',
  'Nueva Zelanda', 'Fiji',
];

function getActiveLeagueId() {
  const raw = localStorage.getItem('activeLeagueId');
  return raw ? parseInt(raw) : null;
}

export async function renderCampeon(el) {
  if (!auth.isLoggedIn()) {
    el.innerHTML = '<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const leagueId = getActiveLeagueId();
    const { champion_prediction } = await api.predictions.getChampion(leagueId);
    const tournamentStarted = new Date() >= TOURNAMENT_START;

    let bodyHtml;

    if (champion_prediction && tournamentStarted) {
      // Torneo empezado + predicción existente → solo lectura bloqueada
      bodyHtml = `
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${champion_prediction.team_name}</strong></p>
          <p>Puntos ganados: <strong>${champion_prediction.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `;
    } else if (!champion_prediction && tournamentStarted) {
      // Torneo empezado + sin predicción → formulario con advertencia de no-vuelta-atrás
      bodyHtml = `
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${championForm(null)}
      `;
    } else if (champion_prediction && !tournamentStarted) {
      // Torneo no empezado + predicción existente → formulario editable
      bodyHtml = `
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${championForm(champion_prediction.team_name)}
      `;
    } else {
      // Torneo no empezado + sin predicción → formulario normal
      bodyHtml = championForm(null);
    }

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${TOURNAMENT_START.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}).
        </p>
        ${bodyHtml}
      </div>
    `;

    document.getElementById('championForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('champBtn');
      const errEl = document.getElementById('champError');
      const team_name = document.getElementById('teamSearch').value.trim();

      if (!team_name) return;

      btn.disabled = true;
      btn.textContent = 'Guardando…';
      errEl.classList.add('hidden');

      try {
        await api.predictions.saveChampion(team_name, leagueId);
        showToast(`¡${team_name} guardado como campeón!`);
        renderCampeon(el);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = btn.dataset.label || 'Confirmar predicción';
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function championForm(currentTeam) {
  const btnLabel = currentTeam ? 'Actualizar predicción' : 'Confirmar predicción';
  return `
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${currentTeam ?? ''}" required />
        <datalist id="teamsList">
          ${WC_2026_TEAMS.map(t => `<option value="${t}">`).join('')}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${btnLabel}">
        ${btnLabel}
      </button>
    </form>
  `;
}
