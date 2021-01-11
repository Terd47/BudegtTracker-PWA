// PWA service worker to cache data
const APP_CACHE = 'static-cache-v2';
const DATA_CACHE = 'data-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/db.js',
  '/index.html',
  '/styles.css',
  '/index.js',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
  );
    self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== APP_CACHE && key !== DATA_CACHE) {
            console.log("Remove old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // on successful response, clone and store in cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // if no network, check cache
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});