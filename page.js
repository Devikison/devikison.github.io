/* Páginas internas: a página funciona sem JavaScript; aqui só atualiza o ano do rodapé. */
(function(){
  'use strict';
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
