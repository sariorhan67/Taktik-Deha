/* Veri bütünlüğü: soru bankaları, kimlikler, modül ağırlıkları.
   Bu testler tarayıcı içinde çalışır çünkü veri index.html'in içindedir. */
import { openApp, RESMI_DAGILIM } from "../lib.mjs";
export const baslik = "Veri bütünlüğü";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  const d = await page.evaluate(() => {
    const harfRe = /(?<![A-Za-zĞÜŞİÖÇğüşıöç])([A-E])\s*(şıkkı|seçeneği|seçenek|şık)\b/;
    const denetle = (list, ad) => {
      const r = { ad, n: list.length, sikBozuk: 0, yinelenen: 0, bosSik: 0,
                  aciklamasiz: 0, harfAtfi: 0, cAralikDisi: 0 };
      list.forEach(q => {
        const o = q.o || [];
        if (o.length !== 5) r.sikBozuk++;
        if (new Set(o).size !== o.length) r.yinelenen++;
        if (o.some(x => !String(x).trim())) r.bosSik++;
        if (q.c == null || q.c < 0 || q.c >= o.length) r.cAralikDisi++;
        if (!q.w || !String(q.w).trim()) r.aciklamasiz++;
        if (harfRe.test(q.w || "")) r.harfAtfi++;
      });
      return r;
    };
    const vaka = [];
    Object.values(CONTENT).forEach(c => (c.quiz || []).forEach(q => vaka.push(q)));

    const pastK = PAST.map(q => q.k), hizliK = HIZLI.map(q => q.k);
    const modIds = new Set(MODULES.map(m => m.id));

    return {
      vaka: denetle(vaka, "Vaka"),
      past: denetle(PAST, "Çıkmış"),
      hizli: denetle(HIZLI, "Hızlı Bilgi"),
      pastTekil: new Set(pastK).size === pastK.length,
      hizliTekil: new Set(hizliK).size === hizliK.length,
      cakisma: pastK.filter(k => hizliK.includes(k)).length,
      hizliIlk: HIZLI[0] && HIZLI[0].k,
      hizliT0: HIZLI.every(q => q.t === 0),
      pastT: PAST.every(q => q.t >= 1 && q.t <= 3),
      /* her sorunun modülü gerçekten var mı */
      yetimModul: [...PAST, ...HIZLI].filter(q => !modIds.has(q.m)).length,
      agirlik: MODULES.map(m => ({ no: +m.no, w: m.w })),
      agirlikToplam: MODULES.reduce((a, m) => a + m.w, 0),
      /* içerik bölümleri eksiksiz mi */
      eksikBolum: MODULES.filter(m => m.ready).map(m => {
        const c = CONTENT[m.id];
        if (!c) return m.no + ":içerik yok";
        const eksik = ["ozet", "harita", "tablo", "match", "cards", "quiz"]
          .filter(k => !c[k] || (Array.isArray(c[k]) && !c[k].length));
        return eksik.length ? m.no + ":" + eksik.join(",") : null;
      }).filter(Boolean),
      hizliModul: HIZLI.reduce((a, q) => (a[q.m] = (a[q.m] || 0) + 1, a), {}),
      modIdByNo: MODULES.reduce((a, m) => (a[+m.no] = m.id, a), {}),
    };
  });

  for (const b of [d.vaka, d.past, d.hizli]) {
    rec.chk(b.sikBozuk === 0 && b.cAralikDisi === 0,
      `${b.ad} (${b.n}): her soruda 5 şık ve geçerli cevap indeksi`);
    rec.chk(b.yinelenen === 0 && b.bosSik === 0,
      `${b.ad}: yinelenen veya boş şık yok`);
    rec.chk(b.aciklamasiz === 0, `${b.ad}: her soruda çözüm açıklaması var`);
    rec.chk(b.harfAtfi === 0,
      `${b.ad}: açıklamalar şık harfine atıf yapmıyor (şıklar karıştığı için harf kayar)`);
  }

  rec.chk(d.pastTekil && d.hizliTekil && d.cakisma === 0,
    "Soru kimlikleri bankalar içinde ve arasında benzersiz");
  rec.chk(d.hizliIlk === "h1",
    `Hızlı Bilgi kimlikleri dizi sırasından üretiliyor; ilk soru ${d.hizliIlk} — araya ekleme çözülmüş kayıtları kaydırır`);
  rec.chk(d.hizliT0 && d.pastT,
    "Hızlı Bilgi t=0, çıkmış sorular t=1..3 ile ayrışıyor");
  rec.chk(d.yetimModul === 0, "Her soru var olan bir modüle bağlı");
  rec.chk(d.eksikBolum.length === 0,
    `Hazır modüllerin tüm bölümleri dolu${d.eksikBolum.length ? " — eksik: " + d.eksikBolum.join(" ") : ""}`);

  /* Modül ağırlıkları resmî duyuruyla birebir olmalı */
  const sapan = d.agirlik.filter(m => m.w !== RESMI_DAGILIM[m.no]);
  rec.chk(sapan.length === 0,
    `Modül ağırlıkları resmî soru dağılımıyla aynı${sapan.length ? " — sapan: " + sapan.map(m => `M${m.no}(${m.w}≠${RESMI_DAGILIM[m.no]})`).join(" ") : ""}`);
  rec.chk(d.agirlikToplam === 60, `Ağırlık toplamı 60 (${d.agirlikToplam})`);

  /* Hızlı Bilgi bankası ağırlığın en az iki katını taşımalı */
  const eksikBanka = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: w * 2, var: d.hizliModul[d.modIdByNo[no]] || 0 }))
    .filter(x => x.var < x.hedef);
  rec.chk(eksikBanka.length === 0,
    `Her modülde ağırlığının en az 2 katı Hızlı Bilgi sorusu var${eksikBanka.length ? " — eksik: " + eksikBanka.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);

  await page.context().close();
}
