/* ================================================================
   DEFNE RESIN — ortak script (tüm sayfalar)
   Sayfada olmayan öğeler sessizce atlanır; GSAP/Lenis CDN'i çökse
   bile site tamamen kullanılabilir kalır (zengin statik görünüm CSS'te).
   ================================================================ */
(function(){
"use strict";
var qs = function(s, c){ return (c || document).querySelector(s); };
var qsa = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

document.documentElement.classList.remove('no-js');

/* ?motion=force → reduced-motion tercihini yok say (test için) */
var forceMotion = /[?&]motion=force/.test(location.search);
var reduced = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var anim = hasGsap && !reduced;

document.documentElement.classList.add(anim ? 'anim' : 'no-anim');
if (hasGsap){ gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

/* ================================================================
   PLACEHOLDER ESER GÖRSELLERİ (SVG)
   Gerçek fotoğraflar hazır olunca img[data-artwork] etiketlerine
   src verin — src dolu görsellere JS dokunmaz.
   ================================================================ */
var artURLs = {};
(function buildArt(){
  function grad(id, stops, x1, y1, x2, y2){
    var s = stops.map(function(p){ return '<stop offset="' + p[0] + '" stop-color="' + p[1] + '"/>'; }).join('');
    return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '">' + s + '</linearGradient>';
  }
  function foam(w, y, amp, op, sw, seg){
    seg = seg || 6;
    var d = 'M0 ' + y, i, x, cy, step = w / seg;
    for (i = 1; i <= seg; i++){ x = step * i; cy = y + ((i % 2) ? -amp : amp); d += ' Q ' + (x - step / 2) + ' ' + cy + ' ' + x + ' ' + y; }
    return '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,' + op + ')" stroke-width="' + sw + '" stroke-linecap="round" filter="url(#soft)"/>';
  }
  function defs(extra){
    return '<defs>' + (extra || '')
      + '<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>'
      + '<filter id="soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>'
      + '<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"/></filter>'
      + '</defs>';
  }
  var grainRect = '<rect width="100%" height="100%" filter="url(#grain)"/>';
  function dolphin(x, y, s, rot, op){
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')" fill="rgba(5,30,42,' + (op || 0.88) + ')">'
      + '<ellipse cx="0" cy="6" rx="26" ry="46" fill="rgba(31,200,227,0.25)" filter="url(#soft2)"/>'
      + '<path d="M0 -46 C11 -30 13 -4 6 26 L15 45 L0 36 L-15 45 L-6 26 C-13 -4 -11 -30 0 -46 Z"/>'
      + '<path d="M-4 -10 L-27 1 L-6 9 Z"/><path d="M4 -10 L27 1 L6 9 Z"/></g>';
  }
  function island(x, y, r){
    return '<g>'
      + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.5) + '" fill="rgba(255,255,255,0.30)" filter="url(#soft2)"/>'
      + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.22) + '" fill="rgba(236,211,163,0.75)" filter="url(#soft)"/>'
      + '<path d="M' + (x - r) + ' ' + y + ' C' + (x - r * 0.9) + ' ' + (y - r * 1.1) + ' ' + (x + r * 0.6) + ' ' + (y - r * 1.15) + ' ' + (x + r * 0.95) + ' ' + (y - r * 0.2) + ' C' + (x + r * 1.15) + ' ' + (y + r * 0.7) + ' ' + (x - r * 0.4) + ' ' + (y + r * 1.15) + ' ' + (x - r) + ' ' + y + ' Z" fill="#5f7a3f"/>'
      + '<path d="M' + (x - r * 0.55) + ' ' + (y - r * 0.1) + ' C' + (x - r * 0.4) + ' ' + (y - r * 0.75) + ' ' + (x + r * 0.45) + ' ' + (y - r * 0.7) + ' ' + (x + r * 0.6) + ' ' + (y - r * 0.05) + ' C' + (x + r * 0.65) + ' ' + (y + r * 0.5) + ' ' + (x - r * 0.35) + ' ' + (y + r * 0.7) + ' ' + (x - r * 0.55) + ' ' + (y - r * 0.1) + ' Z" fill="#a8c775"/>'
      + '</g>';
  }
  function tentacle(d, w, color, rim){
    return '<g fill="none" stroke-linecap="round">'
      + '<path d="' + d + '" stroke="' + color + '" stroke-width="' + w + '" pathLength="100" stroke-dasharray="72 28"/>'
      + '<path d="' + d + '" stroke="' + color + '" stroke-width="' + (w * 0.62) + '" pathLength="100" stroke-dasharray="88 12"/>'
      + '<path d="' + d + '" stroke="' + color + '" stroke-width="' + (w * 0.32) + '"/>'
      + '<path d="' + d + '" stroke="' + rim + '" stroke-width="1.6" opacity="0.55" filter="url(#soft)"/>'
      + '</g>';
  }
  function svgWrap(w, h, inner){
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + inner + '</svg>';
  }

  var arts = {
    yunuslar: function(){
      var w = 520, h = 830, i = '';
      i += defs(grad('g1', [[0, '#45ddec'], [0.35, '#1fc8e3'], [0.7, '#0f7fa8'], [1, '#0c4661']]));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g1)"/>';
      i += foam(w, 150, 26, 0.5, 10, 5) + foam(w, 215, 20, 0.3, 6, 7) + foam(w, 128, 14, 0.25, 4, 9);
      i += foam(w, 520, 22, 0.16, 7, 6) + foam(w, 720, 26, 0.22, 9, 5);
      i += dolphin(w * 0.38, h * 0.42, 1.35, 14) + dolphin(w * 0.62, h * 0.58, 1.05, -10, 0.8);
      i += grainRect;
      return svgWrap(w, h, i);
    },
    koy: function(){
      var w = 640, h = 640, i = '';
      i += defs(grad('g2', [[0, '#2bcede'], [0.5, '#0f7fa8'], [1, '#0c4661']], 0, 0, 1, 1));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g2)"/>';
      i += '<circle cx="640" cy="580" r="430" fill="rgba(255,255,255,0.35)" filter="url(#soft2)"/>';
      i += '<circle cx="660" cy="600" r="400" fill="#ecd3a3"/>';
      i += '<circle cx="672" cy="612" r="360" fill="#dcc08c" opacity="0.7"/>';
      i += '<path d="M240 640 C300 480 480 380 640 360 L640 640 Z" fill="rgba(31,200,227,0.18)" filter="url(#soft2)"/>';
      i += foam(w, 300, 24, 0.4, 9, 5) + foam(w, 360, 16, 0.24, 5, 7) + foam(w, 130, 18, 0.2, 6, 6);
      i += island(170, 170, 52);
      i += grainRect;
      return svgWrap(w, h, i);
    },
    derin: function(){
      var w = 640, h = 850, i = '';
      i += defs(grad('g3', [[0, '#0f7fa8'], [0.4, '#0c4661'], [1, '#041c2b']]));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g3)"/>';
      i += '<ellipse cx="320" cy="120" rx="300" ry="140" fill="rgba(31,200,227,0.18)" filter="url(#soft2)"/>';
      i += tentacle('M180 880 C150 700 130 610 190 510 C250 410 380 440 380 340 C380 260 290 240 260 300', 52, '#0d2836', 'rgba(110,231,245,0.8)');
      i += tentacle('M480 900 C500 710 560 650 520 530 C485 430 400 410 420 330', 40, '#0b2230', 'rgba(110,231,245,0.6)');
      var suck = '', pts = [[196, 650], [176, 576], [186, 510], [226, 456], [286, 430], [340, 400], [368, 348]];
      pts.forEach(function(p, idx){ suck += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (7 - idx * 0.55) + '" fill="rgba(110,231,245,0.35)"/>'; });
      i += suck;
      i += '<circle cx="120" cy="300" r="4" fill="rgba(238,250,252,0.4)"/><circle cx="150" cy="240" r="2.5" fill="rgba(238,250,252,0.3)"/><circle cx="560" cy="200" r="3" fill="rgba(238,250,252,0.35)"/>';
      i += foam(w, 80, 18, 0.18, 6, 6);
      i += grainRect;
      return svgWrap(w, h, i);
    },
    sahil: function(){
      var w = 640, h = 640, i = '';
      i += defs(grad('g4', [[0, '#38d4e2'], [0.55, '#0f7fa8'], [1, '#0c4661']]));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g4)"/>';
      i += '<path d="M0 640 L0 468 Q160 432 320 466 T640 462 L640 640 Z" fill="rgba(255,255,255,0.4)" filter="url(#soft2)"/>';
      i += '<path d="M0 640 L0 484 Q160 450 320 482 T640 478 L640 640 Z" fill="#ecd3a3"/>';
      i += foam(w, 452, 14, 0.55, 9, 7) + foam(w, 428, 10, 0.3, 5, 9);
      i += island(190, 210, 58) + island(452, 150, 36);
      i += foam(w, 320, 18, 0.2, 6, 6);
      i += grainRect;
      return svgWrap(w, h, i);
    },
    lagun: function(){
      var w = 960, h = 600, i = '';
      i += defs(grad('g5', [[0, '#4fe0ee'], [0.3, '#1fc8e3'], [0.65, '#0f7fa8'], [1, '#0c4661']]));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g5)"/>';
      i += '<ellipse cx="480" cy="90" rx="520" ry="120" fill="rgba(238,250,252,0.14)" filter="url(#soft2)"/>';
      i += foam(w, 150, 22, 0.42, 9, 8) + foam(w, 210, 16, 0.26, 6, 10) + foam(w, 340, 20, 0.18, 7, 8) + foam(w, 470, 24, 0.2, 9, 7);
      i += island(700, 300, 64) + island(230, 420, 40);
      i += grainRect;
      return svgWrap(w, h, i);
    },
    siglik: function(){
      var w = 640, h = 760, i = '';
      i += defs(grad('g6', [[0, '#1fc8e3'], [0.45, '#0f7fa8'], [1, '#083048']], 0, 0, 1, 1));
      i += '<rect width="' + w + '" height="' + h + '" fill="url(#g6)"/>';
      i += '<ellipse cx="320" cy="150" rx="330" ry="170" fill="rgba(238,250,252,0.12)" filter="url(#soft2)"/>';
      i += foam(w, 220, 24, 0.35, 9, 6) + foam(w, 300, 16, 0.22, 6, 8) + foam(w, 560, 22, 0.2, 8, 6);
      i += island(460, 480, 66);
      i += '<path d="M0 760 L0 656 Q160 616 320 652 T640 646 L640 760 Z" fill="#ecd3a3" opacity="0.9"/>';
      i += foam(w, 628, 12, 0.5, 8, 8);
      i += grainRect;
      return svgWrap(w, h, i);
    }
  };
  arts.atolye = arts.siglik;
  arts.ig1 = arts.lagun; arts.ig2 = arts.sahil; arts.ig3 = arts.koy;
  arts.ig4 = arts.derin; arts.ig5 = arts.siglik; arts.ig6 = arts.yunuslar;

  qsa('img[data-artwork]').forEach(function(img){
    if (img.getAttribute('src')) return; /* gerçek görsel atanmışsa dokunma */
    var key = img.getAttribute('data-artwork');
    var fn = arts[key];
    if (!fn) return;
    if (!artURLs[key]){
      artURLs[key] = URL.createObjectURL(new Blob([fn()], { type: 'image/svg+xml' }));
    }
    img.src = artURLs[key];
  });
})();

