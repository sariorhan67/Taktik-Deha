# Yönetici Sınavı Koçu

MEB **İlk Defa Yönetici Görevlendirme (Yetiştirme Programı) e-sınavı** için mobil öncelikli bir hazırlık uygulaması. Konu özetleri, zihin haritaları, aktif hatırlama kartları, sınav radarı ve deneme sınavlarını tek bir panoda toplar.

Uygulama **kurulabilir bir PWA**'dır (Progressive Web App): telefona/masaüstüne uygulama gibi kurulur, çevrimdışı açılır ve güncellemeler otomatik gelir.

## Canlı adres

👉 **https://sariorhan67.github.io/Taktik-Deha/kocu/**

## Kurulum

### Android (Chrome)
1. Yukarıdaki adresi Chrome'da aç.
2. Menü (⋮) → **Uygulamayı yükle** / **Ana ekrana ekle**.
3. Ana ekrandan uygulama gibi aç.

### iPhone / iPad (Safari)
1. Adresi **Safari** ile aç (Chrome değil).
2. **Paylaş** (kare + yukarı ok) → **Ana Ekrana Ekle**.
3. Ana ekrandan tam ekran aç.

> iPhone'da APK çalışmaz; iOS için "Ana Ekrana Ekle" yeterlidir.

### Android APK (isteğe bağlı)
Canlı adres kullanılarak [PWABuilder](https://www.pwabuilder.com) ile bir Android paketi (TWA) üretilebilir. APK yalnızca canlı siteyi açan bir kabuktur; içerik güncellemeleri için APK'nın yeniden yapılmasına gerek yoktur.

## Teknik notlar
- **Service worker** `network-first` çalışır: kullanıcı çevrimiçiyken her açılışta en güncel içerik ağdan gelir, çevrimdışıyken cache'ten açılır. Böylece kurulu uygulamalara güncellemeler otomatik yansır.
- Tüm arayüz, veri ve içerik tek `index.html` dosyasında (bağımsız/self-contained).
- İçeriğin büyük kısmı statik olarak gömülüdür (`STATIC_CONTENT`) ve anında açılır.

## Yayınlama (GitHub Pages)
Bu uygulama `Taktik-Deha` deposunda, `claude/sinav-kocu-6fr376` dalının `kocu/` klasöründe tutulur; `Çalışma Defteri` uygulaması aynı dalın kökündedir (adres: `Taktik-Deha/`).
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `claude/sinav-kocu-6fr376` / `(root)`**. Repo public olmalıdır.

## Dosya yapısı
```
index.html              Uygulama (arayüz + veri + mantık)
manifest.webmanifest    PWA manifesti
sw.js                   Service worker (network-first)
offline.html            Çevrimdışı yedek sayfa
icons/                  Uygulama ikonları (192/512/maskable/apple-touch)
.nojekyll               GitHub Pages Jekyll işlemesini kapatır
```
