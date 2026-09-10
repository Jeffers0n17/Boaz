# Boaz — Tapeçaria

Site 3D (estático, sem build) de um ateliê fictício dedicado inteiramente
à **tapeçaria**. Feito em HTML + CSS + JavaScript puro, com
[Three.js](https://threejs.org/) para as cenas 3D.

## Destaques

- **Hero em 3D**: duas tapeçarias penduradas balançando suavemente, com
  partículas de fio flutuando e parallax pelo mouse.
- **Vídeo em rolagem** ("Por dentro da trama"): um vídeo de revelação em
  camadas avança quadro a quadro conforme a página é rolada — a posição de
  rolagem controla diretamente `video.currentTime` (técnica de scrollytelling,
  sem bibliotecas externas).
- **Texturas procedurais**: tramas de tecido são desenhadas em `<canvas>`
  via JavaScript (sem imagens externas) e usadas como texturas do Three.js
  e como imagens de fundo em CSS — servem de base imediata até a foto real
  (gerada com IA) terminar de carregar.
- **Mini cena interativa**: na seção "Tapeçaria", um tecido 3D ondulante
  pode ser girado por arraste (mouse ou toque).
- **Galeria** com efeito de inclinação 3D (tilt) ao passar o mouse.
- Animações de entrada por scroll (`IntersectionObserver`), menu responsivo,
  formulário de contato (estático/demonstração).

## Estrutura

```
index.html         marcação e conteúdo das seções
css/style.css       identidade visual (paleta têxtil)
js/main.js          cenas Three.js, geração de texturas, vídeo em rolagem, UI
js/vendor/           Three.js vendorizado (sem dependência de CDN)
video/exploded-view.mp4   vídeo usado na seção "Por dentro da trama"
```

## Rodando localmente

Não há dependências de build. Basta servir a pasta com qualquer servidor
estático, por exemplo:

```bash
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

(Abrir `index.html` diretamente pelo `file://` também funciona na maioria
dos navegadores modernos, exceto a seção de vídeo em rolagem em alguns
navegadores que restringem `fetch`/`video` por `file://` — nesse caso use
um servidor local.)

## Tecnologias

- HTML5 / CSS3 (variáveis CSS, grid, animações)
- JavaScript (ES2017+, sem framework)
- [Three.js r128](https://threejs.org/) (vendorizado localmente)
- Google Fonts: Cormorant Garamond + Inter
