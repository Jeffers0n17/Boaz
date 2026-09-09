# Boaz — Marcenaria & Tapeçaria

Site 3D (estático, sem build) apresentando um ateliê fictício que une
**marcenaria** e **tapeçaria**. Feito em HTML + CSS + JavaScript puro, com
[Three.js](https://threejs.org/) para as cenas 3D.

## Destaques

- **Hero em 3D**: cena de fundo com uma pilha de tábuas de madeira e uma
  tapeçaria pendurada balançando suavemente, partículas de serragem e fio,
  com parallax pelo mouse.
- **Texturas procedurais**: veios de madeira e tramas de tecido são
  desenhados em `<canvas>` via JavaScript (sem imagens externas) e usados
  como texturas do Three.js e como imagens de fundo em CSS.
- **Mini cenas interativas**: nas seções "Marcenaria" e "Tapeçaria", peças
  3D (uma tigela torneada e um tecido ondulante) podem ser giradas por
  arraste (mouse ou toque).
- **Galeria** com efeito de inclinação 3D (tilt) ao passar o mouse.
- Animações de entrada por scroll (`IntersectionObserver`), menu responsivo,
  formulário de contato (estático/demonstração).

## Estrutura

```
index.html        marcação e conteúdo das seções
css/style.css      identidade visual (tons de madeira + paleta têxtil)
js/main.js         cenas Three.js, geração de texturas, interações de UI
```

## Rodando localmente

Não há dependências de build. Basta servir a pasta com qualquer servidor
estático, por exemplo:

```bash
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

(Abrir `index.html` diretamente pelo `file://` também funciona na maioria
dos navegadores modernos.)

## Tecnologias

- HTML5 / CSS3 (variáveis CSS, grid, animações)
- JavaScript (ES2017+, sem framework)
- [Three.js r128](https://threejs.org/) via CDN (cdnjs)
- Google Fonts: Cormorant Garamond + Inter
