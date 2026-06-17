# MAGICLIGHT.AI ÜRETİM PLANI
## Devrek'in Kayıp Dekovili Belgeseli — v2.3 senaryo üzerinden

**Tarih:** Haziran 2026  
**Hedef:** ~40 dakikalık belgeselin görsel omurgasının MagicLight.ai üzerinden üretilmesi  
**Mevcut varlık:** ElevenLabs ile üretilmiş 25 sahne seslendirmesi
(`C:\Users\HUAWEI\OneDrive - sbe.karaelmas.edu.tr\Masaüstü\Devrek\Ses`)

---

## 0. KRİTİK GERÇEKLER (MagicLight.ai, Haziran 2026 itibarıyla)

| Özellik | Durum | Bizim için anlam |
|---|---|---|
| Maks. video uzunluğu | 50 dk | ✅ 40 dk belgeselimiz sığar |
| Aspect ratio | 16:9 var | ✅ Belgesel formatı |
| Kendi ses dosyamızı yükleme | **VAR** (voice clone + custom audio upload) | ✅ ElevenLabs MP3'leri kullanılır |
| Görsele göre video (image-to-video) | Var (Seedance 2.0, Hailuo, Kling, Pixverse) | ✅ Bing/Banana görsellerimiz girdi olabilir |
| Karakter tutarlılığı (yüz lock) | Var | ⚠️ Belgeselde gerek yok (portreler sabit) |
| Referans foto yükleme | **Yalnız karakter yüz/kıyafet için** | ❌ Rastgele arşiv foto desteklemiyor |
| Çıktı çözünürlüğü | 1080p HD (paralı) | ✅ Yeterli |
| Watermark | Ücretsiz planda bile YOK | ✅ |
| Ticari kullanım | Paralı planlarda var | ✅ YouTube yayını mümkün |
| Kredi ekonomisi | ~1.200 credit / dakika | ⚠️ Bütçe planlaması kritik |

### Plan bazlı maliyet (USD/ay)

| Plan | Aylık ücret | Kredi | Tahmini dakika | Bizim 40 dk için |
|---|---|---|---|---|
| Free | $0 | 300 | ~0,25 dk | Sadece pilot test |
| Standard | $12 | 6.000 | ~5 dk | Çok yetersiz |
| Plus | $26 | 15.000 | ~12 dk | 4 aylık üretim sürer |
| **Pro** | **$35** | **35.000** | **~29 dk** | **1,5 ay → ~$53-70** |

> **Tahmini toplam maliyet:** 40 dk × 1.200 = 48.000 credit gerekiyor.
> Pro planı iki ay üst üste alırsan (70.000 credit), revizyon + başarısız
> denemeler için yeterli buffer'a sahip olursun. Yıllık alımda %20 indirim
> reklamı görülüyor, bütçe sıkıysa o yöne bakılmalı.

---

## 0+. ACİL DURUM PLANI — 5.725 CREDIT PILOT BÜTÇESİ

