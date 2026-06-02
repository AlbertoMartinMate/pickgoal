const BASE_URL = '/api';

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
    ranking: () => request('/auth/ranking'),
    users: () => request('/auth/users'),
    toggleAdmin: (uid) => request(`/auth/users/${uid}/toggle-admin`, { method: 'PATCH' }),
  },

  matches: {
    grouped: () => request('/matches/grouped'),
    list: (params = '') => request(`/matches/${params}`),
    get: (id) => request(`/matches/${id}`),
    sync: () => request('/matches/sync', { method: 'POST' }),
  },

  predictions: {
    mine: () => request('/predictions/'),
    forMatch: (matchId) => request(`/predictions/match/${matchId}`),
    save: (data) => request('/predictions/', { method: 'POST', body: JSON.stringify(data) }),
    getChampion: () => request('/predictions/champion'),
    saveChampion: (team_name) => request('/predictions/champion', { method: 'POST', body: JSON.stringify({ team_name }) }),
    awardChampion: (team_name) => request('/predictions/champion/award', { method: 'POST', body: JSON.stringify({ team_name }) }),
  },

  leagues: {
    public: () => request('/leagues/public'),
    my: () => request('/leagues/my'),
    create: (data) => request('/leagues/', { method: 'POST', body: JSON.stringify(data) }),
    join: (data) => request('/leagues/join', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/leagues/${id}`),
    leave: (id) => request(`/leagues/${id}/leave`, { method: 'DELETE' }),
    matchPredictions: (leagueId, matchId) => request(`/leagues/${leagueId}/predictions/${matchId}`),
  },

  board: {
    messages: (page = 1) => request(`/board/?page=${page}`),
    post: (message) => request('/board/', { method: 'POST', body: JSON.stringify({ message }) }),
    delete: (id) => request(`/board/${id}`, { method: 'DELETE' }),
  },
};
