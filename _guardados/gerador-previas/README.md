# Gerador das imagens de prévia (WhatsApp, Instagram, Google)

Gera as imagens 1200x630 de cada página com o visual do site.

1. Edite os textos e preços em `data.json`.
2. Rode: `node gen.js <pasta-de-saida> "$(cat data.json)"` (precisa do Playwright).
3. Converta para JPEG e salve em `gallery/` com um **nome novo** (ex.: `-v3.jpg`),
   e troque o endereço em `og:image` e `twitter:image` da página.
   O nome novo faz o WhatsApp e o Instagram buscarem a prévia atualizada.

Esta pasta não vai para o site publicado.