**Eldeki kredi:** 5.725 (≈ 4-5 dakika MagicLight çıktısı, belgeselin %12'si)
**Strateji:** Tüm filmi üretmek imkansız → en kritik 3 sahneyi seç,
SIRAYLA üret, her birinden sonra dur ve değerlendir.

### Sahne uzunlukları (seslendirme-metinleri.md karakter sayılarından)

Ortalama 15 karakter/sn Türkçe belgesel temposu varsayımıyla:

| Sahne | Karakter | Süre | Tahmini kredi (1.200/dk) |
|---|---|---|---|
| S1 (cold open) | 803 | ~1:00 | ~1.200 |
| S23 (Stöger v2.3) | 1.660 | ~1:50 | ~2.200 |
| S24 (sentez) | 1.682 | ~1:55 | ~2.300 |
| S25 (kapanış) | 1.039 | ~1:10 | ~1.400 |

### Önerilen kombosu: **S1 + S23 + S25**

| Sıra | Sahne | Neden bu? | Kredi |
|---|---|---|---|
| 1 | **S1 cold open** | Pilot. En kısa, en az risk. Sonucu beğenirsen devam et. | ~1.200 |
| 2 | **S23 Stöger (v2.3 yeni)** | Hiç film olmamış, tezin en yeni cümlesi. Üç üretken görseli (Viyana 1880'ler, Prens Rudolf, sepia İstanbul) sergiler. | ~2.200 |
| 3 | **S25 kapanış** | S1 ile simetri; "Kayıp dekovil, kaybolmadı" — belgeselin son cümlesi. | ~1.400 |
| | **Toplam** | | **~4.800** |
| | **Buffer (revize için)** | | **~925** |

**Bu üçü = ~4 dakika kullanılabilir final montaj** → teaser veya
"Belgeselden bir bölüm" ön gösterim yapmaya yeter.

### Kritik kural: SIRAYLA üret, hep birden değil

1. **Önce sadece S1**'i üret. Sonucu izle, 5 kriteri test et:
   - MP3 ses senkronu ✓
   - 16:9 + 1080p çıktı ✓
   - Üretken Bing/Banana görselinden hareket ✓
   - Tarihsel doğruluk (modern logo, anakronizm yok) ✓
   - Watermark yok ✓
2. S1 **başarısızsa → DUR**. 4.500 credit elinde kalır, MagicLight bizim
   için uygun değil demektir; `grok-animasyon-kilavuzu.md`'ye dön.
3. S1 **başarılıysa → S23**'ü üret. Sonra **S25**.

### Engine seçimi → kredi bütçesini değiştirir

MagicLight 4 engine sunuyor; kalite-fiyat farkı büyük:

| Engine | Kalite | 1 dk maliyet (tahmini) | 5.725 ile ne çıkar |
|---|---|---|---|
| **Seedance 2.0** | En sinematik, belgesel için ideal | ~1.500 cr | ~3,8 dk |
| Hailuo | Orta-yüksek | ~1.000 cr | ~5,7 dk |
| Kling | İyi | ~800 cr | ~7,2 dk |
| Pixverse | Düşük | ~500 cr | ~11 dk |

**Önerim:** S1 pilotu için **Seedance 2.0** kullan (en yüksek bahis), eğer
beğenirsen kararlı çalış. Eğer kredi tarafından sıkışırsan **Hailuo**'ya
kay — sepia/dokümanter ton zaten yüksek hareketten kaçar, fark az olur.

### S1 üretim parametreleri (pilot için tam ayar)

- **Engine:** Seedance 2.0
- **Aspect ratio:** 16:9
- **Resolution:** 1080p
- **Stil eki (prompt'a sabit yapıştır):** *"cinematic documentary style,
  subtle motion, atmospheric, slow, sepia tones for archival sequences,
  natural lighting for modern drone shots, no zoom, calm pacing"*
- **Ses dosyası:** `s01_filyos_kiyisinda_bir_demi.mp3` (Custom audio upload)
- **Referans görseller (sahne kasanda mevcutsa):**
  - Filyos drone (modern) — Bing/Banana çıktısı veya drone klibin
  - Yakın plan paslı demir + su — makro görsel
  - El demir parçasını kaldırıyor — figüran görseli
- **Beklenen çıktı süresi:** 60 sn (±5 sn tolerans)

### Karar tablosu (S1 sonrası)

| S1 sonucu | Sonraki adım |
|---|---|
| Mükemmel (5/5 kriter) | S23 → S25 sırasıyla üret. ~4 dk teaser çıkar. |
| İyi ama küçük revizyon gerek | S23'e geç ama hangi parametrenin oynatıldığını not et |
| Orta (3-4/5) | 1 kez S1'i revize et (~1.200 cr). İyileşmezse Hailuo'ya geç |
| Kötü (≤2/5) | **DUR.** Kalan ~4.500 credit'i koru. `grok-animasyon-kilavuzu.md` ile devam et. |

---

## 1. STRATEJİK KARAR — MagicLight'ın rolü ne olacak?

Bizim belgeselin üç türde görseli var:

| Tip | Kaynak | MagicLight'a uygunluk |
|---|---|---|
| **A — Üretken görseller** (Bing/Banana ile üretilmiş; üretken dönem rekonstrüksiyonları) | Bing Image Creator, Banana | ✅ MagicLight'ta animasyona ver |
| **B — Gerçek arşiv fotoğrafları** (Sadi Uyar, Kekeç, tefen67, Ulus gazetesi, TBMM tutanakları) | Yerel arşivler | ❌ MagicLight'a verme — sabit kalsın (belgesel ağırlığı sabitlikten) |
| **C — Drone / modern çekim** (Filyos, Devrek, Trabzon, Gülüç ağzı) | Senin kendi çekimlerin (varsa) | ⚠️ Eğer yoksa MagicLight'ın "Realistic 2.0" modeli ile üret |

### Karar: HİBRİT MODEL (önerilen)

MagicLight'ı **tek başına bitiren araç olarak değil**, aşağıdaki üç işi yapan
özel bir motor olarak kullan:

1. **Üretken görselleri animasyona dök** (image-to-video, ~5-10 sn klipler)
2. **Drone / modern manzarayı eğer yoksa üret** (text-to-video, Realistic 2.0)
3. **Seslendirme dosyalarını kullan ki sahneler birbirine zamanında otursun**

**Gerçek arşivler ve belgeler MagicLight'a hiç uğramaz**; CapCut'ta zaten
hareketsiz olarak yerleştirilir (Ken Burns vb. ile). Bu, hem kotanı korur
hem de belgesel hassasiyetini bozmaz.

> **Neden tam-otomatik script→video DEĞİL?** MagicLight script-to-video
> akışı tüm sahneleri AI ile yeniden üretir. Bu, Sadi Uyar fotoğraflarını,
> Kekeç arşivini, TBMM tutanaklarını ve hassas tarihsel detayları (75 cm
> dar hat, 1924 üniforma, Orman Yüksek Meclisi binası gibi) silip yerine
> jenerik AI üretimi koyar. Senaryomuzun olgusal omurgasını tehlikeye atar.

---

## 2. SAHNELERİN 3 KOVASA AYRILMASI

Senaryo v2.3'teki 25 sahneyi MagicLight kullanım stratejisine göre üç kovaya ayırıyoruz:

### 🔵 KOVA-A: Tam MagicLight üretimi (ses + görsel + animasyon)
*Üretken görselin yeterli olduğu, gerçek arşivin az olduğu sahneler.*

| # | Sahne | Tahmini süre | Kredi (1.200/dk) |
|---|---|---|---|
| 1 | S1 Filyos kıyısında bir demir parçası | 1:30 | 1.800 |
| 2 | S3 Hamsiköy yamaçları | 1:00 | 1.200 |
| 3 | S6 Trabzon'dan Karadere'ye | 1:00 | 1.200 |
| 4 | S7 Gülüç Irmağı ağzı | 1:15 | 1.500 |
| 5 | S8 1925: Şantiyeyi saran sessizlik | 2:00 | 2.400 |
| 6 | S9 Yirmi yıllık bekleyiş | 1:00 | 1.200 |
| 7 | S12 Paralel ihale | 1:30 | 1.800 |
| 8 | S16 Hattın gündelik hayatı | 1:45 | 2.100 |
| 9 | S17 Alaoğlu Köprüsü, taşkın | 1:30 | 1.800 |
| 10 | S19 Köprünün son baharı | 1:30 | 1.800 |
| 11 | S20 Hurda ve Karabük döngüsü | 1:45 | 2.100 |
| 12 | S22 Bugün hattın izinde | 2:00 | 2.400 |
| 13 | S23 Stöger'in izi (v2.3 yeni 4 blok) | 2:30 | 3.000 |
| 14 | S24 Bir rayın anlattığı Türkiye | 1:45 | 2.100 |
| 15 | S25 Köprü ayağının dibinde | 2:00 | 2.400 |
| **TOPLAM** | **15 sahne** | **~23 dk** | **~28.800 credit** |

### 🟡 KOVA-B: Hibrit (MagicLight + CapCut'ta arşiv katmanı)
*Üretken + gerçek arşivin yan yana kullanıldığı sahneler.*

| # | Sahne | MagicLight'tan ne çıkacak |
|---|---|---|
| 1 | S2 Trabzon Limanı 1914 | Vapur dumanı, sandık taşıma animasyonu |
| 2 | S4 Ankara 1923-1924 | Ulus Meydanı 1923 + Orman Yüksek Meclisi odası |
| 3 | S5 Bir Çek mühendis | Stöger silüeti + müşavirlik odası (sabit kalır, sadece atmosfer) |
| 4 | S13 Kemerler kasım sabahı 1945 | Bayraklarla istasyon önü, kalabalık animasyonu |
| 5 | S18 1950 TBMM | Milletvekili silüeti kürsüde (sınırlı hareket) |

*Bu sahnelerde MagicLight sadece ÜRETKEN katmanı üretir; gerçek arşivler
(Hatipoğlu portresi, Ulus gazetesi, TBMM tutanağı taraması, 548 sayılı
kanun belgesi) CapCut'ta üstüne koyulur.*

Tahmini ek MagicLight üretimi: ~8 dk × 1.200 = **~9.600 credit**

### 🔴 KOVA-C: MagicLight'a hiç gitmez (saf arşiv)
*Yalnız sabit gerçek arşiv + CapCut animasyon (Ken Burns, opacity, harita çizimi).*

| # | Sahne | İçerik |
|---|---|---|
| 1 | S10 Tefen istasyonu (Sadi Uyar / tefen67) | Dönem fotoğrafı + harita animasyonu (CapCut) |
| 2 | S11 1943 TBMM | TBMM Genel Kurul fotoğrafı + tutanak taraması |
| 3 | S14 Kemerler İstasyonu portresi | Kekeç arşivi fotoğrafı + drone bugün |
| 4 | S15 Filyos ahşap köprüsü | Sadi Uyar 1937 sal + 1945 dekovil köprüsü |
| 5 | S21 Kemerler binasının sessiz kayboluşu | Eski Kemerler arşivi + bugünkü drone |
| 6 | S26 Jenerik | Kayan yazı (CapCut text) |

Bu kova MagicLight kredisi tüketmez — yaklaşık **~7 dk** kapsar.

### Toplam MagicLight kredi ihtiyacı

| Kova | Dakika | Kredi |
|---|---|---|
| A | ~23 | ~28.800 |
| B | ~8 | ~9.600 |
| C | ~7 | 0 |
| Buffer (revizyon, başarısız deneme) | — | ~8.000 |
| **TOPLAM** | **~40 dk** | **~46.400 credit** |

**→ Pro plan ($35) bir ay alıp 35.000 credit + ek paket veya ikinci ay
hesabı uzatma ile çözülür.** Toplam yaklaşık ~$50-70.

---

## 3. ÜRETİM AŞAMALARI

### AŞAMA 0 — Kurulum & pilot test (1 gün)

- [ ] MagicLight.ai'da Free hesap aç, 300 credit'i kullanarak test sahnesi
      üret (S1 öneririm — en kritik açılış)
- [ ] Aşağıdakileri **birebir** ölç:
  - [ ] 1080p 16:9 çıktı geliyor mu?
  - [ ] ElevenLabs MP3'ünü yükleyebiliyor musun? (Custom audio upload)
  - [ ] Yüklediğin MP3'e göre görsel zamanlama oturuyor mu?
  - [ ] Üretken görseli (Bing/Banana çıktısı) **kaynak görsel** olarak
        verip üzerinden animasyon yapabiliyor musun?
  - [ ] "Realistic 2.0" stilinin belgesel hissi nasıl?
- [ ] Sonuç beklenenden kötüyse → **Pro plan satın alma**, fallback'e geç
      (Grok + CapCut akışına dön)
- [ ] Sonuç iyiyse → Pro plan satın al, AŞAMA 1'e geç

### AŞAMA 1 — Varlık manifestinin hazırlanması (1 gün)

Ses dosyaları yerel makinende: `C:\Users\HUAWEI\OneDrive - sbe.karaelmas.edu.tr\Masaüstü\Devrek\Ses`

- [ ] 25 MP3 dosyasının tamamının dosya adlandırması seslendirme-metinleri.md
      önerisi ile birebir uyumlu mu kontrol et (`s01_..., s02_..., s25_...`)
- [ ] Ses dosyalarının toplam süresini ölç (yaklaşık 40 dk olmalı)
- [ ] Her sahne için sahne kasası klasörü oluştur:
      ```
      Devrek/
        Ses/                 (mevcut)
        Gorseller/
          s01/               (Bing/Banana üretken + drone klipler)
          s02/
          ...
          s25/
        Arsiv/               (gerçek arşivler — Sadi Uyar, Kekeç, TBMM)
        MagicLight-ciktilari/ (her sahnenin ML çıktısı buraya iner)
      ```
- [ ] Üretken görselleri seçili sahnelerin klasörüne taşı; gerçek arşivleri
      `Arsiv/` altına ayır
- [ ] **Görsel-prompt-sözlüğü.pdf**'ten her sahnenin Bing/Banana
      promptlarını çıkar — bunlar MagicLight'ta yeniden kullanılacak

### AŞAMA 2 — Kova-A üretimi (5-7 gün, batch)

Pro planın 35.000 credit'i = ~29 dakika üretim ≈ Kova-A'nın tamamı.

Önerilen batch sırası (her gün ~3-4 sahne):

**Gün 1:** S1 (pilot), S25 (kapanış — pilotla simetri için)  
**Gün 2:** S22, S23 (v2.3 yeni — Stöger sahnesi)  
**Gün 3:** S3, S6, S7  
**Gün 4:** S8, S9, S16  
**Gün 5:** S17, S19, S20  
**Gün 6:** S12, S24 (özet sahne, tüm dönemlerin bindirmesi — dikkatli prompt)

**Her sahne için iş akışı:**

1. seslendirme-metinleri.md'den ilgili sahnenin metnini kopyala
2. MagicLight'ta yeni proje aç, 16:9 + Realistic 2.0 stili seç
3. Sahnenin MP3 ses dosyasını yükle (custom audio)
4. Görsel sözlüğünden üretken görselleri sahne kasasından sürükle-bırak
5. Sahnenin VO uzunluğu kadar görsel slot'a dağıt
6. "Generate" → bekle → indir
7. **MagicLight-ciktilari/sXX_v1.mp4** olarak kaydet
8. İlk denemeyi 1-2 puanla; 6'dan az ise prompt revizyonu + yeniden üret

**Kalite check listesi (her sahnenin çıktısı için):**
- [ ] Görsel ve VO senkronize mi?
- [ ] Anakronizmler var mı? (örn. 1924 sahnesinde modern bayrak, yanlış üniforma)
- [ ] 16:9, 1080p olarak çıktı oldu mu?
- [ ] Watermark yok mu?
- [ ] Süre ses dosyasıyla aynı uzunlukta mı? (±2 sn tolerans)

### AŞAMA 3 — Kova-B üretimi (2-3 gün)

5 hibrit sahnenin sadece ÜRETKEN katmanı MagicLight'ta üretilir; gerçek
arşivler CapCut'ta ayrıca üzerine konur.

**Önemli:** Kova-B sahnelerinde MagicLight'a ses dosyası ya YÜKLE ama
çıktıda sesi MUTE ederek kullanacağını bil (sesi CapCut'ta üzerine
yerleştireceksin); ya da kısa "alt-katman" video (ses olmadan) üret.

**Sahneler:** S2, S4, S5, S13, S18.

### AŞAMA 4 — Kova-C'nin CapCut üretimi (2 gün)

MagicLight'a hiç gitmez. 6 sahne (S10, S11, S14, S15, S21, S26) doğrudan
CapCut'ta:

- Gerçek arşiv fotoğrafları + Ken Burns (yavaş zoom/pan)
- Harita animasyonları (CapCut çizim/yol takibi)
- Tutanak tarama → highlight kayışı
- Jenerik kayan yazı

### AŞAMA 5 — Birleştirme: CapCut master timeline (3-5 gün)

MagicLight çıktıları + Kova-C CapCut sahneleri tek timeline'da birleşir.

- [ ] 25 sahnenin tamamını sıralı yerleştir
- [ ] **Sahneler arası 0,3 sn cross-dissolve** geçişi (animasyon kılavuzu
      tavsiyesi)
- [ ] Alt-yazı kartlarını `altyazi-kartlari.md`'den yerleştir
- [ ] Müzik altyapısını sahne notlarına göre ekle (Cold Open keman,
      Bölüm I piyano, vs.)
- [ ] Ses miksajı: VO öne, müzik -18 dB
- [ ] Bölüm geçişlerinde "BÖLÜM I/II/III" kart geçişleri
- [ ] Jenerik kart sırası: kaynaklar → ithaf → İbrahim Kekeç teşekkür

### AŞAMA 6 — Revizyon ve Final (2-3 gün)

- [ ] İlk taslağı baştan sona izle (notes alarak)
- [ ] Zayıf sahneleri (puan <7) MagicLight'ta yeniden üret (buffer credit'le)
- [ ] Renk derecesi tutarlılığı (sepia sahnelerin tonu birbirine yakın olsun)
- [ ] Ses seviye normalizasyonu (-16 LUFS YouTube standardı)
- [ ] **Final export: 1080p, H.264, MP4, 25 fps**

### AŞAMA 7 — Yayın

- [ ] YouTube'a yükle (ticari kullanım hakkı var, sorun yok)
- [ ] Açıklamaya kaynak listesi (Kekeç, Sadi Uyar, Cantürk Gümüş, TBMM, Karadere kitapları)
- [ ] Alt-yazıyı otomatik üretme yerine elle yükle (`altyazi-kartlari.md` zaten hazır)

---

## 4. RİSK MATRİSİ VE PLAN-B

| Risk | İhtimal | Etki | Çözüm |
|---|---|---|---|
| MP3 yüklendiğinde dudak/zamanlama tutmuyor | Orta | Yüksek | Ses dosyalarını sahne sahne kes, sahne başı ML sahne uzunluğunu manuel ayarla |
| Üretken görsel kaynak olarak verildiğinde ML üzerine kendi yorumunu basıyor (uncanny) | Yüksek | Yüksek | Kova-A'yı küçült, Kova-B/C'ye sahne aktar; statik kalmaya zorla |
| Kredi planlanandan hızlı bitiyor | Orta | Orta | Pro planda 2. ayı aç; veya 4-5 zayıf sahneyi tamamen statik bırak |
| Tarihsel anakronizm (1924'te yanlış üniforma, modern logo, vs.) | Yüksek | Yüksek | Her sahne için "Vesaire fail check" — kabul etmeden önce 2× incele |
| Çıktı 16:9 değil (vertical kaymış) | Düşük | Yüksek | Aşama 0 pilot testinde sıkı kontrol et |
| Tüm MagicLight üretimi başarısız | Düşük | Çok yüksek | **Plan-B**: Grok + CapCut'a geri dön (grok-animasyon-kilavuzu.md zaten hazır) |

### Plan-B (fallback): Grok + CapCut

MagicLight beklenen kaliteyi vermiyorsa, mevcut `grok-animasyon-kilavuzu.md`
(v2.3) zaten kullanıma hazır. Toplam 40 animasyon planı var, sahne sahne
prompt yazılmış. MagicLight'a $35 yatırmadan önce **Aşama 0 pilot testi
geçilmeden** Pro plana ödeme yapma.

---

## 5. KARAR VE BÜTÇE ÖZETİ

| Madde | Tutar |
|---|---|
| MagicLight Pro plan (1 ay) | $35 |
| Yedek Pro plan (2. ay, revizyon için) | $35 |
| Beklenmedik buffer | $20 (örn. ek credit paketi) |
| **TOPLAM** | **~$90 (yaklaşık 2.700 TL — Haziran 2026 kuruyla)** |

**Süre tahmini (full-time çalışırsan):**

| Aşama | Gün |
|---|---|
| 0 — Pilot test | 1 |
| 1 — Manifest | 1 |
| 2 — Kova-A | 5-7 |
| 3 — Kova-B | 2-3 |
| 4 — Kova-C (CapCut) | 2 |
| 5 — Birleştirme | 3-5 |
| 6 — Revizyon | 2-3 |
| 7 — Yayın | 1 |
| **TOPLAM** | **~17-23 gün** |

---

## 6. SONRAKİ ADIM

1. **Bu plana göre AŞAMA 0'ı çalıştır** — MagicLight Free hesabı aç, S1
   sahnesini test üret.
2. Test sonucunu değerlendir; pilotta "iyi" çıkarsa Pro plan al.
3. Pilot sonuçları geldiğinde bu dosyaya **AŞAMA 0 NOTLARI** bölümü ekle:
   - Custom audio upload formatı (MP3/WAV/M4A?)
   - Maks. ses dosyası süresi
   - Image-to-video kaynak görsel maks. boyut
   - Çıktı kalitesinin gerçek değerlendirmesi (sepia tonu, hareket ritmi)

---

> **Not:** Bu plan, MagicLight'ın Haziran 2026 itibariyle reklam ettiği
> özelliklere dayanır. Bazı özellikler (örn. uzun MP3 senkronizasyonu)
> sahada beklenenden farklı çalışabilir. Pilot test zorunlu.
