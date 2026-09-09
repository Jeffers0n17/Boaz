// AXIA — Modo de voz: esfera de partículas brancas (estilo Jarvis) que reage
// em tempo real ao volume do áudio (microfone do usuário enquanto ouve, e
// ao áudio da resposta falada do assistente enquanto fala).
import * as THREE from './vendor/three.module.min.js';

// `AxiaAPI` vem de /app.js (script clássico carregado antes deste módulo).
if (!AxiaAPI.getToken()) {
  window.location.href = '/index.html';
}

const canvas = document.getElementById('sphere-canvas');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const micBtn = document.getElementById('mic-btn');
const textForm = document.getElementById('text-fallback-form');
const textInput = document.getElementById('text-fallback-input');

// ---------------------------------------------------------------------------
// Cena Three.js: esfera feita de milhares de partículas brancas.
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 4000;
const BASE_RADIUS = 1.6;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5.6;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05070f, 1);

// Distribui os pontos uniformemente na superfície de uma esfera (espiral de
// Fibonacci), guardando a direção unitária de cada partícula pra poder
// "inflar"/"desinflar" o raio dela a cada frame sem perder a distribuição.
const directions = new Float32Array(PARTICLE_COUNT * 3);
const phases = new Float32Array(PARTICLE_COUNT);
const freqs = new Float32Array(PARTICLE_COUNT);
const positions = new Float32Array(PARTICLE_COUNT * 3);

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2; // de 1 a -1
  const radiusAtY = Math.sqrt(1 - y * y);
  const theta = goldenAngle * i;
  const x = Math.cos(theta) * radiusAtY;
  const z = Math.sin(theta) * radiusAtY;

  directions[i * 3] = x;
  directions[i * 3 + 1] = y;
  directions[i * 3 + 2] = z;

  phases[i] = Math.random() * Math.PI * 2;
  freqs[i] = 0.6 + Math.random() * 1.8;

  positions[i * 3] = x * BASE_RADIUS;
  positions[i * 3 + 1] = y * BASE_RADIUS;
  positions[i * 3 + 2] = z * BASE_RADIUS;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.026,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const sphere = new THREE.Points(geometry, material);
sphere.position.y = 0.55; // desloca a esfera pra cima, sobrando espaço pro overlay de texto embaixo
scene.add(sphere);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// Análise de áudio em tempo real (Web Audio API).
// Um único AudioContext é compartilhado entre o medidor do microfone e o
// medidor do áudio de resposta (TTS), trocando qual AnalyserNode está ativo
// conforme o estado (ouvindo vs. falando).
// ---------------------------------------------------------------------------

let audioCtx = null;
let micAnalyser = null;
let micData = null;
let ttsAnalyser = null;
let ttsData = null;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function startMicLevelMeter() {
  if (micAnalyser) return; // já iniciado nesta sessão de página
  ensureAudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);
  micAnalyser = audioCtx.createAnalyser();
  micAnalyser.fftSize = 256;
  micAnalyser.smoothingTimeConstant = 0.6;
  source.connect(micAnalyser);
  micData = new Uint8Array(micAnalyser.frequencyBinCount);
}

function readLevel(analyser, data) {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  return sum / data.length / 255; // 0..1
}

/** Toca um Blob de áudio (mp3 da ElevenLabs) analisando o volume em tempo real. */
function playAudioBlobWithAnalyser(blob) {
  return new Promise((resolve) => {
    ensureAudioContext();
    const audioEl = new Audio(URL.createObjectURL(blob));
    const source = audioCtx.createMediaElementSource(audioEl);
    ttsAnalyser = audioCtx.createAnalyser();
    ttsAnalyser.fftSize = 256;
    ttsAnalyser.smoothingTimeConstant = 0.5;
    ttsData = new Uint8Array(ttsAnalyser.frequencyBinCount);
    source.connect(ttsAnalyser);
    ttsAnalyser.connect(audioCtx.destination);

    const cleanup = () => {
      ttsAnalyser = null;
      URL.revokeObjectURL(audioEl.src);
      resolve();
    };
    audioEl.addEventListener('ended', cleanup);
    audioEl.addEventListener('error', cleanup);
    audioEl.play().catch(cleanup);
  });
}

/** Fallback offline: fala pelo motor do navegador (Web Speech API). Sem
 * acesso ao sinal de áudio real, a esfera usa uma "respiração" simulada
 * enquanto `speechSynthesis.speaking` for true. */
