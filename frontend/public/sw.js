const CACHE_MAP = 'ghost-map-tiles-v1';
const CACHE_API = 'ghost-atm-data-v1';

// =========================================================
// 1. YOUR EXISTING PUSH NOTIFICATIONS
// =========================================================
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.svg', 
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// =========================================================
// 2. GHOST MODE: INTERCEPTING NETWORK REQUESTS
// =========================================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- A. Map Tiles: "Cache First" Strategy ---
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; 
        }
        
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_MAP).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        }).catch(() => {
          console.log("Offline and tile not cached.");
        });
      })
    );
    return; 
  }

  // --- B. ATM Data: "Stale-While-Revalidate" Strategy ---
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_API).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        }).catch(() => {
          console.log("Offline: Using cached ATM data.");
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// =========================================================
// 3. CLEANUP: REMOVE OLD GHOST DATA
// =========================================================
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_MAP, CACHE_API];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});