/* Yönetici Adayı · Çalışma Defteri — service worker
   Strateji:
   - HTML/gezinme: ÖNCE AĞ (internet varsa hep en güncel sürüm), yoksa önbellekten aç.
   - Statik dosyalar (ikon/manifest): önbellekten hızlı aç, arka planda tazele.
   Böylece uygulama çevrimdışı çalışır ama internet varken güncellemeleri anında alır. */
const CACHE = "yd-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      // yalnızca bu uygulamanın (yd-) eski önbelleklerini temizle; diğer uygulamaların cache'ine dokunma
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("yd-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  const sameOrigin = url.origin === location.origin;
  const isHTML = req.mode === "navigation" ||
    (sameOrigin && (url.pathname.endsWith("/") || url.pathname.endsWith("index.html")));

  // 1) HTML / gezinme → önce ağ, başarısızsa önbellek
  if (isHTML) {
    e.respondWith(
      fetch(req).then((res) => {
        try {
          const copy = res.clone();
          caches.open(CACHE).then((c) => { c.put("./index.html", copy); });
        } catch (_) {}
        return res;
      }).catch(() =>
        caches.match(req).then((h) => h || caches.match("./index.html")).then((h) => h || caches.match("./"))
      )
    );
    return;
  }

  // 2) Aynı köken statikleri → önbellekten aç, arka planda tazele (stale-while-revalidate)
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          try { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } catch (_) {}
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }
  // 3) Çapraz köken (yazı tipleri vb.) → tarayıcının varsayılan davranışı
});
