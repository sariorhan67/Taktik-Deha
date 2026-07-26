/* Aralıklı tekrar zamanlayıcısı.
   Kritik davranış: kart programdan hiç silinmemeli. Önceki sürüm 3 doğru
   cevaptan sonra kaydı siliyordu ve kart bir daha hiç sorulmuyordu. */
import { openApp } from "../lib.mjs";
export const baslik = "Aralıklı tekrar (SRS)";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);
  const modId = await page.evaluate(() => MODULES.find(x => CONTENT[x.id]).id);

  /* --- Merdiven --- */
  const merdiven = await page.evaluate(() => {
    state.examDate = null; state.srs = {};
    const m = MODULES.find(x => CONTENT[x.id]).id, out = [];
    for (let i = 0; i < 8; i++) {
      srsMark(m, 0, "ok");
      const e = state.srs[m + ":0"];
      out.push({ stage: e.stage, gun: Math.round((e.due - Date.now()) / DAY), ef: e.ef });
    }
    return out;
  });
  const gun = merdiven.map(x => x.gun);
  rec.chk(gun[0] === 1 && gun[1] === 3, `İlk iki aralık tam 1 ve 3 gün (${gun[0]}, ${gun[1]})`);
  rec.chk(gun.slice(0, 6).every((v, i, a) => i === 0 || v > a[i - 1]),
    `Aralıklar sürekli büyüyor (${gun.slice(0, 6).join("→")} gün)`);
  rec.chk(gun[5] >= 60, `6. tekrarda aralık 60 günü aşıyor (${gun[5]} gün)`);
  rec.chk(merdiven[7].stage === merdiven[6].stage && gun[7] >= 60,
    "En üst basamakta kart silinmiyor, dönmeye devam ediyor");
  rec.chk(merdiven.every(x => x.ef <= 2.8 + 1e-9), "Kolaylık katsayısı tavanı aşmıyor");

  /* --- Unutma --- */
  const unut = await page.evaluate(() => {
    state.examDate = null; state.srs = {};
    const m = MODULES.find(x => CONTENT[x.id]).id;
    for (let i = 0; i < 5; i++) srsMark(m, 1, "ok");
    const once = { ...state.srs[m + ":1"] };
    srsMark(m, 1, "again");
    const sonra = { ...state.srs[m + ":1"] };
    return { once, sonra, gun: Math.round((sonra.due - Date.now()) / DAY) };
  });
  rec.chk(unut.sonra.stage === unut.once.stage - 2,
    `Unutunca iki basamak geri düşüyor, sıfırlanmıyor (${unut.once.stage}→${unut.sonra.stage})`);
  rec.chk(unut.gun === 1, "Unutulan kart ertesi gün yeniden geliyor");
  rec.chk(unut.sonra.ef < unut.once.ef,
    `Kolaylık katsayısı düşüyor (${unut.once.ef.toFixed(2)}→${unut.sonra.ef.toFixed(2)})`);
  rec.chk(unut.sonra.lapses === 1, "Unutma sayacı artıyor");

  /* --- Sınav tarihi sınırı --- */
  const kalan = 9;
  const cap = await page.evaluate((k) => {
    state.srs = {};
    const d = new Date(Date.now() + k * DAY);
    state.examDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
                     "-" + String(d.getDate()).padStart(2, "0");
    const m = MODULES.find(x => CONTENT[x.id]).id, out = [];
    for (let i = 0; i < 7; i++) { srsMark(m, 2, "ok"); out.push(Math.round((state.srs[m + ":2"].due - Date.now()) / DAY)); }
    state.examDate = null;
    return out;
  }, kalan);
  rec.chk(Math.max(...cap) <= kalan - 1,
    `Sınava ${kalan} gün varken hiçbir tekrar sınavdan sonraya atılmıyor (en uzak ${Math.max(...cap)} gün)`);

  /* --- Eski kayıt göçü --- */
  const goc = await page.evaluate(() => {
    const m = MODULES.find(x => CONTENT[x.id]).id;
    state.srs = {}; state.cards = { [m]: {} }; state.srsV = 0; state.examDate = null;
    for (let i = 0; i < 12; i++) state.cards[m][i] = "ok";   // eski sürümde silinmiş kartlar
    state.srs[m + ":0"] = { due: Date.now() + DAY, stage: 1 }; // eski biçim: ef/lapses yok
    const n = srsMigrate();
    const e = srsEntry(m + ":0");
    const gunler = Object.values(state.srs).map(v => Math.round((v.due - Date.now()) / DAY));
    return { n, srsV: state.srsV, toplam: Object.keys(state.srs).length,
             eskiStage: e.stage, eskiEf: e.ef,
             min: Math.min(...gunler), max: Math.max(...gunler),
             ikinci: srsMigrate() };
  });
  rec.chk(goc.n === 11, `Eski sürümde silinen kartlar programa geri alındı (${goc.n})`);
  rec.chk(goc.eskiStage === 1 && goc.eskiEf === 2.3,
    "Mevcut eski kayıt korundu, eksik alanlar varsayılanla tamamlandı");
  rec.chk(goc.max <= 11 && goc.min >= 1,
    `Geri alınanlar 1-10 güne yayıldı, tek güne yığılmadı (${goc.min}-${goc.max})`);
  rec.chk(goc.srsV === 2 && goc.ikinci === undefined, "Göç yalnızca bir kez çalışıyor");

  /* --- Sıralama ve ölü kayıt eleme --- */
  const dl = await page.evaluate((m) => {
    state.srs = {};
    state.srs[m + ":0"] = { due: Date.now() - 1 * DAY, stage: 1, ef: 2.3, lapses: 0 };
    state.srs[m + ":1"] = { due: Date.now() - 9 * DAY, stage: 1, ef: 2.3, lapses: 0 };
    state.srs[m + ":2"] = { due: Date.now() - 4 * DAY, stage: 1, ef: 2.3, lapses: 0 };
    state.srs[m + ":3"] = { due: Date.now() + 5 * DAY, stage: 1, ef: 2.3, lapses: 0 };
    state.srs["olmayan:99"] = { due: Date.now() - 2 * DAY, stage: 1, ef: 2.3, lapses: 0 };
    return { list: dueList(), nd: nextDueDays() };
  }, modId);
  rec.chk(dl.list.length === 3, `Vadesi gelmeyen ve içeriği olmayan kayıtlar elendi (${dl.list.length})`);
  rec.chk(dl.list[0].endsWith(":1"), "En çok gecikmiş kart başa alınıyor");
  rec.chk(dl.nd === 1, `Sıradaki tekrar günü geçerli kayıtlardan hesaplanıyor (${dl.nd})`);

  await page.context().close();
}
