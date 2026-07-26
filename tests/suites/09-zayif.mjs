/* Soru istatistiği ve Zayıf Noktalar pratiği.
   Kritik davranış: her banka aynı anahtar alanını paylaşır, sonuçlar doğru
   deftere yazılır ve seçim gerçekten zayıf sorulara yönelir. */
import { openApp, RESMI_DAGILIM } from "../lib.mjs";
export const baslik = "Zayıf nokta pratiği";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);

  /* --- Anahtar alanı --- */
  const anahtar = await page.evaluate(() => {
    const k = VAKA.map(qKey).concat(HIZLI.map(qKey), PAST.map(qKey));
    return {
      n: k.length, tekil: new Set(k).size,
      bos: k.filter(x => !x).length,
      vakaBicimi: /^m\d+:\d+$/.test(qKey(VAKA[0])),
      /* vaka anahtarı Yanlış Defteri'ninkiyle aynı olmalı, yoksa iki ayrı
         kayıt tutulur ve defter ile istatistik birbirini tutmaz */
      defterleAyni: qKey(VAKA[0]) === MODULES.find(m => CONTENT[m.id]).id + ":0",
    };
  });
  rec.chk(anahtar.tekil === anahtar.n && anahtar.bos === 0,
    `Üç bankanın ${anahtar.n} sorusu benzersiz anahtar taşıyor (${anahtar.tekil} tekil)`);
  rec.chk(anahtar.vakaBicimi && anahtar.defterleAyni,
    "Vaka anahtarı Yanlış Defteri anahtarıyla aynı biçimde (m:i)");

  /* --- Zorluk fonksiyonu --- */
  const z = await page.evaluate(() => {
    state.qStat = {};
    const yap = (k, n, ok) => { for (let i = 0; i < n; i++) qStatYaz(k, i < ok); };
    yap("hep-yanlis", 5, 0); yap("hep-dogru", 5, 5);
    yap("bir-yanlis", 1, 0); yap("bir-dogru", 1, 1);
    /* 3 yanlış sonra 2 doğru: düzelme sayılmalı ama hiç yanlışlamamış kadar değil */
    qStatYaz("duzelen", false); qStatYaz("duzelen", false); qStatYaz("duzelen", false);
    qStatYaz("duzelen", true); qStatYaz("duzelen", true);
    const r = {
      gorulmemis: qZorluk("hic-yok"),
      hepYanlis: qZorluk("hep-yanlis"), hepDogru: qZorluk("hep-dogru"),
      birYanlis: qZorluk("bir-yanlis"), birDogru: qZorluk("bir-dogru"),
      duzelen: qZorluk("duzelen"),
    };
    state.qStat = {};
    return r;
  });
  rec.chk(z.gorulmemis === 0.5,
    `Hiç çözülmemiş soru orta öncelik alıyor (${z.gorulmemis}) — bilinmiyor, kolay değil`);
  rec.chk(z.hepYanlis > z.gorulmemis && z.gorulmemis > z.hepDogru,
    `Sıralama doğru: hep yanlış (${z.hepYanlis.toFixed(2)}) > görülmemiş (${z.gorulmemis}) > hep doğru (${z.hepDogru.toFixed(3)})`);
  rec.chk(z.birYanlis < z.hepYanlis && z.birDogru > z.hepDogru,
    `Tek gözlem beş gözlem kadar güvenilir sayılmıyor (1 yanlış ${z.birYanlis.toFixed(2)} < 5 yanlış ${z.hepYanlis.toFixed(2)})`);
  rec.chk(z.duzelen < z.hepYanlis && z.duzelen > z.hepDogru,
    `Arka arkaya doğru bilmek kartı geri plana atıyor ama sıfırlamıyor (${z.duzelen.toFixed(2)})`);

  /* --- Seçim gerçekten zayıfa gidiyor mu --- */
  const sec = await page.evaluate(() => {
    state.qStat = {}; state.kademe = null;
    const batik = VAKA.slice(0, 30).map(qKey);
    batik.forEach(k => { for (let i = 0; i < 3; i++) qStatYaz(k, false); });
    VAKA.slice(30).concat(HIZLI, PAST).forEach(q => {
      for (let i = 0; i < 4; i++) qStatYaz(qKey(q), true);
    });
    let isabet = 0; const TUR = 30;
    for (let t = 0; t < TUR; t++)
      isabet += zayifHavuz().map(qKey).filter(k => batik.includes(k)).length;
    const bir = zayifHavuz(), iki = zayifHavuz();
    const r = {
      pay: isabet / (TUR * ZAYIF_N),
      sans: batik.length / (VAKA.length + HIZLI.length + PAST.length),
      boy: bir.length,
      tekrarsiz: new Set(bir.map(qKey)).size === bir.length,
      degisken: bir.map(qKey).join("|") !== iki.map(qKey).join("|"),
    };
    state.qStat = {};
    return r;
  });
  rec.chk(sec.boy === 20 && sec.tekrarsiz,
    `Pratik ${sec.boy} soru getiriyor, aynı soru iki kez gelmiyor`);
  rec.chk(sec.pay > 0.4,
    `Batırılan sorular seçimin %${Math.round(sec.pay * 100)}'ini oluşturuyor (şans düzeyi %${Math.round(sec.sans * 100)})`);
  rec.chk(sec.pay < 0.9,
    `Seçim tamamen zayıfa kilitlenmiyor, %${Math.round((1 - sec.pay) * 100)} kapsama payı kalıyor`);
  rec.chk(sec.degisken, "Aynı 20 soru her seferinde gelmiyor (ağırlıklı ama rastgele)");

  /* --- Soğuk başlangıç: kayıt yokken resmî ağırlığa göre dağılmalı --- */
  const soguk = await page.evaluate(() => {
    state.qStat = {}; state.kademe = null;
    const say = {};
    for (let t = 0; t < 50; t++) zayifHavuz().forEach(q => { say[q.m] = (say[q.m] || 0) + 1; });
    return MODULES.filter(m => say[m.id]).map(m => ({ no: +m.no, w: m.w, n: say[m.id] }));
  });
  const mx = soguk.reduce((a, x) => a + x.w, 0) / soguk.length;
  const my = soguk.reduce((a, x) => a + x.n, 0) / soguk.length;
  const kor = soguk.reduce((a, x) => a + (x.w - mx) * (x.n - my), 0) /
    (Math.sqrt(soguk.reduce((a, x) => a + (x.w - mx) ** 2, 0)) *
     Math.sqrt(soguk.reduce((a, x) => a + (x.n - my) ** 2, 0)));
  rec.chk(kor > 0.7,
    `Geçmiş yokken seçim resmî modül ağırlığını izliyor (korelasyon ${kor.toFixed(2)})`);

  /* --- Uçtan uca: sonuçlar doğru deftere yazılıyor mu --- */
  await page.evaluate(() => { state.qStat = {}; state.wrongQ = {}; state.pastR = {}; });
  await page.click("#actWrong");
  await page.waitForSelector("#znStart");
  await page.click("#znStart");
  await page.waitForSelector("#ptOpts .opt");
  const kaynaklar = new Set();
  for (let i = 0; i < 20; i++) {
    kaynaklar.add(await page.evaluate(() => {
      const t = document.querySelector("#pastBody .pt-tag").textContent;
      return /Oturum/.test(t) ? "cikmis" : /Vaka/.test(t) ? "vaka" : "hizli";
    }));
    await page.click("#ptOpts .opt:nth-child(1)");
    await page.waitForSelector("#ptExpl .expl");
    const kaynak = await page.textContent("#ptExpl .basis");
    if (!kaynak.trim() || /undefined/.test(kaynak))
      throw new Error("bozuk kaynak satırı: " + kaynak);
    if (i < 19) await page.click("#ptNext");
  }
  const yazim = await page.evaluate(() => {
    const vakaN = Object.keys(state.qStat).filter(k => k.includes(":")).length;
    return {
      istatistik: Object.keys(state.qStat).length,
      vakaN, bankaN: Object.keys(state.qStat).length - vakaN,
      /* vaka yanlışları Yanlış Defteri'ne, banka sonuçları çözülmüş kaydına */
      defter: Object.keys(state.wrongQ).length,
      banka: Object.keys(state.pastR).length,
      defterSizinti: Object.keys(state.wrongQ).filter(k => !k.includes(":")).length,
      bankaSizinti: Object.keys(state.pastR).filter(k => k.includes(":")).length,
    };
  });
  rec.chk(yazim.istatistik === 20,
    `20 cevabın hepsi istatistiğe işlendi (${yazim.istatistik})`);
  rec.chk(kaynaklar.size >= 2,
    `Pratik tek bankaya sıkışmıyor — gelen kaynaklar: ${[...kaynaklar].join(", ")}`);
  rec.chk(yazim.defterSizinti === 0 && yazim.bankaSizinti === 0,
    `Sonuçlar doğru deftere yazıldı (vaka→Yanlış Defteri ${yazim.defter}, banka→çözülmüş ${yazim.banka})`);
  rec.chk(yazim.banka === yazim.bankaN,
    `Her banka sorusu çözülmüş olarak kaydedildi (${yazim.banka}/${yazim.bankaN})`);

  /* --- Çeldirici takibi ---
     Şıklar her açılışta karıştığı için "C'yi seçtim" kalıcı bir bilgi değildir;
     kaydedilen indeks ÖZGÜN dizideki yeri göstermeli, ekrandaki sırayı değil.
     Bu yanlış olursa istatistik sessizce yanlış çeldiriciyi biriktirir. */
  const celdirici = await page.evaluate(() => {
    const mid = MODULES.find(m => CONTENT[m.id]).id, q = CONTENT[mid].quiz[0];
    let kaydirmali = 0, hata = 0;
    const TUR = 120;
    for (let t = 0; t < TUR; t++) {
      state.qStat = {};
      openModule(mid); switchTab("sinav"); initQuiz(mid);
      const gorunen = qz.ord.findIndex(o => o !== q.c);
      const ozgun = qz.ord[gorunen];
      pick(gorunen);
      const kayit = +Object.keys(state.qStat[mid + ":0"].y)[0];
      if (ozgun !== gorunen) kaydirmali++;
      if (kayit !== ozgun) hata++;
    }
    /* Yanlış Defteri çözücüsü ve deneme yolu da aynı eşlemeyi yapmalı */
    state.qStat = {};
    const it = { src: "vaka", m: mid, i: 0, ord: [3, 1, 4, 0, 2], correct: 0, pick: null };
    denemeYaz(it, false, 2);                  /* ekranda 3. sıra → özgün 4 */
    const denemeKayit = +Object.keys(state.qStat[mid + ":0"].y)[0];
    /* boş bırakma ve süre dolması çeldirici saymamalı */
    state.qStat = {};
    denemeYaz(it, false, null);
    const bosVar = !!(state.qStat[mid + ":0"].y);
    const bosSayildi = state.qStat[mid + ":0"].n;
    state.qStat = {};
    return { TUR, kaydirmali, hata, denemeKayit, bosVar, bosSayildi };
  });
  rec.chk(celdirici.kaydirmali > celdirici.TUR * 0.5,
    `Karıştırma testi anlamlı: ${celdirici.kaydirmali}/${celdirici.TUR} denemede ekran sırası özgün sıradan farklı`);
  rec.chk(celdirici.hata === 0,
    `Kaydedilen çeldirici ekrandaki harfi değil özgün şıkkı gösteriyor (${celdirici.TUR} denemede 0 sapma)`);
  rec.chk(celdirici.denemeKayit === 4,
    `Deneme yolu da ord ile çeviriyor (ekran 2 → özgün ${celdirici.denemeKayit}, beklenen 4)`);
  rec.chk(!celdirici.bosVar && celdirici.bosSayildi === 1,
    "Boş bırakılan / süresi dolan soru denemeye sayılıyor ama çeldirici olarak sayılmıyor");

  /* --- Karışım listesi --- */
  const karisim = await page.evaluate(() => {
    state.qStat = {};
    const mid = MODULES.find(m => CONTENT[m.id]).id, q = CONTENT[mid].quiz[0];
    const yanlisA = [0, 1, 2, 3, 4].find(i => i !== q.c);
    const yanlisB = [0, 1, 2, 3, 4].find(i => i !== q.c && i !== yanlisA);
    for (let i = 0; i < 5; i++) qStatYaz(mid + ":0", false, yanlisA);
    for (let i = 0; i < 2; i++) qStatYaz(mid + ":0", false, yanlisB);
    /* ikinci bir soru, daha az karıştırılan */
    qStatYaz(mid + ":1", false, [0, 1, 2, 3, 4].find(i => i !== CONTENT[mid].quiz[1].c));
    const l = karisimListesi(8);
    const bas = l[0];
    const r = {
      n: l.length,
      enUstKez: bas.kez, enUstToplam: bas.toplam,
      /* en sık seçilen yanlış gösterilmeli, ikinci sıradaki değil */
      dogruCeldirici: bas.yanlis === yanlisA,
      /* doğru şık asla "karıştırılan" olarak gösterilmemeli */
      dogruSikSizmasi: l.some(x => x.yanlis === x.q.c),
      siralama: l.every((x, i, a) => i === 0 || a[i - 1].kez >= x.kez),
    };
    state.qStat = {};
    return r;
  });
  rec.chk(karisim.n === 2 && karisim.enUstKez === 5 && karisim.enUstToplam === 7,
    `Karışım listesi doğru sayıyor (${karisim.n} soru, en üstte 5/7 kez)`);
  rec.chk(karisim.dogruCeldirici,
    "Listede sorunun EN SIK seçilen yanlış şıkkı gösteriliyor");
  rec.chk(!karisim.dogruSikSizmasi,
    "Doğru şık hiçbir zaman 'karıştırdığın' olarak listelenmiyor");
  rec.chk(karisim.siralama, "Liste en çok karıştırılandan aza doğru sıralı");

  /* --- Kalıcılık: istatistik yedeğe girmeli --- */
  const kalici = await page.evaluate(() => {
    state.qStat = {};
    const mid = MODULES.find(m => CONTENT[m.id]).id;
    qStatYaz(mid + ":0", false, 3);
    qStatYaz(mid + ":0", false, 3);
    qStatYaz(mid + ":1", true);
    const j = JSON.parse(snapshot());
    const e = (j.qStat || {})[mid + ":0"] || {};
    state.qStat = {};
    return { n: Object.keys(j.qStat || {}).length, deneme: e.n, celdirici: e.y && e.y["3"] };
  });
  rec.chk(kalici.n === 2 && kalici.deneme === 2 && kalici.celdirici === 2,
    `İstatistik ve çeldirici sayaçları yedeğe giriyor (${kalici.n} kayıt, çeldirici ×${kalici.celdirici})`);

  await page.context().close();
}
