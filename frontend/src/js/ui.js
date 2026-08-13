let toastTimeout = null;

export function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast toast--${type} toast--visible`;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 3000);
}

export function leagueGateHtml() {
  return `
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `;
}

export function pointsModalHtml() {
  return `
    <div class="points-modal" id="pointsModal" aria-hidden="true">
      <div class="points-modal__overlay" id="pointsOverlay"></div>
      <div class="points-modal__box" role="dialog" aria-modal="true" aria-label="Cómo funciona PickGoal">
        <button class="points-modal__close" id="pointsClose" aria-label="Cerrar">✕</button>

        <h2 class="points-modal__heading">¿Cómo funciona PickGoal?</h2>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">⚽ Pronósticos</h3>
          <ul class="points-modal__list">
            <li>Cada jornada tienes <strong>20 unidades</strong> para repartir entre los partidos.</li>
            <li>Por cada partido puedes apostar entre <strong>1 y 5 unidades</strong>.</li>
            <li>Si aciertas el resultado (1X2), ganas <strong>unidades × cuota</strong> del partido.</li>
            <li>Las unidades que no uses se convierten directamente en puntos.</li>
            <li class="points-modal__note">Si un partido se cancela, sus unidades van al bote de "no usadas".</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">🤝 Duelos 1vs1</h3>
          <ul class="points-modal__list">
            <li>Cada jornada te enfrentas a otro jugador de tu división.</li>
            <li>Gana quien consiga más puntos en esa jornada.</li>
            <li><span class="pts-tag pts-tag--win">Victoria</span> 3 pts de duelo &nbsp; <span class="pts-tag pts-tag--draw">Empate</span> 1 pt &nbsp; <span class="pts-tag pts-tag--loss">Derrota</span> 0 pts</li>
            <li>Los puntos de duelo determinan tu posición en la clasificación divisional.</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">🏆 Clasificación divisional</h3>
          <ul class="points-modal__list">
            <li>Cada liga está formada por <strong>16 jugadores</strong>.</li>
            <li>Al final de cada vuelta (16 jornadas) se producen ascensos y descensos:
              <ul class="points-modal__list points-modal__list--inner">
                <li>Top 4 → suben de división</li>
                <li>Últimos 4 → bajan de división</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">📊 Clasificación general</h3>
          <ul class="points-modal__list">
            <li>Suma total de puntos de todas las jornadas.</li>
            <li>Al final de la temporada (48 jornadas) se entregan premios a los mejores de la clasificación general.</li>
            <li>🏆 Premio: camiseta de tu equipo favorito</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

export function attachPointsModal(el) {
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

  return open;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
