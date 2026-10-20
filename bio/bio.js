/* Descomplica Site: página de link na bio (/bio)
   - Compartilhar a página (menu nativo do celular ou copia o link)
   - Endereço digitando no cartão do site
   - Faixa de projetos em loop (duplica os itens; pausa enquanto o dedo segura)
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

  // ===================== COMPARTILHAR =====================
  var share = $('[data-share]');
  if (share) share.addEventListener('click', function(){
    var data = { title: 'Descomplica Site', text: 'Sites que colocam seu negócio no Google e fazem o seu WhatsApp tocar.', url: 'https://www.descomplicasite.com.br/bio/' };
    track('compartilhar_bio');
    if (navigator.share) { navigator.share(data).catch(function(){}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function(){
      share.setAttribute('aria-label', 'Link copiado');
      share.classList.add('copied');
      setTimeout(function(){ share.setAttribute('aria-label', 'Compartilhar esta página'); share.classList.remove('copied'); }, 1800);
    }).catch(function(){});
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

  // ===================== PROJETOS EM LOOP =====================
  var proj = $('[data-proj]');
  if (proj && !reduced){
    var tr = $('.proj-track', proj);
    $$('.pj', tr).forEach(function(pj){ var c = pj.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; tr.appendChild(c); });
    var hold = function(on){ return function(){ proj.classList.toggle('hold', on); }; };
    proj.addEventListener('touchstart', hold(true), { passive: true });
    proj.addEventListener('touchend', hold(false), { passive: true });
    proj.addEventListener('touchcancel', hold(false), { passive: true });
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
      $('[data-done-wa]', panel).href = waLink('Olá, Descomplica Site! Acabei de pedir contato pela bio do Instagram.\n\nNome: ' + lead.nome + '\nNegócio: ' + lead.negocio + '\nPreciso de: ' + lead.quero);
      panel.classList.add('sent'); panel.scrollTop = 0;
      track('generate_lead', { origem: 'bio', quero: lead.quero });
    };

    // robô preencheu o campo escondido: finge que deu certo e não envia nada
    if ($('#f-site').value){ done(); return; }

    sending = true; btn.disabled = true; label.textContent = 'Enviando...'; errBox.classList.remove('on');
    var fail = function(){ sending = false; btn.disabled = false; label.textContent = 'Tentar de novo'; errBox.classList.add('on'); track('lead_erro', { origem: 'bio' }); };
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
        if (!r.ok || String(j.success) === 'false') throw new Error('envio');
      });
    }).then(function(){ sending = false; done(); }).catch(fail);
  });
})();
