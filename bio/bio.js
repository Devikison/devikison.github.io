/* Descomplica Site: página de link na bio (/bio)
   - Endereço digitando no cartão do site
   - Faixa de projetos em loop infinito, arrastável com dedo ou mouse (com embalo)
   - Formulário "Quero que me chamem": manda o contato por e-mail (FormSubmit)
     e oferece adiantar a conversa no WhatsApp com a mensagem já pronta
   - Eventos no Google Analytics para saber qual link mais converte */
(function(){
  'use strict';
  var WA = '5547992476541';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/devikisonads@gmail.com';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var track = function(name, extra){ try { if (window.gtag) window.gtag('event', name, extra || {}); } catch(_){} };
  var waLink = function(msg){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); };

  // ===================== CLIQUES NOS LINKS =====================
  $$('[data-ev]').forEach(function(el){
    el.addEventListener('click', function(){ track('clique_bio', { link: el.getAttribute('data-ev') }); });
  });

  // ===================== ENDEREÇO DIGITANDO =====================
  var typed = $('[data-type]');
  if (typed && !reduced){
    var full = typed.getAttribute('data-type'), n = 0;
    typed.textContent = '';
    setTimeout(function step(){
      n++; typed.textContent = full.slice(0, n);
      if (n < full.length) setTimeout(step, 45 + Math.random() * 55);
    }, 900);
  }

  // ===================== BUSCA DA CAPA (digita, apaga e troca o nicho) =====================
  var q = $('[data-cycle]');
  if (q && !reduced){
    var list = q.getAttribute('data-cycle').split('|'), w = 0, c = list[0].length, del = true;
    setTimeout(function loop(){
      var word = list[w];
      if (del){ c--; q.textContent = word.slice(0, c); if (c <= 0){ del = false; w = (w + 1) % list.length; } setTimeout(loop, 32); return; }
      word = list[w]; c++; q.textContent = word.slice(0, c);
      if (c >= word.length){ del = true; setTimeout(loop, 2200); return; }
      setTimeout(loop, 55 + Math.random() * 60);
    }, 2600);
  }

  // ===================== PROJETOS: LOOP INFINITO COM ARRASTO =====================
  // Uma única linha do tempo em JS: corre sozinha devagar, e o dedo ou o mouse assumem 1:1.
  // Ao soltar, segue com o embalo do gesto e freia suave; depois de um tempo volta a correr.
  // Itens duplicados + posição em módulo = a faixa nunca acaba para nenhum dos lados.
  // touch-action: pan-y no CSS: gesto vertical continua rolando a página normalmente.
  var proj = $('[data-proj]');
  if (proj){
    var tr = $('.proj-track', proj);
    var originals = $$('.pj', tr);
    originals.forEach(function(pj){ var c = pj.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; tr.appendChild(c); });
    var SPEED = reduced ? 0 : 0.035;       // px por ms correndo sozinha (para a esquerda)
    var x = 0, v = 0, half = 1, visible = true, hover = false, resumeAt = 0, last = 0;
    var down = false, axis = null, sx = 0, sy = 0, lx = 0, lt = 0, moved = 0, pid = null;
    var measure = function(){ half = (tr.children[originals.length].offsetLeft - originals[0].offsetLeft) || 1; };
    var wrap = function(n){ n = n % half; return n > 0 ? n - half : n; };
    var paint = function(){ tr.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    var tick = function(t){
      var dt = last ? Math.min(t - last, 50) : 16; last = t;
      if (!down && visible){
        if (Math.abs(v) > 0.005){ x += v * dt; v *= Math.pow(0.94, dt / 16); }   // embalo depois de soltar
        else { v = 0; if (!hover && t > resumeAt) x -= SPEED * dt; }
      }
      x = wrap(x); paint();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ visible = e[0].isIntersecting; }).observe(proj);

    proj.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; axis = null; pid = e.pointerId; moved = 0; v = 0;
      sx = lx = e.clientX; sy = e.clientY; lt = performance.now();
    });
    proj.addEventListener('pointermove', function(e){
      if (!down || e.pointerId !== pid) return;
      if (!axis){
        var ax = Math.abs(e.clientX - sx), ay = Math.abs(e.clientY - sy);
        if (ax < 6 && ay < 6) return;
        axis = ax >= ay ? 'x' : 'y';
        if (axis === 'y'){ down = false; return; }              // gesto vertical: deixa a página rolar
        try { proj.setPointerCapture(pid); } catch(_){}
        proj.classList.add('dragging');
        lx = sx;                                                // conta desde o primeiro toque: 1:1 com o dedo
      }
      var now = performance.now(), dx = e.clientX - lx, dtm = Math.max(now - lt, 1);
      x = wrap(x + dx);
      v = v * 0.6 + (dx / dtm) * 0.4;                          // velocidade suavizada para o embalo
      moved += Math.abs(dx); lx = e.clientX; lt = now;
      paint();
      if (e.cancelable) e.preventDefault();
    });
    var release = function(e){
      if (!down || (e && e.pointerId !== pid)) return;
      down = false;
      if (axis === 'x'){
        if (performance.now() - lt > 90) v = 0;                 // segurou parado antes de soltar: sem embalo
        v = Math.max(-2.5, Math.min(2.5, v));
        resumeAt = performance.now() + 2200;
      }
      setTimeout(function(){ proj.classList.remove('dragging'); }, 0);
      try { proj.releasePointerCapture(pid); } catch(_){}
    };
    proj.addEventListener('pointerup', release);
    proj.addEventListener('pointercancel', release);
    // só a captura da própria faixa conta (no toque o link de dentro também perde a captura dele)
    proj.addEventListener('lostpointercapture', function(e){ if (e.target === proj) release(e); });
    // depois de arrastar, soltar em cima de um projeto não abre o link
    proj.addEventListener('click', function(e){ if (moved > 6){ e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    proj.addEventListener('dragstart', function(e){ e.preventDefault(); });
    proj.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') hover = true; });
    proj.addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse'){ hover = false; resumeAt = performance.now() + 600; } });
  }

  // ===================== FORMULÁRIO =====================
  var sheet = $('#sheet'), panel = sheet && $('.panel', sheet), form = $('#lead'), lastFocus = null;
  if (!sheet || !form) return;

  function open(){
    lastFocus = document.activeElement;
    sheet.classList.add('on'); sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(function(){ $('#f-nome').focus({ preventScroll: true }); }, reduced ? 0 : 380);
  }
  function close(){
    sheet.classList.remove('on'); sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open-form]').forEach(function(b){ b.addEventListener('click', open); });
  $$('[data-close]', sheet).forEach(function(b){ b.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){
    if (!sheet.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab'){ // mantém o foco dentro da folha
      var f = $$('button,input,a[href]', panel).filter(function(x){ return x.offsetParent !== null && x.tabIndex !== -1; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
  });

  // máscara do WhatsApp: (11) 91234-5678
  var zap = $('#f-zap');
  zap.addEventListener('input', function(){
    var d = zap.value.replace(/\D/g, '').slice(0, 11);
    zap.value = d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6) : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d;
  });
  $$('.f input', form).forEach(function(i){ i.addEventListener('input', function(){ var f = i.closest('.f'); if (f) f.classList.remove('err'); }); });

  var sending = false, btn = $('.send', form), label = $('[data-send-label]', form), errBox = $('[data-form-err]', form);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (sending) return;
    var v = function(id){ return ($('#f-' + id).value || '').trim().slice(0, 120); };
    var checks = [['nome', v('nome').length >= 2], ['zap', v('zap').replace(/\D/g, '').length >= 10]], ok = true;
    checks.forEach(function(c){ var f = $('[data-f="' + c[0] + '"]', form); f.classList.toggle('err', !c[1]); if (!c[1]) ok = false; });
    if (!ok){ $('.f.err input', form).focus(); return; }

    var quero = $$('input[name="quero"]:checked', form).map(function(i){ return i.value; }).join(', ') || 'Não marcou';
    var horario = ($('input[name="horario"]:checked', form) || {}).value || 'Qualquer horário';
    var lead = { nome: v('nome'), whatsapp: v('zap'), negocio: v('neg') || '-', quero: quero, horario: horario };
    var digits = lead.whatsapp.replace(/\D/g, '');

    var done = function(){
      $('[data-done-title]', panel).textContent = 'Recebido, ' + lead.nome.split(' ')[0] + '!';
      $('[data-done-wa]', panel).href = waLink(resumo);
      panel.classList.add('sent'); panel.scrollTop = 0;
      track('generate_lead', { origem: 'bio', quero: lead.quero });
    };

    // mensagem pronta com todos os dados: usada no botão de adiantar e como plano B se o e-mail falhar
    var resumo = 'Olá, Descomplica Site! Quero que vocês me chamem.\n\nNome: ' + lead.nome + '\nWhatsApp: ' + lead.whatsapp +
      '\nNegócio: ' + lead.negocio + '\nPreciso de: ' + lead.quero + '\nMelhor horário: ' + lead.horario;
    var errWa = $('a', errBox); if (errWa) errWa.href = waLink(resumo);

    // robô preencheu o campo escondido: finge que deu certo e não envia nada
    if ($('#f-site').value){ done(); return; }

    sending = true; btn.disabled = true; label.textContent = 'Enviando...'; errBox.classList.remove('on');
    var finished = false;
    var fail = function(why){
      if (finished) return; finished = true;
      sending = false; btn.disabled = false; label.textContent = 'Tentar de novo'; errBox.classList.add('on');
      track('lead_erro', { origem: 'bio', motivo: String(why || '').slice(0, 90) });
    };
    // o serviço de e-mail às vezes demora ou nem responde: depois de 12s desiste e mostra o plano B
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function(){ if (ctrl) ctrl.abort(); fail('tempo esgotado'); }, 12000);
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        _subject: 'Novo contato pela bio: ' + lead.nome,
        _template: 'table',
        _captcha: 'false',
        origem: 'Link na bio do Instagram (descomplicasite.com.br/bio)',
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        abrir_conversa: 'https://wa.me/55' + digits,
        negocio_e_cidade: lead.negocio,
        precisa_de: lead.quero,
        melhor_horario: lead.horario
      })
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(j){
        if (!r.ok || String(j.success) === 'false') throw new Error(j.message || ('HTTP ' + r.status));
      });
    }).then(function(){
      clearTimeout(timer);
      if (finished) return; finished = true;
      sending = false; done();
    }).catch(function(e){ clearTimeout(timer); fail(e && e.message); });
  });
})();
