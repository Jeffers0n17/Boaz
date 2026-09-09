'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/tasks', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC')
    .all(req.user.id);
  res.json({ tasks: rows });
});

router.post('/tasks', (req, res) => {
  const { title, dueDate } = req.body || {};
  if (!title) return res.status(400).json({ error: 'invalid_input', message: 'title é obrigatório' });
  const info = db
    .prepare('INSERT INTO tasks (user_id, title, due_date) VALUES (?, ?, ?)')
    .run(req.user.id, title, dueDate || null);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json({ task });
});

router.patch('/tasks/:id', (req, res) => {
  const { done } = req.body || {};
  db.prepare('UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?').run(
    done ? 1 : 0,
    req.params.id,
    req.user.id
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'not_found' });
  res.json({ task });
});

router.get('/reminders', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC')
    .all(req.user.id);
  res.json({ reminders: rows });
});

router.get('/events', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM events WHERE user_id = ? ORDER BY starts_at ASC')
    .all(req.user.id);
  res.json({ events: rows });
});

router.get('/transactions', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY occurred_at DESC')
    .all(req.user.id);
  const balance = rows.reduce((sum, t) => sum + t.amount, 0);
  res.json({ transactions: rows, balance: Math.round(balance * 100) / 100 });
});

router.get('/summary', (req, res) => {
  const userId = req.user.id;
  const tasks = db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE user_id = ? AND done = 0').get(userId).c;
  const reminders = db.prepare('SELECT COUNT(*) AS c FROM reminders WHERE user_id = ?').get(userId).c;
  const events = db.prepare('SELECT COUNT(*) AS c FROM events WHERE user_id = ?').get(userId).c;
  const balanceRow = db.prepare('SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ?').get(userId);
  res.json({
    openTasks: tasks,
    reminders,
    upcomingEvents: events,
    balance: Math.round(balanceRow.balance * 100) / 100,
  });
});

module.exports = router;
