# Yönetici Adayı · Çalışma Defteri

MEB **"İlk Defa Yönetici Görevlendirme — Yetiştirme Programı"** e-sınavına hazırlık için
tek dosyalık, tamamen çevrimdışı çalışan bir çalışma defteri uygulaması.

Tüm uygulama tek bir `index.html` dosyasındadır — **API, sunucu, derleme veya `npm install`
gerektirmez**. İnternet olmadan da çalışır (yalnızca yazı tipleri çevrimiçi yüklenir; yoksa
sistem yazı tipine düşer).

## Özellikler

**Her modülde (20 modül):**
- 📋 Özet — sabit iskelet: **çekirdek fikir → konu blokları → 🧠 hafıza kancaları →
  🎯 sınav radarı**. Radar kapanış bloğudur ("bunlar sorulur"), bu yüzden her modülde
  **son** gelir. Sıralama kaynağa değil ekrana uygulanır: özete ileride nereye blok
  eklenirse eklensin kapanış blokları kendiliğinden sonda kalır, iskelet eklemelerle
  bozulmaz. Özet uzunluğu modülün yoğunluğuna göre değişir — sabit değildir.
- 🙈 **Kapat ve hatırla** (özet sekmesinde) — özeti okumak üretken *hissettirir* ama
  en zayıf çalışma biçimidir. Bu düğme aynı içeriği tek satır değiştirmeden
  **geri-getirme pratiğine** çevirir: tabloda cevap sütunu, sınav radarında kritik
  vurgular, hafıza kancalarında açılım satırı maskelenir; dokununca tek tek açılır.
  Toplam **357 gizlenebilir cevap**. Neyin gizleneceği içeriğin biçimine göre
  seçildi — tabloda kalın metni maskelemek olmazdı, çünkü hücrelerin %33'ü baştan
  sona kalın; orada ipucu ilk sütunda kalır.
- 🧠 Zihin haritası
- 📊 Karşılaştırma tablosu
- 🔗 Eşleştirme alıştırması — **361 çift**, her modülde sınavda getirdiği soru
  sayısının en az beş katı
- 🃏 Kartlar (aralıklı tekrar / SRS) — **191 kart**, her modülde sınavda getirdiği
  soru sayısının en az üç katı
- 🎯 Vaka soruları (optik formlu mini sınav)

**📄 Çıkmış Sorular (25 Temmuz 2026 e-Sınavı):**
- MEB Yönetici Yetiştirme Program Sonu Değerlendirme e-Sınavının **195 gerçek sorusu**
- Cevaplar **resmî cevap anahtarından** doğrulanmıştır (3 oturumun tamamı)
- **Kademe seçimi:** Gerçek sınavda herkes ortak soruları çözer, üstüne kendi kademesinin
  5 sorusu gelir. Temel Eğitim / Ortaöğretim / Özel Eğitim seçilince yalnızca ilgili
  sorular gösterilir (165 ortak + 10 kademeye özel)
- **195 sorunun tamamında çözüm açıklaması var** — yalnızca "doğru cevap C" demez;
  doğrunun neden doğru olduğunu, her çeldiricinin neden yanlış olduğunu ve konuyu
  ayırt ettiren ipucunu ders notlarına dayanarak anlatır (ortalama ~420 karakter)
- Her soru; oturum, rol (Müdür / Müdür Yardımcısı), kademe ve modül etiketi taşır
- Oturuma göre, modüle göre, karışık 60 soru veya "hiç çözmediklerim" olarak çalışma
- Yanlışların ayrı listede birikir, tekrar çözülebilir

**⚡ Hızlı Bilgi (161 kısa soru):**
Gerçek sınavın baskın formatı **kısa bilgi sorusu**dur (%70) ve yaklaşık üçte biri
**olumsuz kök** taşır ("Hangisi ... değildir?"). Uygulamanın kendi 200 sorusu vaka tipiydi; bu banka o açığı
kapatır. Sorular ders notlarına dayanır ve gerçek sınavda çıkan ama uygulamada zayıf kalan
konulara odaklanır: MÖZEM, özel eğitim uygulama evleri, destek eğitim odası, yardımcı
teknolojiler, TEFBİS/EKAP/HYS-MYS/KBS/MEBBİS, Selye ve 3A+S modeli, isim-eser
eşleştirmeleri, PESTLE, normlar hiyerarşisi ve diğerleri.

Banka, **resmî soru dağılımına göre dengelenmiştir**: her modül, sınavda getirdiği soru
sayısının iki katı kadar Hızlı Bilgi sorusu taşır. Önceden dört modülde (Yenilikçilik ve
Değişim Yönetimi, Katılımcı Kurum Yönetimi, İnsan Hakları ve Demokrasi, Etkili İletişim)
hiç soru yoktu. Her sorunun çözüm açıklaması vardır.

