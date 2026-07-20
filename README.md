# Yönetici Sınavı Koçu

MEB **"İlk Defa Yönetici Görevlendirme — Yetiştirme Programı"** e-sınavına hazırlık için
tek dosyalık, kendi kendine yeten bir web uygulaması.

## Nedir?

- 20 modüllük ders içeriği (özet, zihin haritası, sorular) uygulamanın içine gömülüdür.
- Önden üretilmiş **statik içerik** sayesinde modüller API beklemeden **anında** açılır.
- Deneme sınavı (hızlı 10 soru / tam 60 soru · 75 dk), tekrar kutusu ve ilerleme takibi içerir.
- Sınav geri sayımı ve günlük çalışma planı ana ekranda gösterilir.

Tüm uygulama tek bir `index.html` dosyasındadır — derleme, `npm install` veya sunucu gerektirmez.

## Çalıştırma

En basit yol — dosyayı tarayıcıda açın:

```bash
# macOS
open index.html
# Linux
xdg-open index.html
# Windows
start index.html
```

Ya da yerel bir sunucuyla:

```bash
python3 -m http.server 8000
# tarayıcıdan: http://localhost:8000
```

## Yayınlama (GitHub Pages)

Dosya kök dizinde `index.html` olduğu için repo ayarlarından **Settings → Pages**
ile doğrudan yayınlanabilir.

## Notlar

- Statik içeriği dolu modüller çevrimdışı da çalışır.
- Statik içeriği boş modüllerde canlı üretim `api.anthropic.com` çağrısı yapar; bu özelliğin
  çalışması için tarayıcıdan erişilebilir bir API anahtarı/proxy gerekir (kaynak kodda
  `callClaude` fonksiyonu). Statik içerik dolu olduğu sürece uygulamanın çekirdeği bu
  çağrıya ihtiyaç duymaz.
