// Bumping this name is what purges older caches in `activate`. The previous
// version ('pet-tracker-v2') cache-first served a pre-cached copy of '/', which
// could pin users to a stale — or authenticated — app shell across deploys.
const CACHE_NAME = 'pet-tracker-v3'

self.addEventListener('install', () => {
  // Nothing is pre-cached on purpose: '/' is auth-gated, so caching it at
  // install time stores either a redirect or a logged-in shell.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Leave everything else alone: Supabase calls, POSTs and auth requests must
  // reach the network untouched.
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Page loads always go to the network and are never cached. An auth-gated app
  // must not be able to serve a logged-in HTML shell to a logged-out visitor,
  // and a stale shell after a deploy breaks the app until the cache is cleared.
  if (request.mode === 'navigate') return

  // Build output under /_next/static is content-hashed, so a URL never changes
  // meaning. Cache-first is safe and keeps navigation fast.
  const isImmutable = url.pathname.startsWith('/_next/static/')

  if (isImmutable) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndCache(request))
    )
    return
  }

  // Icons, manifest and other assets: prefer the network, fall back to cache
  // when offline.
  event.respondWith(
    fetchAndCache(request).catch(() =>
      caches.match(request).then((cached) => cached || Response.error())
    )
  )
})

function fetchAndCache(request) {
  return fetch(request).then((response) => {
    // Only store clean, final, same-origin responses.
    if (response.ok && !response.redirected && response.type === 'basic') {
      const copy = response.clone()
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.put(request, copy))
        .catch(() => {})
    }
    return response
  })
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'TeslaApp', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
