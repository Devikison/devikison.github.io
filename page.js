/* Páginas internas: a página funciona sem JavaScript. Aqui: ano do rodapé e
   rolagem suave (Lenis), com a mesma sensação da página inicial. */
(function(){
  'use strict';
  // Não deixa o site ser aberto dentro de outro site (proteção contra golpe de clique)
  if (window.top !== window.self) { document.documentElement.style.display = 'none'; try { window.top.location = window.self.location.href; } catch(_) {} }
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // ===================== ROLAGEM SUAVE (Lenis, só desktop com mouse) =====================
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!fine || reduced || !window.Lenis) return;
  var lenis = new Lenis({
    duration: 1.35,
    easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    wheelMultiplier: .9
  });
  var raf = function(t){ lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Links para âncoras da própria página (ex.: "Voltar ao topo") também deslizam
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    var id = a.getAttribute('href').slice(1), t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(a.classList.contains('ft-up') ? 0 : t, { duration: 1.6 });
  });
})();
