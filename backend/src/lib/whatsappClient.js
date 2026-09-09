'use strict';

// Integração real com WhatsApp via whatsapp-web.js (biblioteca que controla
// um Chromium headless via Puppeteer e fala com o WhatsApp Web). Não precisa
// de nenhuma chave de API, mas precisa de um número de WhatsApp real
// escaneando o QR code para ficar "conectado" de verdade.
//
// A inicialização roda em segundo plano e NUNCA deve derrubar o servidor:
// qualquer erro (Chromium não consegue abrir, sandbox bloqueado, etc.) só
// marca o recurso como indisponível, o resto do app continua funcionando.

const path = require('node:path');
const QRCode = require('qrcode');

const DATA_DIR = process.env.AXIA_DATA_DIR || path.join(__dirname, '..', '..', 'data');

const state = {
  enabled: process.env.ENABLE_WHATSAPP !== 'false',
  status: 'disabled', // disabled | starting | qr_pending | ready | error | auth_failure
  qr: null,
  qrDataUrl: null,
  error: null,
  client: null,
};

async function start() {
  if (!state.enabled) {
    state.status = 'disabled';
    return;
  }

  state.status = 'starting';

  let Client, LocalAuth;
  try {
    ({ Client, LocalAuth } = require('whatsapp-web.js'));
  } catch (err) {
    state.status = 'error';
    state.error = `Falha ao carregar whatsapp-web.js: ${err.message}`;
    console.error('[whatsapp]', state.error);
    return;
  }

  const executablePath =
    process.env.WHATSAPP_CHROMIUM_PATH || '/opt/pw-browsers/chromium';

  try {
    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: path.join(DATA_DIR, 'wwebjs_auth') }),
      puppeteer: {
        executablePath: require('node:fs').existsSync(executablePath) ? executablePath : undefined,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
    });

    client.on('qr', async (qr) => {
      state.status = 'qr_pending';
      state.qr = qr;
      try {
        state.qrDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('[whatsapp] erro ao gerar data URL do QR:', err.message);
      }
      console.log('[whatsapp] QR code gerado — escaneie no WhatsApp do celular para conectar de verdade.');
    });

    client.on('ready', () => {
      state.status = 'ready';
      state.error = null;
      console.log('[whatsapp] cliente conectado e pronto.');
    });

    client.on('auth_failure', (msg) => {
      state.status = 'auth_failure';
      state.error = msg;
    });

    client.on('disconnected', (reason) => {
      state.status = 'error';
      state.error = `Desconectado: ${reason}`;
    });

    state.client = client;

    // client.initialize() nunca deve travar o boot do servidor — roda em segundo plano.
    client.initialize().catch((err) => {
      state.status = 'error';
      state.error = err.message;
      console.error('[whatsapp] falha ao inicializar o cliente (seguindo sem WhatsApp real):', err.message);
    });
  } catch (err) {
    state.status = 'error';
    state.error = err.message;
    console.error('[whatsapp] erro inesperado ao criar cliente:', err.message);
  }
}

async function sendMessage(to, text) {
  if (state.status !== 'ready' || !state.client) {
    console.log(`[whatsapp][demo] mensagem simulada para ${to}: ${text}`);
    return { demoMode: true, message: 'WhatsApp não conectado — mensagem apenas simulada/logada.' };
  }
  const chatId = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
  await state.client.sendMessage(chatId, text);
  return { demoMode: false };
}

function getStatus() {
  return {
    enabled: state.enabled,
    status: state.status,
    error: state.error,
    hasQr: Boolean(state.qr),
  };
}

function getQrDataUrl() {
  return state.qrDataUrl;
}

module.exports = { start, sendMessage, getStatus, getQrDataUrl };
