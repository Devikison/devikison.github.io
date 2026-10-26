/* /linkdabio: cards empilhados no scroll (vários grupos na mesma página) e
   evento de clique no WhatsApp para o Google Analytics.
   Mesma regra do app.js: mede só no carregamento/resize; no scroll, só contas
   com números guardados e escrita de transform. */
(function(){
  'use strict';
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
  var root = document.documentElement;

  // ===================== CLIQUE NO WHATSAPP (conversão) =====================
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]'); if (!a || typeof window.gtag !== 'function') return;
    var sec = a.closest('section'), where = a.hasAttribute('data-fab') ? 'barra_fixa' : sec ? (sec.id || sec.getAttribute('aria-labelledby') || sec.className.split(' ')[0]) : 'menu';
    window.gtag('event', 'generate_lead', { method: 'whatsapp', page: 'linkdabio', cta_position: where });
  });

  // ===================== EMPILHAMENTO =====================
  var stacks = $$('[data-lstack]'); if (!stacks.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var S = [], VH = window.innerHeight;

  function measure(){
    VH = window.innerHeight;
    var y = window.scrollY;
    S = stacks.map(function(st){
      var cards = $$('.lcard', st);
      var sticks = cards.map(function(c){ return parseFloat(getComputedStyle(c).top) || 0; });
      root.classList.add('measuring');
      var G = cards.map(function(c, i){ return { el: c, top: c.getBoundingClientRect().top + y, h: c.offsetHeight, st: sticks[i], last: '' }; });
      var r = st.getBoundingClientRect(), bottom = r.bottom + y - (parseFloat(getComputedStyle(st).paddingBottom) || 0);
      root.classList.remove('measuring');
      return { G: G, bottom: bottom };
    });
    update();
  }
  function vis(g, y, bottom){ return Math.min(Math.max(g.top - y, g.st), bottom - y - g.h); }
  function update(){
    var y = window.scrollY;
    S.forEach(function(s){
      var G = s.G; if (!G.length || s.bottom - y < -VH || G[0].top - y > VH * 1.5) return;
      for (var i = 0; i < G.length - 1; i++){
        var g = G[i], vt = vis(g, y, s.bottom), nt = vis(G[i + 1], y, s.bottom);
        var p = clamp((vt + g.h - nt) / g.h, 0, 1), key = p.toFixed(3);
        if (key === g.last) continue; g.last = key;
        g.el.style.transform = p > 0 ? 'scale(' + (1 - p * .07).toFixed(4) + ')' : '';
        g.el.style.setProperty('--dim', (p * .6).toFixed(3));
      }
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; update(); }); } }, { passive: true });
  var t = null, lastW = window.innerWidth;
  window.addEventListener('resize', function(){
    // barra do navegador do celular aparecendo/sumindo não muda a largura: não remede
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - VH) < 160){ VH = window.innerHeight; return; }
    lastW = window.innerWidth; clearTimeout(t); t = setTimeout(measure, 140);
  }, { passive: true });
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window){ var lastH = 0; new ResizeObserver(function(){ var h = document.body.scrollHeight; if (Math.abs(h - lastH) > 2){ lastH = h; clearTimeout(t); t = setTimeout(measure, 60); } }).observe(document.body); }
  measure();
})();
