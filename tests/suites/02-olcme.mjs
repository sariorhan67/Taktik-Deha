/* Ölçme geçerliği: şık karıştırma ve çeldirici uzunluk dengesi.
   Şıklar karışmazsa "cevap hep B" ezberi işe yarar; doğru şık hep en uzunsa
   soruyu bilmeden de bulunur. İkisi de ölçülen şeyi bozar. */
import { openApp, tab } from "../lib.mjs";
export const baslik = "Ölçme geçerliği";

/* Rastgeleliğe dayanan kontrollerde eşikler bilinçli olarak gevşek:
   24 denemede 5'ten az farklı diziliş, karıştırmanın çalışmadığını gösterir. */
const DENEME = 24, ESIK = 5;

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* --- Modül sınavı --- */
  await tab(page, "study");
  await page.locator("#modList .mod").first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-pane="sinav"]').click();
  await page.waitForTimeout(350);

  const mq = await page.evaluate((n) => {
    const seen = new Set();
    for (let i = 0; i < n; i++) { initQuiz(curMod); seen.add(qz.ord.join("")); }
    initQuiz(curMod);
    const q = CONTENT[curMod].quiz[0];
    const ekran = [...document.querySelectorAll("#pane-sinav #opts .opt span:nth-child(2)")]
      .map(e => e.textContent);
    const hizali = ekran.every((t, x) => t === q.o[qz.ord[x]]);
    /* doğru şıkkı işaretle */
    initQuiz(curMod);
    const dsp = qz.ord.indexOf(q.c);
    document.querySelectorAll("#pane-sinav #opts .opt")[dsp].click();
    const dogruAkis = !!document.querySelector("#pane-sinav .opt.picked-ok");
    /* yanlış işaretle: doğru şık doğru konumda açılmalı, harf ekrana göre olmalı */
    initQuiz(curMod);
    const dsp2 = qz.ord.indexOf(q.c);
    document.querySelectorAll("#pane-sinav #opts .opt")[(dsp2 + 1) % 5].click();
    const opts = [...document.querySelectorAll("#pane-sinav #opts .opt")];
    return {
      spread: seen.size, hizali, dogruAkis,
      reveal: opts.findIndex(o => o.classList.contains("reveal")), dsp: dsp2,
      verdict: document.querySelector("#explBox .verdict").textContent.trim(),
    };
  }, DENEME);

  rec.chk(mq.spread >= ESIK, `Modül sınavında şık sırası değişiyor (${mq.spread}/${DENEME} farklı diziliş)`);
  rec.chk(mq.hizali, "Ekrandaki şık metinleri karıştırma sırasıyla birebir eşleşiyor");
  rec.chk(mq.dogruAkis, "Doğru şık işaretlenince olumlu geri bildirim veriliyor");
  rec.chk(mq.reveal === mq.dsp, `Yanlışta doğru şık ekrandaki konumunda açılıyor (${mq.reveal}=${mq.dsp})`);
  rec.chk(mq.verdict.includes("ABCDE"[mq.dsp]), `Geri bildirim harfi ekrandaki konumu gösteriyor — "${mq.verdict}"`);

  /* --- Hızlı Bilgi karışır, çıkmış sorular kitapçık sırasını korur --- */
  const pq = await page.evaluate((n) => {
    const hz = hizliPool(), pt = pastPool();
    const seen = new Set();
    for (let i = 0; i < n; i++) { startPast(hz.slice(0, 1), "t"); seen.add(pq.ord.join("")); }
    startPast(pt.slice(0, 1), "t");
    const kitapcik = pq.ord.join("");
    const q = pq.list[0];
    document.querySelectorAll("#ptOpts .opt")[q.c].click();
    return { spread: seen.size, kitapcik,
             verdict: document.querySelector("#ptExpl .verdict").textContent.trim() };
  }, DENEME);

  rec.chk(pq.spread >= ESIK, `Hızlı Bilgi'de şıklar karışıyor (${pq.spread}/${DENEME})`);
  rec.chk(pq.kitapcik === "01234",
    `Çıkmış sorularda kitapçık sırası korunuyor — resmî anahtar harfleriyle eşleşsin diye (ord=${pq.kitapcik})`);
  rec.chk(pq.verdict.startsWith("✓"), `Çıkmış soruda resmî anahtar şıkkı doğru sayılıyor — "${pq.verdict}"`);

  /* --- Yanlış Defteri --- */
  const wr = await page.evaluate((n) => {
    const m = MODULES.find(x => CONTENT[x.id] && CONTENT[x.id].quiz.length).id;
    state.wrongQ[m + ":0"] = true; state.wrongQ[m + ":1"] = true;
    startWrongSolve();
    const seen = new Set();
    for (let i = 0; i < n; i++) { renderWrongSolve(); seen.add(wr.ord.join("")); }
    renderWrongSolve();
    const key = wr.list[wr.i], [mm, ii] = key.split(":");
    const dsp = wr.ord.indexOf(CONTENT[mm].quiz[+ii].c);
    document.querySelectorAll("#wrongBody #opts .opt")[dsp].click();
    return { spread: seen.size, silindi: !state.wrongQ[key] };
  }, DENEME);

  rec.chk(wr.spread >= ESIK, `Yanlış Defteri'nde şıklar karışıyor (${wr.spread}/${DENEME})`);
  rec.chk(wr.silindi, "Doğru cevaplanan soru Yanlış Defteri'nden siliniyor");

  /* --- Denemelerde doğru şık eşlemesi --- */
  const den = await page.evaluate(() => {
    const e = buildExamPool(), f = buildFullPool();
    const eok = e.every(it => {
      const q = CONTENT[it.ref.m].quiz[it.ref.i];
      return it.ord[it.correct] === q.c;
    });
    const fok = f.every(it => it.ord[it.correct] === CONTENT[it.m].quiz[it.i].c);
    return { e: e.length, f: f.length, eok, fok };
  });
  rec.chk(den.eok && den.fok,
    `Karma (${den.e}) ve Tam Deneme (${den.f}) karıştırılmış şıklarda doğru cevabı doğru işaretliyor`);

  /* --- Çeldirici uzunluk ipucu --- */
  const len = await page.evaluate(() => {
    const kes = t => String(t).replace(/<[^>]+>/g, "");
    const olc = list => {
      let uzun = 0, fark = 0;
      list.forEach(q => {
        const L = q.o.map(o => kes(o).length);
        const dis = L.filter((_, i) => i !== q.c);
        if (L[q.c] > Math.max(...dis)) uzun++;
        fark += L[q.c] - L.reduce((a, b) => a + b, 0) / L.length;
      });
      return { n: list.length, oran: uzun / list.length, fark: fark / list.length };
    };
    const vaka = [];
    Object.values(CONTENT).forEach(c => (c.quiz || []).forEach(q => vaka.push(q)));
    return { vaka: olc(vaka), hizli: olc(HIZLI) };
  });

  /* Şans düzeyi %20. %40'ın üstü, soruyu bilmeden en uzunu seçmeyi kârlı kılar. */
  for (const [ad, s] of [["Vaka", len.vaka], ["Hızlı Bilgi", len.hizli]]) {
    rec.chk(s.oran <= 0.40,
      `${ad}: doğru şık en uzun olma oranı %${Math.round(s.oran * 100)} (şans %20, eşik %40)`);
    rec.chk(s.fark <= 8,
      `${ad}: doğru şıkkın ortalama uzunluk avantajı ${s.fark >= 0 ? "+" : ""}${s.fark.toFixed(1)} karakter (eşik +8)`);
  }

  await page.context().close();
}
