# Carrossel de criativos (guardado, fora do site)

Faixa infinita de criativos que ficava logo abaixo da vitrine de sites, na seção de Projetos.
Foi tirada do site, mas a configuração está guardada aqui para voltar sem retrabalho.

**Nada nesta pasta vai para o ar.** O GitHub Pages não publica pastas que começam com `_`,
e o `.cpanel.yml` só copia o que está na raiz, `gallery/` e `assets/`.

## Como funcionava

- Anda sozinho, devagar, em loop sem emenda.
- Dá para arrastar com o dedo ou o mouse, com inércia. Depois de soltar, espera 2,2 s e volta a andar.
- No computador, fica mais lento com o mouse em cima.
- Toque ou clique abre a imagem grande (lightbox). Arrastar não abre.
- Parado para quem ativou "reduzir movimento". Fora da tela, não gasta processamento.

## Arquivos

| Arquivo | Onde colar |
| --- | --- |
| `carrossel.html` | `index.html`, na seção de Projetos, logo depois do `</div>` que fecha a vitrine (`.hs`) e antes do `</section>` |
| `carrossel.css` | no fim do `styles.css` |
| `carrossel.js` | no `app.js`, logo depois do bloco `LIGHTBOX` |

Depois de colar, suba o número de versão em `styles.css?v=` e `app.js?v=` no `index.html`
para o navegador baixar os arquivos novos.

## Imagens

As 14 imagens foram apagadas da pasta `gallery/`, mas continuam no histórico do Git.
Para trazer de volta exatamente as mesmas:

```bash
git checkout 88df7f1 -- 'gallery/carousel-*.jpg'
```

Para usar imagens novas: formato retrato 3:4 (1080 × 1440 px), nomes `carousel-01.jpg`,
`carousel-02.jpg`... em `gallery/`, e ajuste `TOTAL` no começo do `carrossel.js`.
