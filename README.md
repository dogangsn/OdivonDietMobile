# OdivonDiet Mobil

Diyetisyenler ve klinik yöneticileri için **Expo (React Native)** uygulaması. Web paneliyle aynı
veriyi **MainAPI** (`https://mainapi.odivon.com/api/v1/diet/*`) üzerinden kullanır.

## Ekranlar

| Sekme / ekran | İçerik |
|---|---|
| Bugün | Sıradaki görüşme, KPI'lar, ortalama hedef ilerlemesi, günün programı, ölçüm bekleyen danışanlar |
| Danışanlar | Arama, durum filtresi, hedef ilerleme çubukları |
| Danışan detayı | Kilo/BKİ özeti, kilo grafiği, aktif plan ve öğünler, görüşmeler, sağlık bilgileri, iletişim |
| Ölçüm ekle | Büyük kilo göstergesi, ±0,1 kg adımlar, BKİ ve son ölçüme göre fark |
| Mesajlar / sohbet | Okunmamış rozetleri, gradyan mesaj balonları, sistem mesajları |
| İşler | Danışan talepleri (randevu ver / çözüldü / reddet) ve görevler |
| Takvim | 14 günlük şerit, görüşmeyi tamamla / iptal et |
| + (hızlı işlem) | Yeni danışan, görüşme planla, ölçüm, mesaj |
| Klinik özeti | Yönetici: görüşme sayıları, tamamlama oranı, aylık yeni danışan, ekip yükü |
| Profil | Tema (otomatik/açık/koyu), abonelik durumu, çıkış |

## Çalıştırma

```bash
npm install
npx expo start          # Expo Go ile QR kodu okutun
npm run typecheck
npm run export:web      # web önizleme derlemesi (dist/)
```

**Demo modu:** Giriş ekranındaki "Demo hesabıyla keşfet" uygulamayı örnek verilerle açar; sunucuya bağlanmaz.

**Canlı giriş:** `.env` dosyasına Firebase web API anahtarını yazın (`.env.example`). Giriş Firebase
Authentication REST API ile yapılır, alınan ID token MainAPI'ye `Authorization: Bearer` olarak gönderilir.
Hesabın MainAPI'de `diet` modülü açık bir kiracıya bağlı olması gerekir.

## Mimari

- `src/app/` — Expo Router ekranları (`(tabs)` sekmeler, diğerleri stack / modal)
- `src/ui/` — tasarım sistemi (Card, Button, KpiCard, Avatar, TrendChart, ProgressRing, MacroBar…)
- `src/theme/` — renk token'ları (açık + koyu), Plus Jakarta Sans
- `src/api/` — `DietApi` arayüzü; `http.ts` MainAPI, `demo.ts` çevrimdışı örnek veri
- `src/features/queries.ts` — TanStack Query hook'ları
- `src/auth/` — oturum (SecureStore), Firebase token yenileme

## Yayın

`eas.json` profilleri hazır: `npx eas-cli@latest build --profile preview` (iç test),
`--profile production` (mağaza). Paket kimliği `com.odivon.diet`.
Abonelik satın alma uygulamada yoktur; ödeme web panelden (PayTR) yapılır.
