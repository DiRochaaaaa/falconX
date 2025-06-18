// Service Worker básico para cache de assets estáticos
const CACHE_NAME = 'falconx-v1'

// Instalar o service worker
self.addEventListener('install', _event => {
  self.skipWaiting()
})

// Ativar o service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Interceptar requests apenas para assets estáticos críticos
self.addEventListener('fetch', event => {
  // Só cachear assets específicos em produção
  if (
    process.env.NODE_ENV === 'production' &&
    (event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.url.includes('/_next/static/'))
  ) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request)
      })
    )
  }
})
