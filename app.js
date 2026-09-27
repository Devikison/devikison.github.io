/* =====================================================================
   DESCOMPLICA SITE — interações
   Regra de desempenho: durante a rolagem NADA lê layout (getBoundingClientRect,
   offsetTop...). As posições são medidas uma vez (carregamento, resize, quando a
   altura da página muda) e o scroll só faz contas com números guardados e escreve
   transform/opacity, que a placa de vídeo anima sem travar.
   ===================================================================== */
(function(){
  'use strict';
  var WA = '5547992476541';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/devikisonads@gmail.com'; // backup do lead por e-mail ('' desliga)
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); };
  var fmt = function(s){ return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); };
  var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
  var ic = function(id, cls){ return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var knob = '<span class="knob"><svg aria-hidden="true"><use href="#i-wa"/></svg></span>';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var waLink = function(msg){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); };
  var docTop = function(el){ return el.getBoundingClientRect().top + window.scrollY; };

  // ===================== PROTEÇÃO DE CONTEÚDO =====================
  (function(){
    var isField = function(el){ return el && el.closest && el.closest('input,textarea,select'); };
    document.addEventListener('contextmenu', function(e){ if (!isField(e.target)) e.preventDefault(); });
    document.addEventListener('dragstart', function(e){ if (e.target.tagName === 'IMG') e.preventDefault(); });
    document.addEventListener('copy', function(e){ if (!isField(e.target)) e.preventDefault(); });
    document.addEventListener('selectstart', function(e){ if (!isField(e.target)) e.preventDefault(); });
  })();

  $$('[data-wa]').forEach(function(a){ a.href = waLink(a.getAttribute('data-wa')); });
  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  // ===================== CONTEÚDO =====================
  var SERP = ['dentista perto de mim', 'loja de roupas em são paulo', 'advogado trabalhista', 'pizzaria delivery aberta agora', 'clínica de estética', 'contador para mei', 'encanador 24 horas', 'arquiteto residencial'];
  var LPS = []; for (var l = 1; l <= 7; l++) LPS.push('gallery/lp/lp-0' + l + '.webp');
  var CMP = [
    { k: 'Google', no: 'Não aparece na busca nem no mapa', yes: 'No mapa, na busca e nas respostas de IA', i: 'i-search' },
    { k: 'Primeira impressão', no: 'Link do Instagram, feed bagunçado', yes: 'Página profissional com a sua marca', i: 'i-insta' },
    { k: 'Confiança', no: '“Eles nem têm site...”', yes: 'Endereço próprio, provas e serviços claros', i: 'i-shield' },
    { k: 'Contato', no: 'Cliente procura o número e desiste', yes: 'Um toque e a conversa abre no WhatsApp', i: 'i-chat' },
    { k: 'Anúncio', no: 'Clique caro caindo no perfil', yes: 'Clique caindo numa página que converte', i: 'i-mega' },
    { k: 'Resultado', no: 'Depende de indicação e sorte', yes: 'Cliente novo chegando pelo Google', i: 'i-chart' }
  ];

  // ===================== RENDER =====================
  (function(){
    var vs = $('[data-vs]');
    if (vs){
      var col = function(kind){
        var yes = kind === 'yes';
        return '<div class="vs-col vs-' + kind + (yes ? ' on-dark shine' : '') + ' rv" data-rv="' + (yes ? 'right' : 'left') + '">' +
          '<div class="vs-head"><span class="tag ' + (yes ? 'tag-volt' : 'tag-line') + '">' + (yes ? 'Com a Descomplica' : 'Hoje, sem site') + '</span>' +
          '<h3>' + (yes ? 'Negócio encontrado' : 'Negócio invisível') + '</h3><p>' + (yes ? 'Quem procura, acha. E chama.' : 'Depende de quem já te conhece.') + '</p></div>' +
          CMP.map(function(c){ return '<div class="vs-item"><span class="vs-tile">' + ic(c.i) + '<span class="vs-mark">' + ic(yes ? 'i-check' : 'i-x') + '</span></span><div><small>' + esc(c.k) + '</small><b>' + esc(yes ? c.yes : c.no) + '</b></div></div>'; }).join('') +
          (yes ? '<div class="vs-cta"><a class="btn btn-primary btn-block" href="' + waLink('Olá, Descomplica Site! Quero meu negócio do lado de quem é encontrado no Google.') + '" target="_blank" rel="noopener">' + knob + '<span class="bt">Quero estar desse lado</span></a></div>' : '') +
          '</div>';
      };
      vs.innerHTML = col('no') + '<div class="vs-mid" aria-hidden="true"><span>VS</span></div>' + col('yes');
      var tg = $('[data-cmp-toggle]');
      if (tg) $$('[data-cmp]', tg).forEach(function(b){ b.addEventListener('click', function(){
        var v = b.getAttribute('data-cmp'); tg.className = 'cmp-toggle ' + v; vs.className = 'vs ' + v;
        $$('[data-cmp]', tg).forEach(function(x){ x.classList.toggle('on', x === b); });
        $$('.vs-col', vs).forEach(function(c){ c.classList.add('in'); });
      }); });
    }
    // Ripple: anéis pulsando (no celular, menos anéis e menores; o mesmo pulsar do computador)
    var rp = $('[data-ripple]');
    if (rp){
      var small = window.innerWidth <= 640, html = '', n = small ? 4 : 6;
      for (var k = 0; k < n; k++){
        var sz = (small ? 250 : 320) + k * (small ? 95 : 140);
        html += '<i style="--sz:' + sz + 'px;--op:' + Math.max(.012, .085 - k * .013).toFixed(3) + ';--bo:' + Math.max(.06, .3 - k * .045).toFixed(3) + ';--dl:' + (k * .08).toFixed(2) + 's"></i>';
      }
      rp.innerHTML = html;
    }
  })();

  // ===================== TÍTULOS: sobem palavra por palavra (TextAnimate) =====================
  $$('[data-split]').forEach(function(el){
    var n = 0;
    (function walk(node, inAur){
      Array.prototype.slice.call(node.childNodes).forEach(function(ch){
        if (ch.nodeType === 3){
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--wi', n++);
            if (inAur){ var au = document.createElement('span'); au.className = 'au'; au.textContent = p; w.appendChild(au); } else w.textContent = p;
            frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch, inAur || ch.classList.contains('aurora'));
      });
    })(el, false);
    el.classList.add('split');
  });

  // ===================== REVELAÇÃO NO SCROLL =====================
  (function(){
    var els = $$('.rv, .split');
    if (reduced || !('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){
      if (e.isIntersecting) e.target.classList.add('in');
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('in');
    }); }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
    $$('.hero .rv, .hero .split').forEach(function(e){ requestAnimationFrame(function(){ e.classList.add('in'); }); });
  })();

  // ===================== MOTOR: medir de vez em quando, rolar sempre leve =====================
  var subs = [], pre = [], measures = [], VH = window.innerHeight, VW = window.innerWidth, Y = window.scrollY, ticking = false;
  var onScroll = function(fn){ subs.push(fn); };
  var onPre = function(fn){ pre.push(fn); };        // lê estilos antes de desligar o sticky
  var onMeasure = function(fn){ measures.push(fn); };
  function frame(){ ticking = false; Y = window.scrollY || root.scrollTop; for (var i = 0; i < subs.length; i++) subs[i](Y); }
  function request(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }
  function measureAll(){
    if (!(window.visualViewport && window.visualViewport.scale > 1.01)){ VH = window.innerHeight; VW = window.innerWidth; }
    var i; for (i = 0; i < pre.length; i++) pre[i]();
    root.classList.add('measuring');
    for (i = 0; i < measures.length; i++) measures[i](window.scrollY);
    root.classList.remove('measuring');
    frame();
  }
  var mT = null, lastW = VW, lastH = VH, lastDocH = 0;
  function remeasure(delay){ clearTimeout(mT); mT = setTimeout(function(){ requestAnimationFrame(measureAll); }, delay || 0); }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', function(){
    // zoom de pinça (no iPhone muda innerWidth/innerHeight): não remede nada até voltar ao normal
    if (window.visualViewport && window.visualViewport.scale > 1.01) return;
    var w = window.innerWidth, h = window.innerHeight;
    // barra do navegador do celular aparecendo/sumindo: só atualiza a altura, sem remedir tudo
    if (w === lastW && Math.abs(h - lastH) < 160){ VH = h; request(); return; }
    lastW = w; lastH = h; remeasure(140);
  }, { passive: true });
  window.addEventListener('load', function(){ remeasure(0); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ remeasure(0); });
  if ('ResizeObserver' in window) new ResizeObserver(function(){ var h = document.body.scrollHeight; if (Math.abs(h - lastDocH) > 2){ lastDocH = h; remeasure(0); } }).observe(document.body);
  $$('main > section').forEach(function(s, i){ s.style.zIndex = i + 1; });

  // ===================== TEXTO EM DEGRADÊ: um degradê por frase (não por palavra) =====================
  // posições de layout (offset* do .w de cada palavra): não mudam enquanto as palavras sobem na entrada
  onMeasure(function(){
    $$('.aurora').forEach(function(g){
      var ws = $$('.au', g); if (!ws.length) return;
      // um degradê contínuo por linha: palavras da mesma linha dividem a mesma faixa de cor
      var rs = ws.map(function(w){ var b = w.parentNode.classList.contains('w') ? w.parentNode : w; return { l: b.offsetLeft, t: b.offsetTop, r: b.offsetLeft + b.offsetWidth, h: b.offsetHeight || 1 }; }), lines = [];
      rs.forEach(function(r, i){ var ln = lines.filter(function(L){ return Math.abs(L.t - r.t) < r.h / 2; })[0]; if (!ln){ ln = { t: r.t, l: r.l, r: r.r, ids: [] }; lines.push(ln); } ln.l = Math.min(ln.l, r.l); ln.r = Math.max(ln.r, r.r); ln.ids.push(i); });
      lines.forEach(function(L){ L.ids.forEach(function(i){ ws[i].style.setProperty('--aw', Math.max(1, Math.round(L.r - L.l)) + 'px'); ws[i].style.setProperty('--ax', Math.round(L.l - rs[i].l) + 'px'); }); });
    });
  });

  // ===================== BARRA SUPERIOR: some ao descer, volta ao subir =====================
  var menuOpen = false;
  (function(){
    var nav = $('#nav'), prog = $('.nav-prog'), links = $$('[data-nav]'), pill = $('.nav-pill'), navLinks = $('.nav-links');
    var menuLinks = $$('.menu-link');
    var anchors = links.map(function(a){ return $(a.getAttribute('href')); });
    var tops = [], maxY = 1, lastY = window.scrollY, hidden = false, activeIdx = -2, navHover = false;
    onMeasure(function(y){
      tops = anchors.map(function(a){ return a ? a.getBoundingClientRect().top + y : Infinity; });
      maxY = Math.max(1, root.scrollHeight - VH);
    });
    function setHidden(h){ if (h === hidden) return; hidden = h; nav.classList.toggle('hide', h); }
    function movePill(a){
      if (!pill) return;
      if (!a){ pill.style.opacity = '0'; return; }
      pill.style.opacity = '1'; pill.style.width = a.offsetWidth + 'px'; pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    }
    onScroll(function(y){
      if (y < 90 || menuOpen) setHidden(false);
      else if (y > lastY + 8){ setHidden(true); lastY = y; }
      else if (y < lastY - 8){ setHidden(false); lastY = y; }
      if (prog) prog.style.setProperty('--p', clamp(y / maxY, 0, 1).toFixed(4));
      var mid = y + VH * .42, cur = -1;
      for (var i = 0; i < tops.length; i++) if (tops[i] <= mid) cur = i;
      if (cur !== activeIdx){
        activeIdx = cur;
        links.forEach(function(a, i){ a.classList.toggle('on', i === cur); });
        var href = cur >= 0 ? links[cur].getAttribute('href') : '';
        menuLinks.forEach(function(m){ m.classList.toggle('on', m.getAttribute('href') === href); });
        if (!navHover && VW > 1100) movePill(links[cur]);
      }
    });
    if (navLinks){
      links.forEach(function(a){ a.addEventListener('mouseenter', function(){ navHover = true; movePill(a); }); });
      navLinks.addEventListener('mouseleave', function(){ navHover = false; movePill(links[activeIdx]); });
    }
    var burger = $('[data-burger]'), menu = $('[data-menu]');
    function setMenu(o){
      menuOpen = o; menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); document.body.style.overflow = o ? 'hidden' : ''; if (o) setHidden(false);
    }
    burger.addEventListener('click', function(){ setMenu(!menuOpen); });
    $$('[data-menu-link]').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && menuOpen) setMenu(false); });
  })();

  // ===================== ÂNCORAS (compensa as folhas sobrepostas) =====================
  // a rolagem é restaurada por nós (abaixo), não pelo navegador: com as folhas fixas e as
  // medidas feitas depois das fontes, a posição dele cai no lugar errado
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function cleanHash(){ if (location.hash && history.replaceState) history.replaceState(null, '', location.pathname + location.search); }
  function anchorTop(el){
    if (el.id === 'top') return 0;
    var y = docTop(el), next = el.nextElementSibling;
    if (next && next.classList.contains('sheet')) y += parseFloat(getComputedStyle(next).marginTop) || 0;
    return Math.max(0, y);
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = $(id); if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: anchorTop(t), behavior: reduced ? 'auto' : 'smooth' });
    cleanHash();
    var f = t.nextElementSibling || t;
    if (f.tagName === 'SECTION'){ if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1'); try { f.focus({ preventScroll: true }); } catch(_){} }
  });
  // link de fora com #seção (ex.: compartilhado): vai até ela e limpa o endereço
  (function(){
    var h = location.hash, t = null; if (!h) return;
    try { t = $(h); } catch(_){}
    if (!t){ cleanHash(); return; }
    window.addEventListener('load', function(){ setTimeout(function(){ window.scrollTo(0, anchorTop(t)); cleanHash(); }, 80); });
  })();

  // ===================== ATUALIZAR A PÁGINA: continua de onde parou =====================
  // Só quando a página é recarregada (F5 / puxar pra atualizar). Abrir de novo (aba nova,
  // link, digitar o endereço) começa na hero. Guarda a seção + a distância dentro dela, que
  // continua certa mesmo se as fontes ou as medidas mudarem a altura de algo acima.
  (function(){
    var KEY = 'ds-scroll', secs = $$('main > section');
    function navType(){
      try { var n = performance.getEntriesByType('navigation')[0]; if (n) return n.type; } catch(_){}
      return performance.navigation && performance.navigation.type === 1 ? 'reload' : '';
    }
    // posições reais, sem o sticky e sem o transform das folhas
    function tops(){ root.classList.add('measuring'); var t = secs.map(docTop); root.classList.remove('measuring'); return t; }
    function save(){
      var y = window.scrollY, t = tops(), i = 0;
      for (var k = 0; k < t.length; k++) if (t[k] <= y + 1) i = k;
      try { sessionStorage.setItem(KEY, JSON.stringify({ i: i, o: Math.round(y - (t[i] || 0)), y: Math.round(y) })); } catch(_){}
    }
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') save(); });

    var s = null;
    if (navType() === 'reload' && !location.hash){ try { s = JSON.parse(sessionStorage.getItem(KEY)); } catch(_){} }
    try { sessionStorage.removeItem(KEY); } catch(_){}
    if (!s || !(s.y > 0)) return;
    // reaplica enquanto a página termina de montar; para assim que a pessoa mexer
    var done = false, stop = function(){ done = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function(ev){ window.addEventListener(ev, stop, { passive: true, once: true }); });
    function go(){
      if (done) return;
      var t = secs[s.i] ? tops()[s.i] : null, y = t != null ? t + s.o : s.y;
      y = clamp(Math.round(y), 0, Math.max(0, root.scrollHeight - window.innerHeight));
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    }
    go(); requestAnimationFrame(go);
    window.addEventListener('load', function(){ go(); setTimeout(go, 150); setTimeout(function(){ go(); done = true; }, 700); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  })();

  // ===================== PROFUNDIDADE: a seção afunda e a próxima passa por cima =====================
  (function(){
    var D = $$('[data-depth]').map(function(sec){
      var next = sec.nextElementSibling; while (next && next.tagName !== 'SECTION') next = next.nextElementSibling;
      return { sec: sec, next: next, shade: $('.shade', sec), h: 0, N: 0, scale: false, last: '' };
    }).filter(function(d){ return d.next; });
    onMeasure(function(y){
      D.forEach(function(d){
        d.h = d.sec.offsetHeight; d.N = d.next.getBoundingClientRect().top + y;
        d.T = d.sec.getBoundingClientRect().top + y; d.st = Math.min(0, VH - d.h);
        d.scale = d.h <= VH * 1.35;
        d.sec.style.setProperty('--st', d.st + 'px');
        d.sec.style.transformOrigin = '50% ' + Math.round(Math.max(d.h - VH / 2, d.h / 2)) + 'px';
        d.last = '';
      });
    });
    if (reduced) return;
    onScroll(function(y){
      D.forEach(function(d){
        var nt = d.N - y, p = clamp(1 - nt / VH, 0, 1), covered = nt <= 0;
        var key = covered ? 'c' : p <= 0 ? '0' : p.toFixed(3);
        if (key === d.last) return; d.last = key;
        if (p <= 0){ d.sec.style.transform = ''; d.sec.style.visibility = ''; d.sec.removeAttribute('data-covered'); if (d.shade) d.shade.style.opacity = '0'; return; }
        d.sec.style.visibility = covered ? 'hidden' : '';
        if (covered) d.sec.setAttribute('data-covered', '1'); else d.sec.removeAttribute('data-covered');
        d.sec.style.transform = d.scale ? 'scale(' + (1 - p * .06).toFixed(4) + ') translate3d(0,' + (p * -16).toFixed(1) + 'px,0)' : '';
        if (d.shade) d.shade.style.opacity = (p * .78).toFixed(3);
      });
    });
  })();

  // ===================== PROJETOS: scroll vertical vira movimento lateral =====================
  var Lightbox;
  (function(){
    var hs = $('[data-hs]'), track = $('[data-hs-track]'); if (!hs || !track) return;
    var pin = $('.hs-pin', hs), cards = $$('.pcard', track), bar = $('[data-hs-bar]'), cur = $('[data-hs-cur]'), floor = $('[data-floor]');
    var dist = 0, span = 0, stick = 0, top0 = 0, pos = [], lastCur = -1, lastP = -1;
    if (reduced){ hs.classList.add('hs-static'); }
    onPre(function(){ stick = parseFloat(getComputedStyle(pin).top) || 0; });
    onMeasure(function(y){
      if (reduced) return;
      track.style.transform = '';
      dist = Math.max(0, track.scrollWidth - VW);
      span = dist / 1.5; // 1px rolado = 1,5px de vitrine: menos rolagem, mesma viagem
      hs.style.height = (pin.offsetHeight + span) + 'px';
      top0 = hs.getBoundingClientRect().top + y;
      pos = cards.map(function(c){ return { l: c.offsetLeft, w: c.offsetWidth }; });
      lastP = -1;
    });
    if (!reduced) onScroll(function(y){
      var rt = top0 - y; if (rt > VH + 50 || rt + span + VH < -50) return;
      var p = span ? clamp((stick - rt) / span, 0, 1) : 0; if (p === lastP) return; lastP = p;
      var x = -p * dist, mid = VW / 2, best = 0, bd = 1e9;
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      if (bar) bar.style.setProperty('--p', p.toFixed(4));
      if (floor) floor.style.setProperty('--gx', (x * .35).toFixed(1) + 'px');
      for (var i = 0; i < cards.length; i++){
        var c = pos[i]; if (!c) continue;
        var d = (c.l + c.w / 2 + x - mid) / VW, ad = Math.min(Math.abs(d), 1.2);
        cards[i].style.setProperty('--ry', (-d * 18).toFixed(2) + 'deg');
        cards[i].style.setProperty('--s', (1 - ad * .1).toFixed(4));
        cards[i].style.setProperty('--dim', (ad * .6).toFixed(3));
        if (Math.abs(d) < bd && i < LPS.length){ bd = Math.abs(d); best = i; }
      }
      if (cur && best !== lastCur){ lastCur = best; cur.textContent = '0' + (best + 1); }
    });
    track.addEventListener('click', function(e){
      var b = e.target.closest('[data-lp]'); if (!b) return;
      Lightbox.open(LPS, +b.getAttribute('data-lp'), 'Landing page');
    });
  })();

  // ===================== SERVIÇOS: empilhamento + ilustração que cabe na moldura =====================
  (function(){
    var stack = $('[data-stack]'), cards = $$('.stack .scard'); if (!stack || !cards.length) return;
    var G = [], stickTops = [], bottom = 0;
    onPre(function(){ stickTops = cards.map(function(c){ return parseFloat(getComputedStyle(c).top) || 0; }); });
    onMeasure(function(y){
      var mobile = VW <= 960;
      cards.forEach(function(c, i){
        c.style.minHeight = ''; c.style.transform = '';
        var art = $('.scard-art', c);
        if (mobile){
          var bh = $('.scard-body', c).offsetHeight;
          art.style.setProperty('--art-h', clamp(Math.round(VH - stickTops[i] - 20 - bh), 150, 240) + 'px');
        } else art.style.removeProperty('--art-h');
      });
      var h = 0; cards.forEach(function(c){ h = Math.max(h, c.offsetHeight); });
      if (!mobile) cards.forEach(function(c){ c.style.minHeight = h + 'px'; });
      // ilustração: escala e centraliza pelo retângulo que envolve todas as peças.
      // usa só medidas de layout (offset*), que não mudam com transform/transição
      cards.forEach(function(c){
        var art = $('.scard-art', c), mock = $('.mock', art); if (!mock) return;
        var cs = getComputedStyle(art);
        var iw = art.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ih = art.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        var mw = mock.offsetWidth, mh = mock.offsetHeight, L = 0, T = 0, R = mw, B = mh;
        Array.prototype.forEach.call(mock.children, function(k){ L = Math.min(L, k.offsetLeft); T = Math.min(T, k.offsetTop); R = Math.max(R, k.offsetLeft + k.offsetWidth); B = Math.max(B, k.offsetTop + k.offsetHeight); });
        var s = Math.min(1, iw * .86 / (R - L), ih * .84 / (B - T)), ux = (L + R) / 2, uy = (T + B) / 2;
        mock.style.setProperty('--fit', s.toFixed(3));
        mock.style.setProperty('--fx', (-s * (ux - mw / 2)).toFixed(1) + 'px');
        mock.style.setProperty('--fy', (-s * (uy - mh / 2)).toFixed(1) + 'px');
      });
      G = cards.map(function(c, i){ return { top: c.getBoundingClientRect().top + y, h: c.offsetHeight, st: stickTops[i], last: '' }; });
      var sr = stack.getBoundingClientRect();
      bottom = sr.bottom + y - parseFloat(getComputedStyle(stack).paddingBottom);
    });
    if (reduced) return;
    var vis = function(g, y){ return Math.min(Math.max(g.top - y, g.st), bottom - y - g.h); };
    onScroll(function(y){
      if (!G.length || bottom - y < -VH || G[0].top - y > VH) return;
      for (var i = 0; i < G.length - 1; i++){
        var g = G[i], vt = vis(g, y), nt = vis(G[i + 1], y);
        var p = clamp((vt + g.h - nt) / g.h, 0, 1), key = p.toFixed(3);
        if (key === g.last) continue; g.last = key;
        cards[i].style.transform = p > 0 ? 'scale(' + (1 - p * .08).toFixed(4) + ')' : '';
        cards[i].style.setProperty('--dim', (p * .62).toFixed(3));
        cards[i].classList.toggle('covered', p > .3); // escondido atrás do próximo: a borda para de girar
      }
    });
  })();

  // ===================== RÉGUA: feixe de LED atravessa de ponta a ponta =====================
  // A animação é toda em CSS (.seam-beam, @keyframes seamSweep); aqui só cria o feixe e
  // pausa quando a régua sai da tela.
  (function(){
    var seams = $$('.seam'); if (!seams.length || reduced) return;
    seams.forEach(function(sm){
      var b = document.createElement('i'); b.className = 'seam-beam'; sm.appendChild(b);
      if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ b.classList.toggle('on', en[0].isIntersecting); }).observe(sm);
      else b.classList.add('on');
    });
  })();

  // ===================== FRASE: palavras acendem com o scroll =====================
  (function(){
    var el = $('[data-state]'); if (!el) return;
    var sec = el.closest('section'), orb = $('[data-orb]');
    Array.prototype.slice.call(el.childNodes).forEach(function(ch){
      if (ch.nodeType === 3){
        var frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(function(p){
          if (!p) return;
          if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement('span'); s.className = 'sw'; s.textContent = p; frag.appendChild(s);
        });
        el.replaceChild(frag, ch);
      } else if (ch.nodeType === 1){ ch.classList.add('sw'); if (ch.hasAttribute('data-hl')) ch.classList.add('hl'); }
    });
    var words = $$('.sw', el), last = -1, Tc = 0, T = 0, st = 0;
    if (reduced){ words.forEach(function(w){ w.classList.add('on'); }); return; }
    onMeasure(function(y){
      var r = el.getBoundingClientRect(); Tc = r.top + y + r.height / 2;
      T = sec.getBoundingClientRect().top + y; st = Math.min(0, VH - sec.offsetHeight);
    });
    onScroll(function(y){
      var c = Tc - y + Math.max(0, y - (T - st)); // centro do texto na tela (a seção gruda)
      if (c < -VH || c > VH * 2) return;
      // acende enquanto o texto sobe de 95% até 58% da tela: termina bem antes da próxima seção chegar
      var p = clamp((VH * .95 - c) / (VH * .37), 0, 1), lit = Math.round(p * words.length);
      if (lit !== last){ last = lit; words.forEach(function(w, i){ w.classList.toggle('on', i < lit); }); }
      if (orb) orb.style.setProperty('--os', (.75 + p * .4).toFixed(3));
    });
  })();

  // ===================== COMO FUNCIONA: trilho acende no scroll =====================
  (function(){
    var wrap = $('[data-steps]'), fill = $('[data-steps-fill]'); if (!wrap || !fill) return;
    var steps = $$('.step', wrap), W = { top: 0, h: 0 }, nodes = [], lastKey = '';
    if (reduced){ fill.style.setProperty('--p', 1); steps.forEach(function(s){ s.classList.add('lit'); }); return; }
    onMeasure(function(y){
      var r = wrap.getBoundingClientRect(); W = { top: r.top + y, h: r.height };
      nodes = steps.map(function(s){ var n = $('.node', s).getBoundingClientRect(); return n.top + y + n.height / 2; });
      lastKey = '';
    });
    onScroll(function(y){
      var t = W.top - y; if (t + W.h < 0 || t > VH) return;
      var vertical = VW <= 1100, p, lit;
      if (vertical){ p = clamp((VH * .66 - t) / W.h, 0, 1); lit = nodes.map(function(n){ return n - y <= VH * .66; }); }
      else { p = clamp((VH * .9 - t) / (VH * .55), 0, 1); lit = steps.map(function(_, i){ return p >= i / (steps.length - 1) - .001; }); }
      var key = p.toFixed(3) + lit.join(); if (key === lastKey) return; lastKey = key;
      fill.style.setProperty('--p', p.toFixed(4));
      steps.forEach(function(s, i){ s.classList.toggle('lit', lit[i]); });
    });
  })();

  // ===================== WHATSAPP FLUTUANTE =====================
  (function(){
    var fab = $('[data-fab]'), fin = $('.final'); if (!fab) return;
    var shown = false, F = 1e9;
    onMeasure(function(y){ F = fin ? fin.getBoundingClientRect().top + y : 1e9; });
    onScroll(function(y){
      var s = y > VH * .85 && F - y > VH * .55 && !menuOpen;
      if (s !== shown){ shown = s; fab.classList.toggle('show', s); }
    });
  })();

  // ===================== HERO: frase que troca, contadores, luz e cartões que seguem o mouse =====================
  (function(){
    var sw = $('[data-swap]');
    if (sw && !reduced){
      var items = $$('span', sw), i = 0;
      setInterval(function(){ items[i].classList.remove('on'); i = (i + 1) % items.length; items[i].classList.add('on'); }, 2400);
    }
    var nums = $$('[data-count]');
    if (!reduced && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){ en.forEach(function(e){
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var b = e.target, to = +b.getAttribute('data-count'), t0 = null;
        // trava a largura do número final enquanto conta: o "+", "h" e "%" ao lado não andam (CLS)
        b.style.display = 'inline-block'; b.style.minWidth = b.getBoundingClientRect().width + 'px';
        b.textContent = '0';
        (function tick(ts){ if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1500); k = 1 - Math.pow(1 - k, 4); b.textContent = Math.round(to * k); if (k < 1) requestAnimationFrame(tick); else { b.style.display = ''; b.style.minWidth = ''; } })(performance.now());
      }); }, { threshold: .6 });
      nums.forEach(function(b){ io.observe(b); });
    }
    var hero = $('.hero'), glow = $('[data-glow]'), fl = $$('[data-floaters] .fcard');
    if (fine && !reduced && hero){
      var raf = null, ex = 0, ey = 0;
      hero.addEventListener('pointermove', function(e){
        ex = e.clientX; ey = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(function(){
          raf = null;
          if (glow){ glow.style.setProperty('--gx', ex + 'px'); glow.style.setProperty('--gy', ey + 'px'); }
          var dx = ex / VW - .5, dy = ey / VH - .5;
          fl.forEach(function(c){ var f = +c.getAttribute('data-f') || 1; c.style.setProperty('--px', (dx * 36 * f).toFixed(1) + 'px'); c.style.setProperty('--py', (dy * 26 * f).toFixed(1) + 'px'); });
        });
      }, { passive: true });
    }
  })();

  // ===================== SERVIÇOS: terreno em linhas (desenhado uma vez, tamanho limitado) =====================
  (function(){
    var cv = $('[data-terrain]'); if (!cv) return;
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var drawnW = 0;
    function draw(){
      var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h || w === drawnW) return; drawnW = w;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var rows = w < 700 ? 22 : 34, cols = w < 700 ? 56 : 100, P = [], r, c;
      for (r = 0; r <= rows; r++){
        var z = r / rows, zf = Math.pow(z, 1.55), row = [], yb = h * .06 + h * .98 * zf, amp = 8 + (w < 700 ? 30 : 64) * zf, spread = .55 + 1.25 * zf;
        for (c = 0; c <= cols; c++){
          var xn = c / cols * 2 - 1, wx = xn * 3.2, wz = z * 6;
          var ht = (Math.sin(wx * 1.3 + wz * .8) * .5 + Math.sin(wx * 2.7 - wz * 1.4 + 1.3) * .28 + Math.sin(wx * .6 + wz * 2.1 + 2.1) * .35) * (.55 + .45 * Math.cos(xn * 1.4));
          row.push([w / 2 + xn * w * .5 * spread, yb - amp * ht]);
        }
        P.push(row);
      }
      for (r = 0; r <= rows; r++){
        var zz = r / rows, g = ctx.createLinearGradient(0, 0, w, 0), al = .04 + .3 * Math.pow(zz, 1.2);
        g.addColorStop(0, 'rgba(98,230,255,0)'); g.addColorStop(.25, 'rgba(98,160,255,' + al + ')'); g.addColorStop(.5, 'rgba(142,150,255,' + (al * 1.15) + ')'); g.addColorStop(.75, 'rgba(98,160,255,' + al + ')'); g.addColorStop(1, 'rgba(98,230,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = .6 + zz * .9; ctx.beginPath();
        P[r].forEach(function(pt, i){ i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }); ctx.stroke();
      }
    }
    onMeasure(draw);
  })();

  // ===================== TUDO INCLUSO: globo de pontos girando (canvas) =====================
  // só roda com a seção na tela, a 30 quadros/s; pontos pré-calculados e sem criar texto por ponto
  (function(){
    var cv = $('[data-globe]'); if (!cv) return;
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var small = window.innerWidth <= 760, N = small ? 460 : 900, P = new Float32Array(N * 3), ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++){ var yy = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = ga * i; P[i * 3] = Math.cos(th) * rr; P[i * 3 + 1] = yy; P[i * 3 + 2] = Math.sin(th) * rr; }
    var W = 0, grad = null, rot = .8, px = 0, tpx = 0, visible = false, last = 0, running = false;
    function size(){
      var w = cv.clientWidth; if (!w || w === W) return; W = w;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5); cv.width = cv.height = Math.round(w * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var R = W * .42; grad = ctx.createRadialGradient(W / 2, W / 2, R * .2, W / 2, W / 2, R * 1.25); grad.addColorStop(0, 'rgba(45,99,255,.14)'); grad.addColorStop(1, 'rgba(45,99,255,0)');
    }
    function draw(){
      if (!W) return;
      var R = W * .42, cx = W / 2, cy = W / 2, tilt = .38 + px * .15, ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, W); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, W);
      for (var pass = 0; pass < 2; pass++){
        ctx.fillStyle = pass ? '#a0ecff' : '#6f93ff';
        for (var i = 0; i < N; i++){
          var x0 = P[i * 3], y0 = P[i * 3 + 1], z0 = P[i * 3 + 2], x = x0 * cr - z0 * sr, z = x0 * sr + z0 * cr, y = y0 * ct - z * st; z = y0 * st + z * ct;
          var f = (z + 1) / 2; if ((f > .72) !== !!pass) continue;
          var sz = .6 + f * 1.5; ctx.globalAlpha = .05 + f * f * .72;
          ctx.fillRect(cx + x * R - sz / 2, cy + y * R - sz / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    }
    onMeasure(function(){ size(); draw(); });
    if (reduced) return;
    if (fine) window.addEventListener('pointermove', function(e){ tpx = e.clientX / VW - .5; }, { passive: true });
    // gira sozinho em velocidade constante (uma volta a cada ~28s); o mouse só inclina um pouco
    function loop(now){
      if (!visible){ running = false; return; }
      requestAnimationFrame(loop);
      if (now - last < 33) return;
      var dt = last ? Math.min(now - last, 100) : 33; last = now;
      px += (tpx - px) * .05; rot += dt * .000225; draw();
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ visible = en[0].isIntersecting; if (visible && !running){ running = true; requestAnimationFrame(loop); } }, { rootMargin: '10% 0px' }).observe(cv.parentNode);
  })();

  // ===================== BUSCA DIGITANDO SOZINHA =====================
  (function(){
    var el = $('[data-serp]'); if (!el) return;
    if (reduced){ el.textContent = SERP[0]; return; }
    var ti = 0, ci = SERP[0].length, del = true, timer = null, running = false;
    function tick(){
      var t = SERP[ti];
      if (!del){ ci++; el.textContent = t.slice(0, ci); if (ci === t.length){ del = true; timer = setTimeout(tick, 2200); return; } timer = setTimeout(tick, 55 + Math.random() * 60); }
      else { ci--; el.textContent = t.slice(0, ci); if (ci <= 0){ del = false; ti = (ti + 1) % SERP.length; timer = setTimeout(tick, 380); return; } timer = setTimeout(tick, 26); }
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting && !running){ running = true; timer = setTimeout(tick, 1600); } else if (!e.isIntersecting){ running = false; clearTimeout(timer); } }); }, { threshold: .2 }).observe(el.closest('.serp'));
  })();

  // ===================== HOVER: holofote nos cards + botões magnéticos (só mouse) =====================
  if (fine && !reduced){
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.spot'); if (!c) return;
      var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
    $$('.btn-primary, .btn-glass').forEach(function(b){
      if (b.closest('.menu')) return;
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.setProperty('--bx', clamp(dx * .14, -7, 7).toFixed(1) + 'px'); b.style.setProperty('--by', clamp(dy * .22, -5, 5).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function(){ b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }

  // ===================== ANIMAÇÕES CONTÍNUAS PAUSAM FORA DA TELA =====================
  if ('IntersectionObserver' in window){
    var ioOff = new IntersectionObserver(function(en){ en.forEach(function(e){ if (!e.target.hasAttribute('data-covered')) e.target.classList.toggle('is-off', !e.isIntersecting); }); }, { rootMargin: '15% 0px' });
    $$('main > section').forEach(function(s){ ioOff.observe(s); });
  }

  // ===================== LIGHTBOX =====================
  Lightbox = (function(){
    var lb = $('[data-lb]'); if (!lb) return { open: function(){} };
    var img = $('[data-lb-img]', lb), cnt = $('[data-lb-cnt]', lb), list = [], cur = 0, alt = '', tx = 0;
    function render(){ img.src = list[cur]; img.alt = alt + ' ' + (cur + 1); cnt.textContent = (cur + 1) + ' / ' + list.length; }
    function open(images, i, a){ list = images; alt = a; cur = (i + list.length) % list.length; render(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
    function nav(d){ cur = (cur + d + list.length) % list.length; render(); }
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function(){ nav(-1); });
    $('[data-lb-next]', lb).addEventListener('click', function(){ nav(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){ if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') nav(-1); if (e.key === 'ArrowRight') nav(1); });
    lb.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){ var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) nav(d < 0 ? 1 : -1); }, { passive: true });
    return { open: open };
  })();

  // ===================== DÚVIDAS: abre/fecha suave =====================
  (function(){
    var items = $$('[data-faq] details'); if (!items.length) return;
    var DUR = reduced ? 1 : 340, EASE = 'cubic-bezier(.2,.8,.2,1)';
    function open(d, body){ if (d.anim) d.anim.cancel(); d.open = true; var h = body.getBoundingClientRect().height; body.style.overflow = 'hidden';
      d.anim = body.animate([{ height: '0px', opacity: .3 }, { height: h + 'px', opacity: 1 }], { duration: DUR, easing: EASE }); d.anim.onfinish = function(){ body.style.overflow = ''; d.anim = null; }; }
    function close(d, body){ if (d.anim) d.anim.cancel(); var h = body.getBoundingClientRect().height; body.style.overflow = 'hidden';
      d.anim = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: .3 }], { duration: DUR, easing: EASE }); d.anim.onfinish = function(){ d.open = false; body.style.overflow = ''; d.anim = null; }; }
    items.forEach(function(d){
      var sum = $('summary', d), body = $('.a', d);
      sum.addEventListener('click', function(e){ e.preventDefault(); if (d.open){ close(d, body); return; } items.forEach(function(o){ if (o !== d && o.open) close(o, $('.a', o)); }); open(d, body); });
    });
  })();

  // ===================== DIAGNÓSTICO: quiz gamificado com o Dex =====================
  (function(){
    var box = $('[data-quiz]'); if (!box) return;
    var dex = $('[data-dex]'), wrap = $('[data-dex-wrap]'), bubble = $('[data-bubble]');

    // ----- Dex: humor = rosto + pose dos braços -----
    var POSE = { idle: ['down', 'down'], hello: ['down', 'wave'], curious: ['down', 'down'], thinking: ['down', 'chin'], analyzing: ['tab', 'tab'], happy: ['down', 'thumb'],
      ok: ['down', 'glasses'], worried: ['chest', 'chest'], facepalm: ['face', 'down'], shock: ['up', 'up'], proud: ['down', 'glasses'], party: ['up', 'up'] };
    var moodT = null, curMood = 'idle', busy = false;
    function gleam(){ if (!dex || reduced) return; dex.classList.remove('gleam'); void dex.getBoundingClientRect(); dex.classList.add('gleam'); setTimeout(function(){ dex.classList.remove('gleam'); }, 700); }
    function setMood(m){
      if (!dex) return;
      curMood = m; var p = POSE[m] || POSE.idle;
      dex.setAttribute('data-mood', m); dex.setAttribute('data-l', p[0]); dex.setAttribute('data-r', p[1]);
      if (wrap && !reduced){ wrap.classList.remove('hop', 'shake'); if (m === 'party' || m === 'shock'){ void wrap.offsetWidth; wrap.classList.add(m === 'party' ? 'hop' : 'shake'); } }
      if (m === 'proud' || m === 'ok' || m === 'party') setTimeout(gleam, 250);
    }
    function mood(m, back, ms){ clearTimeout(moodT); setMood(m); if (back) moodT = setTimeout(function(){ setMood(back); }, ms || 1500); }
    if (wrap) wrap.addEventListener('animationend', function(e){ if (e.animationName === 'hop' || e.animationName === 'shake') wrap.classList.remove('hop', 'shake'); });
    // piscar e brilho dos óculos de vez em quando
    if (dex && !reduced){
      (function blink(){ setTimeout(function(){ dex.classList.add('blink'); setTimeout(function(){ dex.classList.remove('blink'); blink(); }, 130); }, 2400 + Math.random() * 3000); })();
      setInterval(function(){ if (Math.random() < .5) gleam(); }, 6500);
      if (fine){
        window.addEventListener('pointermove', function(e){
          var r = dex.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
          var cx = r.left + r.width / 2, cy = r.top + r.height * .46, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 260);
          dex.style.setProperty('--ex', (dx / d * 4 * m).toFixed(2) + 'px'); dex.style.setProperty('--ey', (dy / d * 4 * m).toFixed(2) + 'px');
        }, { passive: true });
      } else setInterval(function(){ dex.style.setProperty('--ex', (Math.random() * 6 - 3).toFixed(1) + 'px'); dex.style.setProperty('--ey', (Math.random() * 4 - 1).toFixed(1) + 'px'); }, 2600);
    }
    // ----- balão: digita a fala enquanto o Dex "fala" (leitor de tela recebe o texto inteiro de uma vez) -----
    var srLine = document.createElement('span'), typed = document.createElement('span'), typeT = null;
    srLine.className = 'sr'; typed.setAttribute('aria-hidden', 'true');
    if (bubble){ var first = bubble.innerHTML; bubble.innerHTML = ''; bubble.appendChild(srLine); bubble.appendChild(typed); typed.innerHTML = first; srLine.textContent = typed.textContent; }
    function cut(toks, n){ var out = '', open = false; for (var i = 0; i < toks.length && n > 0; i++){ var t = toks[i]; if (t === '<b>'){ out += t; open = true; continue; } if (t === '</b>'){ if (open){ out += t; open = false; } continue; } var s = t.slice(0, n); out += s; n -= s.length; } return out + (open ? '</b>' : ''); }
    function say(html){
      if (!bubble) return;
      clearTimeout(typeT); srLine.textContent = html.replace(/<[^>]+>/g, '');
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      if (reduced){ typed.innerHTML = html; return; }
      var toks = html.split(/(<b>|<\/b>)/).filter(Boolean), total = html.replace(/<[^>]+>/g, '').length, n = 0;
      dex.classList.add('talking');
      (function step(){ n = Math.min(total, n + 2); typed.innerHTML = cut(toks, n); if (n < total) typeT = setTimeout(step, 22); else dex.classList.remove('talking'); })();
    }

    // ----- perguntas -----
    var QUIZ = [
      { q: 'Qual é o seu tipo de negócio?', sub: 'Para personalizar a sua análise.', icon: 'i-tag', max: 0, opts: [
        { t: 'Negócio local (loja, clínica, restaurante, salão...)', seg: 'local' }, { t: 'Prestador de serviço ou profissional liberal', seg: 'servico' }, { t: 'Loja online ou venda de produto', seg: 'loja' }, { t: 'Infoproduto, curso ou mentoria', seg: 'info' } ] },
      { q: 'Quando alguém quer conhecer seu negócio, onde chega hoje?', sub: 'O destino de quem te procura.', icon: 'i-layout', max: 30, opts: [
        { t: 'No meu Instagram ou direto no WhatsApp', s: 0 }, { t: 'Num link na bio genérico (tipo Linktree)', s: 8 }, { t: 'Num site antigo, que não traz cliente', s: 15 }, { t: 'Numa página profissional que converte', s: 30 } ] },
      { q: 'Se alguém pesquisar o seu serviço no Google agora, o que aparece?', sub: 'Seja sincero: é isso que o cliente vê.', icon: 'i-search', max: 30, opts: [
        { t: 'Nada meu. Só concorrente', s: 0 }, { t: 'Só o meu Instagram', s: 8 }, { t: 'Meu site, mas lá embaixo', s: 18 }, { t: 'Meu site entre os primeiros', s: 30 } ] },
      { q: 'Seu negócio aparece no Google Maps?', sub: 'O bloco com mapa, estrelas e horário (Google Meu Negócio).', icon: 'i-pin', max: 20, opts: [
        { t: 'Não aparece', s: 0 }, { t: 'Aparece, mas o perfil está incompleto', s: 10 }, { t: 'Sim, completo e com avaliações', s: 20 } ] },
      { q: 'De onde vem a maior parte dos seus clientes?', sub: 'A sua principal fonte de clientes hoje.', icon: 'i-mega', max: 20, opts: [
        { t: 'Indicação e boca a boca', s: 0 }, { t: 'Redes sociais, no orgânico', s: 6 }, { t: 'Impulsiono posts de vez em quando', s: 10 }, { t: 'Campanhas de anúncio estruturadas', s: 20 } ] }
    ];
    var SEG = {
      local:   { n: 'negócio local', rec: 'Site institucional + Google Meu Negócio', want: 'Site institucional', hi: 'Negócio local? O <b>Google Maps</b> vai ser seu melhor amigo.', why: 'Negócio local vive da busca “perto de mim”. Site com SEO local e perfil no Google Maps colocam você na frente de quem está perto e pronto para comprar.' },
      servico: { n: 'prestador de serviço', rec: 'Landing page + Google Meu Negócio', want: 'Landing page', hi: 'Serviço se vende por <b>confiança</b>. Anotado!', why: 'Quem contrata serviço pesquisa, compara e chama quem parece mais profissional. Landing page com prova e WhatsApp em um toque fecha esse ciclo.' },
      loja:    { n: 'loja ou produto', rec: 'Landing page de oferta + Tráfego pago', want: 'Landing page', hi: 'Produto bom precisa de <b>vitrine boa</b>. Bora!', why: 'Produto vende com página de oferta clara e anúncio bem direcionado. A landing page recebe o clique e o tráfego pago traz volume.' },
      info:    { n: 'infoproduto ou mentoria', rec: 'Landing page de conversão + Tráfego pago', want: 'Landing page', hi: 'Infoproduto vive de <b>página que convence</b>. Guardei!', why: 'Infoproduto depende de uma página que convence em segundos: copy forte, prova social e o botão certo, com campanhas levando o público até ela.' }
    };
    var LINES = {
      bad: ['Eita... aqui está <b>escapando cliente.</b>', 'Hmm, isso <b>pesa no resultado.</b>', 'Ai. Esse é um <b>ponto crítico.</b>'],
      mid: ['Está no caminho, <b>dá para melhorar!</b>', 'Meio caminho andado.', 'Bom começo. <b>Tem espaço para crescer.</b>'],
      top: ['Aí sim! <b>Mandou bem.</b>', 'Isso! <b>Ponto para você.</b>', 'Excelente, <b>o Google gosta disso.</b>']
    };
    var step = 0, ans = [], dir = 'fwd', R = null, badCount = 0;
    function xpNow(){ var s = 0; for (var i = 1; i < QUIZ.length; i++) if (ans[i] != null) s += QUIZ[i].opts[ans[i]].s; return s; }
    function setXP(v){ $$('[data-xp]').forEach(function(e){ e.textContent = v; }); $$('[data-xp-bar]').forEach(function(b){ b.style.setProperty('--p', (v / 100).toFixed(3)); }); }
    function stepsBar(all){
      var h = '<div class="q-steps" aria-hidden="true">';
      QUIZ.forEach(function(q, i){
        var st = all || i < step ? 'done' : i === step ? 'cur' : '';
        if (i) h += '<span class="ln' + (all || i <= step ? ' done' : '') + '"><i></i></span>';
        h += '<span class="s ' + st + '">' + ic(st === 'done' ? 'i-check' : q.icon) + '</span>';
      });
      return h + '</div>';
    }
    function xpInline(){ return '<div class="xp xp-inline"><span class="mono">XP</span><span class="bar"><i data-xp-bar style="--p:' + (xpNow() / 100) + '"></i></span><b><span data-xp>' + xpNow() + '</span><small>/100</small></b></div>'; }
    function renderQ(){
      busy = false;
      var q = QUIZ[step];
      box.innerHTML = xpInline() + stepsBar(false) + '<div class="q-step' + (dir === 'back' ? ' back' : '') + '">' +
        '<span class="q-k mono">Pergunta 0' + (step + 1) + ' de 05</span><h3 class="q-title">' + esc(q.q) + '</h3><p class="q-sub">' + esc(q.sub) + '</p>' +
        '<div class="q-opts" role="group" aria-label="Opções">' + q.opts.map(function(o, i){ return '<button type="button" class="q-opt' + (ans[step] === i ? ' sel' : '') + '" data-opt="' + i + '"><span class="k">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.t) + '</span></button>'; }).join('') + '</div>' +
        '<div class="q-nav">' + (step > 0 ? '<button type="button" class="q-back" data-qback>← Voltar</button>' : '<span></span>') + '<span class="q-hint">Toque numa opção ou use <kbd>A</kbd>–<kbd>' + String.fromCharCode(64 + q.opts.length) + '</kbd></span></div></div>';
      setXP(xpNow());
      var opts = $('.q-opts', box);
      $$('[data-opt]', box).forEach(function(b){ b.addEventListener('click', function(){ pick(+b.getAttribute('data-opt'), b); }); });
      if (fine){
        opts.addEventListener('mouseenter', function(){ if (!busy && step > 0) mood('thinking'); });
        opts.addEventListener('mouseleave', function(){ if (!busy && curMood === 'thinking') mood('analyzing'); });
      }
      var bk = $('[data-qback]', box); if (bk) bk.addEventListener('click', function(){ if (busy) return; dir = 'back'; step--; renderQ(); mood('curious', 'analyzing', 1200); say('Voltando: <b>pode mudar a resposta.</b>'); });
    }
    function pop(target, txt, zero){
      var br = box.getBoundingClientRect(), r = target.getBoundingClientRect();
      var p = document.createElement('span'); p.className = 'xp-pop' + (zero ? ' zero' : ''); p.textContent = txt;
      p.style.left = (r.right - br.left - 96) + 'px'; p.style.top = (r.top - br.top + 8) + 'px';
      box.appendChild(p); setTimeout(function(){ p.remove(); }, 1150);
    }
    function pick(i, b){
      if (busy) return; busy = true;
      $$('[data-opt]', box).forEach(function(x){ x.classList.toggle('sel', x === b); });
      ans[step] = i;
      var q = QUIZ[step], o = q.opts[i];
      if (step === 0){ say(SEG[o.seg].hi); mood('happy', 'analyzing', 1300); pop(b, 'Perfil ✓', false); }
      else {
        var ratio = o.s / q.max, bucket = ratio === 0 ? 'bad' : ratio >= 1 ? 'top' : 'mid';
        say(LINES[bucket][Math.floor(Math.random() * 3)]);
        if (bucket === 'bad') mood((badCount++ % 2) ? 'worried' : 'facepalm', 'analyzing', 1500);
        else mood(bucket === 'top' ? 'happy' : 'ok', 'analyzing', 1300);
        pop(b, '+' + o.s + ' XP', o.s === 0); setXP(xpNow());
      }
      setTimeout(function(){ dir = 'fwd'; step++; step < QUIZ.length ? renderQ() : renderResult(); }, 780);
    }
    function compute(){
      var seg = SEG[QUIZ[0].opts[ans[0]].seg];
      var p = QUIZ[1].opts[ans[1]].s, gq = QUIZ[2].opts[ans[2]].s, gm = QUIZ[3].opts[ans[3]].s, t = QUIZ[4].opts[ans[4]].s;
      var score = p + gq + gm + t, gaps = [];
      if (p < 30) gaps.push({ k: p, t: p === 0 ? (seg.want === 'Site institucional' ? 'Site profissional' : 'Landing page profissional') : p === 8 ? 'Página própria no lugar do link genérico' : 'Reestruturar o site atual',
        d: p === 0 ? 'Hoje o clique morre no Instagram. Uma página com a sua marca recebe quem procura e leva direto para o WhatsApp.' : p === 8 ? 'Trocar o link igual ao de todo mundo por uma página sua, com prova e direcionamento para a venda.' : 'Copy de venda, SEO, velocidade e WhatsApp em um toque. O site que você tem vira o site que traz cliente.' });
      if (gq < 30) gaps.push({ k: gq + 1, t: 'SEO + GEO', d: gq <= 8 ? 'Estruturar a página para aparecer na busca e nas respostas de IA quando pesquisam o que você vende.' : 'Subir posições com conteúdo, estrutura técnica e sinais locais.' });
      if (gm < 20) gaps.push({ k: gm + 2, t: 'Google Meu Negócio', d: gm === 0 ? 'Criar o perfil para aparecer no Google Maps e no bloco local, com avaliações e botão de contato.' : 'Completar o perfil: categorias, fotos, descrição com palavras-chave e conexão com o site.' });
      if (t < 20) gaps.push({ k: t + 40, t: 'Tráfego pago (com a página no ar)', d: 'Campanhas no Meta e no Google Ads levando o público certo até a página, com verba controlada.' });
      if (!gaps.length) gaps.push({ k: 0, t: 'Escala', d: 'Base sólida. Próximo passo: mais páginas por serviço, mais tráfego e testes contínuos.' });
      gaps.sort(function(a, b){ return a.k - b.k; });
      var tier = score < 35 ? 'low' : score < 70 ? 'mid' : 'high';
      var T = {
        low: { title: 'Invisível no Google', badge: 'Modo invisível', medal: 'i-ghost', txt: 'Seu negócio existe, mas quem pesquisa não encontra. Cada busca hoje termina no concorrente. A boa notícia: isso se resolve com uma página e um perfil bem feitos.', dex: 'Alerta vermelho! Hoje quase ninguém te encontra. Mas calma: <b>isso tem solução.</b>', mood: 'shock' },
        mid: { title: 'Presença incompleta', badge: 'Meio caminho', medal: 'i-target', txt: 'Você tem alguma presença, mas o caminho tem furos. Fechar os pontos abaixo é o que mais vai destravar cliente novo.', dex: 'Tem presença, mas com furos. <b>Fechando esses pontos, o cliente chega.</b>', mood: 'proud' },
        high: { title: 'Bem posicionado', badge: 'Radar do Google', medal: 'i-rocket', txt: 'Você já aparece. Agora é converter mais e escalar: página melhor, mais tráfego e mais alcance.', dex: 'Uau! Você está bem posicionado. <b>Agora é escalar!</b>', mood: 'party' }
      }[tier];
      return { seg: seg, score: score, gaps: gaps, tier: tier, T: T };
    }
    function renderResult(){
      busy = false;
      R = compute();
      box.innerHTML = stepsBar(true) + '<div class="q-step q-res tier-' + R.tier + '">' +
        '<div class="gauge"><i class="pulse" aria-hidden="true"></i><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="g-bg" cx="80" cy="80" r="70"/><circle class="g-fg" cx="80" cy="80" r="70" data-gauge/></svg><b><span><span data-score>0</span><i>%</i></span><small>Presença digital</small></b></div>' +
        '<div class="badge"><span class="medal">' + ic(R.T.medal) + '</span><span><small>Conquista desbloqueada</small><b>' + esc(R.T.badge) + '</b></span></div>' +
        '<h3>' + esc(R.T.title) + '</h3><p>' + esc(R.T.txt) + '</p>' +
        '<div class="q-rec"><small class="mono">Indicado para ' + esc(R.seg.n) + '</small><b>' + esc(R.seg.rec) + '</b><p>' + esc(R.seg.why) + '</p></div>' +
        '<div class="q-plan">' + R.gaps.map(function(g, i){ return '<div style="--d:' + (.3 + i * .1) + 's">' + ic('i-check') + '<div><b>' + (i === 0 ? 'Prioridade: ' : '') + esc(g.t) + '</b>' + esc(g.d) + '</div></div>'; }).join('') + '</div>' +
        '<div class="cta-row"><button type="button" class="btn btn-primary" data-qform>' + knob + '<span class="bt">Receber meu plano</span></button><button type="button" class="btn btn-glass" data-qreset>Refazer</button></div>' +
        '<p class="q-foot">Sem compromisso. Você recebe uma proposta pensada para o seu caso.</p></div>';
      setXP(R.score);
      say(R.T.dex); mood(R.T.mood);
      var fg = $('[data-gauge]', box), sc = $('[data-score]', box), res = R;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ fg.style.strokeDashoffset = 439.8 - 439.8 * res.score / 100; }); });
      var t0 = null; (function tick(ts){ if (R !== res) return; if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400); k = 1 - Math.pow(1 - k, 3); sc.textContent = Math.round(res.score * k); if (k < 1) requestAnimationFrame(tick); })(performance.now());
      if (R.tier !== 'low') setTimeout(function(){ confetti(R.tier === 'high' ? 160 : 70); }, 700);
      $('[data-qreset]', box).addEventListener('click', reset);
      $('[data-qform]', box).addEventListener('click', renderForm);
    }
    function reset(){
      step = 0; ans = []; dir = 'back'; R = null; badCount = 0; renderQ(); setXP(0);
      say('Bora de novo! <b>Qual é o seu tipo de negócio?</b>'); mood('hello', 'analyzing', 1600);
      window.scrollTo({ top: Math.max(0, docTop(box) - 110), behavior: reduced ? 'auto' : 'smooth' });
    }
    function field(id, label, input, opt){ return '<div class="f-field" data-f="' + id + '"><label for="f-' + id + '">' + label + (opt ? ' <em>(opcional)</em>' : '') + '</label>' + input + '<span class="msg">Preencha este campo.</span></div>'; }
    function renderForm(){
      say('Quase lá! <b>Para quem eu mando o plano?</b>'); mood('happy', 'analyzing', 1300);
      var wants = ['Landing page', 'Site institucional', 'Página de links na bio', 'Google Meu Negócio', 'Tráfego pago', 'Ainda não sei, quero orientação'];
      box.innerHTML = stepsBar(true) + '<div class="q-step"><span class="q-k mono">Último passo</span><h3 class="q-title">Para onde enviamos o seu plano?</h3><p class="q-sub">Ao enviar, sua mensagem vai pronta, com o diagnóstico, direto para o nosso WhatsApp.</p>' +
        '<div class="f-sum"><span>' + esc(R.T.title) + ' · ' + R.score + '/100</span><span>' + esc(R.seg.rec) + '</span></div>' +
        '<form class="q-form" novalidate data-lead><div class="f-grid">' +
          field('nome', 'Seu nome', '<input id="f-nome" name="nome" type="text" autocomplete="name" placeholder="Como você se chama?" required>') +
          field('zap', 'Seu WhatsApp', '<input id="f-zap" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(47) 99999-9999" required>') +
          field('negocio', 'Nome do negócio', '<input id="f-negocio" name="negocio" type="text" autocomplete="organization" placeholder="Ex.: Clínica Sorriso">') +
          field('cidade', 'Cidade', '<input id="f-cidade" name="cidade" type="text" autocomplete="address-level2" placeholder="Ex.: São Paulo, SP">') +
        '</div>' +
        field('link', 'Instagram ou site atual', '<input id="f-link" name="link" type="text" autocomplete="url" placeholder="@seunegocio ou seusite.com.br">', true) +
        field('quero', 'O que você quer primeiro?', '<select id="f-quero" name="quero">' + wants.map(function(w){ return '<option' + (w === R.seg.want ? ' selected' : '') + '>' + esc(w) + '</option>'; }).join('') + '</select>') +
        '<div class="cta-row" style="margin-top:8px;justify-content:flex-start"><button type="submit" class="btn btn-primary">' + knob + '<span class="bt">Enviar e receber proposta</span></button><button type="button" class="btn btn-glass" data-qback-res>Ver resultado</button></div>' +
        '<p class="f-foot">Seus dados vão só para a Descomplica Site, junto com o diagnóstico. Nada de lista, nada de spam.</p></form></div>';
      $('[data-qback-res]', box).addEventListener('click', renderResult);
      var form = $('[data-lead]', box), zap = $('#f-zap', box);
      zap.addEventListener('input', function(){
        var d = zap.value.replace(/\D/g, '').slice(0, 11);
        zap.value = d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6) : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d;
      });
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var v = function(id){ return ($('#f-' + id, box).value || '').trim(); }, ok = true;
        [['nome', v('nome').length >= 2], ['zap', v('zap').replace(/\D/g, '').length >= 10]].forEach(function(c){ var f = $('[data-f="' + c[0] + '"]', box); f.classList.toggle('err', !c[1]); if (!c[1]) ok = false; });
        if (!ok){ $('.f-field.err input', box).focus(); mood('worried', 'analyzing', 1400); say('Opa, faltou um dado. <b>Confere o campo em vermelho?</b>'); return; }
        var lead = { nome: v('nome'), whatsapp: v('zap'), negocio: v('negocio'), cidade: v('cidade'), link: v('link'), quero: v('quero') };
        var linhas = [
          'Olá, Descomplica Site! Fiz o diagnóstico no site e quero uma proposta.', '',
          'Nome: ' + lead.nome, 'WhatsApp: ' + lead.whatsapp,
          'Negócio: ' + (lead.negocio || '-') + (lead.cidade ? ' (' + lead.cidade + ')' : ''),
          'Instagram/site atual: ' + (lead.link || '-'), 'Quero primeiro: ' + lead.quero, '',
          'Diagnóstico: ' + R.T.title + ' (' + R.score + '/100)',
          '- Tipo de negócio: ' + QUIZ[0].opts[ans[0]].t, '- Onde o cliente chega hoje: ' + QUIZ[1].opts[ans[1]].t,
          '- No Google aparece: ' + QUIZ[2].opts[ans[2]].t, '- Google Maps: ' + QUIZ[3].opts[ans[3]].t, '- Clientes vêm de: ' + QUIZ[4].opts[ans[4]].t,
          'Indicado: ' + R.seg.rec, 'Prioridades: ' + R.gaps.map(function(g){ return g.t; }).join(', ')
        ];
        var url = waLink(linhas.join('\n'));
        if (FORM_ENDPOINT && window.fetch) try {
          fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ _subject: 'Novo lead pelo site: ' + lead.nome + ' (' + R.T.title + ')', _template: 'table', nome: lead.nome, whatsapp: lead.whatsapp, negocio: lead.negocio, cidade: lead.cidade, link: lead.link, quer_primeiro: lead.quero, diagnostico: R.T.title + ' ' + R.score + '/100', indicado: R.seg.rec, prioridades: R.gaps.map(function(g){ return g.t; }).join(', '), respostas: linhas.slice(9, 14).join(' | ') }) }).catch(function(){});
        } catch(_){}
        // sem 'noopener' no terceiro parâmetro (com ele o navegador sempre devolve null); o opener é cortado na mão
        var win = window.open(url, '_blank'); if (win) try { win.opener = null; } catch(_){}
        box.innerHTML = stepsBar(true) + '<div class="q-step q-sent"><div class="ok">' + ic('i-check') + '</div>' +
          '<h3 class="q-title" style="text-align:center">Pronto, ' + esc(lead.nome.split(' ')[0]) + '! Seu plano está a caminho.</h3>' +
          '<p class="q-sub" style="text-align:center">' + (win ? 'O WhatsApp abriu em outra aba com a mensagem pronta. É só tocar em enviar.' : 'Toque no botão abaixo para abrir o WhatsApp com a mensagem pronta.') + '</p>' +
          '<div class="cta-row"><a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener">' + knob + '<span class="bt">' + (win ? 'Abrir o WhatsApp de novo' : 'Abrir o WhatsApp') + '</span></a><button type="button" class="btn btn-glass" data-qreset>Refazer diagnóstico</button></div></div>';
        $('[data-qreset]', box).addEventListener('click', reset);
        say('Prontinho! <b>Já já a gente conversa.</b>'); mood('party'); confetti(140);
      });
    }
    function confetti(n){
      if (reduced) return;
      var cv = document.createElement('canvas'); cv.className = 'confetti'; box.appendChild(cv);
      var w = box.clientWidth, h = box.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = cv.getContext('2d');
      cv.width = w * dpr; cv.height = h * dpr; ctx.scale(dpr, dpr);
      var C = ['#62e6ff', '#2d63ff', '#8e6bff', '#d4ff3d', '#ffffff'], P = [];
      for (var i = 0; i < n; i++) P.push({ x: w / 2 + (Math.random() - .5) * 80, y: h * .3, vx: (Math.random() - .5) * 13, vy: -Math.random() * 11 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: C[i % C.length] });
      var t0 = performance.now();
      (function f(now){
        var t = now - t0; ctx.clearRect(0, 0, w, h);
        P.forEach(function(p){ p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - t / 2600); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
        if (t < 2600) requestAnimationFrame(f); else cv.remove();
      })(t0);
    }
    document.addEventListener('keydown', function(e){
      if ((e.target.closest && e.target.closest('input,select,textarea')) || e.ctrlKey || e.metaKey || e.altKey) return;
      var opts = $$('[data-opt]', box); if (!opts.length) return;
      var r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
      var k = e.key.toLowerCase(), i = 'abcd'.indexOf(k); if (i < 0) i = '1234'.indexOf(k);
      if (i >= 0 && opts[i]){ e.preventDefault(); opts[i].click(); }
    });
    renderQ();
    // primeira vez que o quiz aparece: o Dex acena e apresenta o jogo
    if (dex && 'IntersectionObserver' in window){
      var hi = new IntersectionObserver(function(en){ if (!en[0].isIntersecting) return; hi.disconnect(); mood('hello', 'analyzing', 2200); }, { threshold: .4 });
      hi.observe(dex);
    } else if (dex) setMood('analyzing');
  })();

  measureAll();
})();
