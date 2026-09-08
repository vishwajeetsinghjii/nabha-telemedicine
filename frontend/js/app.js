/**
 * Main Application Initializer - Nabha Telemedicine Platform
 * Bootstraps i18n, auth state, network listeners, and Service Worker
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log(`[Nabha App] Initializing version ${CONFIG.VERSION}...`);

  // 1. Initialize i18n engine
  await i18n.init();

  // 2. Setup Network Online/Offline Listeners
  window.addEventListener('online', () => {
    ui.updateConnectivityStatus('ONLINE');
    ui.showToast(i18n.t('status_online', 'Connection restored. Synced.'), 'success');
  });

  window.addEventListener('offline', () => {
    ui.updateConnectivityStatus('OFFLINE');
    ui.showToast(i18n.t('status_offline', 'Operating offline. Changes saved locally.'), 'warning');
  });

  // Initial network state check
  if (!navigator.onLine) {
    ui.updateConnectivityStatus('OFFLINE');
  }

  // 3. Register Service Worker & purge old cache
  if ('serviceWorker' in navigator) {
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (!key.includes('v5.0.3')) caches.delete(key);
        });
      });
    }
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          console.log('[Service Worker] Registered successfully with scope:', reg.scope);
          reg.update();
        })
        .catch(err => {
          console.warn('[Service Worker] Registration failed:', err);
        });
    });
  }
});
