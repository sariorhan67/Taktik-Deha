/* Özet iskeleti ve aktif hatırlama.
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

  /* --- Aktif hatırlama maskesi --- */
  const maske = await page.evaluate(() => {
    state.ozetGizli = true;
    const kotu = { thMaskeli: 0, ilkSutunMaskeli: 0, gorunurMaske: 0, bosHucre: 0 };
    let toplam = 0, tablo = 0, radar = 0, kanca = 0;
    MODULES.forEach(m => {
      openModule(m.id); switchTab("ozet"); ozetModu();
      const pane = document.querySelector("#pane-ozet");
      toplam += pane.querySelectorAll(".gz").length;
      tablo += pane.querySelectorAll("td .gz").length;
      radar += pane.querySelectorAll("ul.radar li .gz").length;
      kanca += pane.querySelectorAll(".kanca .open .gz").length;
      kotu.thMaskeli += pane.querySelectorAll("th .gz").length;
      pane.querySelectorAll("table tr").forEach(tr => {
        if (tr.querySelector("th") || tr.cells.length < 2) return;
        if (tr.cells[0].querySelector(".gz")) kotu.ilkSutunMaskeli++;
        /* ipucu sütunu boşsa satır anlamsız kalır */
        if (!tr.cells[0].textContent.trim()) kotu.bosHucre++;
      });
      /* maskelenen metin torunlarıyla birlikte gerçekten görünmez olmalı:
         .kanca .code b gibi kendi rengi olan öğeler maskenin içinden okunabilirdi */
      pane.querySelectorAll(".gz, .gz *").forEach(e => {
        if (getComputedStyle(e).color !== "rgba(0, 0, 0, 0)") kotu.gorunurMaske++;
      });
    });
    state.ozetGizli = false;
    return { toplam, tablo, radar, kanca, ...kotu };
  });
  rec.chk(maske.toplam > 200,
    `Hatırlama modu 20 modülde ${maske.toplam} cevap maskeliyor (tablo ${maske.tablo} · radar ${maske.radar} · kanca ${maske.kanca})`);
  rec.chk(maske.thMaskeli === 0 && maske.ilkSutunMaskeli === 0,
    "Tabloda başlık satırı ve ipucu sütunu açık kalıyor — maskelenen yalnızca cevap sütunu");
  rec.chk(maske.gorunurMaske === 0,
    `Maskelenen metin torunlarıyla birlikte görünmez (${maske.gorunurMaske} sızıntı)`);

  /* --- Açma / kapama --- */
  const davranis = await page.evaluate(() => {
    openModule(MODULES[8].id); switchTab("ozet");
    state.ozetGizli = true; ozetModu();
    const pane = document.querySelector("#pane-ozet");
    const g = pane.querySelectorAll(".gz");
    g[0].click();
    const birAcik = [...g].filter(x => x.classList.contains("ac")).length;
    /* modu kapatıp açınca açılmış maskeler sıfırlanmalı */
    state.ozetGizli = false; ozetModu();
    state.ozetGizli = true; ozetModu();
    const sifirlandi = [...pane.querySelectorAll(".gz")].filter(x => x.classList.contains("ac")).length;
    /* mod kapalıyken tıklamak bir şey yapmamalı */
    state.ozetGizli = false; ozetModu();
    pane.querySelectorAll(".gz")[1].click();
    const kapaliyken = [...pane.querySelectorAll(".gz")].filter(x => x.classList.contains("ac")).length;
    const dugme = document.querySelector("#ozGizle");
    return { birAcik, sifirlandi, kapaliyken, dugmeVar: !!dugme, etiket: dugme && dugme.textContent };
  });
  rec.chk(davranis.birAcik === 1,
    "Dokunulan maske tek başına açılıyor, diğerleri kapalı kalıyor");
  rec.chk(davranis.sifirlandi === 0,
    "Moddan çıkıp girince açılmış maskeler sıfırlanıyor");
  rec.chk(davranis.kapaliyken === 0,
    "Hatırlama modu kapalıyken tıklama bir şeyi açmıyor");
  rec.chk(davranis.dugmeVar && /kapat ve hatırla/.test(davranis.etiket),
    `Düğme modu doğru anlatıyor ("${davranis.etiket}")`);

  /* --- Tercih kalıcı olmalı --- */
  const kalici = await page.evaluate(() => {
    state.ozetGizli = true;
    const j = JSON.parse(snapshot());
    state.ozetGizli = false;
    return j.ozetGizli;
  });
  rec.chk(kalici === true, "Hatırlama modu tercihi yedeğe giriyor");

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
