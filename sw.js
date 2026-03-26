const CACHE_NAME = 'mafia-game-v3'; // Меняем версию для принудительного обновления
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-180.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache addAll error:', err);
      })
  );
  // Сразу активируем новый Service Worker
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша, если есть
        if (response) {
          return response;
        }
        // Иначе идём в сеть
        return fetch(event.request).catch(err => {
          console.error('Fetch error:', err);
          // Можно вернуть fallback-страницу, но пока просто пробрасываем ошибку
          return new Response('Network error', { status: 404 });
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Удаляем старые кэши
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Принудительно захватываем контроль над страницей
      self.clients.claim()
    ])
  );
});