function speakWithBrowserTTS(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    // Alguns navegadores/ambientes (ex: Chromium headless, sem engine de voz)
    // nunca disparam onend — sem isso a esfera ficaria travada em "Falando…".
    const safetyTimeout = setTimeout(finish, 12000);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.onend = () => { clearTimeout(safetyTimeout); finish(); };
    utterance.onerror = () => { clearTimeout(safetyTimeout); finish(); };
    window.speechSynthesis.speak(utterance);
  });
}

function simulatedSpeakingLevel(t) {
  return 0.35 + 0.25 * Math.abs(Math.sin(t * 6));
}

// ---------------------------------------------------------------------------
// Loop de animação: o "level" (0..1) do estado atual deforma a esfera.
// ---------------------------------------------------------------------------

const clock = new THREE.Clock();
let state = 'idle'; // idle | listening | thinking | speaking
let smoothedLevel = 0;

function setState(next, label) {
  state = next;
  statusEl.textContent = label;
  micBtn.classList.toggle('listening', next === 'listening');
}

function currentRawLevel(t) {
  if (state === 'listening') return readLevel(micAnalyser, micData);
  if (state === 'speaking') {
    return ttsAnalyser ? readLevel(ttsAnalyser, ttsData) : simulatedSpeakingLevel(t);
  }
  if (state === 'thinking') return 0.12 + 0.05 * Math.sin(t * 3);
  return 0.05 + 0.03 * Math.sin(t * 0.8); // idle: respiração bem sutil
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  const raw = currentRawLevel(t);
  smoothedLevel += (raw - smoothedLevel) * 0.25;

  const pos = geometry.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const wobble = Math.sin(t * freqs[i] + phases[i]) * (0.04 + smoothedLevel * 0.5);
    const radius = BASE_RADIUS * (1 + smoothedLevel * 0.22 + wobble * 0.06);
    pos[i * 3] = directions[i * 3] * radius;
    pos[i * 3 + 1] = directions[i * 3 + 1] * radius;
    pos[i * 3 + 2] = directions[i * 3 + 2] * radius;
  }
  geometry.attributes.position.needsUpdate = true;

  sphere.rotation.y += 0.0018 + smoothedLevel * 0.01;
  sphere.rotation.x = Math.sin(t * 0.15) * 0.08;

  renderer.render(scene, camera);
}
animate();

// ---------------------------------------------------------------------------
// Reconhecimento de fala + chat com o backend
// ---------------------------------------------------------------------------

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognitionImpl) {
  recognition = new SpeechRecognitionImpl();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    transcriptEl.textContent = `Você: ${text}`;
    handleUserMessage(text);
  };
  recognition.onerror = (event) => {
    console.error('[voice] erro no reconhecimento de fala:', event.error);
    setState('idle', 'Não entendi — tente de novo');
  };
  recognition.onend = () => {
    if (state === 'listening') setState('idle', 'Pronto');
  };
} else {
  micBtn.disabled = true;
  micBtn.title = 'Seu navegador não suporta reconhecimento de fala. Use o campo de texto abaixo.';
  statusEl.textContent = 'Reconhecimento de fala indisponível neste navegador — use o texto abaixo.';
}

micBtn.addEventListener('click', async () => {
  if (state === 'listening') {
    recognition.stop();
    return;
  }
  try {
    await startMicLevelMeter();
  } catch (err) {
    alert(`Não consegui acessar o microfone: ${err.message}`);
    return;
  }
  transcriptEl.textContent = '';
  setState('listening', 'Ouvindo…');
  recognition.start();
});

textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = '';
  transcriptEl.textContent = `Você: ${text}`;
  handleUserMessage(text);
});

async function handleUserMessage(text) {
  setState('thinking', 'Pensando…');
  try {
    const result = await AxiaAPI.chat(text);
    transcriptEl.textContent = `AXIA: ${result.reply}`;
    await speak(result.reply);
  } catch (err) {
    transcriptEl.textContent = `Erro: ${err.message}`;
  } finally {
    setState('idle', 'Pronto');
  }
}

async function speak(text) {
  setState('speaking', 'Falando…');
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AxiaAPI.getToken()}` },
      body: JSON.stringify({ text }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('audio')) {
      const blob = await res.blob();
      await playAudioBlobWithAnalyser(blob);
      return;
    }
  } catch (err) {
    console.warn('[voice] TTS real (ElevenLabs) indisponível, usando voz do navegador:', err.message);
  }
  await speakWithBrowserTTS(text);
}
