/* ============================================================
   Boaz — Marcenaria & Tapeçaria
   Site 3D: texturas procedurais + cenas Three.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers de cor ---------- */
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(v, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  function shade(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + amt, g + amt, b + amt);
  }

  /* ============================================================
     TEXTURAS PROCEDURAIS
     ============================================================ */

  function createWoodCanvas(size, base, dark) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, shade(base, 22));
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, shade(base, -14));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const [dr, dg, db] = hexToRgb(dark);

    // veios longitudinais
    for (let i = 0; i < 46; i++) {
      let y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += size / 10) {
        y += (Math.random() - 0.5) * 22;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${dr},${dg},${db},${0.06 + Math.random() * 0.14})`;
      ctx.lineWidth = 0.6 + Math.random() * 2.2;
      ctx.stroke();
    }

    // nós da madeira
    for (let i = 0; i < 3; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const rings = 4 + Math.floor(Math.random() * 3);
      for (let r = rings; r > 0; r--) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 6, r * 4.2, Math.random() * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${dr},${dg},${db},${0.12 + (rings - r) * 0.05})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    // ruído sutil
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);

    return canvas;
  }

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

  /* Amostras estáticas usadas na seção "Sobre" */
  function paintSwatches() {
    const woodEl = document.getElementById("wood-swatch");
    const weaveEl = document.getElementById("weave-swatch");
    if (woodEl) {
      const c = createWoodCanvas(512, "#8a5a34", "#3a2413");
      woodEl.style.backgroundImage = `url(${c.toDataURL()})`;
      woodEl.style.backgroundSize = "cover";
    }
    if (weaveEl) {
      const c = createWeaveCanvas(512, ["#a8402f", "#d9a441", "#33685f", "#e7d3ab"]);
      weaveEl.style.backgroundImage = `url(${c.toDataURL()})`;
      weaveEl.style.backgroundSize = "cover";
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

    /* --- pilha de madeira (marcenaria) --- */
    const woodTex = new THREE.CanvasTexture(createWoodCanvas(512, "#8a5a34", "#3a2413"));
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.75, metalness: 0.05 });

    const woodGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.3, 1.7), woodMat);
      plank.position.set((Math.random() - 0.5) * 0.25, i * 0.34, (Math.random() - 0.5) * 0.15);
      plank.rotation.y = (Math.random() - 0.5) * 0.12;
      woodGroup.add(plank);
    }
    woodGroup.position.set(-3.3, -0.9, -1);
    woodGroup.rotation.y = 0.35;
    world.add(woodGroup);

    /* --- tapeçaria pendurada (fibra) --- */
    const weaveTex = new THREE.CanvasTexture(
      createWeaveCanvas(512, ["#a8402f", "#d9a441", "#33685f", "#e7d3ab"])
    );
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
    const rod = new THREE.Mesh(rodGeo, woodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(3.1, 2.25, -0.5);
    world.add(rod);

    const basePos = tapestryGeo.attributes.position.array.slice();

    /* --- partículas: serragem + fio --- */
    const dustCount = 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = -3.3 + (Math.random() - 0.5) * 4;
      dustPos[i * 3 + 1] = -1 + Math.random() * 4;
      dustPos[i * 3 + 2] = -1 + (Math.random() - 0.5) * 3;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd9b579,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    world.add(dust);

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

      woodGroup.rotation.y = 0.35 + Math.sin(t * 0.25) * 0.08 + mouse.x * 0.15;
      woodGroup.position.y = -0.9 + Math.sin(t * 0.6) * 0.05;

      // ondulação suave da tapeçaria
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

      const dp = dustGeo.attributes.position;
      for (let i = 0; i < dustCount; i++) {
        dp.array[i * 3 + 1] += 0.004;
        if (dp.array[i * 3 + 1] > 3) dp.array[i * 3 + 1] = -1;
      }
      dp.needsUpdate = true;

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
     MINI CENAS INTERATIVAS (marcenaria / tapeçaria)
     ============================================================ */

  function initMiniScene(canvasId, kind) {
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
    let waveGeo = null;
    let waveBase = null;

    if (kind === "wood") {
      const tex = new THREE.CanvasTexture(createWoodCanvas(512, "#96633a", "#3a2413"));
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.06 });

      // perfil torneado (bowl / peça de marcenaria)
      const points = [];
      const profile = [
        [0.02, -1.1], [0.55, -1.05], [0.62, -0.8], [0.5, -0.4],
        [0.62, 0.0], [0.7, 0.4], [0.55, 0.75], [0.3, 0.95], [0.05, 1.0],
      ];
      profile.forEach(([x, y]) => points.push(new THREE.Vector2(x, y)));
      const lathe = new THREE.LatheGeometry(points, 48);
      const bowl = new THREE.Mesh(lathe, mat);
      group.add(bowl);

      // pequenas aparas de madeira ao redor
      for (let i = 0; i < 5; i++) {
        const chip = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 10, Math.PI * 1.4), mat);
        chip.position.set((Math.random() - 0.5) * 2.2, -1.3 + Math.random() * 0.3, (Math.random() - 0.5) * 2);
        chip.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(chip);
      }
      group.scale.setScalar(1.1);
    } else {
      const tex = new THREE.CanvasTexture(
        createWeaveCanvas(512, ["#33685f", "#d9a441", "#a8402f", "#e7d3ab"])
      );
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide });
      waveGeo = new THREE.PlaneGeometry(2.6, 3.2, 36, 44);
      const cloth = new THREE.Mesh(waveGeo, mat);
      group.add(cloth);
      waveBase = waveGeo.attributes.position.array.slice();

      const rodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a24, roughness: 0.6 });
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 10), rodMat);
      rod.rotation.z = Math.PI / 2;
      rod.position.y = 1.75;
      group.add(rod);
    }

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

      if (waveGeo) {
        const pos = waveGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const ix = i * 3;
          const x = waveBase[ix];
          const y = waveBase[ix + 1];
          const wave = Math.sin(x * 1.6 + t * 1.3) * 0.045 + Math.sin(y * 1.2 + t) * 0.035;
          pos.array[ix + 2] = waveBase[ix + 2] + wave;
        }
        pos.needsUpdate = true;
      }

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
      { title: "Mesa Freijó", tag: "Marcenaria", type: "wood", base: "#8a5a34", dark: "#3a2413", photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/08bc0b08-71af-4f0e-b541-43bc1457ab34.jpg" },
      { title: "Manta Kilim", tag: "Tapeçaria", type: "fiber", palette: ["#a8402f", "#d9a441", "#e7d3ab"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/d938120b-e81e-4fb0-b090-de9fde551389.jpg" },
      { title: "Banco Cumaru", tag: "Marcenaria", type: "wood", base: "#5c3a24", dark: "#241206", photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/1ae6aab2-753e-477b-a454-dbaad594846c.jpg" },
      { title: "Painel Urdido", tag: "Tapeçaria", type: "fiber", palette: ["#33685f", "#d9a441", "#a8402f"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/cdfed7a1-9cce-4fb0-84ad-0a16b723e053.jpg" },
      { title: "Aparador Imbuia", tag: "Marcenaria", type: "wood", base: "#6b4226", dark: "#2c1a0d", photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/f3043dda-9e08-4c3b-a942-05c6f8fdd198.jpg" },
      { title: "Tear Lã Crua", tag: "Tapeçaria", type: "fiber", palette: ["#e7d3ab", "#33685f", "#8a5a34"], photo: "https://cdn.kairogen.ai/gallery/images/6a412d2e8cef6b158d5eb037/26923a36-770a-424d-affb-93775d8b25ad.jpg" },
    ];

    pieces.forEach((p) => {
      // textura procedural como fundo imediato (evita flash em branco)
      const fallbackCanvas =
        p.type === "wood"
          ? createWoodCanvas(400, p.base, p.dark)
          : createWeaveCanvas(400, p.palette);

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

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
    setupLoader();
    setupHeader();
    setupNavToggle();
    setupReveal();
    setupContactForm();
    paintSwatches();
    buildGallery();
    initHeroScene();
    initMiniScene("wood-canvas", "wood");
    initMiniScene("fiber-canvas", "fiber");
  });
})();
