/* Ortak test altyapısı.
   Playwright ve Chromium'u ortamdan bulur; testler yalnızca kontrol yazar. */
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const APP = "file://" + join(ROOT, "index.html");
export const KOCU = join(ROOT, "kocu", "index.html");
export const hasKocu = existsSync(KOCU);

/* Playwright: önce normal çözümleme, olmazsa bilinen kurulum yolları. */
async function loadPlaywright() {
  const tries = [
    "playwright",
    "playwright-core",
    "/opt/node22/lib/node_modules/playwright/index.js",
    "/usr/lib/node_modules/playwright/index.js",
  ];
  /* CommonJS olarak yüklenen paketlerde dışa aktarımlar .default altında olur */
  const norm = m => (m && m.chromium) ? m : (m && m.default && m.default.chromium ? m.default : null);
  for (const t of tries) {
    try {
      const m = norm(await import(t.startsWith("/") ? "file://" + t : t));
      if (m) return m;
    } catch { /* sıradakini dene */ }
  }
  try { const m = norm(require("playwright")); if (m) return m; } catch { /* yok */ }
  throw new Error(
    "Playwright bulunamadı. Kurulum: npm i -D playwright\n" +
    "Bu depoda bağımlılık tutulmaz; testler yalnızca geliştirme sırasında çalıştırılır."
  );
}

/* Chromium çalıştırılabilir dosyası: Playwright kendi bulamazsa PLAYWRIGHT_BROWSERS_PATH altına bak. */
function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const dir = readdirSync(base).filter(d => d.startsWith("chromium")).sort().pop();
  if (!dir) return undefined;
  for (const rel of ["chrome-linux/chrome", "chrome-linux/headless_shell"]) {
    const p = join(base, dir, rel);
    if (existsSync(p)) return p;
  }
  return undefined;
}

export async function launch() {
  const { chromium } = await loadPlaywright();
  const exe = findChromium();
  return chromium.launch(exe ? { executablePath: exe } : {});
}

/* Tek bir testin sonucunu toplayan kayıt defteri. */
export function makeRecorder() {
  const passed = [], failed = [], skipped = [], errors = [];
  return {
    passed, failed, skipped, errors,
    /* chk(koşul, mesaj) — koşul doğruysa geçer, değilse kalır */
    chk(cond, msg) { (cond ? passed : failed).push(msg); return !!cond; },
    skip(msg) { skipped.push(msg); },
    error(msg) { errors.push(msg); },
  };
}

/* Uygulamayı açar; konsol ve sayfa hatalarını kaydeder.
   Yazı tipi ve ağ hataları çevrimdışı çalışmada normaldir, elenir. */
export async function openApp(browser, rec, url = APP, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    acceptDownloads: true, ...opts,
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => rec.error("PAGEERR: " + e.message));
  page.on("console", m => {
    if (m.type() === "error" && !/fonts|net::ERR|ERR_CONNECTION/.test(m.text()))
      rec.error("CONSOLE: " + m.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  /* MODULES klasik betikte const ile tanımlı: script kapsamında durur, window'a yazılmaz.
     Bu yüzden window.MODULES değil, doğrudan tanımlılığı sınanır. */
  await page.waitForFunction(() => typeof MODULES !== "undefined", { timeout: 15000 })
    .catch(() => rec.error("Uygulama betiği yüklenmedi (MODULES tanımsız)"));
  await page.waitForTimeout(300);
  return page;
}

/* Sekme değiştirme kısayolu */
export async function tab(page, name) {
  await page.locator(`#tabbar [data-tab="${name}"]`).click();
  await page.waitForTimeout(350);
}

/* Resmî sınav duyurusundaki soru dağılımı — ağırlıkların tek doğruluk kaynağı.
   2026 Yönetici Yetiştirme Program Sonu Değerlendirme e-Sınav Duyurusu, ÖDSGM. */
export const RESMI_DAGILIM = {
  1: 2, 2: 3, 3: 4, 4: 2, 5: 4, 6: 4, 7: 4, 8: 3, 9: 3, 10: 2,
  11: 5, 12: 4, 13: 2, 14: 2, 15: 4, 16: 2, 17: 2, 18: 2, 19: 2, 20: 4,
};
