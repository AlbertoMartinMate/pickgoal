import { api } from '../api.js';
import { auth } from '../auth.js';
import { showToast, formatDate } from '../ui.js';

export async function renderTablon(el, { query = {} } = {}) {
  el.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

  const user = auth.getUser();
  let leagueId = query.liga ? parseInt(query.liga) : null;
  let leagueName = null;
  let members = [];
  let page = 1;
  let totalPages = 1;

  // Detectar liga activa si no viene por query
  try {
    if (!leagueId && user) {
      const { leagues } = await api.leagues.my();
      if (leagues && leagues.length) {
        leagueId = leagues[0].id;
        leagueName = leagues[0].name;
      }
    } else if (leagueId) {
      try {
        const { league } = await api.leagues.get(leagueId);
        leagueName = league.name;
      } catch (_) {}
    }

    if (leagueId && user) {
      try {
        const { members: m } = await api.leagues.members(leagueId);
        members = m || [];
      } catch (_) {}
    }
  } catch (_) {}

  async function loadMessages() {
    const data = await api.board.messages(page, leagueId);
    totalPages = data.pages || 1;
    return data;
  }

  try {
    const data = await loadMessages();
    renderUI(data);
  } catch (err) {
    el.innerHTML = `<div class="container"><p class="form__error">Error: ${err.message}</p></div>`;
  }

  function renderUI(data) {
    const { pinned = [], messages = [] } = data;

    el.innerHTML = `
      <div class="container">
        <div class="board-header">
          <h1 class="page-title">Tablón${leagueName ? ` · ${leagueName}` : ''}</h1>
          ${leagueName
            ? `<span class="board-league-badge">🏆 Liga</span>`
            : '<span class="board-general-badge">🌐 General</span>'
          }
        </div>

        ${user
          ? `<form class="board-form" id="boardForm">
               <div class="board-form__input-wrap">
                 <textarea class="form__textarea" id="boardMsg" placeholder="Escribe un mensaje…"
                   maxlength="500" rows="3" required></textarea>
                 <div class="mention-dropdown hidden" id="mentionDropdown"></div>
               </div>
               <div class="board-form__footer">
                 <span class="board-form__counter" id="charCounter">0 / 500</span>
                 <button class="btn btn--primary" type="submit">Publicar</button>
               </div>
             </form>`
          : '<p class="notice"><a href="#/login">Inicia sesión</a> para participar en el tablón.</p>'
        }

        ${pinned.length
          ? `<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${renderPinned(pinned)}
               </div>
             </section>`
          : ''
        }

        <section class="board-section">
          ${pinned.length ? '<h2 class="board-section__title">💬 Mensajes</h2>' : ''}
          <div class="board-messages" id="boardMessages">
            ${renderMessages(messages)}
          </div>
          ${totalPages > 1
            ? `<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
                 <span>Página ${page} / ${totalPages}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
               </div>`
            : ''
          }
        </section>
      </div>
    `;

    attachFormHandlers();
    attachPinnedHandlers();
    attachDeleteHandlers();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderPinned(pinned) {
    if (!pinned.length) return '';
    return pinned.map(msg => `
      <div class="board-message board-message--pinned" data-id="${msg.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${escapeHtml(msg.username)}</strong>
          <span class="board-message__date">${formatDate(msg.created_at)}</span>
          ${user?.is_admin && !msg.is_deleted
            ? `<button class="btn btn--ghost btn--xs unpin-msg" data-id="${msg.id}" title="Desfijar">📌✕</button>`
            : ''
          }
          ${!msg.is_deleted && user && (user.id === msg.user_id || user.is_admin)
            ? `<button class="btn btn--danger btn--xs delete-msg" data-id="${msg.id}">✕</button>`
            : ''
          }
        </div>
        <p class="board-message__text">${renderText(msg.message)}</p>

        ${msg.replies && msg.replies.length
          ? `<div class="board-replies">
               ${msg.replies.map(r => renderReply(r)).join('')}
             </div>`
          : ''
        }

        ${user && !msg.is_deleted
          ? `<form class="reply-form" id="replyForm-${msg.id}" data-parent="${msg.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${msg.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${msg.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`
          : ''
        }
      </div>
    `).join('');
  }

  function renderReply(r) {
    return `
      <div class="board-reply ${r.is_deleted ? 'board-reply--deleted' : ''}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${escapeHtml(r.username)}</strong>
          <span class="board-reply__date">${formatDate(r.created_at)}</span>
          ${!r.is_deleted && user && (user.id === r.user_id || user.is_admin)
            ? `<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`
            : ''
          }
        </div>
        <p class="board-reply__text">${renderText(r.message)}</p>
      </div>
    `;
  }

  function renderMessages(messages) {
    if (!messages.length) return '<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>';
    return messages.map(m => `
      <div class="board-message ${m.is_deleted ? 'board-message--deleted' : ''}" data-id="${m.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${escapeHtml(m.username)}</strong>
          <span class="board-message__date">${formatDate(m.created_at)}</span>
          ${user?.is_admin && !m.is_deleted
            ? `<button class="btn btn--ghost btn--xs pin-msg" data-id="${m.id}" title="Fijar">📌</button>`
            : ''
          }
          ${!m.is_deleted && user && (user.id === m.user_id || user.is_admin)
            ? `<button class="btn btn--danger btn--xs delete-msg" data-id="${m.id}">✕</button>`
            : ''
          }
        </div>
        <p class="board-message__text">${renderText(m.message)}</p>
      </div>
    `).join('');
  }

  function renderText(text) {
    const escaped = escapeHtml(text);
    if (!members.length) return escaped;
    const names = members.map(m => escapeRegexStr(m.username));
    const rx = new RegExp(`@(${names.join('|')})`, 'gi');
    return escaped.replace(rx, '<span class="mention">@$1</span>');
  }

  // ── Form & event handlers ─────────────────────────────────────────────────

  function attachFormHandlers() {
    const form = document.getElementById('boardForm');
    if (!form) return;

    const textarea = document.getElementById('boardMsg');
    const counter = document.getElementById('charCounter');
    const dropdown = document.getElementById('mentionDropdown');

    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 500`;
      handleMentionInput(textarea, dropdown);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = textarea.value.trim();
      if (!message) return;
      try {
        await api.board.post(message, leagueId);
        textarea.value = '';
        counter.textContent = '0 / 500';
        dropdown.classList.add('hidden');
        const data = await loadMessages();
        refreshBoard(data);
        showToast('Mensaje publicado');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function attachPinnedHandlers() {
    // Reply forms
    el.querySelectorAll('.reply-form').forEach(form => {
      const parentId = parseInt(form.dataset.parent);
      const input = form.querySelector('.reply-input');
      const dropdownId = `mentionDropdown-${parentId}`;
      const dropdown = document.getElementById(dropdownId);

      input?.addEventListener('input', () => {
        handleMentionInput(input, dropdown);
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        try {
          await api.board.reply(parentId, message);
          input.value = '';
          dropdown?.classList.add('hidden');
          const data = await loadMessages();
          refreshBoard(data);
          showToast('Respuesta enviada');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    // Pin/unpin
    el.querySelectorAll('.pin-msg').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await api.board.pin(btn.dataset.id);
          const data = await loadMessages();
          refreshBoard(data);
          showToast('Mensaje fijado');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    el.querySelectorAll('.unpin-msg').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await api.board.pin(btn.dataset.id);
          const data = await loadMessages();
          refreshBoard(data);
          showToast('Mensaje desfijado');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }

  function attachDeleteHandlers() {
    el.querySelectorAll('.delete-msg').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este mensaje?')) return;
        try {
          await api.board.delete(btn.dataset.id);
          const data = await loadMessages();
          refreshBoard(data);
          showToast('Mensaje eliminado');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }

  function refreshBoard(data) {
    const { pinned = [], messages = [] } = data;

    const pinnedEl = document.getElementById('boardPinned');
    if (pinnedEl) {
      pinnedEl.innerHTML = renderPinned(pinned);
    } else if (pinned.length) {
      // Pinned section didn't exist yet — full re-render
      const saved = { leagueId, leagueName, members, page, totalPages };
      renderUI(data);
      return;
    }

    const msgsEl = document.getElementById('boardMessages');
    if (msgsEl) msgsEl.innerHTML = renderMessages(messages);

    attachPinnedHandlers();
    attachDeleteHandlers();
  }

  // Pagination
  el.addEventListener('click', async (e) => {
    if (e.target.id === 'prevPage' && page > 1) {
      page--;
      const data = await loadMessages();
      refreshBoard(data);
    } else if (e.target.id === 'nextPage' && page < totalPages) {
      page++;
      const data = await loadMessages();
      refreshBoard(data);
    }
  });

  // ── @mention autocomplete ─────────────────────────────────────────────────

  function handleMentionInput(input, dropdown) {
    if (!dropdown || !members.length) return;

    const val = input.value;
    const cur = input.selectionStart;
    const before = val.slice(0, cur);
    const atMatch = before.match(/@(\w*)$/);

    if (!atMatch) {
      dropdown.classList.add('hidden');
      return;
    }

    const query = atMatch[1].toLowerCase();
    const filtered = members.filter(m =>
      m.username.toLowerCase().startsWith(query) && m.id !== user?.id
    );

    if (!filtered.length) {
      dropdown.classList.add('hidden');
      return;
    }

    dropdown.innerHTML = filtered.slice(0, 6).map(m =>
      `<div class="mention-item" data-username="${escapeHtml(m.username)}">${escapeHtml(m.username)}</div>`
    ).join('');
    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.mention-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const username = item.dataset.username;
        const newBefore = before.replace(/@(\w*)$/, `@${username} `);
        input.value = newBefore + val.slice(cur);
        input.setSelectionRange(newBefore.length, newBefore.length);
        dropdown.classList.add('hidden');
        if (input.tagName === 'TEXTAREA') {
          const counter = document.getElementById('charCounter');
          if (counter) counter.textContent = `${input.value.length} / 500`;
        }
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.board-form__input-wrap') && !e.target.closest('.reply-form__input-wrap')) {
      document.querySelectorAll('.mention-dropdown').forEach(d => d.classList.add('hidden'));
    }
  }, { capture: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegexStr(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