/* ============ SAYFA GEÇİŞİ (dalga silme) ============ */
var wipe = qs('.wipe');
if (wipe){
  /* giriş animasyonu saf CSS; bittiğinde tamamen kapat (güvenlik ağı dahil) */
  setTimeout(function(){ if (!wipe.classList.contains('out')) wipe.classList.add('done'); }, 1600);
  /* bfcache'ten geri dönüşte takılı kalmasın */
  window.addEventListener('pageshow', function(e){
    if (e.persisted){ wipe.classList.remove('out'); wipe.classList.add('done'); }
  });
  if (!reduced){
    document.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (!/\.html(\#.*)?$/.test(href) || /^https?:\/\//.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      wipe.classList.remove('done');
      wipe.classList.add('out');
      setTimeout(function(){ location.href = href; }, 480);
      /* navigasyon iptal edilirse (Stop/Esc/çevrimdışı) sayfa örtülü kalmasın */
      setTimeout(function(){ wipe.classList.remove('out'); wipe.classList.add('done'); }, 4000);
    });
  }
}

/* ============ LENIS — suda süzülme ============ */
var lenis = null;
if (!reduced && typeof window.Lenis !== 'undefined'){
  lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  if (hasGsap){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
}

/* sayfa içi çapa linkleri */
qsa('a[data-scroll]').forEach(function(a){
  a.addEventListener('click', function(e){
    var id = a.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    var target = qs(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis){ lenis.scrollTo(target, { offset: -10, duration: 1.5 }); }
    else { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
  });
});

/* ============ NAV ============ */
var nav = qs('.nav');
function onScrollNav(){ if (nav) nav.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

/* aktif sayfa (statik class'a ek güvence) */
(function(){
  var page = (location.pathname.split('/').pop() || 'index.html');
  qsa('.nav-links a, .menu-overlay a').forEach(function(a){
    var href = (a.getAttribute('href') || '').split('#')[0];
    if (href === page) a.classList.add('active');
  });
})();

/* mobil menü + kaydırma kilidi */
var menuBtn = qs('.menu-btn'), menuOverlay = qs('#menu-overlay');
function syncScrollLock(){
  var lbEl = qs('#lightbox');
  var locked = (menuOverlay && menuOverlay.classList.contains('open')) ||
               (lbEl && lbEl.classList.contains('open'));
  document.body.style.overflow = locked ? 'hidden' : '';
  if (lenis){ locked ? lenis.stop() : lenis.start(); }
}
function closeMenu(){
  if (!menuOverlay || !menuOverlay.classList.contains('open')) return;
  menuOverlay.classList.remove('open');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  syncScrollLock();
  menuBtn.focus();
}
if (menuBtn && menuOverlay){
  menuBtn.setAttribute('aria-controls', 'menu-overlay');
  menuBtn.addEventListener('click', function(){
    var open = menuOverlay.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    syncScrollLock();
    if (open){ var first = qs('a', menuOverlay); if (first) first.focus(); }
  });
  menuOverlay.addEventListener('click', function(e){
    if (e.target === menuOverlay) closeMenu();
  });
  /* odak tuzağı: menü açıkken Tab, menü linkleri + kapatma düğmesi arasında dönsün */
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Tab' || !menuOverlay.classList.contains('open')) return;
    var items = qsa('a', menuOverlay).concat([menuBtn]);
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
}

/* ============ HERO HARF BÖLME (ana sayfa) ============ */
qsa('.split').forEach(function(el){
  var text = el.textContent;
  el.setAttribute('aria-hidden', 'true'); /* erişilebilir metin h1 aria-label'ında */
  el.textContent = '';
  text.split('').forEach(function(c){
    var s = document.createElement('span');
    s.className = 'ch';
    s.textContent = (c === ' ') ? ' ' : c;
    el.appendChild(s);
  });
});

/* ============ ANİMASYONLAR ============ */
if (anim){

  /* hero girişi (dalga silme biter bitmez) */
  if (qs('.hero-title .ch')){
    gsap.set('.hero-title .ch', { opacity: 0, y: 54, filter: 'blur(9px)' });
    gsap.set('.hero-title .shimmer', { opacity: 0, scale: .92, filter: 'blur(6px)' });
    gsap.set('.hero-sub, .hero-ctas .btn', { opacity: 0, y: 20 });
    gsap.set('.f-frame', { opacity: 0, scale: .8 });
    gsap.timeline({ delay: .9 })
      .to('.hero-title .ch', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: .04, ease: 'power3.out' })
      .to('.hero-title .shimmer', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .9, ease: 'power3.out' }, '-=0.6')
      .to('.hero-sub', { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, '-=0.5')
      .to('.hero-ctas .btn', { opacity: 1, y: 0, duration: .7, stagger: .13, ease: 'power2.out' }, '-=0.5')
      .to('.f-frame', { opacity: 1, scale: 1, duration: 1, stagger: .2, ease: 'back.out(1.4)', clearProps: 'opacity,scale' }, '-=0.8');
    /* yüzme salınımı: yPercent kullanır, fare paralaksının x/y'siyle çakışmaz */
    qsa('.f-frame').forEach(function(f, i){
      gsap.to(f, { yPercent: 7, duration: 3.2 + i * .8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });
  }

  /* iç sayfa hero'su */
  if (qs('.page-hero') && !qs('.hero-title .ch')){
    var phItems = qsa('.page-hero .kicker, .page-hero h1, .page-hero .sec-sub, .page-hero .btn');
    gsap.set(phItems, { opacity: 0, y: 34 });
    gsap.to(phItems, { opacity: 1, y: 0, duration: 1, stagger: .12, ease: 'power3.out', delay: .8, clearProps: 'opacity,transform' });
  }

  /* hero paralaksı */
  if (qs('.home-hero .container')){
    gsap.to('.home-hero .container', {
      yPercent: -18, opacity: .2, ease: 'none',
      scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  if (qs('.scroll-ind')){
    gsap.fromTo('.scroll-ind', { opacity: 1 }, {
      opacity: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '.home-hero', start: 'top top', end: '25% top', scrub: true }
    });
  }

  /* genel reveal sistemi — başlangıç durumu JS'te, tween sonunda clearProps */
  var FROM = {
    up:   { opacity: 0, y: 44 },
    left: { opacity: 0, x: -44 },
    right:{ opacity: 0, x: 44 },
    zoom: { opacity: 0, scale: .88 },
    fade: { opacity: 0 }
  };
  qsa('[data-reveal]').forEach(function(el){
    if (el.closest('[data-stagger]')) return;
    var type = el.getAttribute('data-reveal') || 'up';
    gsap.set(el, FROM[type] || FROM.up);
    gsap.to(el, {
      opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.out',
      delay: parseFloat(el.getAttribute('data-delay') || 0),
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  qsa('[data-stagger]').forEach(function(group){
    var items = Array.prototype.slice.call(group.children);
    if (!items.length) return;
    /* hover'ı CSS transform transition'a dayanan kartlarda yalnız opaklık */
    var flat = group.hasAttribute('data-stagger-flat');
    gsap.set(items, flat ? { opacity: 0 } : { opacity: 0, y: 38 });
    var vars = {
      opacity: 1, duration: .95, ease: 'power3.out', stagger: .12,
      clearProps: flat ? 'opacity' : 'opacity,transform',
      scrollTrigger: { trigger: group, start: 'top 86%' }
    };
    if (!flat) vars.y = 0;
    gsap.to(items, vars);
  });

  /* başlıklar: su yükselir gibi clip reveal */
  qsa('.wr').forEach(function(el){
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0% 0% 0%)', y: 26 },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* dekoratif paralaks (data-parallax="0.15" → yPercent) */
  qsa('[data-parallax]').forEach(function(el){
    var sp = parseFloat(el.getAttribute('data-parallax')) || .12;
    gsap.fromTo(el, { yPercent: sp * 100 }, {
      yPercent: -sp * 100, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* sayaçlar — markup'taki gerçek değer görünür kalır (yazdırma/erken durumlar),
     sıfırlama ancak animasyon başlarken yapılır */
  qsa('[data-count]').forEach(function(el){
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function(){
        el.textContent = '0' + suffix;
        gsap.to(obj, { v: end, duration: 2, ease: 'power3.out',
          onUpdate: function(){ el.textContent = Math.round(obj.v) + suffix; } });
      }
    });
  });

  /* çerçeve yüzme salınımı */
  qsa('.frame-float').forEach(function(f, idx){
    gsap.to(f, { y: 9, duration: 2.6 + (idx % 5) * .35, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  });

  /* süreç çizgisi (eğitim sayfası) */
  var pDraw = qs('#p-draw');
  if (pDraw){
    var pLen = pDraw.getTotalLength();
    pDraw.style.strokeDasharray = pLen;
    pDraw.style.strokeDashoffset = pLen;
    var pStops = qsa('.p-stop');
    gsap.to(pDraw, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.process-wave', start: 'top 82%', end: 'bottom 46%', scrub: true,
        onUpdate: function(self){
          pStops.forEach(function(st, idx){
            st.classList.toggle('on', self.progress > (idx + 0.5) / pStops.length);
          });
        }
      }
    });
  }

  /* hero yüzen çerçeveler: fare paralaksı */
  if (finePointer && qs('.hero-floats')){
    var floats = qsa('.f-frame');
    var quick = floats.map(function(f, i){
      return {
        x: gsap.quickTo(f, 'x', { duration: .9, ease: 'power3.out' }),
        y: gsap.quickTo(f, 'y', { duration: .9, ease: 'power3.out' }),
        depth: (i + 1) * 14
      };
    });
    window.addEventListener('pointermove', function(e){
      var nx = e.clientX / window.innerWidth - .5;
      var ny = e.clientY / window.innerHeight - .5;
      quick.forEach(function(q){ q.x(-nx * q.depth); q.y(-ny * q.depth); });
    }, { passive: true });
  }

  /* fontlar yüklenince ölçüleri tazele */
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
}

/* ============ MIKNATISLI BUTONLAR ============ */
if (anim && finePointer){
  qsa('.btn').forEach(function(btn){
    var qx = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3.out' });
    var qy = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3.out' });
    btn.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .18);
      qy((e.clientY - r.top - r.height / 2) * .3);
    });
    btn.addEventListener('pointerleave', function(){ qx(0); qy(0); });
  });
}

/* ============ 3D TILT (eser çerçeveleri) ============ */
if (anim && finePointer){
  qsa('.art-card').forEach(function(card){
    var frame = qs('.frame', card);
    if (!frame) return;
    card.addEventListener('pointermove', function(e){
      var r = frame.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      gsap.to(frame, { rotateY: px * 10, rotateX: -py * 8, duration: .5, ease: 'power2.out' });
    });
    card.addEventListener('pointerleave', function(){
      gsap.to(frame, { rotateY: 0, rotateX: 0, duration: .8, ease: 'elastic.out(1, .5)' });
    });
  });
}

/* ============ ŞERİT: sürükleyerek kaydır ============ */
var stripDragged = false;
qsa('.strip').forEach(function(strip){
  if (!finePointer) return;
  /* tarayıcının yerel görsel sürüklemesi jesti çalmasın */
  qsa('img', strip).forEach(function(img){ img.setAttribute('draggable', 'false'); });
  strip.addEventListener('dragstart', function(e){ e.preventDefault(); });
  var down = false, startX = 0, startScroll = 0, moved = 0;
  function release(){
    if (!down) return;
    down = false;
    strip.classList.remove('dragging');
    stripDragged = moved > 8;
    setTimeout(function(){ stripDragged = false; }, 80);
  }
  strip.addEventListener('pointerdown', function(e){
    if (e.button !== 0) return; /* yalnız sol tuş/birincil temas */
    down = true; moved = 0; startX = e.clientX; startScroll = strip.scrollLeft;
    strip.classList.add('dragging');
    if (strip.setPointerCapture){ try { strip.setPointerCapture(e.pointerId); } catch (err) {} }
  });
  window.addEventListener('pointermove', function(e){
    if (!down) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    strip.scrollLeft = startScroll - dx;
  }, { passive: true });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
});

/* ============ LIGHTBOX ============ */
var lightbox = qs('#lightbox');
if (lightbox){
  var lbImg = qs('.lb-imgwrap img', lightbox);
  var lbTitle = qs('.lb-title', lightbox);
  var lbMeta = qs('.lb-meta', lightbox);
  var lbDesc = qs('.lb-desc', lightbox);
  var lbBuy = qs('.lb-info .btn', lightbox);
  var lbPrevFocus = null;
  var openLightbox = function(card){
    /* satılık olmayan kayıtlar (ör. atölye kareleri) satın alma butonu göstermez */
    if (lbBuy) lbBuy.style.display = card.hasAttribute('data-nobuy') ? 'none' : '';
    var img = qs('img', card);
    lbImg.src = img ? img.src : '';
    lbImg.alt = img ? img.alt : '';
    lbTitle.textContent = card.getAttribute('data-title') || '';
    lbMeta.textContent = (card.getAttribute('data-tech') || '') + ' · ' + (card.getAttribute('data-size') || '');
    lbDesc.textContent = card.getAttribute('data-desc') || '';
    lightbox.classList.toggle('round', card.getAttribute('data-shape') === 'circle');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lbPrevFocus = document.activeElement;
    var closeBtn = qs('.lb-close', lightbox);
    if (closeBtn) closeBtn.focus();
    syncScrollLock();
  };
  var closeLightbox = function(){
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (lbPrevFocus && lbPrevFocus.focus) lbPrevFocus.focus();
  };
  qsa('.art-card .frame').forEach(function(frame){
    var card = frame.closest('.art-card');
    if (!card.getAttribute('data-title')) return; /* lightbox verisi yoksa pasif */
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('role', 'button');
    frame.setAttribute('aria-label', (card.getAttribute('data-title') || 'Eser') + ' — detayları aç');
    frame.addEventListener('click', function(){
      if (stripDragged) return; /* sürükleme sonrası yanlışlıkla açılmasın */
      openLightbox(card);
    });
    frame.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(card); }
    });
  });
  qsa('[data-close]', lightbox).forEach(function(el){
    el.addEventListener('click', closeLightbox);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ closeLightbox(); closeMenu(); return; }
    if (e.key === 'Tab' && lightbox.classList.contains('open')){
      var focusables = qsa('a[href], button', lightbox);
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
} else {
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============ YORUM CAROUSEL ============ */
(function(){
  var wrap = qs('.t-wrap'), track = qs('.t-track');
  if (!wrap || !track) return;
  var cards = qsa('.t-card', track);
  var idx = 0, timer = null;
  function visibleCount(){
    var cw = cards[0].getBoundingClientRect().width;
    return Math.max(1, Math.round(wrap.clientWidth / cw));
  }
  function maxIdx(){ return Math.max(0, cards.length - visibleCount()); }
  function update(){
    var gap = parseFloat(getComputedStyle(track).gap) || 22;
    var step = cards[0].getBoundingClientRect().width + gap;
    idx = Math.min(idx, maxIdx());
    track.style.transform = 'translateX(' + (-idx * step) + 'px)';
  }
  function go(dir){ idx = idx + dir; if (idx < 0) idx = maxIdx(); if (idx > maxIdx()) idx = 0; update(); }
  var autoOn = !reduced; /* elle gezinmede otomatik akış kalıcı durur */
  function stopAuto(){ if (timer){ clearInterval(timer); timer = null; } }
  function restart(){ stopAuto(); if (autoOn) timer = setInterval(function(){ go(1); }, 5500); }
  var nextB = qs('#t-next'), prevB = qs('#t-prev');
  if (nextB) nextB.addEventListener('click', function(){ autoOn = false; stopAuto(); go(1); });
  if (prevB) prevB.addEventListener('click', function(){ autoOn = false; stopAuto(); go(-1); });
  wrap.addEventListener('pointerenter', stopAuto);
  wrap.addEventListener('pointerleave', restart);
  [wrap, prevB, nextB].forEach(function(el){
    if (!el) return;
    el.addEventListener('focusin', stopAuto);
    el.addEventListener('focusout', restart);
  });
  window.addEventListener('resize', update);
  update(); restart();
})();

/* ============ BUTON TIKLAMA DALGASI ============ */
qsa('.btn').forEach(function(btn){
  btn.addEventListener('click', function(e){
    var r = btn.getBoundingClientRect();
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.left = (e.clientX - r.left - 6) + 'px';
    s.style.top = (e.clientY - r.top - 6) + 'px';
    btn.appendChild(s);
    setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, 700);
  });
});

/* ============ CURSOR RIPPLE (2D canvas su dalgası) ============ */
(function(){
  if (reduced) return;
  var canvas = qs('#fx-ripple');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var SCALE = 4, W, H, sw, sh, cur, prev, off, offCtx, imgData;
  var lastInput = 0, running = false;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    sw = Math.max(4, Math.ceil(W / SCALE));
    sh = Math.max(4, Math.ceil(H / SCALE));
    cur = new Float32Array(sw * sh);
    prev = new Float32Array(sw * sh);
    off = document.createElement('canvas');
    off.width = sw; off.height = sh;
    offCtx = off.getContext('2d');
    imgData = offCtx.createImageData(sw, sh);
    var d = imgData.data;
    for (var i = 0; i < sw * sh; i++){
      d[i * 4] = 190; d[i * 4 + 1] = 238; d[i * 4 + 2] = 246; d[i * 4 + 3] = 0;
    }
  }
  resize();

  function drop(x, y, radius, strength){
    var cx = Math.floor(x / SCALE), cy = Math.floor(y / SCALE);
    for (var j = -radius; j <= radius; j++){
      for (var i = -radius; i <= radius; i++){
        if (i * i + j * j > radius * radius) continue;
        var px = cx + i, py = cy + j;
        if (px < 1 || px >= sw - 1 || py < 1 || py >= sh - 1) continue;
        prev[py * sw + px] += strength;
      }
    }
    lastInput = performance.now();
    if (!running){ running = true; requestAnimationFrame(step); }
  }

  var moveTick = 0;
  window.addEventListener('pointermove', function(e){
    if (++moveTick % 2) return;
    drop(e.clientX, e.clientY, 2, 140);
  }, { passive: true });
  window.addEventListener('pointerdown', function(e){
    drop(e.clientX, e.clientY, 4, 420);
  }, { passive: true });
  if (!window.PointerEvent){
    window.addEventListener('touchmove', function(e){
      var t = e.touches[0];
      if (t) drop(t.clientX, t.clientY, 2, 140);
    }, { passive: true });
  }

  function step(){
    if (document.hidden){ running = false; return; }
    var i, x, y, v;
    var maxAmp = 0;
    for (y = 1; y < sh - 1; y++){
      i = y * sw + 1;
      for (x = 1; x < sw - 1; x++, i++){
        v = ((prev[i - 1] + prev[i + 1] + prev[i - sw] + prev[i + sw]) / 2 - cur[i]) * 0.976;
        cur[i] = v;
        if (v > maxAmp) maxAmp = v;
      }
    }
    var tmp = prev; prev = cur; cur = tmp;

    var d = imgData.data;
    for (i = 0; i < sw * sh; i++){
      v = prev[i];
      d[i * 4 + 3] = v > 1.2 ? Math.min(120, v * 0.55) : 0;
    }
    offCtx.putImageData(imgData, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, W, H);

    if (maxAmp < 1.5 && performance.now() - lastInput > 3000){
      running = false;
      ctx.clearRect(0, 0, W, H);
      return;
    }
    requestAnimationFrame(step);
  }

  var rTimer;
  window.addEventListener('resize', function(){
    clearTimeout(rTimer);
    rTimer = setTimeout(resize, 220);
  });
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && !running && performance.now() - lastInput < 3000){
      running = true; requestAnimationFrame(step);
    }
  });
})();

/* ============ KABARCIKLAR ============ */
(function(){
  if (reduced) return;
  var canvas = qs('#fx-bubbles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, bubbles = [];
  var COUNT = 24;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function spawn(b, fresh){
    b.x = Math.random() * W;
    b.y = fresh ? Math.random() * H : H + 12;
    b.r = .8 + Math.random() * 2.6;
    b.speed = .18 + Math.random() * .5;
    b.drift = 12 + Math.random() * 26;
    b.phase = Math.random() * Math.PI * 2;
    b.alpha = .12 + Math.random() * .24;
  }
  resize();
  for (var i = 0; i < COUNT; i++){ var b = {}; spawn(b, true); bubbles.push(b); }

  var t = 0;
  (function tick(){
    requestAnimationFrame(tick);
    if (document.hidden) return;
    t += .008;
    ctx.clearRect(0, 0, W, H);
    bubbles.forEach(function(b){
      b.y -= b.speed;
      if (b.y < -14) spawn(b, false);
      var x = b.x + Math.sin(t * 2 + b.phase) * b.drift * .18;
      ctx.beginPath();
      ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(238,250,252,' + b.alpha + ')';
      ctx.lineWidth = .8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - b.r * .3, b.y - b.r * .3, b.r * .3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(238,250,252,' + (b.alpha * .7) + ')';
      ctx.fill();
    });
  })();
  var rTimer;
  window.addEventListener('resize', function(){
    clearTimeout(rTimer);
    rTimer = setTimeout(resize, 220);
  });
})();

})();
