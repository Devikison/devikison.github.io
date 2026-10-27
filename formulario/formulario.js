/* Descomplica Site: envio de materiais do cliente (/formulario)
   - Só nome, WhatsApp, arquivos, links e um recado opcional
   - Rascunho salvo neste aparelho (localStorage) para o cliente não perder nada
   - Arquivos vão para o Google Drive do Devikison (script em _google/formulario-drive.gs):
     uma pasta por cliente e uma subpasta por envio, planilha de controle e e-mail de aviso
   - Arquivo sobe em pedaços de 8 MB (upload retomável): se a internet cair, continua de onde parou */
(function(){
  'use strict';
  var WA = '5547992476541';
  // URL do app da Web do Google Apps Script (_google/formulario-drive.gs)
  var DRIVE_API = '[URL_DO_APPS_SCRIPT]';
  var CHUNK = 8 * 1024 * 1024; // múltiplo de 256 KB, exigência do upload retomável do Drive
  var MAX_BYTES = 300 * 1024 * 1024;
  var MAX_FILES = 40;
  var DRAFT_KEY = 'ds-briefing-rascunho-v1';

  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function(name, extra){ try { if (window.gtag) window.gtag('event', name, extra || {}); } catch(_){} };

  var form = $('#briefing');
    var files = [];   // { file, path, state: 'wait' | 'up' | 'ok' | 'fail', el }
  var links = [];
  var pastaId = null;
  var protocolo = '';
  var sending = false;

  var X_ICON = '<svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>';

  function kb(n){
    if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
    return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }


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
      if (f.size > MAX_BYTES){ skipped.push(f.name + ' (maior que 300 MB, mande por link)'); return; }
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

  // Fala com o script do Google (texto simples evita a checagem prévia de CORS)
  function api(body){
    return fetch(DRIVE_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function(res){ if (!res.ok) throw new Error(res.erro || 'erro'); return res; });
  }
  function tentar(fn, vezes){
    return fn().catch(function(err){
      if (vezes <= 1) throw err;
      return new Promise(function(ok){ setTimeout(ok, 1500); }).then(function(){ return tentar(fn, vezes - 1); });
    });
  }
  function base64(blob){
    return new Promise(function(resolve, reject){
      var fr = new FileReader();
      fr.onload = function(){ resolve(String(fr.result).split(',')[1] || ''); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  // Sobe um arquivo em pedaços de 8 MB para a sessão retomável do Drive
  function upload(item){
    var f = item.file, total = f.size;
    var bar = $('.file__bar span', item.el), meta = $('.file__meta', item.el);
    item.el.classList.remove('is-fail'); item.el.classList.add('is-up');
    var abrir = item.sessao ? Promise.resolve() : tentar(function(){
      return api({ acao: 'sessao', pasta: pastaId, nome: f.name, tipo: f.type, tamanho: total })
        .then(function(res){ item.sessao = res.sessao; item.enviado = 0; });
    }, 3);
    function proximo(){
      if (item.enviado >= total) return Promise.resolve();
      var ini = item.enviado, fim = Math.min(ini + CHUNK, total);
      return base64(f.slice(ini, fim)).then(function(b64){
        return tentar(function(){
          return api({ acao: 'parte', sessao: item.sessao, inicio: ini, total: total, dados: b64 })
            .catch(function(err){
              // a parte pode ter chegado mesmo com erro de rede: pergunta ao Drive onde parou
              return api({ acao: 'estado', sessao: item.sessao, total: total }).then(function(st){
                if (st.fim || st.proximo > ini) return st;
                throw err;
              });
            });
        }, 4);
      }).then(function(res){
        item.enviado = res.fim ? total : res.proximo;
        bar.style.transform = 'scaleX(' + (item.enviado / total) + ')';
        return proximo();
      });
    }
    return abrir.then(proximo).then(function(){
      item.state = 'ok'; item.el.classList.remove('is-up'); item.el.classList.add('is-ok');
      meta.textContent = kb(total) + ' · enviado';
    }, function(err){
      item.state = 'fail'; item.el.classList.remove('is-up'); item.el.classList.add('is-fail');
      meta.textContent = 'Falhou, toque em Enviar de novo';
      throw err;
    });
  }

  function collect(){
    var get = function(n){ var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
    return { nome: get('nome'), whatsapp: get('whatsapp'), obs: get('obs') };
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (sending || !validate()) return;
    sending = true; btn.disabled = true;
    var dados = collect();
    var pend = files.filter(function(f){ return f.state !== 'ok'; });

    setStatus('Preparando o envio...');
    var chain = pastaId ? Promise.resolve() : tentar(function(){
      return api({ acao: 'iniciar', nome: dados.nome, whatsapp: dados.whatsapp })
        .then(function(res){ pastaId = res.pasta; protocolo = res.protocolo; });
    }, 3);
    pend.forEach(function(item, n){
      chain = chain.then(function(){
        setStatus('Enviando arquivo ' + (n + 1) + ' de ' + pend.length + '...');
        return upload(item);
      });
    });

    chain.then(function(){
      setStatus('Finalizando...');
      return tentar(function(){
        return api({ acao: 'finalizar', pasta: pastaId, nome: dados.nome, whatsapp: dados.whatsapp, recado: dados.obs, links: links });
      }, 3);
    }).then(function(){
      finish(dados, protocolo);
    }).catch(function(){
      sending = false; btn.disabled = false;
      setStatus('Não consegui enviar tudo. Confira a internet e toque em Enviar de novo: o que já subiu não será perdido.', true);
      track('materiais_erro');
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
