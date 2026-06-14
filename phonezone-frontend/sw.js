const CACHE_NAME = 'phonezone-cache-v1.1.0';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/default-seed-data.js',
  '/app.js',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/favicon.ico',
  '/assets/images/iphone.png',
  '/assets/images/samsung.png',
  '/assets/images/pixel.png'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching shell assets');
      // Use cache.addAll and ignore failures on individual files if any
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Failed to cache asset: ${asset}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and non-API/non-external backend calls
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but also update it in the background if it's a same-origin resource
        if (e.request.url.startsWith(self.location.origin)) {
          fetch(e.request).then((fetchResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, fetchResponse);
            });
          }).catch(err => console.log('Background fetch failed:', err));
        }
        return cachedResponse;
      }

      return fetch(e.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (e.request.url.startsWith(self.location.origin)) {
            cache.put(e.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback for index.html if navigating
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
