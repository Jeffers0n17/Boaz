/* ============================================================
   Boaz — Tapeçaria
   Site 3D: texturas procedurais + cenas Three.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helper de cor ---------- */
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(v, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  /* ============================================================
     TEXTURAS PROCEDURAIS
     ============================================================ */

  function createWeaveCanvas(size, palette) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#efe2c8";
    ctx.fillRect(0, 0, size, size);

    const threads = 26;
    const cell = size / threads;
    const bandSize = Math.ceil(threads / palette.length);

    for (let row = 0; row < threads; row++) {
      const bandIdx = Math.min(palette.length - 1, Math.floor(row / bandSize));
      const color = palette[bandIdx];
      const [r, g, b] = hexToRgb(color);
      for (let col = 0; col < threads; col++) {
        const over = (row + col) % 2 === 0;
        const x = col * cell;
        const y = row * cell;
        const tone = over ? 18 : -22;
        const [rr, gg, bb] = [r + tone, g + tone, b + tone];
        const grad = ctx.createLinearGradient(x, y, x, y + cell);
        grad.addColorStop(0, `rgba(${rr},${gg},${bb},1)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(1, `rgba(${rr - 10},${gg - 10},${bb - 10},1)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cell + 0.6, cell + 0.6);

        ctx.strokeStyle = `rgba(0,0,0,${over ? 0.12 : 0.22})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cell, cell);
      }
    }
    return canvas;
  }

  /* ---------- fotos reais (Kairogen) usadas como texturas de tecido ---------- */
  const REAL_TEXTURES = {
    kilim: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/c9a1260e-0e18-4581-90fa-a4f3d9f22807.jpg",
    tapestryWeave: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/cc237626-6d68-4574-91b2-76a8e5948da9.jpg",
    rawWool: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/611c7fca-7f5b-466c-a9b8-cce868e549f4.jpg",
  };

  /* Troca a textura procedural (sempre disponível de imediato) pela foto real
     assim que ela terminar de carregar — se falhar (rede/CORS), fica a
     textura procedural, sem quebrar a cena. */
  function upgradeToPhoto(texture, url) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      texture.image = img;
      texture.needsUpdate = true;
    };
    img.src = url;
  }

  function upgradeBackgroundToPhoto(el, url) {
    const img = new Image();
    img.onload = () => {
      el.style.transition = "opacity .6s ease";
      el.style.backgroundImage = `url(${url})`;
    };
    img.src = url;
  }

  /* Amostras estáticas usadas na seção "Sobre" */
  function paintSwatches() {
    const swatchA = document.getElementById("weave-swatch-a");
    const swatchB = document.getElementById("weave-swatch-b");
    if (swatchA) {
      const c = createWeaveCanvas(512, ["#a8402f", "#d9a441", "#33685f", "#e7d3ab"]);
      swatchA.style.backgroundImage = `url(${c.toDataURL()})`;
      swatchA.style.backgroundSize = "cover";
      upgradeBackgroundToPhoto(swatchA, REAL_TEXTURES.kilim);
    }
    if (swatchB) {
      const c = createWeaveCanvas(512, ["#e7d3ab", "#33685f", "#8a5a34"]);
      swatchB.style.backgroundImage = `url(${c.toDataURL()})`;
      swatchB.style.backgroundSize = "cover";
      upgradeBackgroundToPhoto(swatchB, REAL_TEXTURES.rawWool);
    }
  }

  /* ============================================================
     CENA 3D DE FUNDO (HERO)
     ============================================================ */

  function initHeroScene() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x241812, 0.05);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.3, 9);

    const ambient = new THREE.AmbientLight(0x6a4a30, 0.7);
    const key = new THREE.DirectionalLight(0xffe3b0, 1.1);
    key.position.set(4, 6, 5);
    const rim = new THREE.PointLight(0xd9a441, 1.2, 20);
    rim.position.set(-3, 2, 4);
    scene.add(ambient, key, rim);

    const world = new THREE.Group();
    scene.add(world);

    /* --- haste de madeira simples, só para pendurar as tapeçarias --- */
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a30, roughness: 0.55 });

    /* --- tapeçaria pendurada à direita --- */
    const weaveTex = new THREE.CanvasTexture(
      createWeaveCanvas(512, ["#a8402f", "#d9a441", "#33685f", "#e7d3ab"])
    );
    upgradeToPhoto(weaveTex, REAL_TEXTURES.kilim);
    const tapestryGeo = new THREE.PlaneGeometry(3.2, 4, 40, 50);
    const tapestryMat = new THREE.MeshStandardMaterial({
      map: weaveTex,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    const tapestry = new THREE.Mesh(tapestryGeo, tapestryMat);
    tapestry.position.set(3.1, 0.2, -0.5);
    world.add(tapestry);

    const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 12);
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(3.1, 2.25, -0.5);
    world.add(rod);

    const basePos = tapestryGeo.attributes.position.array.slice();

    /* --- segunda tapeçaria, menor, pendurada à esquerda (profundidade) --- */
    const weaveTex2 = new THREE.CanvasTexture(
      createWeaveCanvas(512, ["#e7d3ab", "#33685f", "#8a5a34"])
    );
    upgradeToPhoto(weaveTex2, REAL_TEXTURES.rawWool);
    const tapestryGeo2 = new THREE.PlaneGeometry(2.4, 3, 30, 38);
    const tapestryMat2 = new THREE.MeshStandardMaterial({
      map: weaveTex2,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    const tapestry2 = new THREE.Mesh(tapestryGeo2, tapestryMat2);
    tapestry2.position.set(-3.3, -0.5, -2.4);
    tapestry2.rotation.y = 0.5;
    world.add(tapestry2);

    const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 12), rodMat);
    rod2.rotation.z = Math.PI / 2;
    rod2.rotation.y = 0.5;
    rod2.position.set(-3.3, 0.95, -2.4);
    world.add(rod2);

    const basePos2 = tapestryGeo2.attributes.position.array.slice();

    /* --- partículas de fio flutuando, junto de cada tapeçaria --- */
    const threadBCount = 70;
    const threadBGeo = new THREE.BufferGeometry();
    const threadBPos = new Float32Array(threadBCount * 3);
    for (let i = 0; i < threadBCount; i++) {
      threadBPos[i * 3] = -3.3 + (Math.random() - 0.5) * 4;
      threadBPos[i * 3 + 1] = -1 + Math.random() * 4;
      threadBPos[i * 3 + 2] = -2 + (Math.random() - 0.5) * 3;
    }
    threadBGeo.setAttribute("position", new THREE.BufferAttribute(threadBPos, 3));
    const threadBMat = new THREE.PointsMaterial({
      color: 0xd9b579,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
    });
    const threadsB = new THREE.Points(threadBGeo, threadBMat);
    world.add(threadsB);

    const threadCount = 60;
    const threadGeo = new THREE.BufferGeometry();
    const threadPos = new Float32Array(threadCount * 3);
    for (let i = 0; i < threadCount; i++) {
      threadPos[i * 3] = 3.1 + (Math.random() - 0.5) * 4;
      threadPos[i * 3 + 1] = -1.5 + Math.random() * 5;
      threadPos[i * 3 + 2] = -0.5 + (Math.random() - 0.5) * 3;
    }
    threadGeo.setAttribute("position", new THREE.BufferAttribute(threadPos, 3));
    const threadMat = new THREE.PointsMaterial({
      color: 0xa8402f,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const threads = new THREE.Points(threadGeo, threadMat);
    world.add(threads);

    /* --- interação: mouse parallax --- */
    const mouse = { x: 0, y: 0 };
    window.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // ondulação suave da tapeçaria da direita
      const pos = tapestryGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = basePos[ix];
        const y = basePos[ix + 1];
        const wave =
          Math.sin(x * 1.4 + t * 1.1) * 0.06 + Math.sin(y * 1.8 + t * 0.8) * 0.05;
        pos.array[ix + 2] = basePos[ix + 2] + wave * (0.4 + (y + 2) / 4);
      }
      pos.needsUpdate = true;
      tapestry.rotation.y = -0.3 + mouse.x * 0.12;

      // ondulação suave da tapeçaria da esquerda (ritmo levemente diferente)
      const pos2 = tapestryGeo2.attributes.position;
      for (let i = 0; i < pos2.count; i++) {
        const ix = i * 3;
        const x = basePos2[ix];
        const y = basePos2[ix + 1];
        const wave =
          Math.sin(x * 1.6 + t * 0.9 + 2) * 0.05 + Math.sin(y * 1.5 + t * 1.2) * 0.04;
        pos2.array[ix + 2] = basePos2[ix + 2] + wave * (0.4 + (y + 1.5) / 3);
      }
      pos2.needsUpdate = true;
      tapestry2.rotation.y = 0.5 + mouse.x * 0.1;

      const bp = threadBGeo.attributes.position;
      for (let i = 0; i < threadBCount; i++) {
        bp.array[i * 3 + 1] += 0.004;
        if (bp.array[i * 3 + 1] > 3) bp.array[i * 3 + 1] = -1;
      }
      bp.needsUpdate = true;

      const tp = threadGeo.attributes.position;
      for (let i = 0; i < threadCount; i++) {
        tp.array[i * 3 + 1] += 0.006;
        tp.array[i * 3] += Math.sin(t + i) * 0.0015;
        if (tp.array[i * 3 + 1] > 3.5) tp.array[i * 3 + 1] = -1.5;
      }
      tp.needsUpdate = true;

      world.rotation.y += (mouse.x * 0.15 - world.rotation.y) * 0.02;
      camera.position.y = 0.3 + mouse.y * -0.3;
      camera.lookAt(0, 0.2, 0);

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ============================================================
     MINI CENA INTERATIVA (tapeçaria)
     ============================================================ */

  function initMiniScene(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === "undefined") return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0.6, 5.4);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffedcf, 1);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.PointLight(0xd9a441, 0.7, 12);
    fill.position.set(-3, -1, 3);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    const tex = new THREE.CanvasTexture(
      createWeaveCanvas(512, ["#33685f", "#d9a441", "#a8402f", "#e7d3ab"])
    );
    upgradeToPhoto(tex, REAL_TEXTURES.tapestryWeave);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide });
    const waveGeo = new THREE.PlaneGeometry(2.6, 3.2, 36, 44);
    const cloth = new THREE.Mesh(waveGeo, mat);
    group.add(cloth);
    const waveBase = waveGeo.attributes.position.array.slice();

    const rodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a24, roughness: 0.6 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 10), rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = 1.75;
    group.add(rod);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(canvas);
    resize();

    // arrastar para girar
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velY = 0.004;
    let velX = 0;

    function pointerDown(e) {
      dragging = true;
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX;
      lastY = p.clientY;
    }
    function pointerMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;
      velY = dx * 0.006;
      velX = dy * 0.006;
      group.rotation.y += velY;
      group.rotation.x = Math.max(-0.6, Math.min(0.6, group.rotation.x + velX));
    }
    function pointerUp() {
      dragging = false;
    }
    canvas.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("touchstart", pointerDown, { passive: true });
    window.addEventListener("touchmove", pointerMove, { passive: true });
    window.addEventListener("touchend", pointerUp);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!dragging) {
        velY *= 0.96;
        velX *= 0.94;
        group.rotation.y += velY + 0.0022;
        group.rotation.x += velX * 0.4;
        group.rotation.x *= 0.98;
      }

      const pos = waveGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = waveBase[ix];
        const y = waveBase[ix + 1];
        const wave = Math.sin(x * 1.6 + t * 1.3) * 0.045 + Math.sin(y * 1.2 + t) * 0.035;
        pos.array[ix + 2] = waveBase[ix + 2] + wave;
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ============================================================
     GALERIA — cards com textura procedural + tilt 3D
     ============================================================ */

  function buildGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;

    const pieces = [
      { title: "Manta Kilim", tag: "Tapeçaria", palette: ["#a8402f", "#d9a441", "#e7d3ab"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/d938120b-e81e-4fb0-b090-de9fde551389.jpg" },
      { title: "Painel Urdido", tag: "Tapeçaria", palette: ["#33685f", "#d9a441", "#a8402f"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/cdfed7a1-9cce-4fb0-84ad-0a16b723e053.jpg" },
      { title: "Tear Lã Crua", tag: "Tapeçaria", palette: ["#e7d3ab", "#33685f", "#8a5a34"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/26923a36-770a-424d-affb-93775d8b25ad.jpg" },
    ];

    pieces.forEach((p) => {
      // textura procedural como fundo imediato (evita flash em branco)
      const fallbackCanvas = createWeaveCanvas(400, p.palette);

      const card = document.createElement("div");
      card.className = "g-card reveal";
      card.innerHTML = `
        <div class="g-surface" style="background-image:url(${fallbackCanvas.toDataURL()});background-size:cover;position:absolute;inset:0;"></div>
        <div class="g-overlay">
          <span class="g-tag">${p.tag}</span>
          <h3>${p.title}</h3>
        </div>`;

      // troca para a foto realista assim que ela carregar (com fade suave)
      const surface = card.querySelector(".g-surface");
      const photo = new Image();
      photo.onload = () => {
        surface.style.transition = "opacity .5s ease";
        surface.style.backgroundImage = `url(${p.photo})`;
      };
      photo.src = p.photo;

      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateY(0) rotateX(0) translateY(0)";
      });

      grid.appendChild(card);
    });

    // observa os cards recém-criados para o efeito reveal
    document.querySelectorAll(".g-card.reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ============================================================
     UI: header, nav, reveal, form, loader
     ============================================================ */

  let revealObserver;

  function setupReveal() {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  }

  function setupHeader() {
    const header = document.getElementById("site-header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupNavToggle() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.classList.remove("open");
      })
    );
  }

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const note = document.getElementById("form-note");
    if (!form || !note) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.textContent = "Mensagem recebida! Em breve retornaremos o contato. (demonstração)";
      form.reset();
    });
  }

  function setupLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    window.addEventListener("load", () => {
      setTimeout(() => loader.classList.add("hidden"), 500);
    });
    // fallback caso 'load' demore
    setTimeout(() => loader.classList.add("hidden"), 3000);
  }

  /* ============================================================
     VÍDEO EM ROLAGEM — "Por dentro da trama"
     O vídeo avança quadro a quadro conforme a seção é rolada
     (a própria posição de rolagem controla o tempo do vídeo).
     ============================================================ */

  function setupScrollVideo() {
    const section = document.getElementById("trama");
    const video = document.getElementById("scroll-video");
    const progressBar = document.getElementById("video-progress-bar");
    const captionBox = document.getElementById("video-caption");
    const captionTitle = document.getElementById("video-caption-title");
    if (!section || !video) return;

    const captions = [
      { at: 0, text: "Cada peça começa pronta na imaginação" },
      { at: 0.32, text: "Camada por camada, o tecido ganha corpo" },
      { at: 0.68, text: "Do fio ao acabamento, tudo é decidido à mão" },
    ];
    let captionIndex = -1;

    function setCaption(idx) {
      if (idx === captionIndex || !captionBox || !captionTitle) return;
      captionIndex = idx;
      captionBox.style.opacity = "0";
      captionBox.style.transform = "translateX(-50%) translateY(10px)";
      setTimeout(() => {
        captionTitle.textContent = captions[idx].text;
        captionBox.style.opacity = "1";
        captionBox.style.transform = "translateX(-50%) translateY(0)";
      }, 220);
    }

    let ready = false;
    video.addEventListener("loadedmetadata", () => {
      ready = true;
      update();
    });

    // iOS exige um "gesto" para liberar o seek programático do vídeo.
    let unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      video.play().then(() => video.pause()).catch(() => {});
    }
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("scroll", unlock, { once: true, passive: true });

    let dirty = true;
    window.addEventListener(
      "scroll",
      () => {
        dirty = true;
      },
      { passive: true }
    );

    function update() {
      if (dirty && ready && video.duration) {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

        video.currentTime = progress * video.duration;
        if (progressBar) progressBar.style.width = `${progress * 100}%`;

        let idx = 0;
        for (let i = 0; i < captions.length; i++) {
          if (progress >= captions[i].at) idx = i;
        }
        setCaption(idx);

        dirty = false;
      }
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
    setupLoader();
    setupHeader();
    setupNavToggle();
    setupReveal();
    setupContactForm();
    setupScrollVideo();
    paintSwatches();
    buildGallery();
    initHeroScene();
    initMiniScene("fiber-canvas");
  });
})();
