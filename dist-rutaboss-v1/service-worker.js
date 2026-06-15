const CACHE_NAME = 'rutaboss-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './state.js',
  './ui.js',
  './data.js',
  './routes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network first strategy for core files
  if (event.request.url.match(/\.(js|css|html)$/) || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for external assets with dynamic caching
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            return networkResponse;
        }).catch(err => {
            console.error('Fetch falló, offline y no en caché', err);
        });
      })
    );
  }
});
