import { api } from './api.js';

let currentUser = null;

export const auth = {
  async init() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { user } = await api.auth.me();
      currentUser = user;
    } catch {
      localStorage.removeItem('token');
    }
  },

  setUser(user, token) {
    currentUser = user;
    localStorage.setItem('token', token);
    document.dispatchEvent(new CustomEvent('auth:change', { detail: user }));
  },

  logout() {
    currentUser = null;
    localStorage.removeItem('token');
    document.dispatchEvent(new CustomEvent('auth:change', { detail: null }));
  },

  getUser() {
    return currentUser;
  },

  isLoggedIn() {
    return !!currentUser;
  },

  isAdmin() {
    return currentUser?.is_admin === true;
  },
};
