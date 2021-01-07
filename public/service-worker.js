// list of files to store in the cache
const CACHE_FILES = [
    '/',
    './index.html',
    './style.css',
    './index.js',
    './manifest.json',
    '/icons/icon-192x192.png',
    './icons/icon-512x512.png'
    
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// open cache and stores app files to cache
self.addEventListener('install', event => {
   event.waitUntil(
       caches
          .open(PRECACHE)
          .then((cache) => cache.addAll(CACHED_FILES))
          .then(self.skipWaiting())
   );
});

// cleanup old cache
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().
        then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
            return Promise.all(
                cachesToDelete.map(cachesToDelete => {
                    return caches.delete(cachesToDelete);
                })
            );
        })
        .then(() => self.ClientRectList.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME)
                .then((cache) => {
                    return fetch(event.request)
                    .then(response => {
                        return cache.put(event.request, response.clone())
                        .then(() => {
                            return response;
                        })
                    })
                })
            })
        );
    }
});