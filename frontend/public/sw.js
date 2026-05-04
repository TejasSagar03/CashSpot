const CACHE_MAP = 'ghost-map-tiles-v1';
const CACHE_API = 'ghost-atm-data-v1';
const CACHE_UI = 'ghost-ui-v1'; // The new UI cache

// =========================================================
// 0. INSTALL: CACHE THE APP SHELL
// =========================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_UI).then((cache) => {
      // Cache the root page and essential assets for offline UI
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.svg',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

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
  // THE BOUNCER: If it is a POST request (like Overpass API), ignore it completely!
  if (event.request.method !== 'GET') {
    return; 
  }

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
    return;
  }

  // --- C. App Shell UI Files: Network First, Fallback to Cache ---
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If internet works, save the newest version of the UI to cache
          const responseClone = networkResponse.clone();
          caches.open(CACHE_UI).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        }).catch(() => {
          // INTERNET DISCONNECTED: Serve the Ghost Mode UI!
          console.log("Ghost Mode Active: Serving cached UI.");
          return cachedResponse || caches.match('/'); 
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
  const cacheWhitelist = [CACHE_MAP, CACHE_API, CACHE_UI];
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