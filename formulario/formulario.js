/* Descomplica Site: formulário de briefing do cliente (/formulario)
   - Checklist ao lado mostra o que já foi preenchido
   - Rascunho salvo neste aparelho (localStorage) para o cliente não perder nada
   - Arquivos sobem direto para o Supabase (bucket privado briefings-descomplica, pasta = id do envio)
   - A função briefing-receber grava tudo na tabela descomplica_briefings e devolve links dos arquivos
   - Cópia organizada vai por e-mail (FormSubmit) com os links para baixar
   - Se uma etapa falhar, o envio pode ser repetido sem subir de novo o que já subiu */
(function(){
  'use strict';
  var WA = '5547992476541';
  var EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/devikisonads@gmail.com';
  var SB_URL = 'https://tlixawxfsuwmgjjlcapw.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaXhhd3hmc3V3bWdqamxjYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NTM0NTIsImV4cCI6MjEwMzUyOTQ1Mn0.iPYmSoR2nCGrpCw52UUiZbE-dnTQ-9BeBoCI9-L-WLY';
  var BUCKET = 'briefings-descomplica';
  var MAX_BYTES = 50 * 1024 * 1024;
  var MAX_FILES = 40;
  var DRAFT_KEY = 'ds-briefing-rascunho-v1';

  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function(name, extra){ try { if (window.gtag) window.gtag('event', name, extra || {}); } catch(_){} };

  var form = $('#briefing');
  var blocks = $$('fieldset[data-step]', form);
  var files = [];   // { file, path, state: 'wait' | 'up' | 'ok' | 'fail', el }
  var links = [];
  var envioId = null;
  var sending = false;

  var X_ICON = '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>';

  function uuid(){
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function(x){ return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0,8) + '-' + h.slice(8,12) + '-' + h.slice(12,16) + '-' + h.slice(16,20) + '-' + h.slice(20);
  }
  function kb(n){
    if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
    return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function safeName(name, i){
    var clean = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return (i + 1) + '-' + (clean || 'arquivo').slice(-80);
  }

  // ===================== CHECKLIST =====================
  var stepsEl = $('[data-steps]');
  blocks.forEach(function(b, i){
    var li = document.createElement('li');
    li.innerHTML = '<a href="#' + b.id + '"><i><span>' + (i + 1) + '</span></i>' + esc(b.getAttribute('data-step')) + '</a>';
    stepsEl.appendChild(li);
  });
  var stepLinks = $$('a', stepsEl);

  function filled(el){ return el.value.trim() !== ''; }
  function groupFilled(name){ return $$('input[name="' + name + '"]', form).some(function(i){ return i.checked; }); }

  function items(){
    var list = [];
    $$('[data-check]', form).forEach(function(el){ list.push({ block: el.closest('fieldset'), ok: filled(el) }); });
    $$('[data-check-group]', form).forEach(function(g){ list.push({ block: g.closest('fieldset'), ok: groupFilled(g.getAttribute('data-check-group')) }); });
    list.push({ block: $('#sec-arquivos'), ok: files.length + links.length > 0 });
    return list;
  }

  function refresh(){
    var all = items();
    var done = all.filter(function(x){ return x.ok; }).length;
    $('[data-count]').textContent = done;
    $('[data-total]').textContent = all.length;
    var pct = Math.round(done / all.length * 100);
    $('.meter__bar').style.transform = 'scaleX(' + (done / all.length) + ')';
    $('[data-meter]').setAttribute('aria-valuenow', pct);
    blocks.forEach(function(b, i){
      var mine = all.filter(function(x){ return x.block === b; });
      var ok = b.id === 'sec-contato'
        ? ['nome', 'empresa', 'whatsapp'].every(function(id){ return filled($('#' + id)); })
        : b.id === 'sec-final' ? $('#consentimento').checked
        : mine.some(function(x){ return x.ok; });
      stepLinks[i].classList.toggle('is-done', ok);
    });
  }

  // ===================== RASCUNHO =====================
  function saveDraft(){
    var data = { links: links, campos: {} };
    $$('input, select, textarea', form).forEach(function(el){
      if (!el.name || el.type === 'file') return;
      if (el.type === 'checkbox' || el.type === 'radio'){
        if (el.checked) (data.campos[el.name] = data.campos[el.name] || []).push(el.value);
      } else data.campos[el.name] = el.value;
    });
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch(_){}
  }
  function loadDraft(){
    var data;
    try { data = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch(_){ data = null; }
    if (!data) return;
    Object.keys(data.campos || {}).forEach(function(name){
      var v = data.campos[name];
      $$('[name="' + name + '"]', form).forEach(function(el){
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = Array.isArray(v) && v.indexOf(el.value) > -1;
        else el.value = v;
      });
    });
    (data.links || []).forEach(addLink);
  }

  // ===================== TELEFONE =====================
  $$('input[type=tel]', form).forEach(function(el){
    el.addEventListener('input', function(){
      var d = el.value.replace(/\D/g, '').slice(0, 13);
      if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
      d = d.slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      el.value = out;
    });
  });

  // ===================== ARQUIVOS =====================
  var fileList = $('[data-files]');
  var drop = $('[data-drop]');
  var input = $('#arquivos');

  function addFiles(list){
    var skipped = [];
    Array.prototype.forEach.call(list, function(f){
      if (files.length >= MAX_FILES){ skipped.push(f.name + ' (limite de ' + MAX_FILES + ' arquivos)'); return; }
      if (f.size > MAX_BYTES){ skipped.push(f.name + ' (maior que 50 MB, mande por link)'); return; }
      if (!f.size){ skipped.push(f.name + ' (arquivo vazio)'); return; }
      var dup = files.some(function(x){ return x.file.name === f.name && x.file.size === f.size; });
      if (dup) return;
      var item = { file: f, path: null, state: 'wait' };
      var li = document.createElement('li');
      li.className = 'file';
      li.innerHTML = '<span class="file__name"></span><span class="file__meta"></span>' +
        '<button type="button" class="file__x" aria-label="Remover arquivo">' + X_ICON + '</button>' +
        '<span class="file__bar"><span></span></span>';
      $('.file__name', li).textContent = f.name;
      $('.file__meta', li).textContent = kb(f.size);
      $('.file__x', li).addEventListener('click', function(){
        if (sending) return;
        files.splice(files.indexOf(item), 1);
        li.remove(); refresh();
      });
      item.el = li;
      files.push(item);
      fileList.appendChild(li);
    });
    if (skipped.length) setStatus('Não adicionei: ' + skipped.join('; ') + '.', true);
    refresh();
    track('briefing_arquivo', { total: files.length });
  }
  input.addEventListener('change', function(){ addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  // ===================== LINKS =====================
  var linkList = $('[data-links]');
  var linkInput = $('#link-novo');
  function addLink(url){
    links.push(url);
    var li = document.createElement('li');
    li.className = 'file';
    li.innerHTML = '<span class="file__name"></span><span class="file__meta">link</span>' +
      '<button type="button" class="file__x" aria-label="Remover link">' + X_ICON + '</button>';
    $('.file__name', li).textContent = url;
    $('.file__x', li).addEventListener('click', function(){
      links.splice(links.indexOf(url), 1);
      li.remove(); refresh(); saveDraft();
    });
    linkList.appendChild(li);
  }
  function tryAddLink(){
    var v = linkInput.value.trim();
    var err = $('#link-err');
    if (!v) return true;
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    var ok = false;
    try { ok = !!new URL(v).hostname.match(/\./); } catch(_){}
    if (!ok){ err.textContent = 'Esse link parece incompleto. Copie e cole o endereço inteiro.'; linkInput.classList.add('is-invalid'); return false; }
    err.textContent = ''; linkInput.classList.remove('is-invalid');
    if (links.indexOf(v) === -1) addLink(v);
    linkInput.value = '';
    refresh(); saveDraft();
    return true;
  }
  $('[data-link-add]').addEventListener('click', tryAddLink);
  linkInput.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); tryAddLink(); } });

  // ===================== VALIDAÇÃO =====================
  function setErr(id, msg){
    var el = $('#' + id), err = $('#' + id + '-err');
    if (err) err.textContent = msg || '';
    if (el && el.type !== 'checkbox') el.classList.toggle('is-invalid', !!msg);
    if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (el && err) el.setAttribute('aria-describedby', id + '-err');
  }
  function validate(){
    var first = null;
    function check(id, ok, msg){ setErr(id, ok ? '' : msg); if (!ok && !first) first = $('#' + id); }
    check('nome', filled($('#nome')), 'Escreva o seu nome.');
    check('empresa', filled($('#empresa')), 'Escreva o nome da empresa ou marca.');
    check('whatsapp', $('#whatsapp').value.replace(/\D/g, '').length >= 10, 'Coloque o WhatsApp com DDD.');
    var em = $('#email').value.trim();
    check('email', !em || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em), 'Confira o e-mail.');
    check('consentimento', $('#consentimento').checked, 'Marque a autorização para enviar.');
    if (!tryAddLink() && !first) first = linkInput;
    if (first){ first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return !first;
  }
  ['nome', 'empresa', 'whatsapp', 'email', 'consentimento'].forEach(function(id){
    $('#' + id).addEventListener('change', function(){ if ($('#' + id + '-err').textContent) validate(); });
  });

  // ===================== ENVIO =====================
  var statusEl = $('[data-status]');
  var btn = $('[data-submit]');
  function setStatus(msg, isErr){ statusEl.textContent = msg; statusEl.classList.toggle('is-err', !!isErr); }

  function upload(item, i){
    return new Promise(function(resolve, reject){
      item.path = item.path || envioId + '/' + safeName(item.file.name, i);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', SB_URL + '/storage/v1/object/' + BUCKET + '/' + item.path.split('/').map(encodeURIComponent).join('/'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + SB_KEY);
      xhr.setRequestHeader('apikey', SB_KEY);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.setRequestHeader('Content-Type', item.file.type || 'application/octet-stream');
      var bar = $('.file__bar span', item.el), meta = $('.file__meta', item.el);
      item.el.classList.remove('is-fail'); item.el.classList.add('is-up');
      xhr.upload.onprogress = function(e){ if (e.lengthComputable) bar.style.transform = 'scaleX(' + (e.loaded / e.total) + ')'; };
      xhr.onload = function(){
        item.el.classList.remove('is-up');
        // 409: já estava lá (envio repetido depois de uma falha)
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 409){
          item.state = 'ok'; item.el.classList.add('is-ok'); meta.textContent = kb(item.file.size) + ' · enviado';
          resolve();
        } else {
          item.state = 'fail'; item.el.classList.add('is-fail'); meta.textContent = 'Falhou, tente enviar de novo';
          reject(new Error('upload ' + xhr.status));
        }
      };
      xhr.onerror = function(){
        item.el.classList.remove('is-up'); item.state = 'fail'; item.el.classList.add('is-fail');
        meta.textContent = 'Sem conexão, tente enviar de novo';
        reject(new Error('rede'));
      };
      xhr.send(item.file);
    });
  }

  function collect(){
    var get = function(n){ var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
    var checks = function(n){ return $$('input[name="' + n + '"]:checked', form).map(function(i){ return i.value; }).join(', '); };
    return {
      nome: get('nome'), empresa: get('empresa'), whatsapp: get('whatsapp'), email: get('email'),
      cidade: get('cidade'), instagram: get('instagram'),
      servico: checks('servico'), negocio: get('negocio'), ofertas: get('ofertas'), publico: get('publico'),
      diferenciais: get('diferenciais'), acao: get('acao'), dominio: get('dominio'), prazo: get('prazo'),
      logo: checks('logo'), cores: get('cores'), evitar: get('evitar'), referencias: get('referencias'),
      wa_botao: get('wa_botao'), horario: get('horario'), endereco: get('endereco'), redes: get('redes'),
      depoimentos: get('depoimentos'), textos: get('textos'), obs: get('obs')
    };
  }

  function saveRecord(dados){
    return fetch(SB_URL + '/functions/v1/briefing-receber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY },
      body: JSON.stringify({
        id: envioId, dados: dados, links: links,
        arquivos: files.map(function(f){ return { path: f.path, nome: f.file.name, tamanho: f.file.size, tipo: f.file.type }; })
      })
    }).then(function(r){ if (!r.ok) throw new Error('registro ' + r.status); return r.json(); });
  }

  function sendEmail(dados, protocolo, fileLinks){
    var L = {
      nome: 'Nome', empresa: 'Empresa / marca', whatsapp: 'WhatsApp', email: 'E-mail', cidade: 'Cidade', instagram: 'Instagram',
      servico: 'Serviço', negocio: 'Sobre o negócio', ofertas: 'Serviços / produtos', publico: 'Cliente ideal', diferenciais: 'Diferenciais',
      acao: 'Ação principal', dominio: 'Domínio', prazo: 'Data importante', logo: 'Logo', cores: 'Cores', evitar: 'Evitar',
      referencias: 'Referências', wa_botao: 'WhatsApp dos botões', horario: 'Horário', endereco: 'Endereço', redes: 'Redes e links',
      depoimentos: 'Depoimentos', textos: 'Textos prontos', obs: 'Observações'
    };
    var body = {
      _subject: 'Briefing ' + protocolo + ': ' + (dados.empresa || dados.nome),
      _template: 'table', _captcha: 'false',
      Protocolo: protocolo
    };
    Object.keys(L).forEach(function(k){ body[L[k]] = dados[k] || '-'; });
    body['Arquivos (' + files.length + ')'] = files.length
      ? files.map(function(f, i){ var l = fileLinks && fileLinks[i]; return f.file.name + ' (' + kb(f.file.size) + ')' + (l ? ': ' + l : ''); }).join('\n')
      : '-';
    body['Links enviados'] = links.length ? links.join('\n') : '-';
    if (dados.email) body._replyto = dados.email;
    return fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r){ if (!r.ok) throw new Error('email ' + r.status); return r.json(); });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (sending || !validate()) return;
    sending = true; btn.disabled = true;
    envioId = envioId || uuid();
    var protocolo = envioId.slice(0, 8).toUpperCase();
    var dados = collect();
    var pend = files.filter(function(f){ return f.state !== 'ok'; });

    var chain = Promise.resolve();
    pend.forEach(function(item, n){
      chain = chain.then(function(){
        setStatus('Enviando arquivo ' + (n + 1) + ' de ' + pend.length + '...');
        return upload(item, files.indexOf(item));
      });
    });

    chain.then(function(){
      setStatus('Salvando suas respostas...');
      var fileLinks = null;
      return saveRecord(dados).then(function(res){
        fileLinks = (res.arquivos || []).map(function(a){ return a.url; });
        return true;
      }, function(){ return false; }).then(function(saved){
        return sendEmail(dados, protocolo, fileLinks).then(function(){ return true; }, function(){ return false; }).then(function(mailed){
          if (!saved && !mailed) throw new Error('nada salvo');
          finish(dados, protocolo);
        });
      });
    }).catch(function(){
      sending = false; btn.disabled = false;
      setStatus('Não consegui enviar tudo. Confira a internet e toque em Enviar de novo: o que já subiu não será perdido.', true);
      track('briefing_erro');
    });
  });

  function finish(dados, protocolo){
    try { localStorage.removeItem(DRAFT_KEY); } catch(_){}
    track('briefing_enviado', { arquivos: files.length, links: links.length });
    $('#app').hidden = true;
    var done = $('[data-done]');
    $('[data-protocolo]', done).textContent = protocolo;
    $('[data-wa]', done).href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(
      'Oi! Acabei de enviar o briefing da ' + (dados.empresa || dados.nome) + ' pelo formulário. Protocolo ' + protocolo + '.');
    done.hidden = false;
    window.scrollTo(0, 0);
    done.focus();
  }

  // ===================== INÍCIO =====================
  loadDraft();
  form.addEventListener('input', function(){ refresh(); saveDraft(); });
  form.addEventListener('change', function(){ refresh(); saveDraft(); });
  refresh();
})();
