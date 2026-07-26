/* Resmî Sınav Yapısı paneli ve oturum/kademe modeli.
   Panel, duyurudaki soru dağılımını gösterir; veri modeli de duyuruyla
   aynı olmalı: her aday 55 ortak + kendi kademesinin 5 sorusunu çözer. */
import { openApp, tab, RESMI_DAGILIM } from "../lib.mjs";
export const baslik = "Resmî sınav yapısı";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);
  await tab(page, "exam");

  rec.chk(await page.locator(".bp").count() === 1, "Resmî Sınav Yapısı kartı basılıyor");
  await page.locator(".bp summary").click();
  await page.waitForTimeout(350);

  const p = await page.evaluate(() => ({
    acik: document.querySelector(".bp").open,
    satir: document.querySelectorAll(".bp-tbl tr:not(.bp-tot) .bp-w").length,
    toplam: [...document.querySelectorAll(".bp-tbl tr:not(.bp-tot) .bp-w")]
      .reduce((a, e) => a + (+e.textContent || 0), 0),
    sayilar: [...document.querySelectorAll(".bp-tbl tr:not(.bp-tot)")]
      .filter(tr => tr.querySelector(".bp-no"))   /* başlık satırını ele */
      .map(tr => ({ no: +tr.querySelector(".bp-no").textContent,
                    w: +tr.querySelector(".bp-w").textContent })),
    oturum: document.querySelectorAll(".bp-otr div").length,
    cubuk: document.querySelectorAll(".bp-bar").length,
  }));
  rec.chk(p.acik, "Karta dokununca açılıyor");
  rec.chk(p.satir === 20, `20 modül satırı (${p.satir})`);
  rec.chk(p.toplam === 60, `Soru sayıları toplamı 60 (${p.toplam})`);
  rec.chk(p.oturum === 3, `Üç oturum gösteriliyor (${p.oturum})`);
  rec.chk(p.cubuk === 20, `Her modülde hazırlık çubuğu (${p.cubuk})`);

  const yanlis = p.sayilar.filter(r => r.w !== RESMI_DAGILIM[r.no]);
  rec.chk(yanlis.length === 0,
    `Paneldeki sayılar resmî duyuruyla aynı${yanlis.length ? " — sapan: " + yanlis.map(r => `M${r.no}`).join(",") : ""}`);

  /* Tablo dar ekranda taşmamalı — colgroup genişlikleri buna bakıyor */
  const tasma = await page.evaluate(() => {
    const w = document.querySelector(".twrap");
    return w ? w.scrollWidth - w.clientWidth : 0;
  });
  rec.chk(tasma <= 0, `Tablo 390px genişlikte taşmıyor (${tasma}px)`);

  /* Oturum / rol / kademe modeli duyuruyla uyumlu mu */
  const model = await page.evaluate(() => {
    const c = {};
    PAST.forEach(q => { const k = `${q.t}|${q.r}|${q.g}`; c[k] = (c[k] || 0) + 1; });
    const kademeler = ["temel", "orta", "ozel"];
    const ortak = t => c[`${t}|${t === 1 ? "mudur" : "myard"}|ortak`] || 0;
    return {
      ortak1: ortak(1), ortak2: ortak(2), ortak3: ortak(3),
      /* 1. oturum müdür: her kademeye 5 soru */
      mudurKademe: kademeler.map(k => c[`1|mudur|${k}`] || 0),
      /* 2. oturum yalnızca temel eğitim, 3. oturum ortaöğretim + özel eğitim */
      ot2: kademeler.map(k => c[`2|myard|${k}`] || 0),
      ot3: kademeler.map(k => c[`3|myard|${k}`] || 0),
      toplam: PAST.length,
    };
  });
  rec.chk(model.ortak1 === 55 && model.ortak2 === 55 && model.ortak3 === 55,
    `Her oturumda 55 ortak soru (${model.ortak1}/${model.ortak2}/${model.ortak3})`);
  rec.chk(model.mudurKademe.every(n => n === 5),
    `1. oturum (Müdür): her kademe için 5 soru (${model.mudurKademe.join(",")})`);
  rec.chk(model.ot2[0] === 5 && model.ot2[1] === 0 && model.ot2[2] === 0,
    `2. oturum yalnızca Temel Eğitim (${model.ot2.join(",")})`);
  rec.chk(model.ot3[0] === 0 && model.ot3[1] === 5 && model.ot3[2] === 5,
    `3. oturum Ortaöğretim ve Özel Eğitim (${model.ot3.join(",")})`);
  rec.chk(model.toplam === 195, `Banka toplamı 195 soru (${model.toplam})`);

  /* Kademe seçimi havuzu daraltıyor mu: 55 ortak + 5 kademeye özel = her oturumda 60 */
  const kademe = await page.evaluate(() => {
    const out = {};
    ["temel", "orta", "ozel"].forEach(k => {
      state.kademe = k;
      out[k] = pastPool().length;
    });
    state.kademe = null;
    out.hepsi = pastPool().length;
    return out;
  });
  rec.chk(kademe.hepsi === 195, `Kademe seçilmeyince tüm banka açık (${kademe.hepsi})`);
  rec.chk(kademe.temel === 175 && kademe.orta === 175 && kademe.ozel === 175,
    `Kademe seçilince 165 ortak + 10 kademeye özel gösteriliyor (${kademe.temel}/${kademe.orta}/${kademe.ozel})`);

  await page.context().close();
}
