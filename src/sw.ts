/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', () => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('[Service Worker] Activating...');
  void (self as any).clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Offline-first strategy for assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

export {};
