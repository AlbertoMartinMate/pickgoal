import { api } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../ui.js';

export function renderResetPassword(el, { query }) {
  const token = query.token || '';

  if (!token) {
    el.innerHTML = '<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';
    return;
  }

  el.innerHTML = `
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Nueva contraseña</h2>
        <form class="form" id="resetForm">
          <div class="form__group">
            <label class="form__label" for="password">Nueva contraseña</label>
            <input class="form__input" type="password" id="password" name="password"
              placeholder="Mínimo 6 caracteres" required minlength="6" />
          </div>
          <p id="resetError" class="form__error hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="resetBtn">Guardar contraseña</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('resetBtn');
    const errEl = document.getElementById('resetError');
    const password = document.getElementById('password').value;

    btn.disabled = true;
    btn.textContent = 'Guardando…';
    errEl.classList.add('hidden');

    try {
      await api.auth.resetPassword(token, password);
      showToast('Contraseña actualizada. Ya puedes iniciar sesión.');
      router.navigate('/login');
    } catch (err) {
      errEl.textContent = err.message || 'Error al restablecer la contraseña';
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar contraseña';
    }
  });
}
