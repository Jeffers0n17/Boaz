// AXIA - cliente de API puro (sem framework), usado por index.html e dashboard.html.
const AxiaAPI = (() => {
  const TOKEN_KEY = 'axia_token';
  const USER_KEY = 'axia_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function saveSession({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Erro ${res.status}`);
    }
    return data;
  }

  return {
    getToken,
    getUser,
    saveSession,
    clearSession,
    signup: (name, email, password) => request('/api/auth/signup', { method: 'POST', body: { name, email, password }, auth: false }),
    login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    me: () => request('/api/auth/me'),
    summary: () => request('/api/dashboard/summary'),
    tasks: () => request('/api/dashboard/tasks'),
    reminders: () => request('/api/dashboard/reminders'),
    events: () => request('/api/dashboard/events'),
    transactions: () => request('/api/dashboard/transactions'),
    chat: (message) => request('/api/assistant/chat', { method: 'POST', body: { message } }),
    chatHistory: () => request('/api/assistant/history'),
    status: () => request('/api/status', { auth: false }),
    createCheckoutSession: () => request('/api/billing/create-checkout-session', { method: 'POST' }),
    billingStatus: () => request('/api/billing/status'),
    googleAuth: () => request('/api/integrations/google/auth'),
    googleConnectDemo: () => request('/api/integrations/google/connect-demo', { method: 'POST' }),
    googleStatus: () => request('/api/integrations/google/status'),
    whatsappStatus: () => request('/api/integrations/whatsapp/status'),
  };
})();
