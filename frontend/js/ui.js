/**
 * UI & Application Shell Manager - Nabha Telemedicine Platform
 * Renders desktop sidebar, top app header, mobile bottom nav, toasts, and status pills
 */

class UIManager {
  constructor() {
    this.toastContainer = null;
    this.initToastContainer();
  }

  initToastContainer() {
    if (!document.getElementById('toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('toast-container');
    }
  }

  /**
   * Renders standard Application Shell (Desktop Sidebar + Mobile Header + Mobile Bottom Nav)
   */
  renderAppShell(activePage = 'dashboard') {
    const user = auth.getCurrentUser();
    const userRole = user ? user.role : 'PATIENT';
    const userName = user ? (user.name || user.email || user.mobile || 'User') : 'Guest User';
    const userAvatar = user ? (user.avatarText || String(userName).trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U') : 'GU';
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
    const safeUserName = escapeHtml(userName);

    const navItems = this.getNavItemsForRole(userRole);

    // 1. Render Left Desktop Sidebar & Mobile Offcanvas Drawer into #app-shell
    const shellContainer = document.getElementById('app-shell');
    if (shellContainer) {
      shellContainer.innerHTML = `
        <a href="#main-content" class="skip-to-content">Skip to main content</a>
        
        <!-- Sidebar Backdrop for Mobile Drawer -->
        <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

        <!-- Desktop Left Sidebar & Mobile Offcanvas Drawer -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-header">
            <a href="dashboard.html" class="header-brand">
              <svg class="header-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span>Nabha Health</span>
            </a>
            <button type="button" class="btn btn-outline btn-sm menu-toggle-btn" id="menu-close" aria-label="Close menu">✕</button>
          </div>

          <div class="sidebar-user">
            <div class="sidebar-user-avatar">${userAvatar}</div>
            <div class="sidebar-user-details">
              <div class="sidebar-user-name">${safeUserName}</div>
              <span class="badge badge-role-${userRole.toLowerCase()}">${userRole}</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            ${navItems.map(item => `
              <a href="${item.href}" class="sidebar-link ${activePage === item.id ? 'active' : ''}">
                <span class="sidebar-link-icon">${item.iconSvg}</span>
                <span data-i18n="${item.i18nKey}">${item.label}</span>
              </a>
            `).join('')}
          </nav>

          <div class="sidebar-footer">
            <a href="emergency.html" class="btn btn-emergency btn-sm btn-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span data-i18n="emergency_help">Emergency Help</span>
            </a>
            <button type="button" class="btn btn-outline btn-sm btn-block" id="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span data-i18n="logout">Logout</span>
            </button>
          </div>
        </aside>

        <!-- Mobile Bottom Navigation Bar -->
        <nav class="bottom-nav">
          ${navItems.slice(0, 4).map(item => `
            <a href="${item.href}" class="bottom-nav-item ${activePage === item.id ? 'active' : ''}">
              <span class="bottom-nav-icon">${item.iconSvg}</span>
              <span data-i18n="${item.i18nKey}">${item.label}</span>
            </a>
          `).join('')}
          <a href="emergency.html" class="bottom-nav-item text-danger">
            <span class="bottom-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            </span>
            <span data-i18n="emergency_help">Emergency</span>
          </a>
        </nav>
      `;
    }

    // 2. Render Top Header into .main-content-wrapper
    const mainWrapper = document.querySelector('.main-content-wrapper');
    if (mainWrapper && !document.querySelector('.app-header')) {
      const headerHTML = `
        <header class="app-header">
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-outline btn-sm menu-toggle-btn" id="menu-toggle" aria-label="Toggle navigation menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <a href="dashboard.html" class="header-brand">
              <svg class="header-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span>Nabha Health</span>
            </a>
          </div>

          <div class="header-actions">
            <button type="button" class="icon-action shell-notification-button" id="shell-notifications" aria-label="Notifications" title="Notifications">🔔<span id="shell-notification-count" class="notification-count" hidden>0</span></button>

            <!-- Connectivity Pill -->
            <div id="sync-status-pill" class="status-pill status-online" title="Network & Sync Status">
              <span class="status-dot"></span>
              <span id="sync-status-text" data-i18n="status_online">Synced</span>
            </div>

            <!-- Language Selector -->
            <div class="lang-selector">
              <select class="lang-select-input" id="global-lang-select" aria-label="Select Language">
                ${CONFIG.SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}">${l.label}</option>`).join('')}
              </select>
            </div>
          </div>
        </header>
      `;
      mainWrapper.insertAdjacentHTML('afterbegin', headerHTML);
    }

    this.bindShellEvents();
  }

  getNavItemsForRole(role) {
    const iconDashboard = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
    const iconPatients = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    const iconConsultations = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const iconPrescriptions = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    const iconAppointments = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>`;
    const iconSync = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;

    switch (role) {
      case 'ASHA':
        return [
          { id: 'dashboard', href: 'asha-dashboard.html', label: 'Dashboard', i18nKey: 'dashboard', iconSvg: iconDashboard },
          { id: 'patients', href: 'patient-register.html', label: 'Register Patient', i18nKey: 'register_patient', iconSvg: iconPatients },
          { id: 'consultations', href: 'consultation.html', label: 'Consultations', i18nKey: 'consultations', iconSvg: iconConsultations },
          { id: 'sync', href: 'sync.html', label: 'Sync Engine', i18nKey: 'sync', iconSvg: iconSync }
        ];
      case 'DOCTOR':
        return [
          { id: 'dashboard', href: 'doctor-dashboard.html', label: 'Dashboard', i18nKey: 'dashboard', iconSvg: iconDashboard },
          { id: 'appointments', href: 'appointments.html', label: 'Appointments', i18nKey: 'appointments', iconSvg: iconAppointments },
          { id: 'consultations', href: 'consultation.html', label: 'Consultations', i18nKey: 'consultations', iconSvg: iconConsultations },
          { id: 'prescriptions', href: 'prescription.html', label: 'Prescriptions', i18nKey: 'prescriptions', iconSvg: iconPrescriptions }
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', href: 'admin-dashboard.html', label: 'Dashboard', i18nKey: 'dashboard', iconSvg: iconDashboard },
          { id: 'patients', href: 'patient-profile.html', label: 'Patient Directory', i18nKey: 'patients', iconSvg: iconPatients },
          { id: 'doctors', href: 'admin-dashboard.html#doctor-directory', label: 'Doctor Directory', i18nKey: 'doctors', iconSvg: iconPatients },
          { id: 'sync', href: 'sync.html', label: 'Sync Monitoring', i18nKey: 'sync', iconSvg: iconSync }
        ];
      default: // PATIENT
        return [
          { id: 'dashboard', href: 'patient-dashboard.html', label: 'Dashboard', i18nKey: 'dashboard', iconSvg: iconDashboard },
          { id: 'consultations', href: 'consultation.html', label: 'My Consultations', i18nKey: 'consultations', iconSvg: iconConsultations },
          { id: 'prescriptions', href: 'prescription.html', label: 'My Prescriptions', i18nKey: 'prescriptions', iconSvg: iconPrescriptions },
          { id: 'appointments', href: 'appointments.html', label: 'Appointments', i18nKey: 'appointments', iconSvg: iconAppointments }
        ];
    }
  }

  bindShellEvents() {
    const toggleBtn = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('menu-close');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const logoutBtn = document.getElementById('logout-btn');
    const langSelect = document.getElementById('global-lang-select');
    const notificationBtn=document.getElementById('shell-notifications');
    if(notificationBtn) notificationBtn.addEventListener('click',()=>this.showNotificationCenter());
    this.refreshNotificationBadge();

    if (toggleBtn && sidebar && backdrop) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.add('is-open');
        backdrop.classList.add('is-open');
      });
    }

    if (closeBtn && sidebar && backdrop) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-open');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-open');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
      });
    }

    if (langSelect) {
      langSelect.value = i18n.currentLang;
      langSelect.addEventListener('change', (e) => {
        i18n.setLanguage(e.target.value);
      });
    }
  }

  async refreshNotificationBadge(){try{if(!window.api)return;const items=await api.getNotifications();const count=items.filter(x=>!x.read_at).length;const badge=document.getElementById('shell-notification-count');if(badge){badge.textContent=count>99?'99+':String(count);badge.hidden=count===0;}}catch(e){}}

  async showNotificationCenter(){try{const items=await api.getNotifications();const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="shell-notifications-title"><div class="modal-head"><div><h2 id="shell-notifications-title">Notifications</h2><p>Your latest account and care updates.</p></div><button type="button" class="close-btn" aria-label="Close">✕</button></div><div class="notification-list">${items.length?items.map(n=>`<article class="notification-item ${n.read_at?'':'unread'}"><strong>${this.escapeHtml(n.title)}</strong><p>${this.escapeHtml(n.message)}</p><small>${this.escapeHtml(new Date(n.created_at).toLocaleString())}</small>${n.read_at?'':`<button type="button" class="btn-small" data-shell-read="${this.escapeHtml(n.id)}">Mark read</button>`}</article>`).join(''):'<div class="empty-state"><strong>No notifications</strong><span>You are all caught up.</span></div>'}</div></section>`;document.body.appendChild(backdrop);const close=()=>backdrop.remove();backdrop.addEventListener('click',e=>{if(e.target===backdrop||e.target.closest('.close-btn'))close();});backdrop.querySelectorAll('[data-shell-read]').forEach(b=>b.addEventListener('click',async()=>{try{await api.markNotificationRead(b.dataset.shellRead);b.closest('.notification-item')?.classList.remove('unread');b.remove();await this.refreshNotificationBadge();}catch(e){this.showToast(e.message||'Unable to mark notification as read','danger');}}));}catch(e){this.showToast(e.message||'Unable to load notifications','danger');}}

  escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  /**
   * Display toast notification
   */
  showToast(message, type = 'info', duration = 3500) {
    if (!this.toastContainer) this.initToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let typeIcon = 'ℹ️';
    if (type === 'success') typeIcon = '✓';
    if (type === 'warning') typeIcon = '⚠️';
    if (type === 'danger') typeIcon = '✕';

    toast.innerHTML = `
      <span>${typeIcon} ${message}</span>
      <button style="background:none;border:none;color:white;cursor:pointer;margin-left:8px;" onclick="this.parentElement.remove()">✕</button>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  /**
   * Updates global connectivity pill state
   */
  updateConnectivityStatus(status) {
    const pill = document.getElementById('sync-status-pill');
    const textEl = document.getElementById('sync-status-text');
    if (!pill || !textEl) return;

    pill.className = 'status-pill';

    switch (status) {
      case 'ONLINE':
        pill.classList.add('status-online');
        textEl.setAttribute('data-i18n', 'status_online');
        textEl.textContent = i18n.t('status_online', 'Synced');
        break;
      case 'OFFLINE':
        pill.classList.add('status-offline');
        textEl.setAttribute('data-i18n', 'status_offline');
        textEl.textContent = i18n.t('status_offline', 'Offline — Saved Locally');
        break;
      case 'SYNCING':
        pill.classList.add('status-syncing');
        textEl.setAttribute('data-i18n', 'status_syncing');
        textEl.textContent = i18n.t('status_syncing', 'Synchronizing...');
        break;
      case 'FAILED':
        pill.classList.add('status-failed');
        textEl.setAttribute('data-i18n', 'status_failed');
        textEl.textContent = i18n.t('status_failed', 'Sync Failed');
        break;
      default:
        pill.classList.add('status-online');
        textEl.textContent = 'Synced';
    }
  }
}

const ui = new UIManager();
