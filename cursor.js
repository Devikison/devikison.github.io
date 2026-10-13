/* Cursor da Descomplica: anel "HUD" que segue a seta com atraso suave.
   Só em computador com mouse; desligado para quem prefere menos movimento.
   A seta em si é CSS (styles.css), então nunca trava nem atrasa. */
(function(){
  'use strict';
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ring = document.createElement('div');
  ring.className = 'cur-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<svg viewBox="0 0 40 40"><circle class="seg" cx="20" cy="20" r="17"/><circle class="core" cx="20" cy="20" r="2"/></svg>';
  document.body.appendChild(ring);
  document.documentElement.classList.add('has-cur');

  var HOT = 'a,button,summary,label,select,[role="button"],[data-lp],.q-opt';
  var x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false;

  function loop(){
    rx += (x - rx) * .22; ry += (y - ry) * .22;
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    if (Math.abs(x - rx) > .1 || Math.abs(y - ry) > .1) raf = requestAnimationFrame(loop); else raf = 0;
  }
  window.addEventListener('mousemove', function(e){
    x = e.clientX; y = e.clientY;
    if (!shown){ shown = true; rx = x; ry = y; ring.classList.add('on'); }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('mouseover', function(e){
    var t = e.target.closest && e.target.closest(HOT);
    ring.classList.toggle('hot', !!t);
    ring.classList.toggle('txt', !t && !!(e.target.closest && e.target.closest('input,textarea')));
  });
  document.addEventListener('mouseleave', function(){ shown = false; ring.classList.remove('on'); });
  window.addEventListener('mousedown', function(){ ring.classList.add('down'); });
  window.addEventListener('mouseup', function(){ ring.classList.remove('down'); });
})();
