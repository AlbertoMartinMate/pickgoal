import { api } from '../api.js';
import { showToast } from '../ui.js';

export function renderForgotPassword(el) {
  el.innerHTML = `
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Recuperar contraseña</h2>
        <form class="form" id="forgotForm">
          <div class="form__group">
            <label class="form__label" for="email">Email</label>
            <input class="form__input" type="email" id="email" name="email"
              placeholder="tu@email.com" required />
          </div>
          <p id="forgotMsg" class="form__message hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="forgotBtn">Enviar enlace</button>
        </form>
        <div class="auth-card__links">
          <a href="#/login">Volver al login</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('forgotBtn');
    const msgEl = document.getElementById('forgotMsg');
    const email = document.getElementById('email').value.trim();

    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      await api.auth.forgotPassword(email);
      msgEl.textContent = 'Si el email existe, recibirás un enlace en breve.';
      msgEl.classList.remove('hidden', 'form__error');
      msgEl.classList.add('form__success');
    } catch {
      showToast('Error al enviar el email', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar enlace';
    }
  });
}
