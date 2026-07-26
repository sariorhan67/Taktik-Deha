/* Sınav Koçu (kocu/index.html) — yalnızca o dal üzerinde varsa çalışır.
   Aşama 4 vaka sınavı ve Deneme Sınavı şıkları karıştırmalı. */
import { openApp, hasKocu, KOCU } from "../lib.mjs";
export const baslik = "Sınav Koçu";

export default async function ({ browser, rec }) {
  if (!hasKocu) {
    rec.skip("kocu/index.html bu dalda yok");
    return;
  }
  const page = await openApp(browser, rec, "file://" + KOCU);
  await page.waitForFunction(() => typeof window.MODULES !== "undefined", { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(400);

  await page.locator('[data-action="open"]').first().click();
  await page.waitForTimeout(600);
  for (let i = 0; i < 3; i++) {
    await page.locator(".advance-btn").click();
    await page.waitForTimeout(500);
  }
  const etiket = await page.locator(".stage-label").innerText();
  rec.chk(/A[Şş][Aa][Mm][Aa]\s*4/i.test(etiket), `Aşama 4 açılıyor — ${etiket}`);

  const d = await page.evaluate(() => {
    const oku = () => [...document.querySelectorAll("#q-0 .quiz-option span:nth-child(2)")]
      .map(e => e.textContent).join("|");
    const seen = new Set();
    for (let i = 0; i < 20; i++) { renderStage(null, 4, STAGE4_DATA); seen.add(oku()); }
    renderStage(null, 4, STAGE4_DATA);
    const src = STAGE4_DATA.questions[0];
    const el = document.getElementById("q-0");
    const ekran = [...el.querySelectorAll(".quiz-option span:nth-child(2)")].map(e => e.textContent);
    const hizali = ekran[+el.dataset.correct] === src.options[src.correctIndex];
    const ayni = [...ekran].sort().join("|") === [...src.options].sort().join("|");
    /* doğru işaretle */
    renderStage(null, 4, STAGE4_DATA);
    const e1 = document.getElementById("q-0"), c1 = +e1.dataset.correct;
    e1.querySelectorAll(".quiz-option")[c1].click();
    const olumlu = /(^|\s)correct/.test(document.getElementById("fb-0").className) &&
                   !/incorrect/.test(document.getElementById("fb-0").className);
    /* yanlış işaretle */
    renderStage(null, 4, STAGE4_DATA);
    const e2 = document.getElementById("q-0"), c2 = +e2.dataset.correct;
    e2.querySelectorAll(".quiz-option")[(c2 + 1) % 5].click();
    const opts = [...e2.querySelectorAll(".quiz-option")];
    return { spread: seen.size, hizali, ayni, olumlu,
             acilan: opts.findIndex(o => o.classList.contains("correct-answer")), c2 };
  });

  rec.chk(d.spread >= 5, `Aşama 4'te şık sırası değişiyor (${d.spread}/20 diziliş)`);
  rec.chk(d.ayni, "Şık kümesi bozulmuyor, yalnızca sırası değişiyor");
  rec.chk(d.hizali, "data-correct ekrandaki doğru şıkla eşleşiyor");
  rec.chk(d.olumlu, "Doğru şık işaretlenince olumlu geri bildirim veriliyor");
  rec.chk(d.acilan === d.c2, `Yanlışta doğru şık doğru konumda açılıyor (${d.acilan}=${d.c2})`);

  /* Deneme sınavı da karıştırmalı */
  const den = await page.evaluate(() => {
    if (typeof shuffleOpts !== "function") return null;
    const m = MODULES.find(x => staticFor(x.id, "deneme"));
    if (!m) return null;
    const q = staticFor(m.id, "deneme").questions[0];
    const seen = new Set();
    for (let i = 0; i < 20; i++) seen.add(shuffleOpts(q).options.join("|"));
    const s = shuffleOpts(q);
    return { spread: seen.size, dogru: s.options[s.correctIndex] === q.options[q.correctIndex] };
  });
  if (den) {
    rec.chk(den.spread >= 5, `Deneme Sınavı şıkları karıştırıyor (${den.spread}/20)`);
    rec.chk(den.dogru, "Karıştırma sonrası doğru cevap doğru konuma taşınıyor");
  } else {
    rec.skip("Deneme Sınavı havuzu bulunamadı");
  }

  await page.context().close();
}
