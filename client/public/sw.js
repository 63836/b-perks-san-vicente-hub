const CACHE_NAME = 'b-perks-pwa-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache only, no network calls
self.addEventListener('fetch', event => {
  event.respondWith(
    cacheFirstStrategy(event.request)
  );
});

// Cache First Strategy - NO NETWORK CALLS EVER
async function cacheFirstStrategy(request) {
  try {
    // Always check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For API calls, return offline response
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({ 
        offline: true, 
        message: 'Running in offline mode - no network calls allowed',
        data: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For other resources, return offline page
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
    
  } catch (error) {
    console.log('Cache error:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

// Background sync for queued actions (no network operations)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data (local only)
async function syncOfflineData() {
  console.log('Background sync triggered - offline mode, no network operations');
  // In offline mode, we just log that sync was attempted
  // No actual network calls will be made
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('B-Perks Service Worker loaded in OFFLINE-ONLY mode');