/* Black Friday de lançamento da Descomplica Site.
   - Contagem regressiva em todo [data-bf-countdown].
   - Depois do fim (30/11 às 23h59, horário de Brasília), o site volta sozinho
     aos preços normais: some tudo que é .bf-only e aparece o que é .bf-off-only,
     e os botões de WhatsApp voltam à mensagem normal (data-wa-off). */
(function(){
  'use strict';
  var END = Date.UTC(2026, 11, 1, 2, 59, 59); // 30/11/2026 23:59:59 em Brasília (UTC-3)
  var root = document.documentElement;
  var WA = 'https://wa.me/5547992476541?text=';

  function end(){
    root.classList.add('bf-ended');
    var links = document.querySelectorAll('[data-wa-off]');
    for (var i = 0; i < links.length; i++){
      var off = links[i].getAttribute('data-wa-off');
      links[i].setAttribute('data-wa', off);
      links[i].href = WA + encodeURIComponent(off);
    }
  }
  if (Date.now() >= END){ end(); return; }

  var boxes = document.querySelectorAll('[data-bf-countdown]');
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function tick(){
    var left = Math.max(0, END - Date.now());
    if (!left){ end(); return; }
    var s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    for (var i = 0; i < boxes.length; i++){
      var b = boxes[i];
      b.querySelector('[data-d]').textContent = pad(d);
      b.querySelector('[data-h]').textContent = pad(h);
      b.querySelector('[data-m]').textContent = pad(m);
      b.querySelector('[data-s]').textContent = pad(sec);
    }
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  if (boxes.length) tick();
})();
