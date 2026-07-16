/* ================================================================
   DEFNE RESIN — ürün detay sayfası üretici
   Kullanım: node tools/build-urun.js
   urun/{id}.html dosyalarını ve sitemap.xml'i üretir.
   Katalog değişince bu dosyadaki PRODUCTS listesini güncelleyip
   tekrar çalıştırmak yeterli.
   ================================================================ */
const fs = require('fs');
const path = require('path');

const CDN = 'https://cdn.shopier.app';
const SHOP = 'https://www.shopier.com/defnekehya';
const IG = 'https://www.instagram.com/defneresin';
const DOMAIN = 'https://defneresin.com'; // TODO: gerçek alan adıyla güncelleyin

/* aile bazlı uzun açıklamalar */
const FAM = {
  ayna: 'Metal çerçevenin çevresine elde dökülen dalga dokusu, aynanın yansımasıyla birleşince odaya gerçek bir kıyı ışığı taşır. Antre, salon ya da banyo — nereye asılırsa asılsın günün her saatinde farklı parlar.',
  kare: 'Kat kat dökülen reçine, gerçek kum ve el işi köpük dokusuyla tamamlanır. Cam gibi cilalanan yüzey ışıkla birlikte yaşar; çerçevesiyle birlikte asmaya hazır gönderilir.',
  yuvarlak: 'Yuvarlak pano üzerine kat kat dökülen reçine; minyatür detaylar tek tek elde boyanır. Askı aparatı takılı, asmaya hazır gönderilir.',
  ripple: 'Rüzgârın su yüzeyine yazdığı ripple dokusu, ince bir çerçevenin içinde dondurulur. Küçük boyutuna rağmen derinlik hissi şaşırtır; duvarın yanı sıra raf ve masa için de idealdir.',
  vitray: 'Kurşun kontur görünümü veren epoksi tekniğiyle vitray etkisi elde edilir. Işık aldığında renk alanları camdan süzülür gibi parlar.',
  mini: 'Minik ahşap şövalesiyle birlikte gelir; masa, raf ve çalışma köşeleri için el yapımı bir deniz. Hediyelik kutusunda gönderilir.',
  set: 'Dört parçalık set; her biri ayrı ayrı elde dökülür, hiçbiri diğerine benzemez. Suya dayanıklı cilalı yüzeyiyle günlük kullanıma uygundur.'
};

