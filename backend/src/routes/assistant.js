'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const demoAssistant = require('../lib/demoAssistant');

const router = express.Router();
router.use(requireAuth);

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

let anthropicClient = null;
function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function loadUserData(userId) {
  return {
    tasks: db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC').all(userId),
    reminders: db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC').all(userId),
    events: db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY starts_at ASC').all(userId),
    transactions: db
      .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY occurred_at DESC')
      .all(userId),
  };
}

function buildSystemPrompt(user, data) {
  return [
    `Você é o AXIA, um assistente pessoal por voz/texto estilo Jarvis para ${user.name}.`,
    'Responda em português do Brasil, de forma direta, útil e simpática.',
    'Use os dados abaixo (mockados, apenas para esta demonstração) quando forem relevantes para a pergunta:',
    `Tarefas: ${JSON.stringify(data.tasks)}`,
    `Lembretes: ${JSON.stringify(data.reminders)}`,
    `Eventos: ${JSON.stringify(data.events)}`,
    `Transações: ${JSON.stringify(data.transactions)}`,
  ].join('\n');
}

router.post('/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'invalid_input', message: 'Envie { message: string }' });
  }

  const data = loadUserData(req.user.id);
  const client = getAnthropicClient();

  db.prepare('INSERT INTO chat_messages (user_id, role, content, demo_mode) VALUES (?, ?, ?, ?)').run(
    req.user.id,
    'user',
    message,
    client ? 0 : 1
  );

  let reply;
  let demoMode = false;

  if (client) {
    try {
      const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 512,
        system: buildSystemPrompt(req.user, data),
        messages: [{ role: 'user', content: message }],
      });
      reply = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim() || 'Desculpe, não consegui gerar uma resposta agora.';
    } catch (err) {
      console.error('[assistant] erro ao chamar Anthropic, caindo para modo demo:', err.message);
      reply = `[Aviso: falha ao chamar a API da Anthropic — ${err.message}]\n\n` + demoAssistant.answer(message, data);
      demoMode = true;
    }
  } else {
    reply = demoAssistant.answer(message, data);
    demoMode = true;
  }

  db.prepare('INSERT INTO chat_messages (user_id, role, content, demo_mode) VALUES (?, ?, ?, ?)').run(
    req.user.id,
    'assistant',
    reply,
    demoMode ? 1 : 0
  );

  res.json({ reply, demoMode, model: demoMode ? 'demo-rules' : ANTHROPIC_MODEL });
});

router.get('/history', (req, res) => {
  const rows = db
    .prepare('SELECT role, content, demo_mode as demoMode, created_at as createdAt FROM chat_messages WHERE user_id = ? ORDER BY id ASC')
    .all(req.user.id);
  res.json({ messages: rows });
});

module.exports = router;
