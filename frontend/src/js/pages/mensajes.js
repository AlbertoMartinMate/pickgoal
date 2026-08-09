import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate } from '../ui.js';

export async function renderMensajes(el, { params = {} } = {}) {
  const partnerId = params.userId ? parseInt(params.userId) : null;
  if (partnerId) {
    await renderConversacion(el, partnerId);
  } else {
    await renderLista(el);
  }
}

async function renderLista(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  try {
    const { conversations } = await api.messages.list();

    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">💬 Mensajes</h1>
        ${conversations.length === 0
          ? '<p class="empty">No tienes conversaciones aún. Pulsa el nombre de un jugador en la clasificación para enviar un mensaje.</p>'
          : `<div class="mensajes-list">${conversations.map(conversacionItem).join('')}</div>`
        }
      </div>
    `;

    el.querySelectorAll('.mensajes-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.hash = `/mensajes/${item.dataset.userId}`;
      });
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function conversacionItem(c) {
  return `
    <div class="mensajes-item" data-user-id="${c.user_id}" style="cursor:pointer">
      <div class="mensajes-item__avatar">${escapeHtml(c.username[0].toUpperCase())}</div>
      <div class="mensajes-item__info">
        <div class="mensajes-item__header">
          <strong class="mensajes-item__name">${escapeHtml(c.username)}</strong>
          ${c.unread_count > 0 ? `<span class="mensajes-item__badge">${c.unread_count}</span>` : ''}
        </div>
        <p class="mensajes-item__preview">${escapeHtml(c.last_message)}</p>
      </div>
    </div>
  `;
}

async function renderConversacion(el, partnerId) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
  const me = auth.getUser();

  try {
    const { messages, partner } = await api.messages.get(partnerId);

    // Notify badge to update
    document.dispatchEvent(new CustomEvent('messages:read'));

    el.innerHTML = `
      <div class="container">
        <div class="chat-header">
          <a href="#/mensajes" class="btn btn--ghost btn--sm">← Volver</a>
          <h2 class="chat-header__name">${escapeHtml(partner?.username || 'Usuario')}</h2>
        </div>

        <div class="chat-messages" id="chatMessages">
          ${messages.length === 0
            ? '<p class="empty" style="text-align:center">Empieza la conversación.</p>'
            : messages.map(m => mensajeBurbuja(m, me)).join('')
          }
        </div>

        <form class="chat-input" id="chatForm">
          <textarea class="form__textarea chat-input__textarea" id="chatMsg"
            placeholder="Escribe un mensaje…" maxlength="1000" rows="2" required></textarea>
          <button class="btn btn--primary chat-input__btn" type="submit">Enviar</button>
        </form>
      </div>
    `;

    // Scroll to bottom
    const chatEl = document.getElementById('chatMessages');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;

    document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textarea = document.getElementById('chatMsg');
      const text = textarea.value.trim();
      if (!text) return;

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const { message } = await api.messages.send(partnerId, text);
        textarea.value = '';
        const chatMessages = document.getElementById('chatMessages');
        const emptyEl = chatMessages?.querySelector('.empty');
        if (emptyEl) emptyEl.remove();
        chatMessages?.insertAdjacentHTML('beforeend', mensajeBurbuja(message, me));
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });

  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }
}

function mensajeBurbuja(m, me) {
  const isSent = me && m.sender_id === me.id;
  return `
    <div class="chat-message ${isSent ? 'chat-message--sent' : 'chat-message--received'}">
      <div class="chat-message__bubble">${escapeHtml(m.message)}</div>
      <div class="chat-message__time">${formatDate(m.created_at)}</div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