**Çalışma araçları:**
- 🔁 **Günün Tekrarı** — aralıklı tekrar (SRS). Aralık merdiveni **1 · 3 · 7 · 14 · 30 · 60 gün**;
  kart hiçbir zaman programdan silinmez, en üst basamakta da dönmeye devam eder. Her kartın
  bir **kolaylık katsayısı** vardır: kolay gelen kartların arası açılır, zorlananların sıklaşır.
  Unutulan kart sıfırlanmaz — iki basamak geri düşüp ertesi gün yeniden gelir.
  **Sınav tarihi girdiysen hiçbir tekrar sınavdan sonraya atılmaz.**
- 📕 **Yanlış Defteri** — yanlış sorular ve zorlanılan kartlar otomatik birikir
- 🎯 **Seni Zorlayanlar** (Yanlış Defteri'nde) — defterin ileri hâli. Defter "şu an
  yanlış duran" soruyu tutar; bu ise **her sorunun tüm geçmişine** bakar: kaç kez
  görüldü, kaçı doğru, kaç kez arka arkaya bilindi. Üç bankanın **584 sorusundan**
  seni en çok zorlayan 20'sini çeker. Sık yanlışladığın öne çıkar, arka arkaya doğru
  bildiğin geri plana düşer ama **hiç silinmez**; hiç görmediğin soru "kolay" değil
  "bilinmiyor" sayılır. Tek denemelik gözlem beş denemelik kadar güvenilir sayılmaz
  (Laplace düzeltmesi), böylece bir kez dikkatsizlik ettiğin soru sonsuza kadar
  tepede kalmaz. Modülün sınav ağırlığı da çarpandır — 5 soru getiren modüldeki
  zayıflık, 2 soru getirendekinden pahalıdır. Seçim ağırlıklı ama **rastgeledir**:
  aynı 20 soru iki kez gelmez, dörtte biri kapsama için ayrılır.
- 🔀 **En Çok Karıştırdıkların** — yalnızca doğru/yanlış değil, **hangi çeldiriciyi
  seçtiğin** de kaydedilir. Şıklar her açılışta karıştığı için "C'yi seçtim" kalıcı
  bir bilgi değildir; saklanan şey şıkkın **özgün dizi indeksi**, yani seçtiğin
  *metin*. Böylece uygulama "bu soruyu bilmiyorsun" yerine «*Örgütsel bilgi toplama*
  yerine **Teşhis**» diyebiliyor — ve 195+161 sorunun açıklaması zaten her çeldiriciyi
  tek tek çürüttüğü için, karıştırdığın ayrımın izahı doğrudan altında çıkıyor.
  Her kartta sorunun kökü de görünür: vaka sorularında şıklar kavram değil senaryo
  etiketi olabiliyor ("L Okulu → K Okulu") ve çift tek başına anlamsız kalırdı.
  Boş bırakılan veya süresi dolan soru çeldirici olarak sayılmaz.
- ⏱ **Karma Deneme** (10 soru) ve 🎓 **Tam Deneme** (60 soru · 75 dk) — soru dağılımı
  resmî ağırlıklara, **format karışımı gerçek sınavın ölçülmüş profiline** göre kurulur:
  çıkmış 195 soruda kısa bilgi kökü %52'dir, bu yüzden denemenin de yaklaşık yarısı
  Hızlı Bilgi bankasından, kalanı vaka bankasından çekilir. **Olumsuz kök** oranı da
  gözetilir: gerçek sınavın %31'i «hangisi … değildir?» biçimindedir ve bu ayrı bir
  beceridir — en iyi seçeneği bulmak yerine beş seçeneğin de doğruluğunu yoklamayı
  gerektirir. Her deneme farklı bir bileşim taşır; havuz 389 soruya çıktığı için aynı
  soru daha seyrek tekrarlanır.
- 📅 Sınav tarihi geri sayımı, genel ilerleme çubuğu

**Bu sürümde eklenenler:**
- 🎯 **Bugünkü Odağın** — akıllı çalışma planı: modülün sınav ağırlığını, mevcut
  hazırlığını ve kalan gün sayısını birleştirip "bugün şu modüllere çalış" önerisi verir
- 🔥 **Çalışma serisi (streak)** — ardışık çalışma günlerini takip eder
- 🎯 **Günün hedefi** — günlük kart hedefi ve ilerleme halkası
- 🏅 **Rozetler** — 10 kilometre taşı rozeti (kazanınca bildirim)
- 🗺️ **Hazırlık Radarı** — 20 modülün hazırlık durumunu tek bakışta gösteren ısı haritası
  (başlanmadı · zayıf · orta · hazır); dokununca modülü açar
- 💾 **Yedekle / Geri Yükle** — ilerlemeyi `.json` olarak dışa aktar, başka cihaza taşı
- ☾ Karanlık / aydınlık tema

**Ölçme geçerliği (bu sürümde düzeltildi):**
- 🔀 **Şıklar her seferinde karıştırılır** — modül sınavı, Yanlış Defteri ve Hızlı Bilgi'de
  şık sırası her açılışta yeniden kurulur. Böylece "cevap hep B'dir" gibi ezber kısayolları
  çalışmaz; ölçülen şey konu bilgisi olur. **Çıkmış sorularda kitapçık sırası korunur** —
  gerçek sınav deneyimi ve resmî cevap anahtarı harfleriyle birebir eşleşsin diye.
- 📏 **Çeldirici uzunlukları dengelendi** — doğru şıkkın en uzun şık olma oranı
  %51'den %31'e (şans düzeyi ~%20), ortalama uzunluk avantajı +14 karakterden
  +3 karaktere indirildi. Doğru şıkta duran gerekçe cümleleri, soruyu bilmeden
  ipucu vermesin diye çözüm açıklamasına taşındı — bilgi kaybı yok, açıklamalar zenginleşti.
- 🔤 **Açıklamalar harf değil içerik anlatır** — "C şıkkı yanlıştır" yerine
  «şıkkın kendi metni» yazılır; şıklar karıştığında açıklama tutarlı kalır.

**📋 Resmî Sınav Yapısı (Deneme sekmesinde):**
Millî Eğitim Akademisi Başkanlığı / ÖDSGM'nin yayımladığı **2026 Yönetici Yetiştirme
Program Sonu Değerlendirme e-Sınav Duyurusu**'ndaki resmî soru dağılımı tablosu, her
modülün yanında kendi hazırlık yüzdenle birlikte gösterilir. Oturum yapısı da duyurudaki
gibidir: 1. Oturum 10.00 Müdür · 2. Oturum 13.00 Müdür Yrd. (Temel Eğitim) ·
3. Oturum 16.00 Müdür Yrd. (Ortaöğretim / Özel Eğitim).

> **Not:** Modül ağırlıkları (her modülün kaç soru getirdiği) **resmî sınav duyurusundaki
> soru dağılımı tablosundan** alınmıştır — tahmin değildir. Bu sayede "Bugünkü Odağın"
> planı, Hazırlık Radarı ve Tam Deneme gerçek sınavın ağırlıklarını yansıtır.

## Testler

```bash
node tests/run.mjs        # 168 kontrol · ~140 sn
node tests/run.mjs srs    # ad parçasıyla süz
```

Uygulama tek dosya olduğu için testler onu gerçek bir tarayıcıda açıp hem veriyi hem
arayüzü yerinde denetler: soru bankalarının biçimi, modül ağırlıklarının resmî duyuruyla
aynılığı, şık karıştırma, aralıklı tekrar zamanlayıcısı, özet iskeleti, deneme havuzunun format
karışımı, uyarlanabilir soru seçimi, WCAG AA kontrastı (dört sekme × iki tema) ve
yatay taşma. Ayrıntılar için [`tests/README.md`](tests/README.md).

## Çalıştırma

Dosyayı tarayıcıda açmanız yeterli:

```bash
# macOS
open index.html
# Linux
xdg-open index.html
# Windows
start index.html
```

İsterseniz yerel sunucuyla:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Yayınlama (GitHub Pages) ve telefona kurma (PWA)

Depoda `.github/workflows/pages.yml` iş akışı var; `claude/session-99v6q0` veya `main`
dalına her push'ta siteyi otomatik olarak GitHub Pages'e yayınlar (Pages'i mümkünse
kendisi etkinleştirir). Yayın adresi, Actions çalışmasının **Deploy** adımında ve
repo **Settings → Pages** kısmında görünür.

> İlk yayında Pages kapalıysa ve iş akışı otomatik etkinleştiremezse: **Settings → Pages →
> Build and deployment → Source: GitHub Actions** seçip iş akışını yeniden çalıştırmak yeterlidir.

Uygulama bir **PWA**'dır (`manifest.webmanifest` + `sw.js`). Yayınlanan adresi telefonda
tarayıcıda açıp **"Ana ekrana ekle"** dediğinizde uygulama gibi kurulur, açılışta tam ekran
olur ve ilk açılıştan sonra **çevrimdışı** çalışır.

Tek dosya olarak indirip `file://` ile açtığınızda uygulama yine tam çalışır; PWA kurulumu
ve service worker yalnızca bir adresten (http/https) sunulduğunda devreye girer.

## Veri ve gizlilik

İlerleme, tamamen kullanıcının tarayıcısındaki `localStorage`'da tutulur; hiçbir sunucuya
veri gönderilmez. Farklı cihaza taşımak için ana ekrandaki **Yedekle / Geri Yükle** kullanılır.
