# Yönetici Adayı · Çalışma Defteri

MEB **"İlk Defa Yönetici Görevlendirme — Yetiştirme Programı"** e-sınavına hazırlık için
tek dosyalık, tamamen çevrimdışı çalışan bir çalışma defteri uygulaması. (v3.1 — indirilebilir)

## Nedir?

- 20 modüllük ders içeriği tek "defter" içinde toplanır.
- **Günün Tekrarı** (aralıklı tekrar), **Yanlış Defteri**, ilerleme takibi.
- **Karma Deneme** ve **Tam Deneme** (60 soru · 75 dk) sınavları.
- İlerleme `localStorage`'da saklanır; içe/dışa aktarma ("indir") ile yedeklenebilir.

Tüm uygulama tek bir `index.html` dosyasındadır — **API, sunucu, derleme veya `npm install`
gerektirmez**. İnternet olmadan da çalışır (yalnızca yazı tipleri çevrimiçi yüklenir; yoksa
sistem yazı tipine düşer).

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
veri gönderilmez. Farklı cihaza taşımak için uygulamadaki dışa/içe aktarma özelliği kullanılır.
