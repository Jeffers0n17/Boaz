'use strict';

// Usa o módulo nativo `node:sqlite` (estável a partir do Node 22.5, sem
// necessidade de compilar nenhum módulo nativo como better-sqlite3/sqlite3).
// Isso evita toda a dor de node-gyp tanto local quanto dentro do Docker.
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = process.env.AXIA_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = process.env.AXIA_DB_PATH || path.join(DATA_DIR, 'axia.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
}

/** Popula dados mockados (tarefas/lembretes/eventos/transações) para um usuário novo. */
function seedMockDataForUser(userId) {
  const today = new Date();
  const iso = (d) => d.toISOString();
  const plusDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const insertTask = db.prepare(
    'INSERT INTO tasks (user_id, title, done, due_date) VALUES (?, ?, ?, ?)'
  );
  const insertReminder = db.prepare(
    'INSERT INTO reminders (user_id, text, remind_at) VALUES (?, ?, ?)'
  );
  const insertEvent = db.prepare(
    'INSERT INTO events (user_id, title, starts_at, ends_at, location, source) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertTransaction = db.prepare(
    'INSERT INTO transactions (user_id, description, amount, currency, occurred_at, category) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const tasks = [
    ['Revisar proposta do cliente', 0, iso(plusDays(0))],
    ['Responder e-mails pendentes', 0, iso(plusDays(0))],
    ['Preparar apresentação da reunião', 0, iso(plusDays(1))],
    ['Pagar conta de internet', 1, iso(plusDays(-2))],
    ['Agendar consulta médica', 0, iso(plusDays(3))],
  ];
  for (const [title, done, due] of tasks) insertTask.run(userId, title, done, due);

  const reminders = [
    ['Beber água', iso(new Date(today.getTime() + 60 * 60 * 1000))],
    ['Reunião de equipe às 15h', iso(plusDays(0))],
    ['Levar o carro para revisão', iso(plusDays(2))],
  ];
  for (const [text, remindAt] of reminders) insertReminder.run(userId, text, remindAt);

  const events = [
    ['Reunião com o time de produto', iso(plusDays(0)), iso(plusDays(0)), 'Google Meet', 'mock'],
    ['Almoço com cliente', iso(plusDays(1)), iso(plusDays(1)), 'Restaurante Central', 'mock'],
    ['Dentista', iso(plusDays(4)), iso(plusDays(4)), 'Clínica Sorriso', 'mock'],
  ];
  for (const [title, starts, ends, location, source] of events) {
    insertEvent.run(userId, title, starts, ends, location, source);
  }

  const transactions = [
    ['Salário', 5200.0, 'BRL', iso(plusDays(-5)), 'renda'],
    ['Supermercado', -320.45, 'BRL', iso(plusDays(-3)), 'alimentação'],
    ['Assinatura streaming', -39.9, 'BRL', iso(plusDays(-2)), 'lazer'],
    ['Uber', -28.5, 'BRL', iso(plusDays(-1)), 'transporte'],
    ['Freelance', 850.0, 'BRL', iso(plusDays(-1)), 'renda extra'],
  ];
  for (const [description, amount, currency, occurredAt, category] of transactions) {
    insertTransaction.run(userId, description, amount, currency, occurredAt, category);
  }
}

module.exports = { db, init, seedMockDataForUser };
