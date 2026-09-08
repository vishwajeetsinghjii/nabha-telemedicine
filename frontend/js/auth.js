(function (window) {
  'use strict';

  class AuthManager {
    constructor() {
      this.currentUser = this.readUser();
    }

    readUser() {
      try {
        return JSON.parse(sessionStorage.getItem(window.CONFIG.STORAGE_KEYS.AUTH_USER) || 'null');
      } catch (_) {
        return null;
      }
    }

    async login(identifier, password) {
      if (!window.api) throw new Error('Authentication service is unavailable. Please refresh the page.');
      const data = await window.api.post('/auth/login', { identifier, password });
      window.api.setSession(data);
      this.currentUser = data.user;
      return data.user;
    }

    async refresh() {
      try {
        const data = await window.api.refresh(null);
        window.api.setSession(data);
        this.currentUser = data.user;
        return true;
      } catch (_) {
        this.logout(false);
        return false;
      }
    }

    async logout(remote = true) {
      if (remote && window.api) {
        try { await window.api.logout(null); } catch (_) {}
      }
      if (window.api) window.api.clearSession();
      this.currentUser = null;
      window.location.href = 'login.html';
    }

    getCurrentUser() {
      return this.currentUser || this.readUser();
    }

    isAuthenticated() {
      return !!(window.api && window.api.getAccessToken()) && !!this.getCurrentUser();
    }

    hasRole(role) {
      return this.getCurrentUser()?.role === role;
    }

    requireAuth(roles = []) {
      const u = this.getCurrentUser();
      if (!this.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
      }
      if (roles.length && !roles.includes(u.role)) {
        this.redirectToDashboard();
        return false;
      }
      return true;
    }

    redirectToDashboard() {
      const role = this.getCurrentUser()?.role;
      window.location.href = {
        PATIENT: 'patient-dashboard.html',
        ASHA: 'asha-dashboard.html',
        DOCTOR: 'doctor-dashboard.html',
        ADMIN: 'admin-dashboard.html'
      }[role] || 'login.html';
    }
  }

  window.AuthManager = AuthManager;
  window.auth = new AuthManager();
})(window);
