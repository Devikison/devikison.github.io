  // ===================== CRIATIVOS: carrossel infinito arrastável =====================
  // Onde colar: dentro do app.js, logo depois do bloco "LIGHTBOX".
  // Usa o que o app.js já tem: $, $$, clamp, reduced, fine, onMeasure e Lightbox.
  (function(){
    var TOTAL = 14; // quantidade de imagens: gallery/carousel-01.jpg ... carousel-14.jpg
    var ARTS = []; for (var g = 1; g <= TOTAL; g++) ARTS.push('gallery/carousel-' + (g < 10 ? '0' + g : g) + '.jpg');
    var w = $('[data-arts]'), track = $('[data-arts-track]'); if (!w || !track) return;
    // a lista aparece duas vezes seguidas para o loop não ter emenda
    var item = function(src, i, dup){ return '<button type="button" class="art" data-art="' + i + '"' + (dup ? ' tabindex="-1" aria-hidden="true"' : ' aria-label="Ampliar criativo ' + (i + 1) + '"') + '><img src="' + src + '" alt="' + (dup ? '' : 'Criativo da Descomplica Site ' + (i + 1)) + '" width="1080" height="1440" loading="lazy" decoding="async"></button>'; };
    track.innerHTML = ARTS.map(function(s, i){ return item(s, i, false); }).join('') + ARTS.map(function(s, i){ return item(s, i, true); }).join('');
    var items = $$('.art', track), N = ARTS.length, SPEED = 38, HOLD = 2200, FR = .03;
    var pos = 0, vel = 0, period = 0, dragging = false, moved = false, pid = null, sx = 0, sp = 0, lastX = 0, lastT = 0, idle = 0, hover = false, last = 0, down = null, vis = false, running = false;
    function measure(){ period = items.length > N ? items[N].offsetLeft - items[0].offsetLeft : track.scrollWidth / 2; }
    function wrapP(p){ return period ? ((p % period) + period) % period : 0; }
    function apply(){ track.style.transform = 'translate3d(' + (-pos).toFixed(2) + 'px,0,0)'; }
    // o loop só roda com o carrossel na tela (fora dela, nada de trabalho por quadro)
    function start(){ if (!running){ running = true; last = 0; requestAnimationFrame(frame); } }
    function frame(ts){
      if (!vis && !dragging){ running = false; return; }
      requestAnimationFrame(frame);
      if (!last) last = ts; var dt = Math.min(48, ts - last) / 1000; last = ts;
      if (dragging) return;
      if (Math.abs(vel) > 8){ pos += vel * dt; vel *= Math.pow(FR, dt); }
      else { vel = 0; if (!reduced && ts > idle) pos += SPEED * (hover ? .3 : 1) * dt; }
      pos = wrapP(pos); apply();
    }
    measure(); onMeasure(function(){ measure(); pos = wrapP(pos); apply(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ vis = en[0].isIntersecting; if (vis) start(); }).observe(w);
    else { vis = true; start(); }
    w.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      down = e.target.closest('[data-art]'); dragging = true; moved = false; pid = e.pointerId; sx = lastX = e.clientX; sp = pos; lastT = e.timeStamp; vel = 0;
      w.classList.add('dragging'); try { w.setPointerCapture(pid); } catch(_){}
      start();
    });
    w.addEventListener('pointermove', function(e){
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true;
      pos = wrapP(sp - dx); apply();
      var dt = e.timeStamp - lastT; if (dt > 0) vel = vel * .5 + (-(e.clientX - lastX) / dt * 1000) * .5;
      lastX = e.clientX; lastT = e.timeStamp;
    });
    function end(e, cancel){
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false; w.classList.remove('dragging'); try { w.releasePointerCapture(pid); } catch(_){}
      if (cancel || (e && e.timeStamp - lastT > 90)) vel = 0;
      vel = clamp(vel, -2800, 2800); idle = performance.now() + HOLD;
    }
    w.addEventListener('pointerup', function(e){ end(e, false); });
    w.addEventListener('pointercancel', function(e){ end(e, true); });
    w.addEventListener('lostpointercapture', function(){ if (dragging) end(null, true); });
    w.addEventListener('wheel', function(e){ if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); pos = wrapP(pos + e.deltaX); apply(); vel = 0; idle = performance.now() + HOLD; }, { passive: false });
    if (fine){ w.addEventListener('mouseenter', function(){ hover = true; }); w.addEventListener('mouseleave', function(){ hover = false; }); }
    w.addEventListener('focusin', function(e){ var b = e.target.closest('.art'); if (!b) return; w.scrollLeft = 0; pos = wrapP(b.offsetLeft - (w.clientWidth - b.offsetWidth) / 2); apply(); vel = 0; idle = performance.now() + 4000; });
    // clique/toque abre a imagem grande (arrastar não abre); Enter/Espaço no teclado também abre
    w.addEventListener('click', function(e){ var b = down || e.target.closest('[data-art]'), drag = !!down && moved; down = null; if (!b || drag) return; Lightbox.open(ARTS, +b.getAttribute('data-art'), 'Criativo da Descomplica Site'); });
  })();
