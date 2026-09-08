/**
 * Service Worker - Nabha Rural Telemedicine Platform
 * Caches static application shell and provides graceful offline fallbacks
 */

const CACHE_NAME = 'nabha-v5.0.3-fixed-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './login.html',
  './forgot-password.html',
  './reset-password.html',
  './dashboard.html',
  './patient-dashboard.html',
  './asha-dashboard.html',
  './doctor-dashboard.html',
  './admin-dashboard.html',
  './register.html',
  './patient-register.html',
  './asha-register.html',
  './doctor-register.html',
  './patient-profile.html',
  './consultation.html',
  './prescription.html',
  './appointments.html',
  './sync.html',
  './emergency.html',
  './offline.html',
  './manifest.json',
  './css/reset.css',
  './css/variables.css',
  './css/main.css',
  './css/components.css',
  './css/forms.css',
  './css/dashboard.css',
  './css/role-dashboard.css',
  './css/responsive.css',
  './css/accessibility.css',
  './css/landing.css',
  './css/symptom-checker.css',
  './css/password-reset.css',
  './js/config.js',
  './js/storage.js',
  './js/i18n.js',
  './js/auth.js',
  './js/indexeddb.js',
  './js/offline.js',
  './js/sync.js',
  './js/api.js',
  './js/validation.js',
  './js/ai.js',
  './js/ui.js',
  './js/app.js',
  './js/ai-checker.js',
  './js/role-dashboard.js',
  './js/forgot-password.js',
  './js/reset-password.js',
  './i18n/en.json',
  './i18n/hi.json',
  './i18n/pa.json',
  './assets/icons/health-logo.svg',
  './assets/icons/user.svg',
  './assets/icons/emergency.svg',
  './assets/icons/sync.svg',
  './assets/icons/dashboard.svg',
  './assets/icons/consultation.svg',
  './assets/icons/prescription.svg',
  './assets/icons/calendar.svg'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching application shell...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version while fetching update in background (Stale-While-Revalidate pattern)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline mode, swallow network error */});
        return cachedResponse;
      }

      // If not in cache, try network
      return fetch(event.request).catch(() => {
        // Always return a Response. Never resolve respondWith() with undefined.
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./offline.html').then((fallback) => fallback || new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          }));
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
