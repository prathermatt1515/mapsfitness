/* =====================================================
   MAPsFitness — Service Worker
   Caches the app shell so the app loads fast and works
   offline. Bump CACHE_NAME any time the shell changes
   to force clients to fetch the new version.
   ===================================================== */

const CACHE_NAME = 'mapsfitness-shell-v2';

// Files that make up the app shell. These get cached on install.
// Paths are relative to /mapsfitness/ since that's our scope on GitHub Pages.
const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './offline.html',
  './assets/logo-full-dark.png',
  './assets/logo-full-light.png',
  './assets/logo-s.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-16.png'
];

// On install: pre-cache the shell so the app works offline immediately.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function () {
      // Activate the new SW right away instead of waiting for tabs to close
      return self.skipWaiting();
    })
  );
});

// On activate: clean up old shell caches from previous versions.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key.startsWith('mapsfitness-') && key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// Fetch strategy:
// - For navigation requests (HTML pages): network first, fall back to cache, fall back to offline page
// - For other shell assets: cache first, fall back to network
// - For everything else (Firebase API, USDA, Google fonts): network only, no caching
self.addEventListener('fetch', function (event) {
  const request = event.request;

  // Only handle GET requests. Skip POST/PUT etc.
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (Firebase, Google, USDA proxy)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigation: try network, fall back to cache, fall back to offline page
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match('./offline.html');
        });
      })
    );
    return;
  }

  // Everything else: cache first, fall back to network
  event.respondWith(
    caches.match(request).then(function (cached) {
      return cached || fetch(request);
    })
  );
});
