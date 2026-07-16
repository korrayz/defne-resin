/* ================================================================
   DEFNE RESIN — v3 "Porselen Galeri" script (ana sayfa)
   Zarif, az ve isabetli hareket. GSAP/Lenis CDN'i çökse bile sayfa
   tamamen okunur ve zengin kalır (başlangıç durumları JS'te verilir).
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
   GERÇEKÇİ DENİZ GÖRSELİ ÜRETİCİSİ (SVG, kuş bakışı)
   feTurbulence + feDisplacementMap ile organik köpük ve kıyı çizgileri.
   Gerçek fotoğraflar geldiğinde img[data-artwork] etiketine src verin;
   src dolu görsele JS dokunmaz.
   ================================================================ */
var artURLs = {};
(function buildArt(){

  function lerpPath(w, y, amp, seg){
    seg = seg || 5;
    var d = 'M-40 ' + y, step = (w + 80) / seg, x, cy, i;
    for (i = 1; i <= seg; i++){
      x = -40 + step * i;
      cy = y + ((i % 2) ? -amp : amp);
      d += ' Q ' + (x - step / 2) + ' ' + cy + ' ' + x + ' ' + y;
    }
    return d;
  }

  function sea(o){
    var w = o.w, h = o.h, seed = o.seed || 7;
    var s = '';

    /* --- defs --- */
    s += '<defs>';
    s += '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
      + o.stops.map(function(p){ return '<stop offset="' + p[0] + '" stop-color="' + p[1] + '"/>'; }).join('')
      + '</linearGradient>';
    s += '<linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#EAD9AF"/><stop offset="1" stop-color="#DFC493"/></linearGradient>';
    s += '<radialGradient id="glint" cx="50%" cy="50%" r="50%">'
      + '<stop offset="0" stop-color="rgba(255,255,255,0.55)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>';
    s += '<radialGradient id="moss" cx="42%" cy="38%" r="65%">'
      + '<stop offset="0" stop-color="#9CB86A"/><stop offset="0.7" stop-color="#61793F"/><stop offset="1" stop-color="#4C6234"/></radialGradient>';
    s += '<filter id="fFoam" x="-25%" y="-25%" width="150%" height="150%">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.045" numOctaves="4" seed="' + seed + '" result="n"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>'
      + '<feGaussianBlur stdDeviation="0.5"/></filter>';
    s += '<filter id="fGlow" x="-25%" y="-25%" width="150%" height="150%">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.045" numOctaves="4" seed="' + seed + '" result="n"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>'
      + '<feGaussianBlur stdDeviation="7"/></filter>';
    s += '<filter id="fSand" x="-25%" y="-25%" width="150%" height="150%">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.007 0.02" numOctaves="3" seed="' + (seed + 3) + '" result="n"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="n" scale="85" xChannelSelector="R" yChannelSelector="G"/>'
      + '<feGaussianBlur stdDeviation="1.2"/></filter>';
    s += '<filter id="fSoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>';
    s += '<filter id="fMist" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>';
    s += '<filter id="fGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>'
      + '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.045 0"/></filter>';
    s += '</defs>';

    /* --- zemin --- */
    s += '<rect width="' + w + '" height="' + h + '" fill="url(#bg)"/>';

    /* --- derin: ışık hüzmeleri --- */
    if (o.rays){
      s += '<g opacity="0.16" filter="url(#fSoft)">'
        + '<polygon points="' + (w * .18) + ',-40 ' + (w * .34) + ',-40 ' + (w * .52) + ',' + h + ' ' + (w * .28) + ',' + h + '" fill="#BDEBEF"/>'
        + '<polygon points="' + (w * .55) + ',-40 ' + (w * .64) + ',-40 ' + (w * .92) + ',' + h + ' ' + (w * .74) + ',' + h + '" fill="#BDEBEF" opacity="0.7"/>'
        + '</g>';
      /* mini kabarcıklar */
      var bx = [0.22, 0.31, 0.68, 0.74, 0.5, 0.83], i;
      for (i = 0; i < bx.length; i++){
        s += '<circle cx="' + (w * bx[i]) + '" cy="' + (h * (0.25 + i * 0.11)) + '" r="' + (2 + (i % 3)) + '" fill="rgba(230,248,250,0.35)" filter="url(#fMist)"/>';
      }
    }

    /* --- güneş parlaması --- */
    if (o.glint){
      s += '<ellipse cx="' + (w * o.glint[0]) + '" cy="' + (h * o.glint[1]) + '" rx="' + (w * o.glint[2]) + '" ry="' + (h * o.glint[2] * 0.7) + '" fill="url(#glint)" opacity="0.5"/>';
    }

    /* --- açık deniz köpük telleri --- */
    (o.wisps || []).forEach(function(t){
      s += '<path d="' + lerpPath(w, h * t[0], h * 0.012, 6) + '" fill="none" stroke="rgba(255,255,255,' + t[1] + ')" stroke-width="' + (t[2] || 3) + '" stroke-linecap="round" filter="url(#fFoam)"/>';
    });

    /* --- kıyı: ıslak kum + kum + köpük hattı --- */
    if (o.sandFrom){
      var sy = h * o.sandFrom;
      /* sığlık açılması */
      s += '<rect x="-40" y="' + (sy - h * 0.10) + '" width="' + (w + 80) + '" height="' + (h * 0.14) + '" fill="rgba(196,235,226,0.55)" filter="url(#fSand)"/>';
      /* ıslak kum */
      s += '<rect x="-40" y="' + (sy - h * 0.015) + '" width="' + (w + 80) + '" height="' + (h - sy + h * 0.1) + '" fill="#C9B287" opacity="0.85" filter="url(#fSand)"/>';
      /* kuru kum */
      s += '<rect x="-40" y="' + (sy + h * 0.035) + '" width="' + (w + 80) + '" height="' + (h - sy + h * 0.1) + '" fill="url(#sandG)" filter="url(#fSand)"/>';
      /* köpük hattı: parlama + ana + ikincil */
      s += '<path d="' + lerpPath(w, sy, h * 0.018, 5) + '" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="' + (h * 0.03) + '" stroke-linecap="round" filter="url(#fGlow)"/>';
      s += '<path d="' + lerpPath(w, sy - h * 0.004, h * 0.016, 5) + '" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="' + (h * 0.011) + '" stroke-linecap="round" filter="url(#fFoam)"/>';
      s += '<path d="' + lerpPath(w, sy - h * 0.05, h * 0.014, 6) + '" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="' + (h * 0.006) + '" stroke-linecap="round" filter="url(#fFoam)"/>';
      s += '<path d="' + lerpPath(w, sy - h * 0.1, h * 0.012, 6) + '" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="' + (h * 0.005) + '" stroke-linecap="round" filter="url(#fFoam)"/>';
    }

    /* --- adacıklar --- */
    (o.islands || []).forEach(function(g){
      var ix = w * g[0], iy = h * g[1], ir = Math.min(w, h) * g[2];
      s += '<circle cx="' + ix + '" cy="' + iy + '" r="' + (ir * 1.6) + '" fill="rgba(210,240,235,0.5)" filter="url(#fSoft)"/>';
      s += '<path d="' + lerpPath(ir * 4, 0, ir * 0.1, 4) + '" transform="translate(' + (ix - ir * 2) + ' ' + (iy + ir * 1.15) + ')" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="' + (ir * 0.14) + '" stroke-linecap="round" filter="url(#fFoam)"/>';
      s += '<ellipse cx="' + ix + '" cy="' + iy + '" rx="' + (ir * 1.28) + '" ry="' + (ir * 1.18) + '" fill="#E2CFA0" filter="url(#fSand)"/>';
      s += '<ellipse cx="' + ix + '" cy="' + (iy - ir * 0.05) + '" rx="' + ir + '" ry="' + (ir * 0.9) + '" fill="url(#moss)" filter="url(#fSand)"/>';
    });

    /* --- yunus silüetleri (bulanık, sualtı) --- */
    if (o.silhouettes){
      var dol = function(x, y, sc, rot){
        return '<g transform="translate(' + (w * x) + ' ' + (h * y) + ') rotate(' + rot + ') scale(' + sc + ')" fill="rgba(9,38,52,0.5)" filter="url(#fMist)">'
          + '<path d="M0 -34 C9 -22 10 -2 5 18 L11 32 L0 26 L-11 32 L-5 18 C-10 -2 -9 -22 0 -34 Z"/>'
          + '<path d="M-3 -6 L-19 2 L-4 7 Z"/><path d="M3 -6 L19 2 L4 7 Z"/></g>';
      };
      s += '<ellipse cx="' + (w * 0.44) + '" cy="' + (h * 0.44) + '" rx="' + (w * 0.16) + '" ry="' + (h * 0.06) + '" fill="rgba(190,236,240,0.28)" filter="url(#fSoft)"/>';
      s += dol(0.42, 0.4, Math.min(w, h) / 420, 18);
      s += dol(0.6, 0.55, Math.min(w, h) / 520, -12);
    }

    /* --- doku --- */
    s += '<rect width="' + w + '" height="' + h + '" filter="url(#fGrain)"/>';

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + s + '</svg>';
  }

  var SHALLOW = [[0, '#0A3D52'], [0.3, '#0E6D8A'], [0.52, '#17A2B5'], [0.68, '#4FC6CE'], [0.8, '#A9E2DE']];
  var MID = [[0, '#093749'], [0.35, '#0E7490'], [0.65, '#1FA9BC'], [1, '#57C8CF']];
  var DEEP = [[0, '#0A2536'], [0.5, '#0C405A'], [1, '#116080']];

  var arts = {
    hero:     function(){ return sea({ w: 900,  h: 1150, seed: 11, stops: SHALLOW, sandFrom: 0.8,  glint: [0.3, 0.1, 0.5], wisps: [[0.3, 0.2, 4], [0.46, 0.28, 5], [0.6, 0.22, 4]] }); },
    lagun:    function(){ return sea({ w: 1280, h: 880,  seed: 5,  stops: SHALLOW, sandFrom: 0.82, glint: [0.68, 0.08, 0.5], islands: [[0.24, 0.42, 0.06]], wisps: [[0.3, 0.2, 4], [0.55, 0.26, 5]] }); },
    pano:     function(){ return sea({ w: 1680, h: 760,  seed: 9,  stops: SHALLOW, sandFrom: 0.8,  glint: [0.24, 0.1, 0.42], islands: [[0.72, 0.4, 0.075]], wisps: [[0.32, 0.22, 4], [0.52, 0.26, 5]] }); },
    koy:      function(){ return sea({ w: 840,  h: 840,  seed: 3,  stops: MID,     sandFrom: 0.74, glint: [0.3, 0.12, 0.45], islands: [[0.3, 0.3, 0.075]], wisps: [[0.42, 0.24, 4]] }); },
    sahil:    function(){ return sea({ w: 840,  h: 880,  seed: 8,  stops: SHALLOW, sandFrom: 0.72, glint: [0.7, 0.1, 0.4], islands: [[0.62, 0.34, 0.065], [0.28, 0.2, 0.045]], wisps: [[0.46, 0.24, 4]] }); },
    yunuslar: function(){ return sea({ w: 760,  h: 1000, seed: 13, stops: MID,     silhouettes: true, glint: [0.36, 0.1, 0.5], wisps: [[0.16, 0.3, 5], [0.24, 0.2, 4], [0.72, 0.2, 4], [0.84, 0.26, 5]] }); },
    derin:    function(){ return sea({ w: 800,  h: 1040, seed: 17, stops: DEEP,    rays: true, wisps: [[0.1, 0.16, 4]] }); },
    siglik:   function(){ return sea({ w: 820,  h: 1020, seed: 21, stops: SHALLOW, sandFrom: 0.64, glint: [0.5, 0.08, 0.45], islands: [[0.66, 0.3, 0.06]], wisps: [[0.36, 0.24, 4]] }); }
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

/* ============ LENIS — yalnız fare/trackpad'li cihazlarda (dokunmatikte
   yerel kaydırma zaten akıcı; boşuna rAF döngüsü çalışmasın) ============ */
var lenis = null;
if (!reduced && finePointer && typeof window.Lenis !== 'undefined'){
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (hasGsap){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
}

/* Nav durumu, menü, çapalar, kart navigasyonu, filtre ve alıntı geçişi
   assets/critical.js'te — CDN'den bağımsız, anında çalışır. */

/* ============ GİRİŞ + REVEAL ============ */
if (anim){

  /* hero girişi */
  var heroItems = qsa('.hero-copy > *');
  if (heroItems.length){
    gsap.set(heroItems, { opacity: 0, y: 28 });
    gsap.set('.hero-visual', { opacity: 0, y: 40 });
    gsap.set('.hero-chip', { opacity: 0, scale: .85 });
    gsap.timeline({ delay: .15 })
      .to(heroItems, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out', clearProps: 'opacity,transform' })
      .to('.hero-visual', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'opacity,transform' }, '-=0.7')
      .to('.hero-chip', { opacity: 1, scale: 1, duration: .7, stagger: .12, ease: 'back.out(1.6)', clearProps: 'opacity,transform' }, '-=0.5');
  }

  /* genel reveal — başlangıç JS'te, bitişte clearProps */
  qsa('[data-r]').forEach(function(el){
    if (el.closest('[data-rg]')) return;
    var t = el.getAttribute('data-r') || 'up';
    var from = { opacity: 0 };
    if (t === 'up') from.y = 30;
    if (t === 'left') from.x = -30;
    if (t === 'right') from.x = 30;
    gsap.set(el, from);
    gsap.to(el, {
      opacity: 1, x: 0, y: 0, duration: .9, ease: 'power3.out',
      delay: parseFloat(el.getAttribute('data-d') || 0),
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  qsa('[data-rg]').forEach(function(group){
    var items = Array.prototype.slice.call(group.children);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 26 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09,
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: group, start: 'top 87%' }
    });
  });

  /* pano paralaksı */
  qsa('.pano img').forEach(function(img){
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: img.closest('.pano'), start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* hero görseli hafif paralaks */
  if (qs('.hero-art img')){
    gsap.to('.hero-art img', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  /* sayaçlar */
  qsa('[data-count]').forEach(function(el){
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function(){
        el.textContent = '0' + suffix;
        gsap.to(obj, { v: end, duration: 1.8, ease: 'power3.out',
          onUpdate: function(){ el.textContent = Math.round(obj.v) + suffix; } });
      }
    });
  });

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
}

})();
