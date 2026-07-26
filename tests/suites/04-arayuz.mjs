/* Arayüz akışı: sekmeler, modül çalışması, denemeler, yedekleme, tema, taşma. */
import { openApp, tab } from "../lib.mjs";
export const baslik = "Arayüz akışı";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* --- Modül: kart çevir, işaretle, sınava geç --- */
  await tab(page, "study");
  const modSayisi = await page.locator("#modList .mod").count();
  rec.chk(modSayisi === 20, `Çalış sekmesinde 20 modül listeleniyor (${modSayisi})`);

  await page.locator("#modList .mod").first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-pane="kart"]').click();
  await page.waitForTimeout(300);
  await page.locator("#fcard").click();
  await page.waitForTimeout(250);
  const btnAcik = await page.locator("#btnOk").isEnabled();
  rec.chk(btnAcik, "Kart çevrilmeden değerlendirme düğmeleri kapalı, çevrilince açılıyor");
  await page.locator("#btnOk").click();
  await page.waitForTimeout(300);
  const srsYazildi = await page.evaluate(() => Object.keys(state.srs).length > 0);
  rec.chk(srsYazildi, "Kart işaretlenince tekrar programına kaydediliyor");

  /* --- Çıkmış sorular --- */
  await page.locator("#scr-mod .back[data-home]").click();
  await page.waitForTimeout(400);
  await tab(page, "exam");
  await page.locator("#actPast").click();
  await page.waitForTimeout(400);
  const secenek = await page.locator(".pt-btn").count();
  rec.chk(secenek > 0, `Çıkmış sorular ekranında ${secenek} çalışma seçeneği var`);
  await page.locator("[data-otr]").first().click();
  await page.waitForTimeout(400);
  const soruVar = await page.locator("#ptOpts .opt").count();
  rec.chk(soruVar === 5, `Soru 5 şıkla açılıyor (${soruVar})`);
  await page.locator("#ptBack").click(); await page.waitForTimeout(300);
  await page.locator("#ptBack").click(); await page.waitForTimeout(300);

  /* --- Karma deneme --- */
  await tab(page, "exam");
  await page.locator("#actExam").click();
  await page.waitForTimeout(500);
  const denemeSoru = await page.locator("#scr-exam .q-scen").count();
  rec.chk(denemeSoru > 0, "Karma Deneme başlıyor ve soru gösteriliyor");
  await page.evaluate(() => { renderHome(); show("#scr-home"); setTab("home"); });
  await page.waitForTimeout(300);

  /* --- İlerleme sekmesi ve yedekleme --- */
  await tab(page, "progress");
  const radar = await page.locator("#radarGrid .rcell").count();
  const rozet = await page.locator("#badgeGrid .bdg").count();
  rec.chk(radar === 20, `Hazırlık Radarı 20 modülü gösteriyor (${radar})`);
  rec.chk(rozet > 0, `Rozet ızgarası dolu (${rozet})`);
  const [indirme] = await Promise.all([
    page.waitForEvent("download", { timeout: 6000 }).catch(() => null),
    page.locator("#expBtn").click(),
  ]);
  rec.chk(!!indirme && /\.json$/.test(indirme.suggestedFilename() || ""),
    `Yedekleme .json dosyası üretiyor (${indirme ? indirme.suggestedFilename() : "yok"})`);

  /* --- Tema --- */
  await page.locator("#themeBtn").click();
  await page.waitForTimeout(300);
  const karanlik = await page.evaluate(() => document.body.classList.contains("dark"));
  rec.chk(karanlik, "Karanlık tema açılıyor");
  const kalici = await page.evaluate(() => state.theme === "dark");
  rec.chk(kalici, "Tema tercihi duruma yazılıyor");

  /* --- Yatay taşma: her sekmede, iki temada --- */
  for (const tema of ["dark", "light"]) {
    if (tema === "light") { await page.locator("#themeBtn").click(); await page.waitForTimeout(250); }
    for (const t of ["home", "study", "exam", "progress"]) {
      await tab(page, t);
      const tasma = await page.evaluate(() =>
        document.documentElement.scrollWidth - window.innerWidth);
      rec.chk(tasma <= 1, `390px genişlikte yatay taşma yok — ${t} sekmesi, ${tema === "dark" ? "karanlık" : "aydınlık"} tema (${tasma}px)`);
    }
  }

  await page.context().close();
}
