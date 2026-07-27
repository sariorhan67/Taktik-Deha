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
      /* Kart desteleri: sayı ve biçim */
      kart: MODULES.reduce((a, m) => (a[+m.no] = (CONTENT[m.id] && CONTENT[m.id].cards || []).length, a), {}),
      kartBozuk: MODULES.reduce((n, m) => n + (CONTENT[m.id] && CONTENT[m.id].cards || [])
        .filter(c => !c.q || !c.a || !String(c.q).trim() || !String(c.a).trim()).length, 0),
      kartYinelenen: (() => {
        const t = []; MODULES.forEach(m => (CONTENT[m.id] && CONTENT[m.id].cards || []).forEach(c => t.push(c.q)));
        return t.length - new Set(t).size;
      })(),
      kartToplam: MODULES.reduce((n, m) => n + (CONTENT[m.id] && CONTENT[m.id].cards || []).length, 0),
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

  /* Vaka soruları sınava en çok benzeyen pratiktir ve deneme havuzunun da asıl
     kaynağıdır: buildFullPool her modülden ağırlığı kadar soru çeker, bu yüzden
     ince bankada aynı soru sık tekrarlanır. Taban modülün ağırlığının 5 katıdır. */
  const vakaSayi = await page.evaluate(() =>
    MODULES.reduce((a, m) => (a[+m.no] = (CONTENT[m.id] && CONTENT[m.id].quiz || []).length, a), {}));
  const eksikVaka = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: w * 5, var: vakaSayi[no] || 0 }))
    .filter(x => x.var < x.hedef);
  const vakaToplam = Object.values(vakaSayi).reduce((a, b) => a + b, 0);
  rec.chk(eksikVaka.length === 0,
    `Her modülde ağırlığının en az 5 katı vaka sorusu var (toplam ${vakaToplam})${eksikVaka.length ? " — eksik: " + eksikVaka.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);

  /* Kartlar aralıklı tekrarın yakıtıdır; ağır modüllerin destesi ince kalmamalı.
     Hedef, modülün resmî soru sayısının üç katıdır. */
  const eksikKart = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: w * 3, var: d.kart[no] || 0 }))
    .filter(x => x.var < x.hedef);
  rec.chk(eksikKart.length === 0,
    `Her modülde ağırlığının en az 3 katı kart var (toplam ${d.kartToplam})${eksikKart.length ? " — eksik: " + eksikKart.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);
  rec.chk(d.kartBozuk === 0 && d.kartYinelenen === 0,
    `Kartlarda boş alan veya yinelenen soru yok (boş ${d.kartBozuk}, yinelenen ${d.kartYinelenen})`);

  /* Zihin haritası ve karşılaştırma tabloları da ağırlığı izlemeli. Bunlar drill
     değil kavrayış aracıdır, bu yüzden taban korelasyondan önce gelir: hafif
     modüldeki bolluk zarar değil, ağır modüldeki incelik zarardır. */
  const gorsel = await page.evaluate(() => MODULES.reduce((a, m) => {
    const h = (CONTENT[m.id] && CONTENT[m.id].harita) || {};
    a[+m.no] = {
      yaprak: (h.branches || []).reduce((n, b) => n + (b.kids || []).length, 0),
      dal: (h.branches || []).length,
      bosYaprak: (h.branches || []).reduce((n, b) => n +
        (b.kids || []).filter(k => !k.k || !k.v || !String(k.k).trim() || !String(k.v).trim()).length, 0),
      tablo: (((CONTENT[m.id] || {}).tablo || "").match(/<table/g) || []).length,
      tabloKapanis: (((CONTENT[m.id] || {}).tablo || "").match(/<\/table>/g) || []).length,
    };
    return a;
  }, {}));
  const eksikHarita = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: w * 10, var: gorsel[no].yaprak })).filter(x => x.var < x.hedef);
  rec.chk(eksikHarita.length === 0,
    `Her modülde ağırlığının en az 10 katı zihin haritası yaprağı var (toplam ${Object.values(gorsel).reduce((a, x) => a + x.yaprak, 0)})${eksikHarita.length ? " — eksik: " + eksikHarita.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);
  const eksikTablo = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: Math.max(3, w), var: gorsel[no].tablo })).filter(x => x.var < x.hedef);
  rec.chk(eksikTablo.length === 0,
    `Her modülde en az ağırlığı kadar (asgari 3) karşılaştırma tablosu var (toplam ${Object.values(gorsel).reduce((a, x) => a + x.tablo, 0)})${eksikTablo.length ? " — eksik: " + eksikTablo.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);
  const bozukHarita = Object.entries(gorsel).filter(([, x]) => x.bosYaprak || x.dal < 5);
  rec.chk(bozukHarita.length === 0,
    `Haritalarda boş yaprak yok ve her modülde en az 5 dal var${bozukHarita.length ? " — " + bozukHarita.map(([no]) => "M" + no).join(" ") : ""}`);
  const acikTablo = Object.entries(gorsel).filter(([, x]) => x.tablo !== x.tabloKapanis);
  rec.chk(acikTablo.length === 0,
    `Tablo etiketleri kapatılmış${acikTablo.length ? " — " + acikTablo.map(([no]) => "M" + no).join(" ") : ""}`);

  /* Olumsuz kök derinliği: deneme havuzu bunları tercihen çektiği için her modülde
     birkaç tane bulunmalı, yoksa aynı soru neredeyse her denemede tekrarlanır. */
  const olm = await page.evaluate(() => {
    const hz = {};
    hizliPool().forEach(q => { (hz[q.m] = hz[q.m] || []).push(q); });
    return MODULES.map(m => ({
      no: m.no, w: m.w,
      n: (hz[m.id] || []).filter(olumsuzKok).length +
         (CONTENT[m.id].quiz || []).filter(olumsuzKok).length,
    }));
  });
  /* Deneme başına ihtiyaç modülün ağırlığı × %31; havuz bunun en az üç katı olmalı
     ki aynı soru denemelerin üçte birinden fazlasında çıkmasın. */
  const ince = olm.filter(x => x.n < Math.max(2, Math.ceil(x.w * 0.31 * 3)));
  rec.chk(ince.length === 0,
    `Her modülde yeterli olumsuz köklü soru var${ince.length ? " — ince: " + ince.map(x => `M${x.no}(${x.n})`).join(" ") : ` (toplam ${olm.reduce((a, x) => a + x.n, 0)})`}`);

  /* Eşleştirme alıştırmaları: oyun şıkları İNDEKSE göre eşleştirdiği için bir set
     içinde aynı metin iki kez geçerse, doğru bilen kullanıcı yanlış kutuya
     dokunup hata almış olur. Ayrıca deste ağırlıkla orantılı kalmalı. */
  const es = await page.evaluate(() => {
    const setler = [], yinelenen = [];
    MODULES.forEach(m => (CONTENT[m.id].match || []).forEach(st => {
      setler.push({ no: m.no, ad: st.name, n: st.pairs.length });
      const L = st.pairs.map(p => p[0]), R = st.pairs.map(p => p[1]);
      if (new Set(L).size !== L.length || new Set(R).size !== R.length)
        yinelenen.push(`M${m.no}/${st.name}`);
    }));
    return {
      yinelenen,
      bosluk: setler.filter(s => s.n < 3).map(s => `M${s.no}/${s.ad}(${s.n})`),
      cift: MODULES.reduce((a, m) => (a[+m.no] = (CONTENT[m.id].match || [])
        .reduce((n, s) => n + s.pairs.length, 0), a), {}),
      toplam: MODULES.reduce((a, m) => a + (CONTENT[m.id].match || [])
        .reduce((n, s) => n + s.pairs.length, 0), 0),
    };
  });
  rec.chk(es.yinelenen.length === 0,
    `Eşleştirme setlerinde yinelenen taraf yok (indeksle eşleşiyor, aynı metin iki kutuda olamaz)${es.yinelenen.length ? " — " + es.yinelenen.join(" ") : ""}`);
  rec.chk(es.bosluk.length === 0,
    `Her eşleştirme setinde en az 3 çift var${es.bosluk.length ? " — " + es.bosluk.join(" ") : ""}`);
  const eksikEs = Object.entries(RESMI_DAGILIM)
    .map(([no, w]) => ({ no, hedef: w * 5, var: es.cift[no] || 0 }))
    .filter(x => x.var < x.hedef);
  rec.chk(eksikEs.length === 0,
    `Her modülde ağırlığının en az 5 katı eşleştirme çifti var (toplam ${es.toplam})${eksikEs.length ? " — eksik: " + eksikEs.map(x => `M${x.no}(${x.var}/${x.hedef})`).join(" ") : ""}`);

  /* Rozet eşikleri ulaşılabilir ve doğru olmalı: kart rozeti desteden büyük olamaz,
     baraj rozeti de gerçek barajın (60 puan) altında verilmemeli. */
  const rozet = await page.evaluate(() => {
    const kaynak = BADGES.map(b => ({ id: b.id, ad: b.n, kod: b.t.toString() }));
    const sayi = k => { const m = k.match(/>=\s*(\d+)/); return m ? +m[1] : null; };
    return {
      n: BADGES.length,
      kart: kaynak.filter(b => /totalLearned/.test(b.kod)).map(b => ({ ...b, esik: sayi(b.kod) })),
      past: kaynak.filter(b => /pastSolved/.test(b.kod)).map(b => ({ ...b, esik: sayi(b.kod) })),
      baraj: kaynak.filter(b => /state\.full.*best/.test(b.kod)).map(b => ({ ...b, esik: sayi(b.kod) })),
      kartToplam: MODULES.reduce((n, m) => n + (CONTENT[m.id] && CONTENT[m.id].cards || []).length, 0),
      pastToplam: PAST.length + HIZLI.length,
      /* uygulama tam deneme puanını yüzde olarak saklar */
      yuzdeMi: true,
    };
  });
  const ulasilmaz = [
    ...rozet.kart.filter(b => b.esik > rozet.kartToplam).map(b => `${b.ad} (${b.esik}>${rozet.kartToplam} kart)`),
    ...rozet.past.filter(b => b.esik > rozet.pastToplam).map(b => `${b.ad} (${b.esik}>${rozet.pastToplam} soru)`),
  ];
  rec.chk(ulasilmaz.length === 0,
    `Rozet eşikleri ulaşılabilir${ulasilmaz.length ? " — " + ulasilmaz.join(", ") : ""}`);
  const barajHatali = rozet.baraj.filter(b => b.esik !== null && b.esik < 60);
  rec.chk(barajHatali.length === 0,
    `Baraj rozeti gerçek barajın altında verilmiyor (Tam Deneme puanı yüzdedir, baraj 60)${barajHatali.length ? " — " + barajHatali.map(b => `${b.ad}:${b.esik}`).join(", ") : ""}`);
  const adUyumsuz = rozet.kart.concat(rozet.past)
    .filter(b => { const m = b.ad.match(/(\d+)/); return m && +m[1] !== b.esik; });
  rec.chk(adUyumsuz.length === 0,
    `Rozet adındaki sayı eşikle aynı${adUyumsuz.length ? " — " + adUyumsuz.map(b => `${b.ad}≠${b.esik}`).join(", ") : ""}`);

  await page.context().close();
}
