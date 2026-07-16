# DEFNE RESIN — "Porselen Galeri" (v3)

Aydınlık, editoryal, 2026 standardında 5 sayfalık statik site. Gerçek Shopier
kataloğuyla (isim / fiyat / indirim / ürün linki / fotoğraf) entegre.

| Sayfa | Dosya | İçerik |
|---|---|---|
| Ana Sayfa | `index.html` | Kemer hero + 6 öne çıkan ürün + eğitim bandı + sanatçı + yorum + IG |
| Hakkında | `hakkinda.html` | Hikâye + sayaçlar + zanaat üçlüsü + atölye ürünleri |
| Eserler | `eserler.html` | **24 gerçek ürün** + kategori filtresi (Tablolar/Aynalar/Mini) + lightbox |
| Eğitim | `egitim.html` | Koyu satış bandı + müfredat + 6 yorumlu slider + CTA |
| İletişim | `iletisim.html` | WhatsApp / Instagram / Shopier kartları + IG grid |

Ortak varlıklar: `assets/fresh.css` + `assets/fresh.js`.
Ürün verisi referansı: `assets/products.json` (13 Tem 2026'da Shopier'den çekildi).
Eski koyu tasarım yedekleri: `_eski/` klasöründe (style.css/app.js artık kullanılmıyor).

## Ürün görselleri hakkında (önemli)

Görseller şu an **Shopier CDN'inden hotlink**: `cdn.shopier.app/pictures_{small|mid|large}/...`
(330 / 458 / 916 px). Yayına çıkmadan önce görselleri indirip kendi sunucunuza
koyun ve `src`leri güncelleyin — mağazadan ürün silinirse sitedeki görsel de kaybolur.
Lightbox, `pictures_mid` görselini otomatik `pictures_large`'a yükseltir.

## Yayına almadan önce değiştirilecekler

| Ne | Nerede |
|---|---|
| **WhatsApp numarası** | Tüm sayfalarda `https://wa.me/905000000000` — `TODO` yorumlu |
| **Rakamlar** | `data-count` değerleri (6 yıl / 200 eser / 500 öğrenci) — index + hakkinda |
| **Canonical + OG URL'leri** | Her sayfanın `<head>`'i (`defneresin.com` varsayıldı) |
| **Ürün güncellemeleri** | Yeni ürün/fiyat değişiminde `eserler.html` + `index.html` kartları (referans: `assets/products.json`) |
| **Sanatçı portresi** | Defne'nin fotoğrafını **`assets/img/defne.jpg`** olarak kaydedin — Ana Sayfa + Hakkında'daki "Sanatçı" bölümünde otomatik görünür (dosya yokken Shopier profil görseli gösterilir) |

## Hazır bağlantılar

- Shopier mağaza: `https://www.shopier.com/defnekehya` (+ her ürünün kendi sayfası kartlarda `data-href`)
- Instagram: `https://www.instagram.com/defneresin`

## Geliştirici notları

- `?motion=force` — `prefers-reduced-motion` açık cihazlarda animasyonları zorla test eder.
- Lokal önizleme: `python -m http.server 4173`
- Ürün kartı şablonu: `figure.work` üzerinde `data-title/tech/size/price/old/href/desc`
  + `data-cat` (filtre için: `tablo|ayna|mini`). Lightbox ve satın alma linki bunlardan beslenir.
- GSAP/Lenis CDN'i çökse veya JS kapalı olsa bile site tamamen okunur kalır
  (başlangıç durumları JS'te verilir, içerik hiçbir zaman CSS ile gizlenmez).

## 🌐 Yayın

- **Canlı adres:** https://korrayz.github.io/defne-resin/
- **Repo:** https://github.com/korrayz/defne-resin (GitHub Pages, `main` / kök)
- **Güncelleme akışı:** dosyayı değiştir → `git add -A && git commit -m "..." && git push` — Pages 1-2 dk içinde yeniden yayınlar.
- **Alan adı bağlama:** Repo → Settings → Pages → Custom domain (`defneresin.com`) + DNS'te CNAME kaydı. Sonra `tools/build-urun.js` içindeki `DOMAIN` sabitini ve sayfalardaki canonical'ları güncelleyin.

## Ürün detay sayfaları

`urun/{shopierId}.html` — 24 sayfa, `tools/build-urun.js` ile üretilir:
`node tools/build-urun.js` (sitemap.xml'i de günceller). Yeni ürün eklendiğinde
script içindeki `PRODUCTS` listesine ekleyin, çalıştırın, push'layın; ayrıca
`eserler.html` gridine bir kart ekleyin. Kart tıklaması otomatik olarak
`data-href`'teki Shopier ID'sinden ürün sayfasına yönlenir.
