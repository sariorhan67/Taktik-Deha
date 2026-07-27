/* Yönetici Adayı · Çalışma Defteri — service worker
   Strateji:
   - HTML/gezinme: ÖNCE AĞ (internet varsa hep en güncel sürüm), yoksa önbellekten aç.
   - Statik dosyalar (ikon/manifest): önbellekten hızlı aç, arka planda tazele.
   Böylece uygulama çevrimdışı çalışır ama internet varken güncellemeleri anında alır. */
const CACHE = "yd-cache-v3";
const FONT_CACHE = "yd-font-v1";
/* HTML'de ağı süresiz beklemeyiz: önbellekte tam çalışan bir kopya dururken
   asılı kalan bir istek açılışı tarayıcı pes edene kadar bekletiyordu. */
const AG_ZAMAN_ASIMI = 2000;
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
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("yd-") && k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
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

  // 1) HTML / gezinme → ağ ile önbellek YARIŞIR (ağa 2 sn süre tanınır)
  //    Ağ kazanırsa en güncel sürüm gelir ve önbellek tazelenir; ağ yavaşsa ya da
  //    asılı kalırsa uygulama önbellekten anında açılır, güncelleme arka planda iner.
  if (isHTML) {
    const onbellek = () =>
      caches.match(req).then((h) => h || caches.match("./index.html")).then((h) => h || caches.match("./"));
    const ag = fetch(req).then((res) => {
      try {
        const copy = res.clone();
        caches.open(CACHE).then((c) => { c.put("./index.html", copy); });
      } catch (_) {}
      return res;
    });
    e.respondWith(
      new Promise((coz) => {
        let bitti = false;
        const ver = (r) => { if (!bitti && r) { bitti = true; coz(r); } };
        ag.then(ver).catch(() => onbellek().then((h) => ver(h) || (bitti || coz(Response.error()))));
        setTimeout(() => { if (!bitti) onbellek().then((h) => { if (h) ver(h); }); }, AG_ZAMAN_ASIMI);
      })
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
  // 3) Yazı tipleri → önce önbellek, yoksa ağdan alıp sakla.
  //    Önceden çapraz köken tarayıcıya bırakılıyordu; bu yüzden yazı tipleri
  //    hiç önbelleğe girmiyor ve her açılışta yeniden ağa çıkılıyordu.
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com$/.test(url.origin)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        try { const copy = res.clone(); caches.open(FONT_CACHE).then((c) => c.put(req, copy)); } catch (_) {}
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // 4) Diğer çapraz köken → tarayıcının varsayılan davranışı
});
