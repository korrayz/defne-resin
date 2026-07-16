/* ================================================================
   DEFNE RESIN — kritik etkileşimler (CDN'den BAĞIMSIZ)
   Menü, kart navigasyonu, filtre, alıntı geçişi, çapa linkleri.
   GSAP/Lenis yüklenmese ya da gecikse bile bunlar anında çalışır.
   ================================================================ */
(function(){
"use strict";
var qs = function(s, c){ return (c || document).querySelector(s); };
var qsa = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

/* ============ NAV: scrolled durumu ============ */
var nav = qs('.nav');
function onScrollNav(){ if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

/* ============ MOBİL MENÜ (+ arka plan kaydırma kilidi) ============ */
var menuBtn = qs('.menu-btn'), mPanel = qs('#m-panel');
function setMenuLock(open){
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMenu(){
  if (!mPanel || !mPanel.classList.contains('open')) return;
  mPanel.classList.remove('open');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  setMenuLock(false);
  menuBtn.focus();
}
if (menuBtn && mPanel){
  menuBtn.setAttribute('aria-controls', 'm-panel');
  menuBtn.addEventListener('click', function(){
    var open = mPanel.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    setMenuLock(open);
    if (open){ var first = qs('a', mPanel); if (first) first.focus(); }
  });
  document.addEventListener('click', function(e){
    if (!mPanel.classList.contains('open')) return;
    if (!mPanel.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });
}
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') closeMenu();
});

/* ============ SAYFA İÇİ ÇAPALAR (scroll-margin-top CSS'te) ============ */
var reducedCrit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
qsa('a[data-scroll]').forEach(function(a){
  a.addEventListener('click', function(e){
    var id = a.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    var target = qs(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reducedCrit ? 'auto' : 'smooth' });
  });
});

/* ============ ÜRÜN KARTLARI → DETAY SAYFASI ============ */
qsa('.work').forEach(function(card){
  var href = card.getAttribute('data-href') || '';
  var m = href.match(/(\d+)\/?$/);
  if (!m) return;
  var base = /\/urun\//.test(location.pathname) ? '' : 'urun/';
  var target = base + m[1] + '.html';
  var ph = qs('.ph', card) || card;
  ph.setAttribute('tabindex', '0');
  ph.setAttribute('role', 'link');
  ph.setAttribute('aria-label', (card.getAttribute('data-title') || 'Ürün') + ' — detay sayfası');
  /* başlık/fiyat bandı dahil TÜM kart tıklanabilir */
  card.addEventListener('click', function(){ location.href = target; });
  ph.addEventListener('keydown', function(e){
    if (e.key === 'Enter'){ location.href = target; }
  });
});

/* ============ KATALOG FİLTRESİ (+ konum kaybını önle) ============ */
(function(){
  var row = qs('.filter-row');
  if (!row) return;
  var chips = qsa('.chip', row);
  var cards = qsa('.cat-grid .work');
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      chips.forEach(function(c){
        c.classList.toggle('on', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      var cat = chip.getAttribute('data-filter');
      cards.forEach(function(card){
        card.classList.toggle('hidden', cat !== 'hepsi' && card.getAttribute('data-cat') !== cat);
      });
      /* liste kısalınca kullanıcı footer'da kalmasın: grid başına dön */
      var rowTop = row.offsetTop - 90;
      if (window.scrollY > rowTop) window.scrollTo({ top: Math.max(0, rowTop), behavior: 'auto' });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
})();

/* ============ ALINTI GEÇİŞİ (yalnız elle) ============ */
(function(){
  var slides = qsa('.quote-slide');
  if (!slides.length) return;
  var idx = 0;
  function show(n){
    idx = (n + slides.length) % slides.length;
    slides.forEach(function(sl, i){ sl.classList.toggle('on', i === idx); });
  }
  var prev = qs('#q-prev'), next = qs('#q-next');
  if (prev) prev.addEventListener('click', function(){ show(idx - 1); });
  if (next) next.addEventListener('click', function(){ show(idx + 1); });
  show(0);
})();

})();
