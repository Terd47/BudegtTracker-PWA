
const APP_CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

const staticFilesToPreCache = [
  "/",
  "/db.js",
  "/manifest.webmanifest",
  "/index.js",
  "/index.html",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];


// install
self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(APP_CACHE).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(staticFilesToPreCache);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== APP_CACHE && key !== DATA_CACHE) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function(evt) {
  const {url} = evt.request;
  if (url.includes("/api/")){
    evt.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );
  } else {
    // respond from static cache, request is not for /api/*
    evt.respondWith(
      caches.open(APP_CACHE).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }
});
