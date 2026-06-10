const CACHE = 'velvetsnap-v3';
const CACHE_BUST = '20260610';

const PRECACHE_URLS = [
  '/',
  '/templates',
  '/booth',
  '/payment',
  '/result',
  '/strips-studio',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for pages; cache-first for static assets
  const url = new URL(request.url);
  const isPage = request.headers.get('Accept')?.includes('text/html');
  const isAdmin = url.pathname.startsWith('/admin');

  if (isPage || isAdmin) {
    event.respondWith(
      fetch(request).then((r) => {
        if (r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return r;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            cache.put(request, clone);
          }
          return response;
        });
      }).catch(() => caches.match('/'))
    )
  );
});
