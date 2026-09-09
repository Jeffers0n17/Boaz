'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { db, seedMockDataForUser } = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'invalid_input', message: 'name, email e password são obrigatórios' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'weak_password', message: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'email_taken', message: 'Já existe uma conta com esse e-mail' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email.toLowerCase(), passwordHash);

  const userId = Number(info.lastInsertRowid);
  seedMockDataForUser(userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const token = signToken(user);

  return res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'invalid_input', message: 'email e password são obrigatórios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'E-mail ou senha incorretos' });
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
});

router.get('/me', require('../middleware/auth').requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'not_found' });
  return res.json({ user: publicUser(user) });
});

module.exports = router;
