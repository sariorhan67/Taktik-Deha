/* Puan geçmişi, isabete dayalı hazırlık ve Son Tekrar Turu.
   Kritik davranış: hazırlık artık okumakla değil, bilmekle yükselmeli. */
import { openApp } from "../lib.mjs";
export const baslik = "İlerleme ve tur";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* --- Hazırlık isabeti hesaba katıyor mu ---
     Eski davranışta modülü baştan sona okuyup kartları çevirmek, soruları
     yanlış yaparken bile %100 "hazır" gösteriyordu. */
  const hazir = await page.evaluate(() => {
    const m = MODULES.find(x => CONTENT[x.id]), c = CONTENT[m.id];
    const tamOku = () => {
      state.cards[m.id] = {}; c.cards.forEach((_, i) => state.cards[m.id][i] = "ok");
      state.quiz[m.id] = { best: c.quiz.length, attempts: 1 };
      state.match[m.id] = {}; c.match.forEach((_, i) => state.match[m.id][i] = true);
    };
    const yaz = (n, dogruMu) => {
      state.qStat = {};
      for (let i = 0; i < n; i++) qStatYaz(m.id + ":" + (i % c.quiz.length), dogruMu(i), 0);
    };
    tamOku();
    state.qStat = {};
    const soruSuz = moduleReadiness(m.id);
    yaz(10, () => false); const hepYanlis = moduleReadiness(m.id);
    const is0 = modIsabet(m.id);
    yaz(10, i => i % 2 === 0); const yarim = moduleReadiness(m.id);
    yaz(10, () => true); const hepDogru = moduleReadiness(m.id);
    state.qStat = {}; state.cards = {}; state.quiz = {}; state.match = {};
    return { soruSuz, hepYanlis, yarim, hepDogru, is0 };
  });
  rec.chk(hazir.hepYanlis < 0.7,
    `Baştan sona okunmuş ama soruları yanlış yapılan modül "hazır" görünmüyor (%${Math.round(hazir.hepYanlis * 100)})`);
  rec.chk(hazir.hepYanlis < hazir.yarim && hazir.yarim < hazir.hepDogru,
    `Hazırlık isabetle birlikte yükseliyor (%${Math.round(hazir.hepYanlis * 100)} → %${Math.round(hazir.yarim * 100)} → %${Math.round(hazir.hepDogru * 100)})`);
  rec.chk(Math.round(hazir.hepDogru * 100) === 100 && Math.round(hazir.soruSuz * 100) === 100,
    "Hiç soru çözmemiş ile hepsini bilen aynı tepede — isabet cezalandırır, veri yokluğu cezalandırmaz");
  rec.chk(hazir.is0 && hazir.is0.deneme === 10 && hazir.is0.oran === 0,
    `modIsabet tüm geçmişi sayıyor (${hazir.is0 && hazir.is0.deneme} deneme)`);

  /* --- Puan geçmişi --- */
  const puan = await page.evaluate(() => {
    state.puanlar = { tam: [], karma: [] };
    [40, 52, 48, 58, 61].forEach(p => puanKaydet("tam", p));
    const kisa = state.puanlar.tam.length;
    /* tavan: eski kayıtlar düşer, yeniler kalır */
    for (let i = 0; i < 60; i++) puanKaydet("tam", 70 + i);
    const tavanli = state.puanlar.tam;
    const yedek = JSON.parse(snapshot()).puanlar;
    state.puanlar = { tam: [], karma: [] };
    return {
      kisa, tavan: tavanli.length, sonuncu: tavanli[tavanli.length - 1].p,
      ilk: tavanli[0].p, yedekVar: !!(yedek && yedek.tam && yedek.tam.length),
    };
  });
  rec.chk(puan.kisa === 5, `Her deneme puanı kaydediliyor (${puan.kisa})`);
  rec.chk(puan.tavan === 40 && puan.sonuncu === 129,
    `Geçmiş ${puan.tavan} kayıtla sınırlı ve en yeniyi tutuyor (son ${puan.sonuncu}, ilk ${puan.ilk})`);
  rec.chk(puan.yedekVar, "Puan geçmişi yedeğe giriyor");

  /* Eğilim tek denemeye değil, son üçün ortalamasına bakmalı —
     bir kötü deneme "geriliyorsun" dememeli. */
  const egilim = await page.evaluate(() => {
    const kur = a => { state.puanlar = { tam: [], karma: [] }; a.forEach(p => puanKaydet("tam", p)); return puanEgilim("tam"); };
    const r = {
      az: kur([50, 55]),
      yukselen: kur([40, 45, 50, 60, 62, 65]),
      gerileyen: kur([70, 68, 65, 50, 48, 45]),
      yatay: kur([60, 61, 59, 60, 61, 59]),
      /* son deneme kötü ama genel gidiş iyi */
      birKotu: kur([40, 45, 50, 62, 64, 55]),
    };
    state.puanlar = { tam: [], karma: [] };
    return r;
  });
  rec.chk(egilim.az === null, "Dört kayıttan az varken eğilim hesaplanmıyor");
  rec.chk(egilim.yukselen > 1 && egilim.gerileyen < -1,
    `Yükseliş ve gerileyiş ayırt ediliyor (${egilim.yukselen.toFixed(1)} / ${egilim.gerileyen.toFixed(1)})`);
  rec.chk(Math.abs(egilim.yatay) <= 1, `Yatay gidiş yatay okunuyor (${egilim.yatay.toFixed(1)})`);
  rec.chk(egilim.birKotu > 0,
    `Tek kötü deneme "geriliyorsun" demiyor (${egilim.birKotu.toFixed(1)})`);

  /* --- Eğri çizimi --- */
  await page.evaluate(() => {
    state.puanlar = { tam: [40, 52, 48, 58, 61, 57, 64, 66].map(p => ({ t: Date.now(), p })), karma: [] };
    setTab("progress");
  });
  const egri = await page.evaluate(() => ({
    nokta: document.querySelectorAll(".tr-dot").length,
    gecen: document.querySelectorAll(".tr-dot.pass").length,
    baraj: !!document.querySelector(".tr-baraj"),
    son: document.querySelector(".tr-head b").textContent,
    ok: document.querySelector(".tr-ok") && document.querySelector(".tr-ok").textContent,
    etiket: document.querySelector(".tr-svg").getAttribute("aria-label"),
  }));
  rec.chk(egri.nokta === 8 && egri.son === "66",
    `Eğri her denemeyi çiziyor (${egri.nokta} nokta, son ${egri.son})`);
  rec.chk(egri.gecen === 3,
    `Baraj üstü denemeler ayrı renkte (${egri.gecen}/8 — 61, 64, 66)`);
  rec.chk(egri.baraj && /yükseliyor/.test(egri.ok || ""),
    "Baraj çizgisi ve eğilim rozeti görünüyor");
  rec.chk(/8 denemenin puan eğrisi/.test(egri.etiket || ""),
    "Eğri ekran okuyucuya metin olarak da anlatılıyor");

  const bos = await page.evaluate(() => {
    state.puanlar = { tam: [], karma: [] }; renderTrend();
    const a = !!document.querySelector(".tr-bos");
    state.puanlar = { tam: [{ t: Date.now(), p: 55 }], karma: [] }; renderTrend();
    return { sifir: a, bir: !!document.querySelector(".tr-bos") };
  });
  rec.chk(bos.sifir && bos.bir,
    "Tek denemeyle eğri çizilmiyor, ne yapılacağı yazıyor");

  /* --- Son Tekrar Turu --- */
  await page.evaluate(() => setTab("study"));
  const girisEtiket = await page.textContent("#turSub");
  await page.click("#turBtn");
  await page.waitForSelector("#turBody .po-hero");
  const tur = await page.evaluate(() => ({
    n: turListesi().length,
    posterli: MODULES.filter(m => CONTENT[m.id] && CONTENT[m.id].poster).length,
    baslik: document.querySelector("#turBaslik").textContent,
    onceKapali: document.querySelector("#turOnce").disabled,
  }));
  rec.chk(tur.n === 20 && tur.n === tur.posterli,
    `Tur 20 modülün posterini de kapsıyor (${tur.n})`);
  rec.chk(/1\/20/.test(tur.baslik) && tur.onceKapali,
    "Tur baştan başlıyor ve ilk posterde 'önceki' kapalı");

  /* Baştan sona gez: her adımda poster dolu olmalı ve sıra kaymamalı */
  const gezi = await page.evaluate(async () => {
    const l = turListesi(); const gorulen = [];
    startTur(0);
    for (let i = 0; i < l.length; i++) {
      gorulen.push(document.querySelector("#turBody").innerHTML.length);
      if (i < l.length - 1) turGit(1);
    }
    const sonEtiket = document.querySelector("#turSonra").textContent;
    const dolu = document.querySelector("#turFill").style.width;
    return { bos: gorulen.filter(x => x < 200).length, n: gorulen.length, sonEtiket, dolu };
  });
  rec.chk(gezi.bos === 0 && gezi.n === 20,
    `Turun 20 adımında da poster dolu geliyor (${gezi.bos} boş)`);
  rec.chk(/bitir/.test(gezi.sonEtiket) && gezi.dolu === "100%",
    "Son posterde düğme 'bitir' diyor ve çubuk dolu");
  rec.chk(/20 poster/.test(girisEtiket) && /dk/.test(girisEtiket),
    `Giriş etiketi poster sayısını ve süreyi kendisi hesaplıyor ("${girisEtiket}")`);

  await page.context().close();
}
