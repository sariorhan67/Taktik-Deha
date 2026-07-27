/* Açılış hızı ve çevrimdışı dayanıklılık.
   Kritik davranış: yavaş bağlantı, bağlantısızlıktan KÖTÜ olmamalı. Ölçümde
   bloklayan yazı tipi bağlantısı yüzünden ağ varken ilk boyama 12,8 sn,
   ağ hiç yokken 0,2 sn sürüyordu. */
import { launch, APP, ROOT } from "../lib.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
export const baslik = "Açılış ve çevrimdışı";

const ESIK = 3000;   /* proxy'li ortamda bile rahatça altında kalmalı */

export default async function ({ browser, rec }) {
  const olc = async (fontEngelle) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    if (fontEngelle) await page.route("**://fonts.*/**", r => r.abort());
    const t0 = Date.now();
    await page.goto(APP, { waitUntil: "domcontentloaded" });
    const dom = Date.now() - t0;
    await page.waitForSelector("#scr-home", { state: "visible" });
    const gorunur = Date.now() - t0;
    const hazir = await page.evaluate(() => typeof MODULES !== "undefined");
    await ctx.close();
    return { dom, gorunur, hazir };
  };

  const agli = await olc(false);
  const agsiz = await olc(true);

  rec.chk(agli.hazir && agsiz.hazir,
    "Uygulama ağ olsa da olmasa da açılıyor");
  rec.chk(agli.gorunur < ESIK,
    `Ağ varken ilk ekran ${agli.gorunur}ms'de görünüyor (eşik ${ESIK}ms)`);
  rec.chk(agsiz.gorunur < ESIK,
    `Ağ yokken ilk ekran ${agsiz.gorunur}ms'de görünüyor (eşik ${ESIK}ms)`);
  /* Asıl kural: ağ varken açılış, ağ yokkinden belirgin biçimde yavaş olamaz.
     Bloklayan yazı tipi bağlantısı bu oranı 64 kat bozuyordu. */
  rec.chk(agli.gorunur < agsiz.gorunur + ESIK,
    `Yavaş ağ, bağlantısızlıktan kötü değil (ağlı ${agli.gorunur}ms · ağsız ${agsiz.gorunur}ms)`);

  /* Yazı tipi bağlantısı bloklamayan biçimde yazılmış olmalı — hız ölçümü
     ortama göre oynayabilir, bu kontrol niyeti sabitler. */
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const fontSatir = html.split("\n").filter(l => /fonts\.googleapis\.com\/css2/.test(l));
  const bloklayan = fontSatir.filter(l => !/media=["']print["']/.test(l) && !/<noscript>/.test(l));
  rec.chk(fontSatir.length >= 1 && bloklayan.length === 0,
    `Yazı tipi stil dosyası render'ı bloklamıyor (${fontSatir.length} bağlantı, ${bloklayan.length} bloklayan)`);
  rec.chk(/<noscript>[\s\S]*fonts\.googleapis[\s\S]*<\/noscript>/.test(html),
    "JS kapalıyken yazı tipleri için <noscript> yedeği var");

  /* Service worker: HTML'de ağ süresiz beklenmemeli, yazı tipleri önbelleğe girmeli */
  const sw = readFileSync(join(ROOT, "sw.js"), "utf8");
  rec.chk(/AG_ZAMAN_ASIMI|setTimeout/.test(sw),
    "Service worker HTML'de ağı süresiz beklemiyor (zaman aşımı var)");
  rec.chk(/fonts\.\(googleapis\|gstatic\)|fonts\\\.\(googleapis/.test(sw) || /gstatic/.test(sw),
    "Service worker yazı tiplerini önbelleğe alıyor");
  const surum = sw.match(/const CACHE\s*=\s*"([^"]+)"/);
  rec.chk(!!surum && /v(\d+)/.test(surum[1]),
    `Önbellek sürümlü (${surum && surum[1]}) — strateji değişince eski önbellek devrede kalmaz`);
  /* Yazı tipi önbelleği, sürüm temizliğinde silinmemeli */
  rec.chk(/k !== FONT_CACHE/.test(sw),
    "Sürüm temizliği yazı tipi önbelleğini silmiyor");

  /* Uygulama tek dosya kalmalı: yazı tipi dışında uzak kaynak olmamalı */
  const uzak = [...new Set((html.match(/https?:\/\/[^"' )]+/g) || []))]
    .filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  rec.chk(uzak.length === 0,
    `Yazı tipi dışında uzak kaynak yok${uzak.length ? " — " + uzak.join(", ") : ""}`);
}
