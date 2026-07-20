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

**Çalışma araçları:**
- 🔁 **Günün Tekrarı** — aralıklı tekrar (SRS) ile o gün tekrarı gelen kartlar
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

## Yayınlama (GitHub Pages)

Dosya kök dizinde `index.html` olduğu için repo **Settings → Pages** kısmından doğrudan
yayınlanabilir.

## Veri ve gizlilik

İlerleme, tamamen kullanıcının tarayıcısındaki `localStorage`'da tutulur; hiçbir sunucuya
veri gönderilmez. Farklı cihaza taşımak için ana ekrandaki **Yedekle / Geri Yükle** kullanılır.
