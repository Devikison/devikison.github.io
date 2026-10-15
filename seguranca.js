// Segurança: impede que o site seja exibido dentro de outro site (golpe de clique / clickjacking).
// Precisa ser o primeiro script da página. No GitHub Pages não dá para enviar o cabeçalho
// X-Frame-Options / frame-ancestors, então a proteção é feita aqui.
(function () {
  if (window.top === window.self) return;
  try { window.top.location.replace(window.self.location.href); }
  catch (e) { document.documentElement.style.display = 'none'; }
})();
