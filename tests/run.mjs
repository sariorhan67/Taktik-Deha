#!/usr/bin/env node
/* Test koşucusu.
   Kullanım:  node tests/run.mjs            (hepsi)
              node tests/run.mjs srs bank   (ad parçasıyla süz) */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { launch, makeRecorder } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const filtre = process.argv.slice(2);
const dosyalar = readdirSync(join(here, "suites"))
  .filter(f => f.endsWith(".mjs"))
  .filter(f => !filtre.length || filtre.some(k => f.includes(k)))
  .sort();

if (!dosyalar.length) {
  console.error("Eşleşen test yok:", filtre.join(", "));
  process.exit(2);
}

const G = "\x1b[32m", K = "\x1b[31m", S = "\x1b[33m", D = "\x1b[2m", X = "\x1b[0m";
let browser;
try {
  browser = await launch();
} catch (e) {
  console.error(K + e.message + X);
  process.exit(2);
}

let tGecti = 0, tKaldi = 0, tAtlandi = 0, tHata = 0;
const basladi = Date.now();

for (const dosya of dosyalar) {
  const mod = await import("file://" + join(here, "suites", dosya));
  const rec = makeRecorder();
  const ad = mod.baslik || dosya.replace(/^\d+-|\.mjs$/g, "");
  process.stdout.write(`\n${D}──${X} ${ad}\n`);
  try {
    await mod.default({ browser, rec });
  } catch (e) {
    rec.error("Test çöktü: " + (e && e.message ? e.message : String(e)));
  }
  rec.passed.forEach(m => console.log(`  ${G}✓${X} ${m}`));
  rec.skipped.forEach(m => console.log(`  ${S}–${X} ${m} ${D}(atlandı)${X}`));
  rec.failed.forEach(m => console.log(`  ${K}✗${X} ${m}`));
  rec.errors.forEach(m => console.log(`  ${K}!${X} ${m}`));
  tGecti += rec.passed.length; tKaldi += rec.failed.length;
  tAtlandi += rec.skipped.length; tHata += rec.errors.length;
}

await browser.close();
const sn = ((Date.now() - basladi) / 1000).toFixed(1);
const kotu = tKaldi + tHata;
console.log(
  `\n${kotu ? K : G}${"═".repeat(46)}${X}\n` +
  `  ${tGecti} geçti · ${tKaldi} kaldı · ${tAtlandi} atlandı · ${tHata} hata   ${D}${sn}s${X}\n` +
  `${kotu ? K : G}${"═".repeat(46)}${X}`
);
process.exit(kotu ? 1 : 0);
