const CACHE_NAME = 'agroview-v1';
const urlsToCache = [
  '/',
  '/calc/area',
  '/calc/insumos',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // For API calls, try network first
        if (event.request.url.includes('/analytics/') || event.request.url.includes('/weather/')) {
          return fetch(event.request).catch(() => {
            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        }

        return fetch(event.request);
      })
  );
});