'use strict';

// Assistente "demo": responde por regras simples sobre os dados mockados do
// usuário, sem chamar nenhuma IA. Usado quando ANTHROPIC_API_KEY não está
// configurada, para que o fluxo de chat continue 100% testável de ponta a
// ponta mesmo sem a chave.

function formatCurrency(value, currency = 'BRL') {
  const sign = value < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(value).toFixed(2)}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function answer(message, data) {
  const text = (message || '').toLowerCase();
  const { tasks, reminders, events, transactions } = data;

  if (/tarefa/.test(text)) {
    const open = tasks.filter((t) => !t.done);
    if (open.length === 0) return 'Você não tem tarefas pendentes. 🎉';
    const list = open.slice(0, 5).map((t) => `• ${t.title} (até ${formatDate(t.due_date)})`).join('\n');
    return `Você tem ${open.length} tarefa(s) pendente(s):\n${list}`;
  }

  if (/lembrete/.test(text)) {
    if (reminders.length === 0) return 'Você não tem lembretes cadastrados.';
    const list = reminders.slice(0, 5).map((r) => `• ${r.text} — ${formatDate(r.remind_at)}`).join('\n');
    return `Seus próximos lembretes:\n${list}`;
  }

  if (/(evento|agenda|compromisso|reuni[aã]o)/.test(text)) {
    if (events.length === 0) return 'Não há eventos na sua agenda.';
    const list = events.slice(0, 5).map((e) => `• ${e.title} — ${formatDate(e.starts_at)}${e.location ? ` (${e.location})` : ''}`).join('\n');
    return `Sua agenda:\n${list}`;
  }

  if (/(saldo|balan[cç]o)/.test(text)) {
    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
    return `Seu saldo atual é ${formatCurrency(balance)}.`;
  }

  if (/(transa[cç][aã]o|gasto|despesa|receita|extrato)/.test(text)) {
    if (transactions.length === 0) return 'Não há transações registradas.';
    const list = transactions.slice(0, 5).map((t) => `• ${t.description}: ${formatCurrency(t.amount, t.currency)}`).join('\n');
    return `Suas últimas transações:\n${list}`;
  }

  if (/(oi|ol[aá]|bom dia|boa tarde|boa noite|hello|hi)\b/.test(text)) {
    return 'Olá! Eu sou o AXIA (em modo demo, sem IA real conectada). Posso te contar sobre suas tarefas, lembretes, eventos ou transações. O que você quer saber?';
  }

  // Fallback: resumo geral
  const openTasks = tasks.filter((t) => !t.done).length;
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  return (
    `[Modo demo — sem ANTHROPIC_API_KEY configurada, então não estou usando IA de verdade]\n` +
    `Aqui vai um resumo: você tem ${openTasks} tarefa(s) pendente(s), ${reminders.length} lembrete(s), ` +
    `${events.length} evento(s) na agenda e um saldo de ${formatCurrency(balance)}. ` +
    `Pergunte sobre "tarefas", "lembretes", "eventos" ou "transações" para mais detalhes.`
  );
}

module.exports = { answer };
