'use strict';

require('dotenv').config();

const path = require('node:path');
const express = require('express');
const cors = require('cors');

const { init: initDb } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const assistantRoutes = require('./src/routes/assistant');
const billingRoutes = require('./src/routes/billing');
const googleRoutes = require('./src/routes/integrations/google');
const whatsappRoutes = require('./src/routes/integrations/whatsapp');
const statusRoutes = require('./src/routes/status');
const ttsRoutes = require('./src/routes/tts');
const whatsappClient = require('./src/lib/whatsappClient');

initDb();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/integrations/google', googleRoutes);
app.use('/api/integrations/whatsapp', whatsappRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/status', statusRoutes);

// Frontend estático (HTML/CSS/JS puro)
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// 404 para rotas de API desconhecidas (evita cair no fallback de HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not_found', message: `Rota ${req.method} ${req.originalUrl} não existe` });
});

// Qualquer outra rota GET cai no index (SPA-like, útil para links diretos)
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] erro não tratado:', err);
  res.status(500).json({ error: 'internal_error', message: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`AXIA backend rodando em http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'configurada (modo real)' : 'ausente (chat em modo demo)'}`);
});

// Inicializa o cliente do WhatsApp em segundo plano — nunca bloqueia o boot.
whatsappClient.start();
