/* Descomplica Site: envio de materiais do cliente (/formulario)
   - Só nome, WhatsApp, arquivos, links e um recado opcional
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

  function filled(el){ return el.value.trim() !== ''; }
  function refresh(){
    if (files.length + links.length) setErr('arquivos', '');
  }

  // ===================== RASCUNHO =====================
  function saveDraft(){
    var data = { links: $$('input', linkList).map(function(i){ return i.value; }), campos: {} };
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
    (data.links || []).forEach(function(v){ if (v) addLinkRow(v); });
    syncLinks();
    if (links.length) $('.more').open = true;
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
  // Um campo por link; "Adicionar outro link" cria mais um e o X apaga o que sobrou.
  var linkList = $('[data-links]');
  function normLink(v){
    v = v.trim();
    if (!v) return '';
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    try { return new URL(v).hostname.indexOf('.') > 0 ? v : null; } catch(_){ return null; }
  }
  function syncLinks(){
    links = [];
    $$('input', linkList).forEach(function(inp){
      var v = normLink(inp.value);
      if (v && links.indexOf(v) === -1) links.push(v);
    });
  }
  function addLinkRow(value, focus){
    var n = linkList.children.length + 1;
    var li = document.createElement('li');
    li.className = 'link-row';
    li.innerHTML = '<input type="url" inputmode="url" placeholder="https://" aria-label="Link ' + n + '">' +
      '<button type="button" class="file__x" aria-label="Apagar este link">' + X_ICON + '</button>' +
      '<p class="err"></p>';
    var inp = $('input', li);
    inp.value = value || '';
    $('.file__x', li).addEventListener('click', function(){
      li.remove();
      if (!linkList.children.length) addLinkRow('');
      syncLinks(); refresh(); saveDraft();
    });
    linkList.appendChild(li);
    if (focus) inp.focus();
  }
  $('[data-link-add]').addEventListener('click', function(){ addLinkRow('', true); });
  linkList.addEventListener('input', function(e){
    var row = e.target.closest('.link-row');
    if (row){ $('.err', row).textContent = ''; e.target.classList.remove('is-invalid'); }
    syncLinks(); refresh();
  });
  function checkLinks(){
    var bad = null;
    $$('.link-row', linkList).forEach(function(row){
      var inp = $('input', row);
      var ok = normLink(inp.value) !== null;
      $('.err', row).textContent = ok ? '' : 'Esse link parece incompleto. Copie e cole o endereço inteiro.';
      inp.classList.toggle('is-invalid', !ok);
      if (!ok && !bad) bad = inp;
    });
    syncLinks();
    return bad;
  }

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
    check('whatsapp', $('#whatsapp').value.replace(/\D/g, '').length >= 10, 'Coloque o WhatsApp com DDD.');
    var badLink = checkLinks();
    if (badLink){ $('.more').open = true; if (!first) first = badLink; }
    check('arquivos', files.length + links.length > 0, 'Escolha pelo menos um arquivo ou cole um link.');
    if (first){ first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return !first;
  }
  ['nome', 'whatsapp'].forEach(function(id){
    $('#' + id).addEventListener('input', function(){ if ($('#' + id + '-err').textContent) setErr(id, ''); });
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
    return { nome: get('nome'), whatsapp: get('whatsapp'), obs: get('obs') };
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
    var L = { nome: 'Nome', whatsapp: 'WhatsApp', obs: 'Recado' };
    var body = {
      _subject: 'Materiais ' + protocolo + ': ' + dados.nome,
      _template: 'table', _captcha: 'false',
      Protocolo: protocolo
    };
    Object.keys(L).forEach(function(k){ body[L[k]] = dados[k] || '-'; });
    body['Arquivos (' + files.length + ')'] = files.length
      ? files.map(function(f, i){ var l = fileLinks && fileLinks[i]; return f.file.name + ' (' + kb(f.file.size) + ')' + (l ? ': ' + l : ''); }).join('\n')
      : '-';
    body['Links enviados'] = links.length ? links.join('\n') : '-';
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
    track('materiais_enviados', { arquivos: files.length, links: links.length });
    $('#app').hidden = true;
    var done = $('[data-done]');
    $('[data-protocolo]', done).textContent = protocolo;
    $('[data-wa]', done).href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(
      'Oi! Sou ' + dados.nome + ' e acabei de enviar os arquivos pelo formulário. Protocolo ' + protocolo + '.');
    done.hidden = false;
    window.scrollTo(0, 0);
    done.focus();
  }

  // ===================== INÍCIO =====================
  loadDraft();
  if (!linkList.children.length) addLinkRow('');
  form.addEventListener('input', function(){ refresh(); saveDraft(); });
  form.addEventListener('change', function(){ refresh(); saveDraft(); });
  refresh();
})();
