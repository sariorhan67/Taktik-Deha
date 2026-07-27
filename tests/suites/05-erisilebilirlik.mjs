/* Erişilebilirlik: metin kontrastı (WCAG AA), düğme etiketleri, odak görünürlüğü,
   dokunma hedefi boyutu. Kontrast her iki temada ayrı ölçülür. */
import { openApp, tab } from "../lib.mjs";
export const baslik = "Erişilebilirlik";

const TARA = `(() => {
  const lum = c => {
    const v = c.match(/[\\d.]+/g);
    if (!v) return 1;
    const [r, g, b] = v.slice(0, 3).map(Number).map(x => {
      x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const oran = (f, b) => { const a = lum(f), c = lum(b); return (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05); };
  /* Zemini ararken gradyanla karşılaşırsak tek bir renk yoktur; oran hesaplanamaz.
     Böyle öğeleri hatalı düşük saymak yerine ayrı sayıp raporluyoruz. */
  const zemin = e => {
    let n = e;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { gradyan: true };
      const c = cs.backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && !/^rgba\\(.*,\\s*0\\)$/.test(c)) return { renk: c };
      n = n.parentElement;
    }
    return { renk: getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)' };
  };
  const dusuk = []; let gradyan = 0;
  document.querySelectorAll('*').forEach(e => {
    if (!e.offsetParent || e.children.length) return;
    const t = (e.textContent || '').trim();
    if (t.length < 2) return;
    const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
    const z = zemin(e);
    if (z.gradyan) { gradyan++; return; }
    const buyuk = fs >= 18.66 || (fs >= 14 && +cs.fontWeight >= 700);
    const gerek = buyuk ? 3 : 4.5;
    /* Yarı saydam metin, zeminle karışarak gerçek kontrastı düşürür; hesaba kat. */
    const op = +cs.opacity;
    let renk = cs.color;
    if (op > 0 && op < 1) {
      const f = renk.match(/[\\d.]+/g).slice(0, 3).map(Number);
      const b = z.renk.match(/[\\d.]+/g).slice(0, 3).map(Number);
      renk = 'rgb(' + f.map((v, i) => Math.round(v * op + b[i] * (1 - op))).join(',') + ')';
    }
    const cr = oran(renk, z.renk);
    if (cr < gerek - 0.05) dusuk.push({ t: t.slice(0, 28), fs: Math.round(fs), cr: +cr.toFixed(2), gerek });
  });
  const etiketsiz = [...document.querySelectorAll('button, [role=button]')]
    .filter(x => x.offsetParent && !(x.textContent || '').trim() && !x.getAttribute('aria-label'))
    .length;
  const kucuk = [...document.querySelectorAll('button')]
    .filter(x => { const r = x.getBoundingClientRect(); return x.offsetParent && r.height > 0 && r.height < 40; })
    .map(x => (x.id || x.className || 'button') + ':' + Math.round(x.getBoundingClientRect().height));
  return { dusuk: dusuk.slice(0, 10), n: dusuk.length, gradyan, etiketsiz, kucuk: [...new Set(kucuk)].slice(0, 8) };
})()`;

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* Belge düzeyi */
  const belge = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    baslik: document.title,
    h1: document.querySelectorAll("h1").length,
    odak: [...document.styleSheets]
      .flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
      .some(r => r.selectorText && /:focus-visible/.test(r.selectorText)),
    viewport: !!document.querySelector('meta[name="viewport"]'),
  }));
  rec.chk(belge.lang === "tr", `Belge dili tanımlı (lang="${belge.lang}")`);
  rec.chk(!!belge.baslik, `Sayfa başlığı var ("${belge.baslik}")`);
  rec.chk(belge.odak, "Klavye odağı için :focus-visible kuralı tanımlı");
  rec.chk(belge.viewport, "Viewport meta etiketi var");

  /* Kontrast ve dokunma hedefleri — her sekme, her tema */
  for (const tema of ["aydınlık", "karanlık"]) {
    if (tema === "karanlık") { await page.locator("#themeBtn").click(); await page.waitForTimeout(300); }
    for (const t of ["home", "study", "exam", "progress"]) {
      await tab(page, t);
      const r = await page.evaluate(TARA);
      rec.chk(r.n === 0,
        `Metin kontrastı WCAG AA eşiğinde — ${t}, ${tema}${r.n ? " → " + r.dusuk.map(x => `"${x.t}" ${x.cr}:1 (gerek ${x.gerek})`).join("; ") : ""}`);
      if (t === "home") {
        rec.chk(r.etiketsiz === 0, `Etiketsiz düğme yok — ${tema} (${r.etiketsiz})`);
        rec.chk(r.kucuk.length === 0,
          `Dokunma hedefleri en az 40px — ${tema}${r.kucuk.length ? " → " + r.kucuk.join(", ") : ""}`);
      }
    }
  }

  /* Alt ekranlar — buraya kadar yalnızca dört ana sekme taranıyordu ve
     alt ekranların birincil gezinme düğmesi olan «geri» 17×22 pikselde
     kalmıştı: WCAG 2.5.8'in AA düzeyindeki 24×24 asgarisinin bile altında. */
  const altEkran = await page.evaluate(() => {
    const kucuk = [], yok = [];
    const ekranlar = ["scr-mod", "scr-review", "scr-wrong", "scr-tur",
                      "scr-exam", "scr-full", "scr-past"];
    const onceki = [...document.querySelectorAll(".screen.active")].map(x => x.id);
    ekranlar.forEach(id => {
      const s = document.getElementById(id);
      if (!s) { yok.push(id); return; }
      document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
      s.classList.add("active");
      s.querySelectorAll("button, a[href]").forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (r.width < 40 || r.height < 40)
          kucuk.push(`${id} "${(el.textContent.trim() || el.className).slice(0, 18)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      });
    });
    document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
    onceki.forEach(id => document.getElementById(id).classList.add("active"));
    return { kucuk: [...new Set(kucuk)], yok, n: ekranlar.length };
  });
  rec.chk(altEkran.yok.length === 0,
    `Taranan alt ekranların hepsi var (${altEkran.n})`);
  rec.chk(altEkran.kucuk.length === 0,
    `Alt ekranlarda dokunma hedefleri en az 40px${altEkran.kucuk.length ? " → " + altEkran.kucuk.join(", ") : ""}`);

  /* Geri düğmesi yedi ekranda da aynı görünmeli ve ikon taşımalı: metin «←»
     karakteriyken 12px'te kalıyor ve 20px'lik başlığın yanında kayboluyordu. */
  const geri = await page.evaluate(() => {
    const ekranlar = ["scr-mod", "scr-review", "scr-wrong", "scr-tur",
                      "scr-exam", "scr-full", "scr-past"];
    const bicim = new Set(); let ikonsuz = 0, etiketsiz = 0, n = 0;
    const tema = document.querySelector("#themeBtn");
    const t = tema ? getComputedStyle(tema) : null;
    ekranlar.forEach(id => {
      document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
      document.getElementById(id).classList.add("active");
      const el = document.querySelector("#" + id + " .back");
      if (!el) return;
      n++;
      const c = getComputedStyle(el), r = el.getBoundingClientRect();
      bicim.add([Math.round(r.width), Math.round(r.height), c.borderRadius, c.borderTopWidth].join("/"));
      if (!el.querySelector("svg")) ikonsuz++;
      if (!el.getAttribute("aria-label") && !el.textContent.trim()) etiketsiz++;
    });
    document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
    document.getElementById("scr-home").classList.add("active");
    return { n, bicim: [...bicim], ikonsuz, etiketsiz, temaYuvarlak: t && t.borderRadius };
  });
  rec.chk(geri.n === 7 && geri.bicim.length === 1,
    `Geri düğmesi yedi ekranda da aynı ölçüde (${geri.bicim.join(" | ")})`);
  rec.chk(geri.ikonsuz === 0,
    `Geri düğmeleri metin değil ikon taşıyor (${geri.ikonsuz} ikonsuz)`);
  rec.chk(geri.etiketsiz === 0,
    "İkonlu geri düğmelerinin erişilebilir adı var");
  rec.chk(!!geri.temaYuvarlak && geri.bicim[0].includes(geri.temaYuvarlak),
    `Geri düğmesi tema düğmesiyle aynı biçim dilinde (yuvarlaklık ${geri.temaYuvarlak})`);

  await page.context().close();
}
