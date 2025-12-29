/// <reference lib="webworker" />
/// <reference path="./types/service-worker.d.ts" />

import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Take control immediately
self.skipWaiting();
clientsClaim();

// Handle Cloudflare redirects
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to get the response from the network first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);
          if (networkResponse.redirected) {
            // Clone the response and create a new response without the redirect
            const redirectedBody = await networkResponse.text();
            return new Response(redirectedBody, {
              status: 200,
              headers: networkResponse.headers,
            });
          }
          return networkResponse;
        } catch (error) {
          // If offline, try to get from cache
          const cache = await caches.open('pages');
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || new Response('Offline page', { status: 503 });
        }
      })()
    );
  }
});

// Cache TMDB API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/tmdb'),
  new NetworkFirst({
    cacheName: 'tmdb-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Cache images with a CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Add engagement tracking
let interactionCount = 0;
let startTime = Date.now();

self.addEventListener('message', (event) => {
  if (event.data === 'USER_INTERACTION') {
    interactionCount++;
    const timeSpent = Date.now() - startTime;
    
    // Check if engagement criteria are met (30 seconds + interaction)
    if (timeSpent > 30000 && interactionCount > 0) {
      // Notify the page that engagement criteria are met
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage('ENGAGEMENT_CRITERIA_MET');
        });
      });
    }
  }
});