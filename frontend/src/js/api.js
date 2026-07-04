const BASE_URL = import.meta.env.PROD
  ? 'https://pickgoal-backend.onrender.com/api'
  : 'http://127.0.0.1:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, message: data.error || 'Error desconocido' };
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),

  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
    ranking: (leagueId) => request(`/auth/ranking${leagueId ? `?league_id=${leagueId}` : ''}`),
    users: () => request('/auth/users'),
    toggleAdmin: (uid) => request(`/auth/users/${uid}/toggle-admin`, { method: 'PATCH' }),
  },

  matches: {
    grouped: () => request('/matches/grouped'),
    list: (params = '') => request(`/matches/${params}`),
    get: (id) => request(`/matches/${id}`),
    today: () => request('/matches/today'),
    setResult: (id, home, away, result90 = null) => request(`/matches/${id}/result`, { method: 'PATCH', body: JSON.stringify({ home_score: home, away_score: away, ...(result90 ? { result_90: result90 } : {}) }) }),
    sync: () => request('/matches/sync', { method: 'POST' }),
    recalculate: () => request('/matches/recalculate', { method: 'POST' }),
  },

  predictions: {
    mine: (leagueId) => request(`/predictions/${leagueId ? `?league_id=${leagueId}` : ''}`),
    forMatch: (matchId, leagueId) => request(`/predictions/match/${matchId}${leagueId ? `?league_id=${leagueId}` : ''}`),
    save: (data) => request('/predictions/', { method: 'POST', body: JSON.stringify(data) }),
    forUser: (userId, leagueId) => request(`/predictions/user/${userId}${leagueId ? `?league_id=${leagueId}` : ''}`),
    getChampion: (leagueId) => request(`/predictions/champion${leagueId ? `?league_id=${leagueId}` : ''}`),
    saveChampion: (team_name, leagueId) => request('/predictions/champion', { method: 'POST', body: JSON.stringify({ team_name, league_id: leagueId ?? null }) }),
    awardChampion: (team_name) => request('/predictions/champion/award', { method: 'POST', body: JSON.stringify({ team_name }) }),
  },

  leagues: {
    all: () => request('/leagues/all'),
    public: () => request('/leagues/public'),
    my: () => request('/leagues/my'),
    create: (data) => request('/leagues/', { method: 'POST', body: JSON.stringify(data) }),
    join: (data) => request('/leagues/join', { method: 'POST', body: JSON.stringify(data) }),
    joinByCode: (code) => request(`/leagues/join/${encodeURIComponent(code)}`),
    adminAll: () => request('/leagues/admin'),
    get: (id) => request(`/leagues/${id}`),
    update: (id, data) => request(`/leagues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    leave: (id) => request(`/leagues/${id}/leave`, { method: 'DELETE' }),
    members: (id) => request(`/leagues/${id}/members`),
    matchPredictions: (leagueId, matchId) => request(`/leagues/${leagueId}/predictions/${matchId}`),
  },

  home: {
    summary: () => request('/home/summary'),
  },

  board: {
    messages: (page = 1, leagueId = null) => request(`/board/?page=${page}${leagueId ? `&league_id=${leagueId}` : ''}`),
    unread: (leagueId, since) => request(`/board/unread?league_id=${leagueId}&since=${encodeURIComponent(since)}`),
    post: (message, leagueId = null) => request('/board/', { method: 'POST', body: JSON.stringify({ message, league_id: leagueId }) }),
    pin: (id) => request(`/board/${id}/pin`, { method: 'POST' }),
    reply: (id, message) => request(`/board/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
    delete: (id) => request(`/board/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    vapidPublicKey: () => request('/notifications/vapid-public-key'),
    subscribe: (subscription) => request('/notifications/subscribe', { method: 'POST', body: JSON.stringify(subscription) }),
    send: (data) => request('/notifications/send', { method: 'POST', body: JSON.stringify(data) }),
  },
};
