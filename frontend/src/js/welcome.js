const WELCOME_KEY = 'pickgoal_welcome_shown';

export function maybeShowWelcome(ctaDestination = '/ligas') {
  if (localStorage.getItem(WELCOME_KEY)) return;
  localStorage.setItem(WELCOME_KEY, '1');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="welcome-modal" id="welcomeModal">
      <div class="welcome-modal__overlay" id="welcomeOverlay"></div>
      <div class="welcome-modal__box">
        <h2 class="welcome-modal__title">¡Bienvenido a PickGoal! ⚽</h2>
        <p class="welcome-modal__subtitle">La liga de predicciones · Temporada 26/27</p>

        <ol class="welcome-modal__steps">
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">1️⃣</span>
            <div>
              <strong>Únete a la PickGoal League</strong>
              <span>— o crea tu propia liga privada</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">2️⃣</span>
            <div>
              <strong>Predice los partidos</strong>
              <span>— LaLiga, Premier League y Champions</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">3️⃣</span>
            <div>
              <strong>Gana duelos y sube de división</strong>
              <span>— sistema de divisiones y ascensos</span>
            </div>
          </li>
        </ol>

        <div class="welcome-modal__highlight">
          🏆 Sistema de divisiones con duelos 1vs1 cada jornada
        </div>

        <button class="btn btn--primary btn--full btn--lg" id="welcomeCta">
          ¡Empezar a predecir!
        </button>
      </div>
    </div>
  `;

  const modal = wrapper.firstElementChild;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Forzar reflow para que la animación de entrada arranque
  requestAnimationFrame(() => modal.classList.add('welcome-modal--open'));

  function close(destination) {
    modal.classList.remove('welcome-modal--open');
    document.body.style.overflow = '';
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
    if (destination) window.location.hash = destination;
  }

  document.getElementById('welcomeOverlay').addEventListener('click', () => close());
  document.getElementById('welcomeCta').addEventListener('click', () => close(ctaDestination));
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
  });
}
