/* Deneme havuzu: format karışımı, modül ağırlıkları, havuz derinliği ve iki
   kaynaklı (vaka + Hızlı Bilgi) maddelerin uçtan uca çalışması.

   Gerçek sınavın ölçülmüş profili (195 çıkmış soru): kısa kök %52, olumsuz kök %29.
   Deneme yalnızca vaka bankasından kurulursa kısa kök %18'de kalır ve var olmayan
   bir sınav formatına hazırlar. */
import { openApp } from "../lib.mjs";
export const baslik = "Deneme havuzu";

const TUR = 40;           /* örneklem: rastgeleliğin gürültüsünü düşürmek için */
const GERCEK_KISA = 0.52; /* çıkmış sorulardan ölçüldü */

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  const d = await page.evaluate((n) => {
    const kes = t => String(t).replace(/<[^>]+>/g, "");
    const olumsuz = /değildir|olamaz|yanlış|söylenemez|yer almaz|sayılmaz|beklenmez|yoktur/i;
    let kisa = 0, olm = 0, top = 0, hz = 0, boyutHata = 0;
    const modSayac = {}, kullanim = {}, esleme = [];
    for (let t = 0; t < n; t++) {
      const pool = buildFullPool();
      if (pool.length !== 60) boyutHata++;
      pool.forEach(it => {
        const q = denemeQ(it);
        top++;
        if (kes(q.s).length < 160) kisa++;
        if (olumsuz.test(kes(q.s))) olm++;
        if (it.src === "hizli") hz++;
        modSayac[it.m] = (modSayac[it.m] || 0) + 1;
        kullanim[it.src + ":" + (it.k || it.m + "#" + it.i)] = 1;
        /* karıştırılmış şıkta doğru cevap doğru yere düşmüş mü */
        esleme.push(it.ord[it.correct] === q.c && q.o.length === 5);
      });
    }
    const agirlikSapma = MODULES
      .map(m => ({ no: m.no, ort: (modSayac[m.id] || 0) / n, w: m.w }))
      .filter(x => Math.abs(x.ort - x.w) > 0.01);
    return {
      boyutHata, kisa: kisa / top, olm: olm / top, hz: hz / top,
      agirlikSapma, farkli: Object.keys(kullanim).length,
      esleme: esleme.every(Boolean),
      vakaToplam: Object.values(CONTENT).reduce((a, c) => a + (c.quiz || []).length, 0),
    };
  }, TUR);

  rec.chk(d.boyutHata === 0, `Her deneme tam 60 soru üretiyor (${TUR} turda ${d.boyutHata} sapma)`);
  rec.chk(d.agirlikSapma.length === 0,
    `Modül başına çekilen soru sayısı resmî ağırlığa eşit${d.agirlikSapma.length ? " — sapan: " + d.agirlikSapma.map(x => `M${x.no}(${x.ort.toFixed(2)}≠${x.w})`).join(" ") : ""}`);
  rec.chk(d.esleme, "Karıştırılmış şıklarda doğru cevap doğru konuma eşleniyor");

  /* Format karışımı gerçek sınava yakın olmalı; ±8 puanlık bant örneklem
     gürültüsünü tolere eder ama tek kaynaklı havuza (%18) geri dönüşü yakalar. */
  rec.chk(Math.abs(d.kisa - GERCEK_KISA) <= 0.08,
    `Kısa kök oranı gerçek sınava yakın: %${Math.round(d.kisa * 100)} (gerçek %52, bant ±8)`);
  rec.chk(d.hz > 0.25 && d.hz < 0.55,
    `Denemenin bir bölümü Hızlı Bilgi bankasından geliyor: %${Math.round(d.hz * 100)}`);

  /* Havuz derinliği: tek kaynaklı sürümde 40 denemede yalnızca vaka bankası
     (213 soru) dolaşılabiliyordu. */
  rec.chk(d.farkli > d.vakaToplam,
    `${TUR} denemede kullanılan farklı soru sayısı vaka bankasını aşıyor (${d.farkli} > ${d.vakaToplam})`);

  /* Uçtan uca: iki kaynaklı maddeler cevaplanıp sonuç ekranı üretilebiliyor mu,
     ve her kaynak kendi defterine yazıyor mu? */
  const akis = await page.evaluate(() => {
    state.wrongQ = {}; state.pastR = {};
    startFull();
    const N = fx.list.length;
    const hzVar = fx.list.some(it => it.src === "hizli");
    const vakaVar = fx.list.some(it => it.src === "vaka");
    fx.list.forEach((it, n) => { it.pick = n % 3 === 0 ? it.correct : (it.correct + 1) % 5; });
    const beklenenDogru = fx.list.filter(it => it.pick === it.correct).length;
    finishFull(false);
    const govde = document.getElementById("fullBody").innerText;
    return {
      N, hzVar, vakaVar, beklenenDogru,
      puan: state.full.best,
      hzKayit: Object.keys(state.pastR).length,
      wqKayit: Object.keys(state.wrongQ).length,
      analiz: document.querySelectorAll(".fx-tbl tr").length,
      cozum: document.querySelectorAll(".fx-rev").length,
      bosDayanak: [...document.querySelectorAll(".fx-rev .basis")]
        .filter(e => e.textContent.replace(/[📌\s]/g, "") === "").length,
      metin: (govde.match(/(\d+) doğru \/ (\d+) soru/) || []).slice(1).join("/"),
    };
  });

  rec.chk(akis.hzVar && akis.vakaVar, "Deneme her iki kaynaktan da soru içeriyor");
  rec.chk(akis.metin === `${akis.beklenenDogru}/${akis.N}`,
    `Sonuç ekranı doğru sayısını doğru yazıyor (${akis.metin})`);
  rec.chk(Math.abs(akis.puan - akis.beklenenDogru / akis.N * 100) < 0.02,
    `Puan doğru/soru oranından hesaplanıyor (${akis.puan})`);
  rec.chk(akis.analiz > 1, `Modül bazlı analiz tablosu doluyor (${akis.analiz} satır)`);
  rec.chk(akis.cozum === akis.N - akis.beklenenDogru,
    `Yanlışların tamamı çözüm listesine giriyor (${akis.cozum})`);
  rec.chk(akis.hzKayit > 0 && akis.wqKayit > 0,
    `Her kaynak kendi defterine yazıyor — Hızlı Bilgi ${akis.hzKayit}, Yanlış Defteri ${akis.wqKayit}`);
  rec.chk(akis.bosDayanak === 0,
    `Çözüm kartlarında dayanak satırı boş kalmıyor (${akis.bosDayanak} boş)`);

  /* Karma Deneme aynı karışımı taşımalı */
  const karma = await page.evaluate(() => {
    let hz = 0, tur = 30;
    for (let t = 0; t < tur; t++) hz += buildExamPool().filter(it => it.src === "hizli").length;
    startExam();
    const n = ex.list.length;
    exPick(ex.list[0].correct);
    return { n, hzOrt: hz / tur,
             verdict: document.querySelector("#scr-exam .verdict").textContent.trim() };
  });
  rec.chk(karma.n === 10, `Karma Deneme 10 soru (${karma.n})`);
  rec.chk(karma.hzOrt > 1, `Karma Deneme de kısa bilgi sorusu içeriyor (ortalama ${karma.hzOrt.toFixed(1)}/10)`);
  rec.chk(karma.verdict.startsWith("✓"), `Karma Deneme cevabı doğru değerlendiriliyor — "${karma.verdict}"`);

  await page.context().close();
}
