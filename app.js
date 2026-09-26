/* =====================================================================
   DESCOMPLICA SITE — interações
   ===================================================================== */
(function(){
  'use strict';
  var WA = '5547992476541';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/devikisonads@gmail.com'; // backup do lead por e-mail ('' desliga)
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); };
  var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
  var ic = function(id, cls){ return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var waLink = function(msg){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); };
  var resyncScroll = function(){}; // substituída pela rolagem suave (desktop)

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
  var MARQUEE = ['Landing pages', 'Sites institucionais', 'Google Meu Negócio', 'SEO', 'GEO · busca com IA', 'Links na bio', 'Tráfego pago', 'Meta Ads', 'Google Ads', 'Copy de venda'];
  var PILL = ['Negócios locais', 'Clínicas e consultórios', 'Prestadores de serviço', 'Lojas e e-commerces', 'Profissionais liberais'];
  var SERP = ['dentista perto de mim', 'loja de roupas em são paulo', 'advogado trabalhista', 'pizzaria delivery aberta agora', 'clínica de estética', 'contador para mei', 'encanador 24 horas', 'arquiteto residencial'];
  var ARTS = []; for (var g = 1; g <= 14; g++) ARTS.push('gallery/carousel-' + (g < 10 ? '0' + g : g) + '.jpg');
  var LPS = []; for (var l = 1; l <= 7; l++) LPS.push('gallery/lp/lp-0' + l + '.webp');
  var CMP = [
    { k: 'Google', no: 'Não aparece na busca nem no mapa', yes: 'No mapa, na busca e nas respostas de IA', i: 'i-search' },
    { k: 'Primeira impressão', no: 'Link do Instagram, feed bagunçado', yes: 'Página profissional com a sua marca', i: 'i-insta' },
    { k: 'Confiança', no: '“Eles nem têm site...”', yes: 'Endereço próprio, provas e serviços claros', i: 'i-shield' },
    { k: 'Contato', no: 'Cliente procura o número e desiste', yes: 'Um toque e a conversa abre no WhatsApp', i: 'i-chat' },
    { k: 'Anúncio', no: 'Clique caro caindo no perfil', yes: 'Clique caindo numa página que converte', i: 'i-mega' },
    { k: 'Resultado', no: 'Depende de indicação e sorte', yes: 'Cliente novo chegando pelo Google', i: 'i-chart' }
  ];
  var FAQ = [
    ['Landing page ou site: qual eu preciso?', 'Landing page é uma página com um objetivo só, ideal para anúncio, link da bio e ofertas. Site institucional tem várias páginas e é a casa do negócio no Google. Na primeira conversa a gente indica o melhor para o seu momento. Muitos projetos começam pela landing page e crescem para o site.'],
    ['Já tenho Instagram. Preciso mesmo de um site?', 'O Instagram não aparece quando alguém pesquisa “seu serviço + sua cidade” no Google. Site e Google Meu Negócio aparecem. O site não substitui o Instagram: ele recebe quem chega e transforma em contato.'],
    ['Preciso entender de tecnologia?', 'Não. Esse é o ponto da Descomplica. Você fala do seu negócio e a gente cuida de texto, design, domínio, Google e WhatsApp. Você só aprova.'],
    ['Quanto custa e quanto tempo leva?', 'Depende do escopo: uma página de links é diferente de um site com dez páginas. Por isso o primeiro passo é uma conversa grátis. Você recebe uma proposta com valor e prazo fechados, sem surpresa no meio do caminho.'],
    ['O que é SEO e GEO?', 'SEO faz o seu site aparecer no Google. GEO faz o seu negócio ser citado por IAs como ChatGPT, Gemini e o modo IA do Google, que cada vez mais gente usa para escolher onde comprar. Toda página sai pensada para os dois.'],
    ['Vocês fazem o Google Meu Negócio?', 'Sim. A gente cria ou otimiza o perfil (Perfil da Empresa no Google), com categorias, fotos e descrição com palavras-chave, e conecta ao seu site. É o que coloca você no Google Maps.'],
    ['E domínio, hospedagem e manutenção?', 'A gente registra o domínio (ou usa o seu), publica a página e configura o HTTPS. Depois da entrega você tem suporte e pode contratar manutenção para atualizações e novas páginas.'],
    ['Atendem qualquer cidade?', 'Sim. Tudo é online: conversa por WhatsApp ou chamada, prévias por link e entrega em nuvem. Atendemos o Brasil inteiro.']
  ];

  // ===================== RENDER =====================
  (function(){
    var mq = $('[data-marquee]');
    if (mq){ var one = MARQUEE.map(function(t){ return '<span>' + esc(t) + '</span>'; }).join(''); mq.innerHTML = one + one; }
    var vs = $('[data-vs]');
    if (vs){
      var col = function(kind){
        var yes = kind === 'yes';
        return '<div class="vs-col vs-' + kind + (yes ? ' shine' : '') + ' rv" data-rv="' + (yes ? 'right' : 'left') + '">' +
          '<div class="vs-head"><span class="tag ' + (yes ? 'tag-volt' : 'tag-line') + '">' + (yes ? 'Com a Descomplica' : 'Hoje, sem site') + '</span>' +
          '<h3>' + (yes ? 'Negócio encontrado' : 'Negócio invisível') + '</h3><p>' + (yes ? 'Quem procura, acha. E chama.' : 'Depende de quem já te conhece.') + '</p></div>' +
          CMP.map(function(c){ return '<div class="vs-item"><span class="vs-tile">' + ic(c.i) + '<span class="vs-mark">' + ic(yes ? 'i-check' : 'i-x') + '</span></span><div><small>' + esc(c.k) + '</small><b>' + esc(yes ? c.yes : c.no) + '</b></div></div>'; }).join('') +
          (yes ? '<div class="vs-cta"><a class="btn btn-primary btn-block" href="' + waLink('Olá, Descomplica Site! Quero meu negócio do lado de quem é encontrado no Google.') + '" target="_blank" rel="noopener"><span class="knob"><svg aria-hidden="true"><use href="#i-wa"/></svg></span>Quero estar desse lado</a></div>' : '') +
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
    var fq = $('[data-faq]');
    if (fq) fq.innerHTML = FAQ.map(function(f, i){
      return '<details class="card spot rv" style="--d:' + (i * .05) + 's"><span class="rim"></span><summary>' + esc(f[0]) + '<span class="pl" aria-hidden="true"></span></summary><div class="a"><p>' + esc(f[1]) + '</p></div></details>';
    }).join('');
    var at = $('[data-arts-track]');
    if (at){
      var item = function(src, i, dup){ return '<button type="button" class="art" data-art="' + i + '"' + (dup ? ' tabindex="-1" aria-hidden="true"' : ' aria-label="Ampliar criativo ' + (i + 1) + '"') + '><img src="' + src + '" alt="' + (dup ? '' : 'Criativo da Descomplica Site ' + (i + 1)) + '" width="1080" height="1440" loading="lazy"></button>'; };
      at.innerHTML = ARTS.map(function(s, i){ return item(s, i, false); }).join('') + ARTS.map(function(s, i){ return item(s, i, true); }).join('');
    }
    var rp = $('[data-ripple]');
    if (rp){
      var small = window.innerWidth < 700, html = '';
      for (var k = 0; k < 8; k++){
        var sz = (small ? 170 : 230) + k * (small ? 64 : 92);
        html += '<i style="--sz:' + sz + 'px;--op:' + Math.max(.012, .1 - k * .012).toFixed(3) + ';--bo:' + Math.max(.05, .34 - k * .036).toFixed(3) + ';--dl:' + (k * .07).toFixed(2) + 's"></i>';
      }
      rp.innerHTML = html;
    }
  })();

  // ===================== TEXTO: slideUp por palavra (TextAnimate) =====================
  function splitWords(el){
    var n = 0, a = 0;
    (function walk(node, inAur){
      Array.prototype.slice.call(node.childNodes).forEach(function(ch){
        if (ch.nodeType === 3){
          var parts = ch.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--wi', n++);
            if (inAur){ var au = document.createElement('span'); au.className = 'au'; au.style.setProperty('--ai', a++); au.textContent = p; w.appendChild(au); }
            else w.textContent = p;
            frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1){
          walk(ch, inAur || ch.classList.contains('aurora'));
        }
      });
    })(el, false);
    el.classList.add('split');
  }
  $$('[data-split]').forEach(splitWords);

  // ===================== REVELAÇÃO NO SCROLL =====================
  (function(){
    var els = $$('.rv, .split');
    if (reduced || !('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){
      if (e.isIntersecting) e.target.classList.add('in');
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('in'); // saiu por baixo: anima de novo na próxima descida
    }); }, { threshold: 0, rootMargin: '0px 0px -9% 0px' });
    els.forEach(function(e){ io.observe(e); });
    // hero entra na hora
    $$('.hero .rv, .hero .split').forEach(function(e){ requestAnimationFrame(function(){ e.classList.add('in'); }); });
  })();

  // ===================== MOTOR DE SCROLL (um rAF para tudo) =====================
  var subs = [], measures = [], ticking = false, VH = window.innerHeight, VW = window.innerWidth;
  function onScroll(fn){ subs.push(fn); }
  function onMeasure(fn){ measures.push(fn); }
  function frame(){ ticking = false; var y = window.scrollY || document.documentElement.scrollTop; for (var i = 0; i < subs.length; i++) subs[i](y); }
  function request(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }
  function measureAll(){ VH = window.innerHeight; VW = window.innerWidth; for (var i = 0; i < measures.length; i++) measures[i](); frame(); }
  window.addEventListener('scroll', request, { passive: true });
  var rT = null;
  function remeasure(){ clearTimeout(rT); rT = setTimeout(measureAll, 120); }
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('load', measureAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
  if ('ResizeObserver' in window){
    var lastH = 0;
    new ResizeObserver(function(){ var h = document.body.scrollHeight; if (Math.abs(h - lastH) > 2){ lastH = h; remeasure(); } }).observe(document.body);
  }

  // camadas: cada seção acima da anterior (necessário pro efeito de folha/profundidade)
  $$('main > section').forEach(function(s, i){ s.style.zIndex = i + 1; });

  // ===================== BARRA SUPERIOR: some ao descer, volta ao subir =====================
  var menuOpen = false;
  (function(){
    var nav = $('#nav'), prog = $('.nav-prog'), links = $$('[data-nav]'), pill = $('.nav-pill'), navLinks = $('.nav-links');
    var anchors = links.map(function(a){ return $(a.getAttribute('href')); });
    var tops = [], maxY = 1, lastY = window.scrollY, hidden = false, activeIdx = -1;
    onMeasure(function(){
      var y = window.scrollY;
      tops = anchors.map(function(a){ return a ? a.getBoundingClientRect().top + y : Infinity; });
      maxY = Math.max(1, document.documentElement.scrollHeight - VH);
    });
    function setHidden(h){ if (h === hidden) return; hidden = h; nav.classList.toggle('hide', h); }
    function movePill(a){
      if (!pill || !navLinks) return;
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
      if (cur !== activeIdx){ activeIdx = cur; links.forEach(function(a, i){ a.classList.toggle('on', i === cur); }); if (!navHover) movePill(links[cur]); }
    });
    var navHover = false;
    if (navLinks){
      links.forEach(function(a){ a.addEventListener('mouseenter', function(){ navHover = true; movePill(a); }); });
      navLinks.addEventListener('mouseleave', function(){ navHover = false; movePill(links[activeIdx]); });
    }
    // menu mobile
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
  function anchorTop(el){
    if (el.id === 'top') return 0;
    var y = el.getBoundingClientRect().top + window.scrollY, next = el.nextElementSibling;
    if (next && next.classList.contains('sheet')) y += parseFloat(getComputedStyle(next).marginTop) || 0;
    return Math.max(0, y);
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = $(id); if (!t) return;
    e.preventDefault(); resyncScroll();
    window.scrollTo({ top: anchorTop(t), behavior: reduced ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
    // acessibilidade: leva o foco do teclado junto com a rolagem
    var f = t.tagName === 'MAIN' ? t : t.nextElementSibling || t;
    if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1');
    try { f.focus({ preventScroll: true }); } catch(_){}
  });
  if (location.hash && $(location.hash)) window.addEventListener('load', function(){ setTimeout(function(){ window.scrollTo(0, anchorTop($(location.hash))); }, 60); });

  // ===================== PROFUNDIDADE: a seção afunda e a próxima passa por cima =====================
  (function(){
    var D = $$('[data-depth]').map(function(sec){
      var next = sec.nextElementSibling; while (next && next.tagName !== 'SECTION') next = next.nextElementSibling;
      return { sec: sec, next: next, shade: $('.shade', sec), h: 0, state: -1 };
    }).filter(function(d){ return d.next; });
    if (!D.length) return;
    onMeasure(function(){
      D.forEach(function(d){
        d.sec.style.transform = ''; d.h = d.sec.offsetHeight;
        d.sec.style.setProperty('--st', Math.min(0, VH - d.h) + 'px');
        d.sec.style.transformOrigin = '50% ' + Math.round(Math.max(d.h - VH / 2, d.h / 2)) + 'px';
      });
    });
    if (reduced) return;
    onScroll(function(){
      D.forEach(function(d){
        var nt = d.next.getBoundingClientRect().top, p = clamp(1 - nt / VH, 0, 1);
        if (p <= 0){
          if (d.state !== 0){ d.state = 0; d.sec.style.transform = ''; if (d.shade) d.shade.style.opacity = '0'; d.sec.style.visibility = ''; d.sec.removeAttribute('data-covered'); d.sec.classList.remove('is-off'); }
          return;
        }
        var covered = nt <= 0;
        d.state = covered ? 2 : 1;
        d.sec.style.visibility = covered ? 'hidden' : '';
        d.sec.classList.toggle('is-off', covered);
        if (covered) d.sec.setAttribute('data-covered', '1'); else d.sec.removeAttribute('data-covered');
        d.sec.style.transform = 'scale(' + (1 - p * .07).toFixed(4) + ') translate3d(0,' + (p * -18).toFixed(1) + 'px,0)';
        if (d.shade) d.shade.style.opacity = (p * .78).toFixed(3);
      });
    });
  })();

  // ===================== PROJETOS: scroll vertical vira movimento lateral =====================
  var Lightbox;
  (function(){
    var hs = $('[data-hs]'), track = $('[data-hs-track]'); if (!hs || !track) return;
    var pin = $('.hs-pin', hs), cards = $$('.pcard', track), bar = $('[data-hs-bar]'), cur = $('[data-hs-cur]'), floor = $('[data-floor]');
    var dist = 0, span = 0, stick = 0, pos = [], lastCur = -1;
    if (reduced){ hs.classList.add('hs-static'); }
    onMeasure(function(){
      if (reduced) return;
      track.style.transform = '';
      dist = Math.max(0, track.scrollWidth - VW);
      span = dist / 1.5; // a vitrine anda 1,5px pro lado a cada 1px rolado: menos rolagem, mesma viagem
      stick = parseFloat(getComputedStyle(pin).top) || 0; // no celular o palco é mais baixo que a tela e fica centralizado
      hs.style.height = (pin.offsetHeight + span) + 'px';
      pos = cards.map(function(c){ return { l: c.offsetLeft, w: c.offsetWidth }; });
    });
    if (!reduced) onScroll(function(){
      var r = hs.getBoundingClientRect();
      if (r.bottom < -50 || r.top > VH + 50) return;
      var p = span ? clamp((stick - r.top) / span, 0, 1) : 0, x = -p * dist, mid = VW / 2, best = 0, bd = 1e9;
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
      Lightbox.open(LPS, +b.getAttribute('data-lp'), 'Landing page', false);
    });
  })();

  // ===================== SERVIÇOS: empilhamento (scroll stacking) =====================
  (function(){
    var cards = $$('.stack .scard'); if (cards.length < 2) return;
    onMeasure(function(){
      cards.forEach(function(c){ c.style.minHeight = ''; c.style.transform = ''; });
      var h = 0; cards.forEach(function(c){ h = Math.max(h, c.offsetHeight); });
      cards.forEach(function(c){ c.style.minHeight = h + 'px'; });
    });
    if (reduced) return;
    var stackEl = $('[data-stack]');
    onScroll(function(){
      var sr = stackEl.getBoundingClientRect(); if (sr.bottom < -VH || sr.top > VH) return;
      for (var i = 0; i < cards.length - 1; i++){
        var c = cards[i], top = c.getBoundingClientRect().top, h = c.offsetHeight, nt = cards[i + 1].getBoundingClientRect().top;
        var p = clamp((top + h - nt) / h, 0, 1);
        c.style.transform = p > 0 ? 'scale(' + (1 - p * .085).toFixed(4) + ')' : '';
        c.style.setProperty('--dim', (p * .62).toFixed(3));
      }
    });
  })();

  // ===================== FRASE: palavras acendem com o scroll =====================
  (function(){
    var el = $('[data-state]'); if (!el) return;
    var orb = $('[data-orb]');
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
    var words = $$('.sw', el), last = -1;
    if (reduced){ words.forEach(function(w){ w.classList.add('on'); }); return; }
    onScroll(function(){
      var r = el.getBoundingClientRect(); if (r.bottom < -VH || r.top > VH * 1.5) return;
      var c = r.top + r.height / 2, p = clamp((VH * .92 - c) / (VH * .52), 0, 1), lit = Math.round(p * words.length);
      if (lit !== last){ last = lit; words.forEach(function(w, i){ w.classList.toggle('on', i < lit); }); }
      if (orb) orb.style.setProperty('--os', (.75 + p * .45).toFixed(3));
    });
  })();

  // ===================== PROCESSO: trilho acende no scroll =====================
  (function(){
    var wrap = $('[data-steps]'), fill = $('[data-steps-fill]'); if (!wrap || !fill) return;
    var steps = $$('.step', wrap);
    if (reduced){ fill.style.setProperty('--p', 1); steps.forEach(function(s){ s.classList.add('lit'); }); return; }
    onScroll(function(){
      var r = wrap.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
      var vertical = VW <= 1100, p;
      if (vertical){
        p = clamp((VH * .66 - r.top) / r.height, 0, 1);
        steps.forEach(function(s){ var n = $('.node', s).getBoundingClientRect(); s.classList.toggle('lit', n.top + n.height / 2 <= VH * .66); });
      } else {
        p = clamp((VH * .9 - r.top) / (VH * .55), 0, 1);
        steps.forEach(function(s, i){ s.classList.toggle('lit', p >= i / (steps.length - 1) - .001); });
      }
      fill.style.setProperty('--p', p.toFixed(4));
    });
  })();

  // ===================== WHATSAPP FLUTUANTE =====================
  (function(){
    var fab = $('[data-fab]'), fin = $('.final'); if (!fab) return;
    var shown = false;
    onScroll(function(y){
      var finTop = fin ? fin.getBoundingClientRect().top : 1e9;
      var s = y > VH * .85 && finTop > VH * .55 && !menuOpen;
      if (s !== shown){ shown = s; fab.classList.toggle('show', s); }
    });
  })();

  // ===================== HERO: pílula, contadores, cartões flutuantes =====================
  (function(){
    var wrap = $('[data-pill]');
    if (wrap){
      var txt = wrap.firstElementChild, i = 0;
      var lock = function(){ var cur = txt.textContent, max = 0; PILL.forEach(function(t){ txt.textContent = t; max = Math.max(max, txt.getBoundingClientRect().width); }); txt.textContent = cur; wrap.style.width = Math.ceil(max + 2) + 'px'; };
      lock(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(lock);
      if (!reduced) setInterval(function(){ txt.classList.add('out'); setTimeout(function(){ i = (i + 1) % PILL.length; txt.textContent = PILL[i]; txt.classList.remove('out'); }, 360); }, 2200);
    }
    // contadores
    var nums = $$('[data-count]');
    if (!reduced && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){ en.forEach(function(e){
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var b = e.target, to = +b.getAttribute('data-count'), t0 = null;
        b.textContent = '0';
        (function tick(ts){ if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1500); k = 1 - Math.pow(1 - k, 4); b.textContent = Math.round(to * k); if (k < 1) requestAnimationFrame(tick); })(performance.now());
      }); }, { threshold: .6 });
      nums.forEach(function(b){ io.observe(b); });
    }
    // cartões flutuantes seguem o mouse (profundidade)
    var fl = $$('[data-floaters] .fcard');
    if (fine && !reduced && fl.length){
      var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
      window.addEventListener('pointermove', function(e){
        tx = e.clientX / VW - .5; ty = e.clientY / VH - .5;
        if (!run){ run = true; requestAnimationFrame(loop); }
      }, { passive: true });
      var loop = function(){
        cx += (tx - cx) * .08; cy += (ty - cy) * .08;
        fl.forEach(function(c){ var f = +c.getAttribute('data-f') || 1; c.style.setProperty('--px', (cx * 36 * f).toFixed(1) + 'px'); c.style.setProperty('--py', (cy * 26 * f).toFixed(1) + 'px'); });
        if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) requestAnimationFrame(loop); else run = false;
      };
    }
  })();

  // ===================== HERO: superfície líquida 3D (WebGL) =====================
  (function(){
    var cv = $('[data-gl]'); if (!cv) return;
    var hero = cv.closest('.hero');
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch(_){}
    if (!gl) return;
    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
      'uniform vec2 R;uniform float T;uniform vec2 M;uniform float S;',
      'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}',
      'float H(vec2 p){float t=T*.07;float w=fbm(p*.7+vec2(t,-t*.6));float w2=fbm(p*1.3-vec2(t*.8,t)+w);',
      ' return sin(p.x*1.1+p.y*.6+w*3.4+t*3.)*.55+sin(p.x*-.6+p.y*1.4+w2*2.6-t*2.2)*.35+sin(p.x*2.4-p.y*1.2+w*4.2+t*3.8)*.1;}',
      'void main(){vec2 uv=gl_FragCoord.xy/R;vec2 p=(gl_FragCoord.xy-.5*R)/R.y*2.4;p+=M*.18;p.y-=S*1.2;',
      ' float e=.012;float h=H(p),hx=H(p+vec2(e,0.)),hy=H(p+vec2(0.,e));',
      ' vec3 n=normalize(vec3((h-hx)/e,(h-hy)/e,2.4));vec3 L=normalize(vec3(-.4+M.x*.8,.6+M.y*.5,.8));',
      ' float dif=max(dot(n,L),0.);float spec=pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),60.);float fres=pow(1.-n.z,2.);',
      ' float k=smoothstep(-.95,.95,h);vec3 c=mix(vec3(.01,.015,.045),vec3(.02,.09,.42),k);c=mix(c,vec3(.05,.3,1.),smoothstep(.55,1.,k)*.75);',
      ' float vz=fbm(p*.45+T*.015);c=mix(c,vec3(.36,.22,.95),smoothstep(.45,.8,vz)*.45*k);',
      ' vec3 col=c*(.3+dif)+spec*vec3(.75,.92,1.)*.85+fres*vec3(.3,.85,1.)*.25;',
      ' float d=length((uv-vec2(.5,.56))*vec2(1.,1.35));col*=mix(.42,1.,smoothstep(.12,.72,d));',
      ' col*=smoothstep(-.1,.45,uv.y)*.75+.25;gl_FragColor=vec4(col,1.);}'
    ].join('\n');
    function sh(type, src){ var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uM = gl.getUniformLocation(pr, 'M'), uS = gl.getUniformLocation(pr, 'S');
    function size(){
      var w = cv.clientWidth, h = cv.clientHeight, s = (w < 700 ? .3 : .5) * Math.min(window.devicePixelRatio || 1, 2);
      var W = Math.round(w * s), Hh = Math.round(h * s), cap = 1150 / Math.max(W, 1);
      if (cap < 1){ W = Math.round(W * cap); Hh = Math.round(Hh * cap); }
      cv.width = Math.max(2, W); cv.height = Math.max(2, Hh); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height);
    }
    size(); onMeasure(size);
    var mx = 0, my = 0, tx = 0, ty = 0, visible = true, t0 = performance.now(), last = 0, shown = false;
    if (fine) window.addEventListener('pointermove', function(e){ tx = e.clientX / VW * 2 - 1; ty = -(e.clientY / VH * 2 - 1); }, { passive: true });
    function draw(now, force){
      var t = (now - t0) / 1000;
      if (!fine){ tx = Math.sin(t * .35) * .7; ty = Math.cos(t * .27) * .45; }
      mx += (tx - mx) * .05; my += (ty - my) * .05;
      gl.uniform1f(uT, reduced ? 12 : t); gl.uniform2f(uM, mx, my); gl.uniform1f(uS, clamp(window.scrollY / VH, 0, 1.2));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!shown){ shown = true; cv.classList.add('on'); }
    }
    if (reduced){ draw(performance.now(), true); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(hero);
    (function loop(now){
      requestAnimationFrame(loop);
      if (!visible || hero.hasAttribute('data-covered') || now - last < 33) return;
      last = now; draw(now);
    })(performance.now());
  })();

  // ===================== SERVIÇOS: terreno 3D em wireframe (canvas) =====================
  (function(){
    var cv = $('[data-terrain]'); if (!cv) return;
    var ctx = cv.getContext('2d'); if (!ctx) return;
    function draw(){
      var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
      var rows = w < 700 ? 26 : 38, cols = w < 700 ? 60 : 110, P = [];
      for (var r = 0; r <= rows; r++){
        var z = r / rows, zf = Math.pow(z, 1.55), row = [];
        var yb = h * .06 + h * .98 * zf, amp = 8 + (w < 700 ? 36 : 70) * zf, spread = .55 + 1.25 * zf;
        for (var c = 0; c <= cols; c++){
          var xn = c / cols * 2 - 1, wx = xn * 3.2, wz = z * 6;
          var ht = Math.sin(wx * 1.3 + wz * .8) * .5 + Math.sin(wx * 2.7 - wz * 1.4 + 1.3) * .28 + Math.sin(wx * .6 + wz * 2.1 + 2.1) * .35;
          ht *= .55 + .45 * Math.cos(xn * 1.4);
          row.push([w / 2 + xn * w * .5 * spread, yb - amp * ht]);
        }
        P.push(row);
      }
      for (r = 0; r <= rows; r++){
        var zz = r / rows, g = ctx.createLinearGradient(0, 0, w, 0), al = .04 + .32 * Math.pow(zz, 1.2);
        g.addColorStop(0, 'rgba(98,230,255,0)'); g.addColorStop(.25, 'rgba(98,160,255,' + al + ')'); g.addColorStop(.5, 'rgba(142,150,255,' + (al * 1.15) + ')'); g.addColorStop(.75, 'rgba(98,160,255,' + al + ')'); g.addColorStop(1, 'rgba(98,230,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = .6 + zz * .9; ctx.beginPath();
        P[r].forEach(function(pt, i){ i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }); ctx.stroke();
      }
      for (c = 0; c <= cols; c += 3){
        ctx.strokeStyle = 'rgba(111,147,255,.07)'; ctx.lineWidth = .6; ctx.beginPath();
        for (r = 0; r <= rows; r++){ var pt = P[r][c]; r ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }
        ctx.stroke();
      }
    }
    var lastW = 0;
    onMeasure(function(){ if (Math.abs(cv.clientWidth - lastW) > 4){ lastW = cv.clientWidth; draw(); } });
    draw();
  })();

  // ===================== ENTREGAS: globo de pontos girando (canvas) =====================
  (function(){
    var cv = $('[data-globe]'); if (!cv) return;
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var N = window.innerWidth < 700 ? 520 : 900, pts = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++){ var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga * i; pts.push([Math.cos(th) * rr, y, Math.sin(th) * rr]); }
    var W = 0, visible = false, last = 0, rot = 0, px = 0, tpx = 0;
    function size(){ var w = cv.clientWidth; if (!w) return; var dpr = Math.min(window.devicePixelRatio || 1, 2); W = w; cv.width = w * dpr; cv.height = w * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(){
      if (!W) return;
      var R = W * .42, cx = W / 2, cy = W / 2, tilt = .38 + px * .15, ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      ctx.clearRect(0, 0, W, W);
      var g = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.25); g.addColorStop(0, 'rgba(45,99,255,.16)'); g.addColorStop(1, 'rgba(45,99,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
      for (var i = 0; i < pts.length; i++){
        var p = pts[i], x = p[0] * cr - p[2] * sr, z = p[0] * sr + p[2] * cr, y = p[1] * ct - z * st; z = p[1] * st + z * ct;
        var f = (z + 1) / 2, a = .05 + f * f * .75, s = .6 + f * 1.5;
        ctx.fillStyle = f > .72 ? 'rgba(160,236,255,' + a + ')' : 'rgba(111,147,255,' + a + ')';
        ctx.fillRect(cx + x * R - s / 2, cy + y * R - s / 2, s, s);
      }
    }
    size(); onMeasure(function(){ size(); draw(); });
    if (fine) window.addEventListener('pointermove', function(e){ tpx = e.clientX / VW - .5; }, { passive: true });
    if (reduced){ draw(); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(cv.parentNode);
    (function loop(now){
      requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now; px += (tpx - px) * .05; rot += .0035 + px * .01; draw();
    })(performance.now());
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

  // ===================== HOVER: holofote nos cards + botões magnéticos =====================
  if (fine && !reduced){
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.spot'); if (!c) return;
      var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
    $$('.btn-primary, .btn-glass').forEach(function(b){
      if (b.closest('.menu')) return;
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.setProperty('--bx', clamp(dx * .16, -8, 8).toFixed(1) + 'px'); b.style.setProperty('--by', clamp(dy * .25, -6, 6).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function(){ b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }

  // ===================== ANIMAÇÕES CONTÍNUAS PAUSAM FORA DA TELA =====================
  if ('IntersectionObserver' in window){
    var ioOff = new IntersectionObserver(function(en){ en.forEach(function(e){ if (!e.target.hasAttribute('data-covered')) e.target.classList.toggle('is-off', !e.isIntersecting); }); }, { rootMargin: '20% 0px' });
    $$('main > section').forEach(function(s){ ioOff.observe(s); });
  }

  // ===================== LIGHTBOX =====================
  Lightbox = (function(){
    var lb = $('[data-lb]'); if (!lb) return { open: function(){} };
    var img = $('[data-lb-img]', lb), cnt = $('[data-lb-cnt]', lb), list = [], cur = 0, alt = '', tx = 0;
    function render(){ img.src = list[cur]; img.alt = alt + ' ' + (cur + 1); cnt.textContent = (cur + 1) + ' / ' + list.length; }
    function open(images, i, a, tall){ list = images; alt = a; cur = (i + list.length) % list.length; lb.classList.toggle('tall', !!tall); render(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
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

  // ===================== CRIATIVOS: carrossel infinito arrastável =====================
  (function(){
    var w = $('[data-arts]'), track = $('[data-arts-track]'); if (!w || !track) return;
    var items = $$('.art', track), N = ARTS.length, SPEED = 38, HOLD = 2200, FR = .03;
    var pos = 0, vel = 0, period = 0, dragging = false, moved = false, pid = null, sx = 0, sp = 0, lastX = 0, lastT = 0, idle = 0, hover = false, last = 0, down = null, vis = true;
    function measure(){ period = items.length > N ? items[N].offsetLeft - items[0].offsetLeft : track.scrollWidth / 2; }
    function wrapP(p){ return period ? ((p % period) + period) % period : 0; }
    function apply(){ track.style.transform = 'translate3d(' + (-pos).toFixed(2) + 'px,0,0)'; }
    function frame(ts){
      requestAnimationFrame(frame);
      if (!last) last = ts; var dt = Math.min(48, ts - last) / 1000; last = ts;
      if (dragging || !vis) return;
      if (Math.abs(vel) > 8){ pos += vel * dt; vel *= Math.pow(FR, dt); }
      else { vel = 0; if (!reduced && ts > idle) pos += SPEED * (hover ? .3 : 1) * dt; }
      pos = wrapP(pos); apply();
    }
    measure(); onMeasure(function(){ measure(); pos = wrapP(pos); apply(); });
    requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ vis = en[0].isIntersecting; }).observe(w);
    w.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      down = e.target.closest('[data-art]'); dragging = true; moved = false; pid = e.pointerId; sx = lastX = e.clientX; sp = pos; lastT = e.timeStamp; vel = 0;
      w.classList.add('dragging'); try { w.setPointerCapture(pid); } catch(_){}
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
    w.addEventListener('click', function(){ var b = down; down = null; if (!b || moved) return; Lightbox.open(ARTS, +b.getAttribute('data-art'), 'Criativo', true); });
  })();

  // ===================== FAQ: abre/fecha suave =====================
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
    var dex = $('[data-dex]'), bubble = $('[data-bubble]');
    var QUIZ = [
      { q: 'Qual é o seu tipo de negócio?', sub: 'Pra personalizar a sua análise.', icon: 'i-tag', max: 0, opts: [
        { t: 'Negócio local (loja, clínica, restaurante, salão...)', seg: 'local' }, { t: 'Prestador de serviço ou profissional liberal', seg: 'servico' }, { t: 'Loja online ou venda de produto', seg: 'loja' }, { t: 'Infoproduto, curso ou mentoria', seg: 'info' } ] },
      { q: 'Quando alguém quer conhecer seu negócio, onde chega hoje?', sub: 'O destino de quem te procura.', icon: 'i-layout', max: 30, opts: [
        { t: 'No meu Instagram ou direto no WhatsApp', s: 0 }, { t: 'Num link na bio genérico (tipo Linktree)', s: 8 }, { t: 'Num site antigo, que não traz cliente', s: 15 }, { t: 'Numa página profissional que converte', s: 30 } ] },
      { q: 'Se alguém pesquisar o seu serviço no Google agora, o que aparece?', sub: 'Seja sincero: é isso que o cliente vê.', icon: 'i-search', max: 30, opts: [
        { t: 'Nada meu. Só concorrente', s: 0 }, { t: 'Só o meu Instagram', s: 8 }, { t: 'Meu site, mas lá embaixo', s: 18 }, { t: 'Meu site entre os primeiros', s: 30 } ] },
      { q: 'Seu negócio aparece no Google Maps?', sub: 'O bloco com mapa, estrelas e horário (Google Meu Negócio).', icon: 'i-pin', max: 20, opts: [
        { t: 'Não aparece', s: 0 }, { t: 'Aparece, mas o perfil está incompleto', s: 10 }, { t: 'Sim, completo e com avaliações', s: 20 } ] },
      { q: 'De onde vem a maior parte dos seus clientes?', sub: 'A sua principal fonte de demanda hoje.', icon: 'i-mega', max: 20, opts: [
        { t: 'Indicação e boca a boca', s: 0 }, { t: 'Redes sociais, no orgânico', s: 6 }, { t: 'Impulsiono posts de vez em quando', s: 10 }, { t: 'Campanhas de anúncio estruturadas', s: 20 } ] }
    ];
    var SEG = {
      local:   { n: 'negócio local', rec: 'Site institucional + Google Meu Negócio', want: 'Site institucional', hi: 'Negócio local? O Google Maps vai ser seu melhor amigo.', why: 'Negócio local vive da busca “perto de mim”. Site com SEO local e perfil no Google Maps colocam você na frente de quem está perto e pronto pra comprar.' },
      servico: { n: 'prestador de serviço', rec: 'Landing page + Google Meu Negócio', want: 'Landing page', hi: 'Serviço se vende por confiança. Anotado!', why: 'Quem contrata serviço pesquisa, compara e chama quem parece mais profissional. Landing page com prova e WhatsApp em um toque fecha esse ciclo.' },
      loja:    { n: 'loja ou produto', rec: 'Landing page de oferta + Tráfego pago', want: 'Landing page', hi: 'Produto bom precisa de vitrine boa. Bora!', why: 'Produto vende com página de oferta clara e anúncio bem direcionado. A landing page recebe o clique e o tráfego pago traz volume.' },
      info:    { n: 'infoproduto ou mentoria', rec: 'Landing page de conversão + Tráfego pago', want: 'Landing page', hi: 'Infoproduto vive de página que convence. Guardei!', why: 'Infoproduto depende de uma página que convence em segundos: copy forte, prova social e o botão certo, com campanhas levando o público até ela.' }
    };
    var LINES = {
      bad: ['Eita... aqui tá escapando cliente.', 'Hmm, isso pesa no resultado.', 'Ai. Esse é um ponto crítico.'],
      mid: ['Tá no caminho, dá pra melhorar!', 'Meio caminho andado.', 'Bom começo. Tem espaço pra crescer.'],
      top: ['Aí sim! Mandou bem.', 'Isso! Ponto pra você.', 'Excelente, o Google gosta disso.']
    };
    var step = 0, ans = [], dir = 'fwd', R = null, busy = false, moodT = null;
    var xpEls = function(){ return $$('[data-xp]'); }, xpBars = function(){ return $$('[data-xp-bar]'); };
    function say(html){ if (!bubble) return; bubble.innerHTML = html; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop'); }
    function mood(m, back, ms){ if (!dex) return; clearTimeout(moodT); dex.setAttribute('data-mood', m); if (back) moodT = setTimeout(function(){ dex.setAttribute('data-mood', back); }, ms || 1400); }
    function xpNow(){ var s = 0; for (var i = 1; i < QUIZ.length; i++) if (ans[i] != null) s += QUIZ[i].opts[ans[i]].s; return s; }
    function setXP(v){ xpEls().forEach(function(e){ e.textContent = v; }); xpBars().forEach(function(b){ b.style.setProperty('--p', (v / 100).toFixed(3)); }); }
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
      resyncScroll(); busy = false;
      var q = QUIZ[step];
      box.innerHTML = xpInline() + stepsBar(false) + '<div class="q-step' + (dir === 'back' ? ' back' : '') + '">' +
        '<span class="q-k mono">Pergunta 0' + (step + 1) + ' de 05</span><h3 class="q-title">' + esc(q.q) + '</h3><p class="q-sub">' + esc(q.sub) + '</p>' +
        '<div class="q-opts" role="group" aria-label="Opções">' + q.opts.map(function(o, i){ return '<button type="button" class="q-opt' + (ans[step] === i ? ' sel' : '') + '" data-opt="' + i + '"><span class="k">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.t) + '</span></button>'; }).join('') + '</div>' +
        '<div class="q-nav">' + (step > 0 ? '<button type="button" class="q-back" data-qback>← Voltar</button>' : '<span></span>') + '<span class="q-hint">Toque numa opção ou use <kbd>A</kbd>–<kbd>' + String.fromCharCode(64 + q.opts.length) + '</kbd></span></div></div>';
      setXP(xpNow());
      $$('[data-opt]', box).forEach(function(b){ b.addEventListener('click', function(){ pick(+b.getAttribute('data-opt'), b); }); });
      var bk = $('[data-qback]', box); if (bk) bk.addEventListener('click', function(){ if (busy) return; dir = 'back'; step--; renderQ(); mood('curious'); });
    }
    function pop(target, txt, zero){
      var br = box.getBoundingClientRect(), r = target.getBoundingClientRect();
      var p = document.createElement('span'); p.className = 'xp-pop' + (zero ? ' zero' : ''); p.textContent = txt;
      p.style.left = (r.right - br.left - 90) + 'px'; p.style.top = (r.top - br.top + 8) + 'px';
      box.appendChild(p); setTimeout(function(){ p.remove(); }, 1150);
    }
    function pick(i, b){
      if (busy) return; busy = true;
      $$('[data-opt]', box).forEach(function(x){ x.classList.toggle('sel', x === b); });
      ans[step] = i;
      var q = QUIZ[step], o = q.opts[i];
      if (step === 0){ say(esc(SEG[o.seg].hi)); mood('happy', 'curious', 900); pop(b, 'Perfil ✓', false); }
      else {
        var ratio = o.s / q.max, bucket = ratio === 0 ? 'bad' : ratio >= 1 ? 'top' : 'mid', line = LINES[bucket][Math.floor(Math.random() * 3)];
        say(esc(line)); mood(bucket === 'bad' ? 'worried' : bucket === 'top' ? 'happy' : 'ok', 'curious', 1100);
        pop(b, '+' + o.s + ' XP', o.s === 0); setXP(xpNow());
      }
      setTimeout(function(){ dir = 'fwd'; step++; step < QUIZ.length ? renderQ() : renderResult(); }, 720);
    }
    function compute(){
      var seg = SEG[QUIZ[0].opts[ans[0]].seg];
      var p = QUIZ[1].opts[ans[1]].s, gq = QUIZ[2].opts[ans[2]].s, gm = QUIZ[3].opts[ans[3]].s, t = QUIZ[4].opts[ans[4]].s;
      var score = p + gq + gm + t, gaps = [];
      if (p < 30) gaps.push({ k: p, t: p === 0 ? (seg.want === 'Site institucional' ? 'Site profissional' : 'Landing page profissional') : p === 8 ? 'Página própria no lugar do link genérico' : 'Reestruturar o site atual',
        d: p === 0 ? 'Hoje o clique morre no Instagram. Uma página com a sua marca recebe quem procura e leva direto pro WhatsApp.' : p === 8 ? 'Trocar o link igual ao de todo mundo por uma página sua, com prova e direcionamento pra venda.' : 'Copy de venda, SEO, velocidade e WhatsApp em um toque. O site que você tem vira o site que traz cliente.' });
      if (gq < 30) gaps.push({ k: gq + 1, t: 'SEO + GEO', d: gq <= 8 ? 'Estruturar a página pra aparecer na busca e nas respostas de IA quando pesquisam o que você vende.' : 'Subir posições com conteúdo, estrutura técnica e sinais locais.' });
      if (gm < 20) gaps.push({ k: gm + 2, t: 'Google Meu Negócio', d: gm === 0 ? 'Criar o perfil pra aparecer no Google Maps e no bloco local, com avaliações e botão de contato.' : 'Completar o perfil: categorias, fotos, descrição com palavras-chave e conexão com o site.' });
      if (t < 20) gaps.push({ k: t + 40, t: 'Tráfego pago (com a página no ar)', d: 'Campanhas no Meta e no Google Ads levando o público certo até a página, com verba controlada.' });
      if (!gaps.length) gaps.push({ k: 0, t: 'Escala', d: 'Base sólida. Próximo passo: mais páginas por serviço, mais tráfego e testes contínuos.' });
      gaps.sort(function(a, b){ return a.k - b.k; });
      var tier = score < 35 ? 'low' : score < 70 ? 'mid' : 'high';
      var T = {
        low: { title: 'Invisível no Google', badge: 'Modo invisível', medal: 'i-ghost', txt: 'Seu negócio existe, mas quem pesquisa não encontra. Cada busca hoje termina no concorrente. A boa notícia: isso se resolve com uma página e um perfil bem feitos.', dex: 'Alerta vermelho! Hoje quase ninguém te encontra. Mas calma: <b>isso tem solução.</b>', mood: 'shock' },
        mid: { title: 'Presença incompleta', badge: 'Meio caminho', medal: 'i-target', txt: 'Você tem alguma presença, mas o caminho tem furos. Fechar os pontos abaixo é o que mais vai destravar cliente novo.', dex: 'Tem presença, mas com furos. <b>Fechando esses pontos, o cliente chega.</b>', mood: 'proud' },
        high: { title: 'Bem posicionado', badge: 'Radar do Google', medal: 'i-rocket', txt: 'Você já aparece. Agora é converter mais e escalar: página melhor, mais tráfego e mais alcance.', dex: 'Uau! Você tá bem posicionado. <b>Agora é escalar!</b>', mood: 'party' }
      }[tier];
      return { seg: seg, score: score, gaps: gaps, tier: tier, T: T };
    }
    function renderResult(){
      resyncScroll(); busy = false;
      R = compute();
      var chk = ic('i-check');
      box.innerHTML = stepsBar(true) + '<div class="q-step q-res tier-' + R.tier + '">' +
        '<div class="gauge"><i class="pulse" aria-hidden="true"></i><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="g-bg" cx="80" cy="80" r="70"/><circle class="g-fg" cx="80" cy="80" r="70" data-gauge/></svg><b><span><span data-score>0</span><i>%</i></span><small>Presença digital</small></b></div>' +
        '<div class="badge"><span class="medal">' + ic(R.T.medal) + '</span><span><small>Conquista desbloqueada</small><b>' + esc(R.T.badge) + '</b></span></div>' +
        '<h3>' + esc(R.T.title) + '</h3><p>' + esc(R.T.txt) + '</p>' +
        '<div class="q-rec"><small class="mono">Indicado para ' + esc(R.seg.n) + '</small><b>' + esc(R.seg.rec) + '</b><p>' + esc(R.seg.why) + '</p></div>' +
        '<div class="q-plan">' + R.gaps.map(function(g, i){ return '<div style="--d:' + (.3 + i * .1) + 's">' + chk + '<div><b>' + (i === 0 ? 'Prioridade: ' : '') + esc(g.t) + '</b>' + esc(g.d) + '</div></div>'; }).join('') + '</div>' +
        '<div class="cta-row"><button type="button" class="btn btn-primary" data-qform><span class="knob"><svg aria-hidden="true"><use href="#i-wa"/></svg></span>Receber meu plano</button><button type="button" class="btn btn-glass" data-qreset>Refazer</button></div>' +
        '<p class="q-foot">Sem compromisso. Você recebe uma proposta pensada pro seu caso.</p></div>';
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
      step = 0; ans = []; dir = 'back'; R = null; renderQ(); setXP(0);
      say('Bora de novo! <b>Qual é o seu tipo de negócio?</b>'); mood('curious');
      var y = box.getBoundingClientRect().top + window.scrollY - 90;
      resyncScroll(); window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
    }
    function field(id, label, input, opt){ return '<div class="f-field" data-f="' + id + '"><label for="f-' + id + '">' + label + (opt ? ' <em>(opcional)</em>' : '') + '</label>' + input + '<span class="msg">Preencha este campo.</span></div>'; }
    function renderForm(){
      resyncScroll();
      say('Quase lá! <b>Me diz pra quem eu mando o plano.</b>'); mood('happy', 'curious', 1200);
      var wants = ['Landing page', 'Site institucional', 'Página de links na bio', 'Google Meu Negócio', 'Tráfego pago', 'Ainda não sei, quero orientação'];
      box.innerHTML = stepsBar(true) + '<div class="q-step"><span class="q-k mono">Último passo</span><h3 class="q-title">Pra onde a gente manda o seu plano?</h3><p class="q-sub">Ao enviar, sua mensagem vai pronta, com o diagnóstico, direto pro nosso WhatsApp.</p>' +
        '<div class="f-sum"><span>' + esc(R.T.title) + ' · ' + R.score + '/100</span><span>' + esc(R.seg.rec) + '</span></div>' +
        '<form class="q-form" novalidate data-lead><div class="f-grid">' +
          field('nome', 'Seu nome', '<input id="f-nome" name="nome" type="text" autocomplete="name" placeholder="Como você se chama?" required>') +
          field('zap', 'Seu WhatsApp', '<input id="f-zap" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(47) 99999-9999" required>') +
          field('negocio', 'Nome do negócio', '<input id="f-negocio" name="negocio" type="text" autocomplete="organization" placeholder="Ex.: Clínica Sorriso">') +
          field('cidade', 'Cidade', '<input id="f-cidade" name="cidade" type="text" autocomplete="address-level2" placeholder="Ex.: São Paulo, SP">') +
        '</div>' +
        field('link', 'Instagram ou site atual', '<input id="f-link" name="link" type="text" autocomplete="url" placeholder="@seunegocio ou seusite.com.br">', true) +
        field('quero', 'O que você quer primeiro?', '<select id="f-quero" name="quero">' + wants.map(function(w){ return '<option' + (w === R.seg.want ? ' selected' : '') + '>' + esc(w) + '</option>'; }).join('') + '</select>') +
        '<div class="cta-row" style="margin-top:8px;justify-content:flex-start"><button type="submit" class="btn btn-primary"><span class="knob"><svg aria-hidden="true"><use href="#i-wa"/></svg></span>Enviar e receber proposta</button><button type="button" class="btn btn-glass" data-qback-res>Ver resultado</button></div>' +
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
        if (!ok){ $('.f-field.err input', box).focus(); mood('worried', 'curious', 1200); say('Opa, faltou um dado. <b>Confere o campo em vermelho?</b>'); return; }
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
        // sem o parâmetro 'noopener' (com ele o navegador sempre devolve null); o opener é cortado na mão
        var win = window.open(url, '_blank'); if (win) try { win.opener = null; } catch(_){}
        resyncScroll();
        box.innerHTML = stepsBar(true) + '<div class="q-step q-sent"><div class="ok">' + ic('i-check') + '</div>' +
          '<h3 class="q-title" style="text-align:center">Pronto, ' + esc(lead.nome.split(' ')[0]) + '! Seu plano está a caminho.</h3>' +
          '<p class="q-sub" style="text-align:center">' + (win ? 'O WhatsApp abriu em outra aba com a mensagem pronta. É só tocar em enviar.' : 'Toque no botão abaixo pra abrir o WhatsApp com a mensagem pronta.') + '</p>' +
          '<div class="cta-row"><a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener"><span class="knob"><svg aria-hidden="true"><use href="#i-wa"/></svg></span>' + (win ? 'Abrir o WhatsApp de novo' : 'Abrir o WhatsApp') + '</a><button type="button" class="btn btn-glass" data-qreset>Refazer diagnóstico</button></div></div>';
        $('[data-qreset]', box).addEventListener('click', reset);
        say('Prontinho! <b>Já já a gente conversa.</b>'); mood('party'); confetti(140);
      });
    }
    // confete (canvas leve, só quando o resultado é bom)
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
    // teclado: A–D / 1–4 escolhem a opção
    document.addEventListener('keydown', function(e){
      if (e.target.closest && e.target.closest('input,select,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
      var opts = $$('[data-opt]', box); if (!opts.length) return;
      var r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
      var k = e.key.toLowerCase(), i = 'abcd'.indexOf(k); if (i < 0) i = '1234'.indexOf(k);
      if (i >= 0 && opts[i]){ e.preventDefault(); opts[i].click(); }
    });
    // olhos do Dex seguem o cursor (desktop) ou dão uma olhadinha pro card (mobile)
    if (dex){
      if (fine && !reduced){
        window.addEventListener('pointermove', function(e){
          var r = dex.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
          var cx = r.left + r.width / 2, cy = r.top + r.height * .41, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 260);
          dex.style.setProperty('--ex', (dx / d * 4.5 * m).toFixed(2) + 'px'); dex.style.setProperty('--ey', (dy / d * 4.5 * m).toFixed(2) + 'px');
        }, { passive: true });
      } else { dex.style.setProperty('--ex', '3px'); dex.style.setProperty('--ey', '2.5px'); }
    }
    renderQ();
    setTimeout(function(){ mood('curious'); }, 1200);
  })();

  // ===================== ROLAGEM SUAVE (desktop, roda do mouse) =====================
  (function(){
    if (!fine || reduced) return;
    var target = window.scrollY, current = target, raf = null, animating = false, EASE = .085;
    function maxY(){ return document.documentElement.scrollHeight - window.innerHeight; }
    resyncScroll = function(){ if (raf){ cancelAnimationFrame(raf); raf = null; } animating = false; current = target = window.scrollY; };
    function loop(){
      current += (target - current) * EASE;
      if (Math.abs(target - current) < .5){ current = target; window.scrollTo(0, current); raf = null; animating = false; return; }
      window.scrollTo(0, current); raf = requestAnimationFrame(loop);
    }
    window.addEventListener('wheel', function(e){
      if (e.ctrlKey || e.metaKey || document.body.style.overflow === 'hidden') return;
      if (e.target.closest && e.target.closest('[data-arts]') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      if (!animating){ current = window.scrollY; target = current; }
      target = clamp(target + d * .95, 0, maxY()); animating = true;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: false });
    window.addEventListener('scroll', function(){ if (!animating) current = target = window.scrollY; }, { passive: true });
  })();

  measureAll();
})();
