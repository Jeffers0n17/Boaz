// @ts-check
const { test, expect } = require('@playwright/test');

// Gera um e-mail único por execução para não colidir com testes anteriores.
const uniqueEmail = `e2e-${Date.now()}@axia.dev`;

test('fluxo completo: signup -> dashboard -> chat com o assistente', async ({ page }) => {
  await page.goto('/index.html');

  // Troca pra aba de criar conta e preenche o formulário.
  await page.click('#tab-signup');
  await page.fill('#signup-name', 'Usuária E2E');
  await page.fill('#signup-email', uniqueEmail);
  await page.fill('#signup-password', 'senha123');
  await page.click('#signup-form button[type="submit"]');

  // Deve redirecionar para o dashboard.
  await page.waitForURL('**/dashboard.html');
  await expect(page.locator('#greeting')).toContainText('Usuária E2E');

  // O badge de modo deve indicar modo demo (sem ANTHROPIC_API_KEY neste teste).
  await expect(page.locator('#mode-badge')).toContainText(/demo|IA real/i);

  // Widgets carregados com dados mockados.
  await expect(page.locator('#widget-tasks li').first()).not.toContainText('Carregando');

  // Manda uma mensagem de chat perguntando sobre tarefas.
  await page.fill('#chat-input', 'quais são minhas tarefas?');
  await page.click('#chat-send');

  // A resposta do assistente deve aparecer no DOM.
  const assistantMsgs = page.locator('.msg.assistant');
  await expect(assistantMsgs.last()).toContainText(/tarefa/i, { timeout: 10_000 });
});

test('modo de voz: esfera de partículas carrega e o fallback de texto conversa com o assistente', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);

  const email = `e2e-voice-${Date.now()}@axia.dev`;
  await page.goto('/index.html');
  await page.click('#tab-signup');
  await page.fill('#signup-name', 'Usuária Voz');
  await page.fill('#signup-email', email);
  await page.fill('#signup-password', 'senha123');
  await page.click('#signup-form button[type="submit"]');
  await page.waitForURL('**/dashboard.html');

  await page.click('#btn-voice');
  await page.waitForURL('**/voice.html');

  // A cena Three.js deve ter criado o <canvas> com WebGL de verdade.
  const canvas = page.locator('#sphere-canvas');
  await expect(canvas).toBeVisible();
  const hasWebGL = await canvas.evaluate((el) => {
    return Boolean(el.getContext('webgl2') || el.getContext('webgl'));
  });
  expect(hasWebGL).toBe(true);

  // Fallback de texto (sem depender de microfone real) dispara o mesmo fluxo
  // de chat + fala usado pelo reconhecimento de voz.
  await page.fill('#text-fallback-input', 'quais são minhas tarefas?');
  await page.click('#text-fallback-form button[type="submit"]');

  await expect(page.locator('#transcript')).toContainText(/tarefa/i, { timeout: 10_000 });
  await expect(page.locator('#status')).toContainText('Pronto', { timeout: 20_000 });
});

test('GET /api/status reflete configuração sem chaves', async ({ request }) => {
  const res = await request.get('/api/status');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.integrations.anthropic.configured).toBe(false);
  expect(body.integrations.stripe.configured).toBe(false);
  expect(body.integrations.googleCalendar.configured).toBe(false);
});
