/**
 * Descomplica Site: recebe os arquivos do formulário (descomplicasite.com.br/formulario)
 * e guarda tudo no Google Drive de quem implantar este script.
 *
 * Organização no Drive:
 *   Descomplica Site - Envios de clientes/
 *     Nome do cliente/                    (uma pasta por cliente, achada pelo WhatsApp)
 *       Envio 27-10-2026 14h30/           (uma subpasta por envio)
 *         arquivos do cliente
 *         Informações do envio.txt        (nome, WhatsApp, recado e links)
 *   Planilha "Envios de clientes"         (uma linha por envio, com link da pasta)
 *
 * A cada envio chega um e-mail para a conta dona do script com o link da pasta.
 *
 * Como os arquivos sobem: o navegador manda pedaços de 8 MB para cá e este script repassa
 * cada pedaço para uma sessão de upload do Drive (upload retomável). Assim cabem arquivos
 * grandes e, se a internet cair no meio, o envio continua de onde parou.
 */

var PASTA_RAIZ = 'Descomplica Site - Envios de clientes';
var PLANILHA = 'Envios de clientes';
var FUSO = 'America/Sao_Paulo';
var MAX_BYTES = 300 * 1024 * 1024;           // tamanho máximo por arquivo
var EMAIL_AVISO = '';                        // vazio = e-mail da conta dona do script

/** Rode uma vez pelo editor (botão Executar) para autorizar e criar a pasta e a planilha. */
function configurar() {
  var raiz = pastaRaiz_();
  planilha_();
  DriveApp.getStorageUsed(); // garante a permissão completa do Drive para o upload retomável
  Logger.log('Pronto. Pasta: ' + raiz.getUrl());
}

function doGet() {
  return json_({ ok: true, servico: 'formulario-drive' });
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    switch (req.acao) {
      case 'iniciar': return json_(iniciar_(req));
      case 'sessao': return json_(sessao_(req));
      case 'parte': return json_(parte_(req));
      case 'estado': return json_(estado_(req));
      case 'finalizar': return json_(finalizar_(req));
    }
    return json_({ ok: false, erro: 'acao' });
  } catch (err) {
    return json_({ ok: false, erro: String(err && err.message || err) });
  }
}

// ---------------------------------------------------------------- ações

/** Cria (ou acha) a pasta do cliente e a subpasta deste envio. */
function iniciar_(req) {
  var nome = txt_(req.nome, 120);
  var zap = String(req.whatsapp || '').replace(/\D/g, '').slice(-11);
  if (!nome || zap.length < 10) throw new Error('campos');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var raiz = pastaRaiz_();
    var cliente = null;
    var it = raiz.getFolders();
    while (it.hasNext()) {
      var f = it.next();
      if (f.getDescription() === 'whatsapp:' + zap) { cliente = f; break; }
    }
    if (!cliente) {
      cliente = raiz.createFolder(nome);
      cliente.setDescription('whatsapp:' + zap);
    }
    var protocolo = Utilities.getUuid().slice(0, 8).toUpperCase();
    var envio = cliente.createFolder('Envio ' + Utilities.formatDate(new Date(), FUSO, "dd-MM-yyyy HH'h'mm"));
    envio.setDescription('protocolo:' + protocolo);
    return { ok: true, pasta: envio.getId(), protocolo: protocolo };
  } finally {
    lock.releaseLock();
  }
}

/** Abre uma sessão de upload retomável do Drive para um arquivo dentro da pasta do envio. */
function sessao_(req) {
  var pasta = pastaDoEnvio_(req.pasta);
  var tamanho = Number(req.tamanho) || 0;
  if (tamanho <= 0 || tamanho > MAX_BYTES) throw new Error('tamanho');
  var nome = txt_(req.nome, 200) || 'arquivo';
  var tipo = txt_(req.tipo, 120) || 'application/octet-stream';

  var r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': tipo,
      'X-Upload-Content-Length': String(tamanho)
    },
    payload: JSON.stringify({ name: nome, parents: [pasta.getId()] }),
    muteHttpExceptions: true
  });
  var loc = cabecalho_(r, 'location');
  if (r.getResponseCode() !== 200 || !loc) throw new Error('sessao ' + r.getResponseCode());
  return { ok: true, sessao: loc };
}

/** Repassa um pedaço do arquivo (base64) para a sessão do Drive. */
function parte_(req) {
  var sessao = sessaoValida_(req.sessao);
  var inicio = Number(req.inicio), total = Number(req.total);
  var bytes = Utilities.base64Decode(req.dados);
  var fim = inicio + bytes.length - 1;
  var r = UrlFetchApp.fetch(sessao, {
    method: 'put',
    contentType: 'application/octet-stream',
    headers: { 'Content-Range': 'bytes ' + inicio + '-' + fim + '/' + total },
    payload: bytes,
    followRedirects: false,
    muteHttpExceptions: true
  });
  return resposta_(r);
}

/** Pergunta ao Drive quanto do arquivo já chegou (para continuar depois de uma falha). */
function estado_(req) {
  var sessao = sessaoValida_(req.sessao);
  var r = UrlFetchApp.fetch(sessao, {
    method: 'put',
    headers: { 'Content-Range': 'bytes */' + Number(req.total) },
    followRedirects: false,
    muteHttpExceptions: true
  });
  return resposta_(r);
}

