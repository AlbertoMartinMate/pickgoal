import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate } from '../ui.js';

export async function renderTablon(el) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  let page = 1;
  let totalPages = 1;

  async function loadMessages() {
    const { messages, pages } = await api.board.messages(page);
    totalPages = pages;
    return messages;
  }

  try {
    const messages = await loadMessages();
    renderUI(messages);
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }

  function renderUI(messages) {
    const user = auth.getUser();
    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">Tablón</h1>
        ${user
          ? `<form class="board-form" id="boardForm">
               <textarea class="form__textarea" id="boardMsg" placeholder="Escribe un mensaje…"
                 maxlength="500" rows="3" required></textarea>
               <button class="btn btn--primary" type="submit">Publicar</button>
             </form>`
          : '<p class="notice"><a href="#/login">Inicia sesión</a> para participar en el tablón.</p>'
        }
        <div class="board-messages" id="boardMessages">
          ${renderMessages(messages, user)}
        </div>
        ${totalPages > 1
          ? `<div class="pagination">
               <button class="btn btn--ghost btn--sm" id="prevPage" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
               <span>Página ${page} / ${totalPages}</span>
               <button class="btn btn--ghost btn--sm" id="nextPage" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
             </div>`
          : ''
        }
      </div>
    `;

    document.getElementById('boardForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textarea = document.getElementById('boardMsg');
      const message = textarea.value.trim();
      if (!message) return;
      try {
        await api.board.post(message);
        textarea.value = '';
        const msgs = await loadMessages();
        document.getElementById('boardMessages').innerHTML = renderMessages(msgs, user);
        attachDeleteHandlers(user);
        showToast('Mensaje publicado');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('prevPage')?.addEventListener('click', async () => {
      page--;
      const msgs = await loadMessages();
      document.getElementById('boardMessages').innerHTML = renderMessages(msgs, user);
      attachDeleteHandlers(user);
    });

    document.getElementById('nextPage')?.addEventListener('click', async () => {
      page++;
      const msgs = await loadMessages();
      document.getElementById('boardMessages').innerHTML = renderMessages(msgs, user);
      attachDeleteHandlers(user);
    });

    attachDeleteHandlers(user);
  }

  function renderMessages(messages, user) {
    if (!messages.length) return '<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>';
    return messages.map(m => `
      <div class="board-message ${m.is_deleted ? 'board-message--deleted' : ''}" data-id="${m.id}">
        <div class="board-message__header">
          <strong>${m.username}</strong>
          <span class="board-message__date">${formatDate(m.created_at)}</span>
          ${!m.is_deleted && user && (user.id === m.user_id || user.is_admin)
            ? `<button class="btn btn--danger btn--xs delete-msg" data-id="${m.id}">✕</button>`
            : ''
          }
        </div>
        <p class="board-message__text">${escapeHtml(m.message)}</p>
      </div>
    `).join('');
  }

  function attachDeleteHandlers(user) {
    el.querySelectorAll('.delete-msg').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este mensaje?')) return;
        try {
          await api.board.delete(btn.dataset.id);
          const msgs = await loadMessages();
          document.getElementById('boardMessages').innerHTML = renderMessages(msgs, user);
          attachDeleteHandlers(user);
          showToast('Mensaje eliminado');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
