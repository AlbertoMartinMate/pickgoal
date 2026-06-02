import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast } from '../ui.js';

const TOURNAMENT_START = new Date('2026-06-11T00:00:00Z');

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

export async function renderCampeon(el) {
  if (!auth.isLoggedIn()) {
    el.innerHTML = '<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';
    return;
  }

  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { champion_prediction } = await api.predictions.getChampion();
    const locked = new Date() >= TOURNAMENT_START;

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Solo puedes predecirlo una vez y antes del inicio del torneo
          (${TOURNAMENT_START.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}).
        </p>

        ${champion_prediction
          ? `<div class="champion-result">
               <p>Tu predicción: <strong class="champion-result__team">${champion_prediction.team_name}</strong></p>
               <p>Puntos ganados: <strong>${champion_prediction.points_earned}</strong></p>
               ${locked ? '' : '<p class="notice">No puedes cambiar la predicción una vez enviada.</p>'}
             </div>`
          : locked
            ? '<p class="notice">El torneo ya ha comenzado. No es posible predecir el campeón.</p>'
            : `<form class="form champion-form" id="championForm">
                 <div class="form__group">
                   <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
                   <input class="form__input" type="text" id="teamSearch" placeholder="Escribe para buscar…"
                     list="teamsList" autocomplete="off" required />
                   <datalist id="teamsList">
                     ${WC_2026_TEAMS.map(t => `<option value="${t}">`).join('')}
                   </datalist>
                 </div>
                 <p id="champError" class="form__error hidden"></p>
                 <button class="btn btn--primary" type="submit" id="champBtn">Confirmar predicción</button>
               </form>`
        }
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
        await api.predictions.saveChampion(team_name);
        showToast(`¡${team_name} guardado como campeón!`);
        renderCampeon(el);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Confirmar predicción';
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}
