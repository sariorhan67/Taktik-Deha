/* Özet iskeleti ve tipografi.
   Bu paketin asıl işi: özete içerik eklendikçe yapının bozulmadığını garanti etmek.
   Sıralama render sırasında uygulandığı için, yeni blok kaynağın neresine
   eklenirse eklensin kapanış blokları sonda kalmalı. */
import { openApp } from "../lib.mjs";
export const baslik = "Özet iskeleti";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* --- İskelet: … → Hafıza Kancaları → Sınav Radarı --- */
  const iskelet = await page.evaluate(() => {
    return MODULES.map(m => {
      openModule(m.id); switchTab("ozet");
      const pane = document.querySelector("#pane-ozet");
      const bas = [...pane.querySelectorAll(".blk:not(.sayi-serit) h3")].map(h => h.textContent.trim());
      const kaynak = (CONTENT[m.id].ozet.match(/<h3/g) || []).length;
      const kancaIdx = bas.findIndex(x => /Hafıza Kancaları/.test(x));
      const ilkRadar = bas.findIndex(x => /Sınav Radarı/.test(x));
      return {
        no: +m.no, n: bas.length, kaynak,
        radarSon: /Sınav Radarı/.test(bas[bas.length - 1] || ""),
        kancaVar: kancaIdx >= 0, radarVar: ilkRadar >= 0,
        kancaHemenOnce: kancaIdx >= 0 && ilkRadar >= 0 && kancaIdx === ilkRadar - 1,
      };
    });
  });
  const kayip = iskelet.filter(x => x.n !== x.kaynak);
  rec.chk(kayip.length === 0,
    `Sıralama hiçbir bloğu düşürmüyor${kayip.length ? " — " + kayip.map(x => `M${x.no}(${x.n}≠${x.kaynak})`).join(" ") : ""}`);
  rec.chk(iskelet.every(x => x.kancaVar && x.radarVar),
    "Her modülde Hafıza Kancaları ve Sınav Radarı bloğu var");
  const radarKacik = iskelet.filter(x => !x.radarSon);
  rec.chk(radarKacik.length === 0,
    `Sınav Radarı her modülde SON blok — kapanış vaadinden sonra içerik yok${radarKacik.length ? " — " + radarKacik.map(x => "M" + x.no).join(" ") : ""}`);
  const kancaKacik = iskelet.filter(x => !x.kancaHemenOnce);
  rec.chk(kancaKacik.length === 0,
    `Hafıza Kancaları radardan hemen önce${kancaKacik.length ? " — " + kancaKacik.map(x => "M" + x.no).join(" ") : ""}`);

  /* Asıl güvence: kaynağın SONUNA blok eklenirse bile radar sonda kalmalı.
     Kullanıcının çekindiği durum tam olarak bu. */
  const eklemeDayanikli = await page.evaluate(() => {
    const m = MODULES[0], asil = CONTENT[m.id].ozet;
    CONTENT[m.id].ozet = asil + '<div class="blk"><h3>🆕 Sonradan Eklenen</h3><p>x</p></div>';
    openModule(m.id); switchTab("ozet");
    const bas = [...document.querySelectorAll("#pane-ozet .blk:not(.sayi-serit) h3")].map(h => h.textContent.trim());
    CONTENT[m.id].ozet = asil;
    return { son: bas[bas.length - 1], yeniVar: bas.some(x => /Sonradan Eklenen/.test(x)) };
  });
  rec.chk(/Sınav Radarı/.test(eklemeDayanikli.son) && eklemeDayanikli.yeniVar,
    `Kaynağın sonuna blok eklense bile radar sonda kalıyor (son blok: ${eklemeDayanikli.son})`);

  /* --- Vurgu sınıfları ---
     Ayrımın değeri, neyi ALMADIĞINDA. "5 ilke:" gibi liste tanıtan sayaçlar
     sayı vurgusu alırsa şerit çöp dolar ve vurgu yine anlamsızlaşır. */
  const vurgu = await page.evaluate(() => {
    const dogru = ["1739", "10 yıl", "%70", "2,40 m²", "5018 sayılı", "50 cm", "1,5 katı"];
    const yanlis = ["5 ilke:", "10 özellik:", "3 Katman (görünmezden görünene):",
                    "3", "20", "1. Alarm", "4 unsur", "ayrıntılı anlatımı Modül 11"];
    let sayi = 0, tuzak = 0, kancaSizinti = 0;
    MODULES.forEach(m => {
      openModule(m.id); switchTab("ozet");
      const p = document.querySelector("#pane-ozet");
      sayi += p.querySelectorAll("b.v-sayi").length;
      tuzak += p.querySelectorAll("b.v-tuzak").length;
      kancaSizinti += p.querySelectorAll(".kanca b.v-sayi, .kanca b.v-tuzak").length;
      /* uzun ibareler tuzak işareti almamalı: işaret cümleye değil ibareye */
      p.querySelectorAll("b.v-tuzak").forEach(x => {
        if (x.textContent.trim().length > 40) tuzak = -9999;
      });
    });
    return {
      sayi, tuzak, kancaSizinti,
      kacirilan: dogru.filter(t => !ozetSayiMi(t)),
      yanlisAlinan: yanlis.filter(t => ozetSayiMi(t)),
    };
  });
  rec.chk(vurgu.kacirilan.length === 0,
    `Ezberlenen sayılar sayı vurgusu alıyor${vurgu.kacirilan.length ? " — kaçan: " + vurgu.kacirilan.join(", ") : ""}`);
  rec.chk(vurgu.yanlisAlinan.length === 0,
    `Liste tanıtan sayaçlar ve çıplak sayılar vurgu ALMIYOR${vurgu.yanlisAlinan.length ? " — sızan: " + vurgu.yanlisAlinan.join(", ") : ""}`);
  rec.chk(vurgu.sayi > 20 && vurgu.tuzak > 10,
    `Vurgu sınıfları gerçekten uygulanıyor (${vurgu.sayi} sayı · ${vurgu.tuzak} tuzak)`);
  rec.chk(vurgu.kancaSizinti === 0,
    "Hafıza kancasının kendi altın vurgusu bozulmuyor");

  /* --- Kritik sayılar şeridi --- */
  const serit = await page.evaluate(() => {
    let modul = 0, cip = 0, yinelenen = 0, kirikBag = 0, seritsizAmaSayili = 0;
    MODULES.forEach(m => {
      openModule(m.id); switchTab("ozet");
      const p = document.querySelector("#pane-ozet");
      const s = p.querySelector(".sayi-serit");
      const tekil = new Set([...p.querySelectorAll("b.v-sayi")]
        .map(x => x.textContent.trim().replace(/[:.,;]+$/, "")));
      if (!s) { if (tekil.size >= 3) seritsizAmaSayili++; return; }
      modul++;
      const bt = [...s.querySelectorAll(".sy")];
      cip += bt.length;
      const metin = bt.map(x => x.textContent);
      if (new Set(metin).size !== metin.length) yinelenen++;
      /* her çip gerçekten bir vurguya gitmeli, yoksa dokunuş hiçbir yere götürmez */
      bt.forEach(x => {
        if (!p.querySelector('b.v-sayi[data-sy="' + x.dataset.git + '"]')) kirikBag++;
      });
      /* şerit özetin başında olmalı */
      if (p.querySelector(".blk") !== s) kirikBag += 100;
    });
    return { modul, cip, yinelenen, kirikBag, seritsizAmaSayili };
  });
  rec.chk(serit.cip > 30 && serit.modul >= 5,
    `Sayı şeridi ${serit.modul} modülde, toplam ${serit.cip} çip (3'ten az sayısı olan modülde şerit kurulmaz)`);
  rec.chk(serit.yinelenen === 0, "Şeritte aynı sayı iki kez görünmüyor");
  rec.chk(serit.kirikBag === 0,
    "Her çip özetteki vurgusuna bağlı ve şerit ilk blok");
  rec.chk(serit.seritsizAmaSayili === 0,
    "Yeterli sayısı olan hiçbir modül şeritsiz kalmıyor");

  /* --- Radar → çıkmış sorular --- */
  const radarBag = await page.evaluate(() => {
    let dugme = 0, yanlisSayi = 0, radarDisi = 0;
    MODULES.forEach(m => {
      openModule(m.id); switchTab("ozet");
      const p = document.querySelector("#pane-ozet");
      const bt = p.querySelector(".rd-git");
      const bekle = pastPool().filter(q => q.m === m.id).length;
      if (!bt) return;
      dugme++;
      /* düğmedeki sayı gerçek soru sayısını söylemeli */
      const n = +(bt.textContent.match(/\d+/) || [0])[0];
      if (n !== bekle) yanlisSayi++;
      /* düğme radar bloğunun içinde olmalı, ortada bir yerde değil */
      const blk = bt.closest(".blk"), h = blk && blk.querySelector("h3");
      if (!h || !/Sınav Radarı/.test(h.textContent)) radarDisi++;
    });
    return { dugme, yanlisSayi, radarDisi };
  });
  rec.chk(radarBag.dugme === 20,
    `Her modülün radarı çıkmış sorulara bağlanıyor (${radarBag.dugme}/20)`);
  rec.chk(radarBag.yanlisSayi === 0,
    "Düğmedeki soru sayısı gerçek havuzla aynı");
  rec.chk(radarBag.radarDisi === 0,
    "Bağlantı radar bloğunun içinde duruyor");

  /* Bağlantı gerçekten o modülün sorularını açmalı */
  const acilis = await page.evaluate(() => {
    const m = MODULES[8];
    openModule(m.id); switchTab("ozet");
    document.querySelector("#pane-ozet .rd-git").click();
    return {
      ekran: document.querySelector("#scr-past").classList.contains("on") ||
             getComputedStyle(document.querySelector("#scr-past")).display !== "none",
      n: pq && pq.list.length,
      hepsiModul: pq && pq.list.every(q => q.m === m.id),
      etiket: pq && pq.label,
    };
  });
  rec.chk(acilis.hepsiModul && acilis.n > 0,
    `Bağlantı yalnızca o modülün sorularını açıyor (${acilis.n} soru · "${acilis.etiket}")`);

  /* --- Punto basamağı: gövde metniyle tablo arası uçurum olmamalı --- */
  const punto = await page.evaluate(() => {
    openModule(MODULES[8].id); switchTab("ozet");
    const al = s => { const e = document.querySelector("#pane-ozet " + s); return e ? parseFloat(getComputedStyle(e).fontSize) : null; };
    return { p: al(".blk p"), td: al("td"), acilim: al(".kanca .open") };
  });
  rec.chk(punto.p - punto.td <= 2 && punto.p - punto.td >= 0,
    `Tablo metni gövdeden en çok 2px küçük (gövde ${punto.p}px, tablo ${punto.td}px)`);
  rec.chk(punto.p - punto.acilim <= 2,
    `Kanca açılımı gövdeden en çok 2px küçük (${punto.acilim}px)`);

  await page.context().close();
}
