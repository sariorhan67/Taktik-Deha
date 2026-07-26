# Yönetici Adayı · Çalışma Defteri

MEB **"İlk Defa Yönetici Görevlendirme — Yetiştirme Programı"** e-sınavına hazırlık için
tek dosyalık, tamamen çevrimdışı çalışan bir çalışma defteri uygulaması.

Tüm uygulama tek bir `index.html` dosyasındadır — **API, sunucu, derleme veya `npm install`
gerektirmez**. İnternet olmadan da çalışır (yalnızca yazı tipleri çevrimiçi yüklenir; yoksa
sistem yazı tipine düşer).

## Özellikler

**Her modülde (20 modül):**
- 📋 Özet (çekirdek fikir, hafıza kancaları, sınav radarı)
- 🧠 Zihin haritası
- 📊 Karşılaştırma tablosu
- 🔗 Eşleştirme alıştırması
- 🃏 Kartlar (aralıklı tekrar / SRS)
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

**⚡ Hızlı Bilgi (54 kısa soru):**
Gerçek sınavın baskın formatı **kısa bilgi sorusu**dur (%70) ve dörtte biri **olumsuz kök**
taşır ("Hangisi ... değildir?"). Uygulamanın kendi 200 sorusu vaka tipiydi; bu banka o açığı
kapatır. Sorular ders notlarına dayanır ve gerçek sınavda çıkan ama uygulamada zayıf kalan
konulara odaklanır: MÖZEM, özel eğitim uygulama evleri, destek eğitim odası, yardımcı
teknolojiler, TEFBİS/EKAP/HYS-MYS/KBS/MEBBİS, Selye ve 3A+S modeli, isim-eser
eşleştirmeleri, PESTLE, normlar hiyerarşisi ve diğerleri.

**Çalışma araçları:**
- 🔁 **Günün Tekrarı** — aralıklı tekrar (SRS). Aralık merdiveni **1 · 3 · 7 · 14 · 30 · 60 gün**;
  kart hiçbir zaman programdan silinmez, en üst basamakta da dönmeye devam eder. Her kartın
  bir **kolaylık katsayısı** vardır: kolay gelen kartların arası açılır, zorlananların sıklaşır.
  Unutulan kart sıfırlanmaz — iki basamak geri düşüp ertesi gün yeniden gelir.
  **Sınav tarihi girdiysen hiçbir tekrar sınavdan sonraya atılmaz.**
- 📕 **Yanlış Defteri** — yanlış sorular ve zorlanılan kartlar otomatik birikir
- ⏱ **Karma Deneme** ve 🎓 **Tam Deneme** (60 soru · 75 dk)
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