/** Grava o resumo na pasta, registra na planilha e manda o e-mail de aviso. */
function finalizar_(req) {
  var pasta = pastaDoEnvio_(req.pasta);
  var cliente = pasta.getParents().next();
  var protocolo = pasta.getDescription().replace('protocolo:', '');
  var nome = txt_(req.nome, 120);
  var zap = txt_(req.whatsapp, 30);
  var recado = txt_(req.recado, 5000);
  var links = (req.links || []).map(function (l) { return txt_(l, 2000); })
    .filter(function (l) { return /^https?:\/\//i.test(l); }).slice(0, 50);

  var arquivos = [];
  var it = pasta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    arquivos.push({ nome: f.getName(), url: f.getUrl(), tamanho: f.getSize() });
  }

  var quando = Utilities.formatDate(new Date(), FUSO, "dd/MM/yyyy 'às' HH:mm");
  var resumo = [
    'Protocolo: ' + protocolo,
    'Enviado em: ' + quando,
    'Nome: ' + nome,
    'WhatsApp: ' + zap,
    '',
    'Recado:',
    recado || '-',
    '',
    'Links enviados:',
    links.length ? links.join('\n') : '-',
    '',
    'Arquivos nesta pasta: ' + arquivos.length
  ].join('\n');
  pasta.createFile('Informações do envio.txt', resumo, MimeType.PLAIN_TEXT);

  planilha_().appendRow([new Date(), protocolo, nome, zap, arquivos.length, links.join('\n'), recado, pasta.getUrl()]);

  var para = EMAIL_AVISO || Session.getEffectiveUser().getEmail();
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">' +
    '<p><b>' + esc(nome) + '</b> mandou ' + arquivos.length + ' arquivo(s)' + (links.length ? ' e ' + links.length + ' link(s)' : '') + '.</p>' +
    '<p><a href="' + pasta.getUrl() + '" style="display:inline-block;background:#0245f2;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Abrir a pasta no Drive</a></p>' +
    '<p>WhatsApp: <a href="https://wa.me/55' + zap.replace(/\D/g, '').slice(-11) + '">' + esc(zap) + '</a><br>Protocolo: ' + protocolo + '<br>Enviado em: ' + quando + '</p>' +
    (recado ? '<p><b>Recado:</b><br>' + esc(recado).replace(/\n/g, '<br>') + '</p>' : '') +
    (links.length ? '<p><b>Links:</b><br>' + links.map(function (l) { return '<a href="' + esc(l) + '">' + esc(l) + '</a>'; }).join('<br>') + '</p>' : '') +
    (arquivos.length ? '<p><b>Arquivos:</b><br>' + arquivos.map(function (a) { return '<a href="' + a.url + '">' + esc(a.nome) + '</a> (' + mb_(a.tamanho) + ')'; }).join('<br>') + '</p>' : '') +
    '<p style="color:#666">Pasta do cliente: <a href="' + cliente.getUrl() + '">' + esc(cliente.getName()) + '</a></p></div>';
  MailApp.sendEmail({ to: para, subject: 'Arquivos de ' + nome + ' (' + protocolo + ')', htmlBody: html, name: 'Formulário Descomplica Site' });

  return { ok: true, protocolo: protocolo };
}

// ---------------------------------------------------------------- apoio

function pastaRaiz_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('RAIZ');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  var raiz = DriveApp.createFolder(PASTA_RAIZ);
  props.setProperty('RAIZ', raiz.getId());
  return raiz;
}

function planilha_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PLANILHA');
  if (id) { try { return SpreadsheetApp.openById(id).getSheets()[0]; } catch (e) {} }
  var ss = SpreadsheetApp.create(PLANILHA);
  var aba = ss.getSheets()[0];
  aba.appendRow(['Data', 'Protocolo', 'Nome', 'WhatsApp', 'Arquivos', 'Links', 'Recado', 'Pasta']);
  aba.setFrozenRows(1);
  DriveApp.getFileById(ss.getId()).moveTo(pastaRaiz_());
  props.setProperty('PLANILHA', ss.getId());
  return aba;
}

/** Só aceita pastas de envio criadas por este script (raiz > cliente > envio). */
function pastaDoEnvio_(id) {
  var pasta = DriveApp.getFolderById(String(id || ''));
  if (pasta.getDescription().indexOf('protocolo:') !== 0) throw new Error('pasta');
  var cliente = pasta.getParents();
  if (!cliente.hasNext()) throw new Error('pasta');
  var avo = cliente.next().getParents();
  if (!avo.hasNext() || avo.next().getId() !== pastaRaiz_().getId()) throw new Error('pasta');
  return pasta;
}

function sessaoValida_(url) {
  url = String(url || '');
  if (url.indexOf('https://www.googleapis.com/upload/drive/v3/files?') !== 0) throw new Error('sessao');
  return url;
}

function resposta_(r) {
  var code = r.getResponseCode();
  if (code === 200 || code === 201) {
    var id = null;
    try { id = JSON.parse(r.getContentText()).id; } catch (e) {}
    return { ok: true, fim: true, id: id };
  }
  if (code === 308) {
    var range = cabecalho_(r, 'range'); // ex.: bytes=0-8388607
    var prox = range ? Number(range.split('-')[1]) + 1 : 0;
    return { ok: true, fim: false, proximo: prox };
  }
  return { ok: false, erro: 'drive ' + code };
}

function cabecalho_(r, nome) {
  var h = r.getAllHeaders();
  for (var k in h) if (k.toLowerCase() === nome) return Array.isArray(h[k]) ? h[k][0] : h[k];
  return null;
}

function txt_(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }
function mb_(n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB'; }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
