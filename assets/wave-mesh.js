/* =====================================================================
   WAVE MESH — campo de pontos até o horizonte, ondulando como um mar lento.
   O mouse levanta uma colina onde aponta no chão; o clique (ou toque) solta
   um anel que corre pelo campo e some. Os pontos encolhem e apagam com a
   distância: parece profundidade sem nenhuma biblioteca 3D (canvas 2D puro).
   Uso: <div data-wave data-wave-colors="#c3d2ff,#62e6ff" data-wave-crests></div>
   ===================================================================== */
(function(){
  'use strict';
  var CAM = 0.62, NEAR = 0.35, FAR = 3.4;

  function rgb(h){ var n = parseInt(h.replace('#',''), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }

  function mount(host){
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var cs = (host.getAttribute('data-wave-colors') || '#c3d2ff,#62e6ff').split(',');
    var dot = rgb(cs[0].trim()), accent = rgb((cs[1] || cs[0]).trim());
    var crests = host.hasAttribute('data-wave-crests');
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarse = !matchMedia('(hover: hover) and (pointer: fine)').matches;
    var W = 0, H = 0, cols = 0, rows = 0, f = 0, hz = 0, dpr = 1;
    var raf = 0, visible = true, last = 0, t0 = performance.now();
    var ptr = { x: 0, z: 1.4, s: 0, tx: 0, tz: 1.4, ts: 0 };
    var rings = [];

    function resize(){
      var w = host.clientWidth, h = host.clientHeight;
      if (w === W && h === H) return;
      W = w; H = h;
      dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var narrow = W < 700;
      f = Math.max(W, H * 1.2) * (narrow ? 0.5 : 0.55);   // distância focal
      hz = H * (narrow ? 0.46 : 0.38);                       // horizonte: o campo nasce abaixo do título
      cols = Math.round(Math.min(150, Math.max(46, W / (narrow ? 8 : 9))));
      rows = Math.round(Math.min(84, Math.max(40, H / (narrow ? 13 : 10))));
    }

    // metade da largura do chão no fundo, para o campo sempre preencher a tela
    function half(){ return (W / 2 / f) * FAR * 1.05; }

    function height(x, z, t){
      var y = 0.085 * Math.sin(x * 2.2 + t * 0.7) +
              0.07 * Math.sin(z * 2.9 - t * 0.9 + x * 0.8) +
              0.03 * Math.sin((x + z) * 6.1 + t * 1.6);
      if (ptr.s > 0.01){
        var dx = x - ptr.x, dz = z - ptr.z;
        y += 0.24 * ptr.s * Math.exp(-(dx * dx + dz * dz) / 0.07);
      }
      for (var k = 0; k < rings.length; k++){
        var r = rings[k], age = t - r.t, d = Math.sqrt((x - r.x) * (x - r.x) + (z - r.z) * (z - r.z)), front = age * 1.15;
        y += 0.2 * Math.exp(-((d - front) * (d - front)) / 0.014) * Math.exp(-age * 0.75);
      }
      return y;
    }

    function frame(t){
      ctx.clearRect(0, 0, W, H);
      ptr.x += (ptr.tx - ptr.x) * 0.1;
      ptr.z += (ptr.tz - ptr.z) * 0.1;
      ptr.s += (ptr.ts - ptr.s) * 0.06;
      while (rings.length && t - rings[0].t > 5) rings.shift();
      var hw = half(), hot = [];
      for (var j = 0; j < rows; j++){
        // fileiras espaçadas em progressão geométrica: ficam quase uniformes na tela
        var z = FAR * Math.pow(NEAR / FAR, j / (rows - 1));
        var fog = Math.pow(1 - (z - NEAR) / (FAR - NEAR), 1.25);
        var size = Math.max(0.8, Math.min(3.2, 2.3 / z));
        ctx.fillStyle = 'rgba(' + dot + ',' + (0.14 + fog * 0.86).toFixed(3) + ')';
        for (var i = 0; i < cols; i++){
          var x = -hw + (i / (cols - 1)) * hw * 2;
          var sx = W / 2 + (x / z) * f;
          if (sx < -4 || sx > W + 4) continue;
          var y = height(x, z, t);
          var sy = hz + ((CAM - y) / z) * f;
          if (sy > H + 4) continue;
          if (crests && y > 0.12){ hot.push(sx, sy, size, fog); continue; }
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        }
      }
      for (var k = 0; k < hot.length; k += 4){
        ctx.fillStyle = 'rgba(' + accent + ',' + (0.2 + hot[k + 3] * 0.8).toFixed(3) + ')';
        var s = hot[k + 2] * 1.15;
        ctx.fillRect(hot[k] - s / 2, hot[k + 1] - s / 2, s, s);
      }
    }

    function now(){ return (performance.now() - t0) / 1000; }
    function loop(ms){
      if (!visible || document.hidden){ raf = 0; return; }
      raf = requestAnimationFrame(loop);
      if (coarse && ms - last < 30) return;   // celular: ~33 quadros por segundo bastam
      last = ms;
      resize();
      frame(now());
    }
    function wake(){ if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }

    // onde, no chão, cai um ponto da tela (ignorando as ondas)
    function ground(e){
      var r = host.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
      if (sx < 0 || sy < 0 || sx > r.width || sy > r.height || sy <= hz + 4) return null;
      var z = Math.min(FAR, Math.max(NEAR, (CAM * f) / (sy - hz)));
      return { x: ((sx - W / 2) * z) / f, z: z };
    }
    function onMove(e){
      var g = ground(e);
      if (g){ ptr.tx = g.x; ptr.tz = g.z; if (ptr.s < 0.05){ ptr.x = g.x; ptr.z = g.z; } }
      ptr.ts = g ? 1 : 0;
    }
    // click (e não pointerdown): no celular não dispara ao rolar a página
    function onClick(e){ var g = ground(e); if (g) rings.push({ x: g.x, z: g.z, t: now() }); }

    resize();
    frame(reduced ? 3 : 0);
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; wake(); }).observe(host);
    new ResizeObserver(function(){ if (reduced){ resize(); frame(3); } }).observe(host);
    document.addEventListener('visibilitychange', wake);
    if (!reduced){
      wake();
      if (!coarse) window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('click', onClick, { passive: true });
    }
  }

  function init(){ Array.prototype.forEach.call(document.querySelectorAll('[data-wave]'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
