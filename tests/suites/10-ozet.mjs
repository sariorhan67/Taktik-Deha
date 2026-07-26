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
      const bas = [...pane.querySelectorAll(".blk h3")].map(h => h.textContent.trim());
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
    const bas = [...document.querySelectorAll("#pane-ozet .blk h3")].map(h => h.textContent.trim());
    CONTENT[m.id].ozet = asil;
    return { son: bas[bas.length - 1], yeniVar: bas.some(x => /Sonradan Eklenen/.test(x)) };
  });
  rec.chk(/Sınav Radarı/.test(eklemeDayanikli.son) && eklemeDayanikli.yeniVar,
    `Kaynağın sonuna blok eklense bile radar sonda kalıyor (son blok: ${eklemeDayanikli.son})`);

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
