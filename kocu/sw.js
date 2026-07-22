/* Yönetici Sınavı Koçu — service worker (network-first)
 * Strategy: her istekte önce ağ denenir; başarısızsa cache'e düşülür.
 * Bu sayede kurulu (installed) uygulamalarda içerik güncellemeleri
 * kullanıcı çevrimiçiyken otomatik gelir. */
const VERSION = 'v2026-07-21-2';
const CACHE = 'ysk-' + VERSION;
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // {cache:'reload'} => install sırasında ağdan taze kopya al
    await cache.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // yalnızca bu uygulamanın (ysk-) eski önbelleklerini temizle; diğer uygulamaların cache'ine dokunma
    await Promise.all(keys.filter((k) => k.startsWith('ysk-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Yalnızca same-origin isteklerini yönet; çapraz-köken (Google Fonts, API) doğrudan ağa gitsin.
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // NETWORK-FIRST
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = (await cache.match('./index.html')) || (await cache.match('./'));
        if (shell) return shell;
        const off = await cache.match('./offline.html');
        if (off) return off;
      }
      throw err;
    }
  })());
});
