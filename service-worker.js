var CACHE_NAME = 'static-cache';
var urlsToCache = [
  'assets/android-chrome-192x192.png', 'assets/android-chrome-512x512.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.ico','assets/favicon-16x16.png', 'assets/favicon-32x32.png',
  'assets/mstile-70x70.png', 'assets/mstile-144x144.png', 'assets/mstile-150x150.png', 'assets/mstile-310x150.png', 'assets/mstile-310x310.png',
  'assets/question-circle-regular.svg',
  'assets/site.webmanifest',
  'assets/styles.css',
  'index.html',
  'model/group1-shard1of1',
  'model/model.json',
  'scripts/coco-ssd.js',
  'scripts/lang-dicts.js',
  'scripts/register-service-worker.js',
  'scripts/start-camera.js',
  'scripts/web-worker.js',
  'scripts/worker-interface.js',
  'scripts/tfjs.js',
  'service-worker.js',
];
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return caches.open(CACHE_NAME)
        .then(function(cache) {
          cache.put(url, response.clone());
          return response;
        });
    })
    .catch(function(error) {
      console.log('Request failed:', error);
    });
}