/* id, ad, cat (tablo|ayna|mini), tech, size, price, old, badge, sale, img(hash), desc, fam */
const PRODUCTS = [
  { id: '48808921', ad: 'Okyanusun Aynası', cat: 'ayna', tech: 'Metal çerçeveli epoksi ayna', size: 'Ø 70 cm', price: '14.000 TL', old: '18.000 TL', badge: '%22 İndirim', sale: true, img: 'defnekehya_ba5afa8c1217af3d937bf2f120fdafb6.jpeg', desc: 'Dalga dokusunun aynayla buluştuğu 70 cm metal çerçeveli el yapımı parça; hem eser, hem ayna.', fam: 'ayna' },
  { id: '48808824', ad: 'Okyanusun Aynası II', cat: 'ayna', tech: 'Metal çerçeveli epoksi ayna', size: 'Ø 70 cm', price: '14.000 TL', old: '18.000 TL', badge: '%22 İndirim', sale: true, img: 'defnekehya_5d8098aa6a5493c67e4c6c42b5531c35.jpeg', desc: 'Deniz manzarasına karşı çekilmiş dalga dokulu ayna; her açıdan farklı bir kıyı.', fam: 'ayna' },
  { id: '48808666', ad: 'Okyanusun Aynası III', cat: 'ayna', tech: 'Metal çerçeveli epoksi ayna', size: 'Ø 70 cm', price: '14.000 TL', old: '18.000 TL', badge: '%22 İndirim', sale: true, img: 'defnekehya_2243ab79f069e7a024ee0b221b42053b.jpeg', desc: 'Kıyı köpüğünün metal çerçeveye taştığı 70 cm ayna; ışıkla birlikte yaşayan yüzey.', fam: 'ayna' },
  { id: '48806102', ad: 'Rest in Beach', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '9.000 TL', old: '12.000 TL', badge: '%25 İndirim', sale: true, img: 'defnekehya_58f5201b5eb2406debed34c31cd53c1c.jpeg', desc: 'Kumun köpükle buluştuğu kıyı; gerçek kum dokusu ve kat kat reçine derinliğiyle.', fam: 'kare' },
  { id: '48806071', ad: 'Golden Hour', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '9.000 TL', old: '12.000 TL', badge: '%25 İndirim', sale: true, img: 'defnekehya_07444d191083bb8cdeac8ec09e4d30c3.jpeg', desc: 'Gün batımı ışığında altın tonlarına dönen kıyı; sıcak pigmentlerle dökülmüş kompozisyon.', fam: 'kare' },
  { id: '48805951', ad: 'Golden', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '9.000 TL', old: '12.000 TL', badge: '%25 İndirim', sale: true, img: 'defnekehya_3e74a31166df4b09eacdd451e17ac8a7.jpeg', desc: 'Altın varak detaylı kıyı çizgisi; sıcak kum tonlarıyla turkuazın buluşması.', fam: 'kare' },
  { id: '48805649', ad: 'Kumsal', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '9.000 TL', old: '12.000 TL', badge: '%25 İndirim', sale: true, img: 'defnekehya_38476e077ce2f271802ca2022be7363b.jpeg', desc: 'Sığ suların kumla kucaklaştığı sakin bir kıyı; katmanlı köpük dokusuyla.', fam: 'kare' },
  { id: '48805527', ad: 'Kumsal II', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '9.000 TL', old: '12.000 TL', badge: '%25 İndirim', sale: true, img: 'defnekehya_870f008f61545d5f0f293b789d10e937.jpeg', desc: 'Köpüğün iki kat dökümle derinleştiği kumsal; her açıdan farklı parlayan yüzey.', fam: 'kare' },
  { id: '48806570', ad: 'Mermaid Drips', cat: 'tablo', tech: 'Yuvarlak epoksi tablo', size: 'Ø 30 cm', price: '9.000 TL', old: '13.000 TL', badge: '%31 İndirim', sale: true, img: 'defnekehya_064bf21a23f2f3637dc952f62cf3313c.jpeg', desc: 'Deniz kızı pulunu andıran damla dokular; sedefli pigmentlerle dökülmüş yuvarlak pano.', fam: 'yuvarlak' },
  { id: '48806408', ad: 'Kano', cat: 'tablo', tech: 'Yuvarlak epoksi tablo', size: 'Ø 30 cm', price: '8.000 TL', old: '10.000 TL', badge: '%20 İndirim', sale: true, img: 'defnekehya_2586a38727a998e61e594df39a576609.jpeg', desc: 'Turkuaz koyda süzülen minyatür kano; kuş bakışı bir yaz anısı.', fam: 'yuvarlak' },
  { id: '48806312', ad: 'İskele', cat: 'tablo', tech: 'Yuvarlak epoksi tablo', size: 'Ø 30 cm', price: '8.000 TL', old: '10.000 TL', badge: '%20 İndirim', sale: true, img: 'defnekehya_98a0bcf4254d6a9589c8d5d636d7b3ba.jpeg', desc: 'Turkuaza uzanan minyatür iskele; kuş bakışı sakin bir koy.', fam: 'yuvarlak' },
  { id: '48806272', ad: 'İskele II', cat: 'tablo', tech: 'Yuvarlak epoksi tablo', size: 'Ø 30 cm', price: '8.000 TL', old: '10.000 TL', badge: '%20 İndirim', sale: true, img: 'defnekehya_ad1404b34833636b7f7632ef14144f2c.jpeg', desc: 'Köpüklü kıyıdan derine uzanan iskele; el boyaması detaylarla.', fam: 'yuvarlak' },
  { id: '48806235', ad: 'İskele III', cat: 'tablo', tech: 'Yuvarlak epoksi tablo', size: 'Ø 30 cm', price: '8.000 TL', old: '10.000 TL', badge: '%20 İndirim', sale: true, img: 'defnekehya_e7c36f8e4be4b410ea7c2bdcbc6c8069.jpeg', desc: 'Sığ suların üstünde bir iskele; iki kat reçineyle derinleşen turkuaz.', fam: 'yuvarlak' },
  { id: '48806187', ad: 'Faux Vitray — Orka', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '7.000 TL', old: '9.000 TL', badge: '%22 İndirim', sale: true, img: 'defnekehya_69b33a4d894da7e18357c2ccf4b2f660.jpeg', desc: 'Vitray etkisi veren epoksi tekniğiyle orka; kurşun kontur görünümlü el işi parça.', fam: 'vitray' },
  { id: '48806159', ad: 'Faux Vitray — Balina', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '30 × 30 cm', price: '7.000 TL', old: '9.000 TL', badge: '%22 İndirim', sale: true, img: 'defnekehya_0dc137cf3f7fe6b9e45ec5798a8f1490.jpeg', desc: 'Vitray etkisiyle dalgaların arasında bir balina; ışık geçirgen renk alanları.', fam: 'vitray' },
  { id: '48806843', ad: 'Ripple — Whale', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_25f6fac8766c4ccbdc12b1a97a1502c9.jpeg', desc: 'Dalgalanan turkuaz yüzeyin altında süzülen balina silüeti; el boyaması minyatür figürle.', fam: 'ripple' },
  { id: '48806662', ad: 'Ripple — Whale II', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_c7dd73c69881e53af28756ab4f1c05bf.jpeg', desc: 'Ripple dokulu su yüzeyinin altında anne-yavru balina; sakin bir derinlik.', fam: 'ripple' },
  { id: '48806783', ad: 'Ripple — Eagleray', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_8b80522d5d8fd4785412ae0b782e2af4.jpeg', desc: 'Kristal turkuaz suda süzülen vatoz; ripple dokusuyla derinleşen minyatür kompozisyon.', fam: 'ripple' },
  { id: '48806744', ad: 'Ripple — Eagleray II', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_2218970e0e5a4069cacb6db0b41afcb8.jpeg', desc: 'Dalga kırışıklarının altında süzülen vatoz; ince çerçeveli dikey parça.', fam: 'ripple' },
  { id: '48806616', ad: 'Ripple 1', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_85777c7226b8f41e6b9115a265deb101.jpeg', desc: 'Saf ripple dokusu: rüzgârın su yüzeyine yazdığı deseni reçineyle donduran parça.', fam: 'ripple' },
  { id: '48806641', ad: 'Ripple 2', cat: 'tablo', tech: 'Çerçeveli epoksi tablo', size: '15 × 30 cm', price: '3.900 TL', badge: 'Son ürün', img: 'defnekehya_569e3895b46b9569ea1a5bd2d1d815e9.jpeg', desc: 'Işıltılı dalga kırışıkları; günün ışığına göre renk değiştiren yüzey.', fam: 'ripple' },
  { id: '48869618', ad: 'Şövaleli Mini Tablo', cat: 'mini', tech: 'Şövaleli epoksi tablo', size: '15 × 15 cm', price: '2.800 TL', badge: 'Yeni', img: 'defnekehya_24c1da4528286612e8bca1f9c8b2a66a.jpeg', desc: 'Minik şövalesiyle gelen kıyı manzarası; masa ve raflar için el yapımı bir deniz.', fam: 'mini' },
  { id: '48869594', ad: 'Şövaleli Mini Tablo II', cat: 'mini', tech: 'Şövaleli epoksi tablo', size: '15 × 15 cm', price: '2.800 TL', badge: 'Yeni', img: 'defnekehya_e569b7e32408b66b7cfb49ffe998bd04.jpeg', desc: 'Tekne silüetli mini kıyı; ahşap şövalesiyle hediyelik el yapımı parça.', fam: 'mini' },
  { id: '48868673', ad: 'Okyanus Bardak Altlığı Seti', cat: 'mini', tech: "4'lü epoksi bardak altlığı", size: '4 parça', price: '1.700 TL', badge: 'Yeni', img: 'defnekehya_2ca5e622ba61ac070263ec6aad5c4039.jpeg', desc: 'Dört parçalık dalga dokulu bardak altlığı seti; her biri elde dökülür.', fam: 'set' }
];

const CATLABEL = { tablo: 'Tablolar', ayna: 'Aynalar', mini: 'Mini & Hediye' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const priceNum = s => parseFloat(s.replace(/\./g, '').replace(' TL', ''));

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const VIEW = '<span class="view" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>';
const IGSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none"/></svg>';
const BAGSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z"/><path d="M8.5 9.5V6a3.5 3.5 0 0 1 7 0v3.5"/></svg>';
const WAVE = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 18 Q8 12 12 18 T20 18 T28 18"/><path d="M4 24 Q8 19 12 24 T20 24 T28 24" opacity=".5"/></svg>';

function relatedOf(p){
  const same = PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat);
  const rest = PRODUCTS.filter(x => x.id !== p.id && x.cat !== p.cat);
  return same.concat(rest).slice(0, 4);
}

function card(p){
  return `      <figure class="work" data-cat="${p.cat}" data-title="${esc(p.ad)}" data-href="${SHOP}/${p.id}">
        <div class="ph"><span class="badge${p.sale ? ' badge--sale' : ''}">${esc(p.badge)}</span><img src="${CDN}/pictures_mid/${p.img}" alt="${esc(p.ad)} — ${esc(p.tech.toLowerCase())}" loading="lazy" decoding="async">${VIEW}</div>
        <figcaption><div><h3>${esc(p.ad)}</h3><small>${esc(p.tech)} · ${esc(p.size)}</small></div><span class="price">${esc(p.price)}${p.old ? `<s>${esc(p.old)}</s>` : ''}</figcaption>
      </figure>`;
}

function navLink(href, label, active){
  return `<a href="../${href}"${active ? ' class="active"' : ''}>${label}</a>`;
}

function page(p){
  const rel = relatedOf(p).map(card).join('\n');
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.ad, image: `${CDN}/pictures_large/${p.img}`,
    description: p.desc, brand: { '@type': 'Brand', name: 'Defne Resin' },
    offers: { '@type': 'Offer', url: `${SHOP}/${p.id}`, priceCurrency: 'TRY', price: priceNum(p.price), availability: 'https://schema.org/InStock' }
  });
  const mArrow = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  return `<!DOCTYPE html>
<html lang="tr" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.ad)} — Defne Resin</title>
<meta name="description" content="${esc(p.desc)} ${esc(p.size)}, ${esc(p.price)}. El yapımı, tek üretim. Shopier üzerinden güvenle satın alın.">
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#F7F5EF">
<link rel="canonical" href="${DOMAIN}/urun/${p.id}.html">
<meta property="og:type" content="product">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(p.ad)} — Defne Resin">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${DOMAIN}/urun/${p.id}.html">
<meta property="og:image" content="${CDN}/pictures_large/${p.img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${CDN}/pictures_large/${p.img}">
<script type="application/ld+json">${jsonld}</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23F7F5EF'/%3E%3Cpath d='M4 18 Q8 12 12 18 T20 18 T28 18' fill='none' stroke='%230B6070' stroke-width='2.4' stroke-linecap='round'/%3E%3Cpath d='M4 24 Q8 19 12 24 T20 24 T28 24' fill='none' stroke='%23D9C29A' stroke-width='1.6' stroke-linecap='round' opacity='.85'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.shopier.app">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..650;1,9..144,400..650&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/fresh.css">
<noscript><style>.work .ph{background:linear-gradient(165deg,#4FC6CE,#0E7490 55%,#0A3D52)}</style></noscript>
</head>
<body>

<header class="nav">
  <a class="brand" href="../index.html">${WAVE}Defne <span>Resin</span></a>
  <nav class="nav-links" aria-label="Sayfalar">
    ${navLink('index.html', 'Ana Sayfa')}
    ${navLink('hakkinda.html', 'Hakkında')}
    ${navLink('eserler.html', 'Eserler', true)}
    ${navLink('egitim.html', 'Eğitim')}
    ${navLink('iletisim.html', 'İletişim')}
  </nav>
  <div class="nav-right">
    <a class="btn btn-ink btn-sm" href="${SHOP}" target="_blank" rel="noopener">Eğitime Katıl</a>
    <button class="menu-btn" aria-label="Menüyü aç" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>

<div class="m-panel" id="m-panel">
  <a href="../index.html">Ana Sayfa ${mArrow}</a>
  <a href="../hakkinda.html">Hakkında ${mArrow}</a>
  <a href="../eserler.html" class="active">Eserler ${mArrow}</a>
  <a href="../egitim.html">Eğitim ${mArrow}</a>
  <a href="../iletisim.html">İletişim ${mArrow}</a>
  <a class="btn btn-ink" href="${SHOP}" target="_blank" rel="noopener">Eğitime Katıl</a>
</div>

<main>
<div class="wrap">
  <nav class="crumbs" aria-label="Sayfa yolu">
    <a href="../eserler.html">Eserler</a>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <span>${esc(p.ad)}</span>
  </nav>

  <article class="pdp">
    <div class="pdp-img" data-r>
      <img src="${CDN}/pictures_large/${p.img}" alt="${esc(p.ad)} — ${esc(p.tech.toLowerCase())}, ${esc(p.size)}" fetchpriority="high">
    </div>
    <div class="pdp-info">
      <span class="badge${p.sale ? ' badge--sale' : ''}">${esc(p.badge)}</span>
      <h1>${esc(p.ad)}</h1>
      <p class="pdp-cat">${CATLABEL[p.cat]} · ${esc(p.tech)}</p>
      <p class="pdp-price">${esc(p.price)}${p.old ? `<s>${esc(p.old)}</s>` : ''}</p>
      <p>${esc(p.desc)}</p>
      <p>${esc(FAM[p.fam])}</p>
      <div class="pdp-meta">
        <div><span>Boyut</span><b>${esc(p.size)}</b></div>
        <div><span>Teknik</span><b>${esc(p.tech)}</b></div>
        <div><span>Üretim</span><b>El yapımı · Tek üretim</b></div>
        <div><span>Durum</span><b>${esc(p.badge)}</b></div>
      </div>
      <div class="pdp-ctas">
        <a class="btn btn-ink" href="${SHOP}/${p.id}" target="_blank" rel="noopener">Satın Al — Shopier ${ARROW}</a>
        <a class="btn btn-line" href="${IG}" target="_blank" rel="noopener">Soru Sor — DM</a>
      </div>
      <ul class="pdp-trust">
        <li>${CHECK}Shopier ile güvenli ödeme — kredi kartı &amp; havale</li>
        <li>${CHECK}Özenli paketleme, sigortalı gönderim</li>
        <li>${CHECK}İmzalı ve sertifikalı tek üretim</li>
      </ul>
    </div>
  </article>
</div>

<section class="sec-tight" aria-labelledby="rel-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="label" data-r>Koleksiyon</p>
        <h2 id="rel-h" data-r>Benzer <em>parçalar</em></h2>
      </div>
      <a class="link-arrow" href="../eserler.html" data-r><span>Tüm eserleri gör</span>${ARROW}</a>
    </div>
    <div class="cat-grid cols-4" data-r>
${rel}
    </div>
  </div>
</section>
</main>

<footer>
  <div class="wrap">
    <div class="f-grid">
      <div class="f-brand">
        <a class="brand" href="../index.html">${WAVE}Defne <span>Resin</span></a>
        <p>El yapımı deniz temalı epoksi reçine tabloları ve sıfırdan başlayanlar için online eğitim.</p>
      </div>
      <div class="f-col">
        <b>Sayfalar</b>
        <a href="../index.html">Ana Sayfa</a>
        <a href="../hakkinda.html">Hakkında</a>
        <a href="../eserler.html">Eserler</a>
        <a href="../egitim.html">Eğitim</a>
        <a href="../iletisim.html">İletişim</a>
      </div>
      <div class="f-col">
        <b>İletişim</b>
        <a href="${IG}" target="_blank" rel="noopener">${IGSVG}Instagram</a>
        <a href="${SHOP}" target="_blank" rel="noopener">${BAGSVG}Shopier Mağazası</a>
      </div>
    </div>
    <div class="f-word" aria-hidden="true">DEFNE RESIN</div>
    <div class="f-fine">
      <span>© 2026 Defne Resin · Tüm hakları saklıdır</span>
      <i>"Her eser, denizin bir anısını taşır."</i>
    </div>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.7/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.7/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
<script src="../assets/fresh.js"></script>
</body>
</html>
`;
}

/* ---- üret ---- */
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'urun');
fs.mkdirSync(outDir, { recursive: true });
PRODUCTS.forEach(p => {
  fs.writeFileSync(path.join(outDir, p.id + '.html'), page(p), 'utf8');
});

/* ---- sitemap ---- */
const staticPages = ['', 'hakkinda.html', 'eserler.html', 'egitim.html', 'iletisim.html'];
const urls = staticPages.map(u => `  <url><loc>${DOMAIN}/${u}</loc></url>`)
  .concat(PRODUCTS.map(p => `  <url><loc>${DOMAIN}/urun/${p.id}.html</loc></url>`))
  .join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');

console.log(PRODUCTS.length + ' ürün sayfası üretildi → urun/ · sitemap.xml güncellendi');
