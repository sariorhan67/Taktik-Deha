# Test paketi

Uygulama tek bir `index.html` dosyası olduğu için testler onu gerçek bir tarayıcıda
açar ve hem veriyi hem arayüzü yerinde denetler. Derleme adımı, sunucu veya bağımlılık
dosyası yoktur.

## Çalıştırma

```bash
node tests/run.mjs              # hepsi
node tests/run.mjs srs          # yalnızca adında "srs" geçen dosyalar
node tests/run.mjs olcme veri   # birden fazla süzgeç
```

Çıkış kodu: bir kontrol bile kalırsa `1`, hepsi geçerse `0`. Sürekli tümleştirmede
doğrudan kullanılabilir.

## Gereksinim

Yalnızca **Playwright** ve bir Chromium. Depoda `package.json` tutulmaz; testler
geliştirme sırasında çalıştırılır:

```bash
npm i -D playwright && npx playwright install chromium
```

`tests/lib.mjs`, Playwright'ı önce normal yoldan çözer; bulamazsa bilinen kurulum
dizinlerine bakar. Chromium'u da `PLAYWRIGHT_BROWSERS_PATH` altında arar. İkisi de
yoksa ne yapılacağını söyleyen bir hata verir.

## Dosyalar

| Dosya | Ne denetler |
|---|---|
| `01-veri.mjs` | Üç soru bankasının biçimi; kimliklerin benzersizliği; modül ağırlıklarının resmî duyuruyla aynı olması; her modülde yeterli Hızlı Bilgi sorusu, kart, olumsuz kök ve eşleştirme çifti bulunması |
| `02-olcme.mjs` | Şık karıştırma (modül sınavı, Yanlış Defteri, Hızlı Bilgi), çıkmış sorularda kitapçık sırasının korunması, çeldirici uzunluk dengesi |
| `03-srs.mjs` | Aralık merdiveni, kolaylık katsayısı, unutma davranışı, sınav tarihi sınırı, eski kayıt göçü, sıralama |
| `04-arayuz.mjs` | Sekme akışı, kart çevirme, denemeler, yedekleme, tema, yatay taşma |
| `05-erisilebilirlik.mjs` | WCAG AA metin kontrastı (dört sekme × iki tema), düğme etiketleri, odak görünürlüğü, dokunma hedefi boyutu |
| `06-sinav-yapisi.mjs` | Resmî Sınav Yapısı paneli ve oturum/rol/kademe veri modeli |
| `07-kocu.mjs` | Sınav Koçu (`kocu/index.html`) şık karıştırma — dosya yoksa atlanır |
| `08-deneme.mjs` | Deneme havuzunun format karışımı: kısa kök ve olumsuz kök oranları, modül ağırlıkları, tekrar derinliği |
| `09-zayif.mjs` | Soru istatistiği anahtarları, zorluk fonksiyonu, ağırlıklı seçim, sonuçların doğru deftere yazılması |

## Yeni test yazmak

`tests/suites/` altına bir `.mjs` koy; varsayılan dışa aktarım `{ browser, rec }` alır:

```js
import { openApp, tab } from "../lib.mjs";
export const baslik = "Kısa ad";

export default async function ({ browser, rec }) {
  const page = await openApp(browser, rec);
  rec.chk(kosul, "Ne beklendiğini anlatan cümle");
  rec.skip("Neden atlandığı");            // koşul sağlanmıyorsa
  await page.context().close();
}
```

`openApp` sayfa ve konsol hatalarını kendiliğinden kaydeder; ayrıca yakalamaya gerek yok.

## Yazarken dikkat

**Mesajlar sonucu değil beklentiyi anlatsın.** `rec.chk(x === 20, "20 modül listeleniyor (" + n + ")")`
biçimi, kalınca neyin bozulduğunu doğrudan gösterir.

**Rastgeleliğe dayanan kontrollerde eşik gevşek tutulur.** Şık karıştırma testleri
"24 denemede en az 5 farklı diziliş" arar; kesin bir sayı beklemek testi kırılgan yapar.

**Kontrast tarayıcısı gradyan zeminleri atlar.** Gradyanın tek bir rengi olmadığı için
oran hesaplanamaz; bu öğeler hatalı düşük sayılmak yerine ayrıca sayılır. Yarı saydam
metinler ise zeminle karıştırılıp gerçek renkleri üzerinden ölçülür.

**Eşikler koda gömülü değil, gerekçeli.** Örneğin doğru şıkkın en uzun olma oranı için
üst sınır %40'tır: şans düzeyi %20, %40'ın üstü ise soruyu bilmeden en uzunu seçmeyi
kârlı hâle getirir.

**Uyarlanabilir seçim iki yönden sınanır.** Yalnızca "zayıf soruyu getiriyor mu" değil,
"tamamen zayıfa kilitlenmiyor mu" da denetlenir: saf sömürü, ustalaşmış soruyu bir daha
hiç göstermez ve aralıklı tekrarın kapsama işlevini bozar. Alt sınır %40, üst sınır %90.
