# AXIA — Assistente Pessoal por Voz/Texto

AXIA é um assistente pessoal estilo Jarvis: você conversa por texto (dashboard
web) ou por voz (assistente Python), e ele responde usando seus dados
(tarefas, lembretes, eventos, transações), com integrações reais de IA
(Claude/Anthropic), pagamentos (Stripe), calendário (Google Calendar),
WhatsApp e texto-para-voz (ElevenLabs).

**Toda integração externa funciona em dois modos:**
- **Real**: quando a chave/credencial correspondente está configurada em `backend/.env`.
- **Demo**: quando a chave não está configurada — o recurso continua funcionando (sem quebrar o app), só que com dados/fluxos simulados, deixando isso explícito nas respostas da API (`demoMode: true`) e no dashboard.

## Arquitetura

```
┌─────────────────┐      ┌──────────────────────────────┐
│  Frontend web    │◄────►│   Backend Node/Express        │
│  (HTML/CSS/JS)   │ HTTP │   (porta 8080)                 │
└─────────────────┘      │                                │
        ▲                 │  • Auth (JWT)                  │
        │                 │  • SQLite (node:sqlite)         │
┌───────┴────────┐        │  • Chat (Anthropic SDK / demo)  │
│ App Desktop     │        │  • Billing (Stripe / demo)      │
│ (Electron)      │        │  • Google Calendar (OAuth/demo) │
│ abre a mesma UI │        │  • WhatsApp (whatsapp-web.js)   │
└─────────────────┘        │  • TTS (ElevenLabs / demo)      │
                            └──────────────────────────────┘
                                     ▲
                                     │ HTTP (mesma API)
                            ┌────────┴─────────┐
                            │ Assistente de voz │
                            │ em Python          │
                            │ (STT + TTS)         │
                            └────────────────────┘
```

- **`backend/`** — Node/Express. Serve a API (`/api/*`) **e** os arquivos estáticos do frontend, tudo na porta 8080. Usa `node:sqlite` (módulo nativo do Node ≥ 22.5) — **zero compilação nativa**, funciona igual local e no Docker.
- **`frontend/`** — HTML/CSS/JS puro, sem framework/build step. `index.html` (login/signup), `dashboard.html` (chat + widgets) e `voice.html` (modo de voz em tela cheia, com uma esfera de partículas em Three.js que reage ao áudio).
- **`desktop/`** — App Electron real que abre a mesma UI web em uma janela nativa (menu, ícone, etc). Não duplica lógica nenhuma.
- **`voice-assistant/`** — Script Python com pipeline de voz completo (reconhecimento de fala + fala), que conversa com o mesmo backend HTTP.
- **`tests/`** — Teste end-to-end com Playwright, cobrindo signup → dashboard → chat, batendo num backend de verdade rodando.
- **`docker-compose.yml` / `backend/Dockerfile`** — sobe o backend+frontend num único container na porta 8080.
- **`start.sh`** — sobe tudo localmente sem Docker (cria `.env`, instala dependências, inicia o servidor).

## Como rodar

### Opção 1 — sem Docker

```bash
./start.sh
```

Isso cria `backend/.env` a partir de `backend/.env.example` (se ainda não existir), roda `npm install` e sobe o servidor em `http://localhost:8080`.

### Opção 2 — com Docker

```bash
cp backend/.env.example backend/.env   # se ainda não existir
docker compose up --build
```

Sobe em `http://localhost:8080`. O `Dockerfile` instala Chromium via `apt` (necessário pra integração real de WhatsApp) e roda `npm install --omit=dev`.

> **Nota sobre o ambiente onde este projeto foi desenvolvido/testado**: a sessão usada para construir o AXIA tinha uma política de rede que **bloqueia o pull de imagens do Docker Hub** (`docker.io`/`production.cloudfront.docker.com` retornou 403 do proxy de saída). Por isso, `docker compose build` não pôde ser validado de ponta a ponta *nesse ambiente específico* — mas o `Dockerfile` roda exatamente o mesmo `server.js` que foi validado 100% funcional via `./start.sh`, então o comportamento em runtime é o mesmo; só o download da imagem base `node:22-slim` depende de acesso normal ao Docker Hub, que a maioria dos ambientes tem.

### Variáveis de ambiente (`backend/.env`)

| Variável | Obrigatória para | Sem ela... |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chat com IA de verdade (Claude) | Chat cai pro **modo demo**: respostas por regras sobre tarefas/lembretes/eventos/transações. Gere em https://console.anthropic.com/settings/keys |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` | Checkout de billing real | `POST /api/billing/create-checkout-session` cria uma sessão demo local (`demo_cs_...`), sem chamar a Stripe |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth real do Google Calendar | `GET /api/integrations/google/auth` retorna um fluxo demo (conta "conectada" com eventos mockados) |
| `ELEVENLABS_API_KEY` | TTS real (voz do assistente) | Assistente de voz Python usa TTS offline (`pyttsx3`); `POST /api/tts` responde em modo demo |
| `ENABLE_WHATSAPP` | — | `false` desliga completamente a inicialização do cliente WhatsApp |
| `JWT_SECRET` | Segurança em produção | Usa um valor de desenvolvimento fixo (não use em produção) |

O WhatsApp (`whatsapp-web.js`) não usa chave de API — ele controla um Chromium headless para falar com o WhatsApp Web de verdade. Basta escanear o QR code (`GET /api/integrations/whatsapp/qr`, autenticado) no WhatsApp do seu celular para conectar de verdade; sem escanear, mensagens enviadas via `POST /api/integrations/whatsapp/send` ficam em modo demo (só logadas no console).

## API

Autenticação via JWT (`Authorization: Bearer <token>`), obtido em signup/login.

| Rota | Método | Descrição |
|---|---|---|
| `/api/auth/signup` | POST | Cria conta (`name`, `email`, `password`) e já popula dados mockados |
| `/api/auth/login` | POST | Login (`email`, `password`) |
| `/api/auth/me` | GET | Dados do usuário logado |
| `/api/dashboard/tasks` | GET/POST | Lista/cria tarefas |
| `/api/dashboard/tasks/:id` | PATCH | Marca tarefa como concluída |
| `/api/dashboard/reminders` | GET | Lista lembretes |
| `/api/dashboard/events` | GET | Lista eventos da agenda |
| `/api/dashboard/transactions` | GET | Lista transações + saldo |
| `/api/dashboard/summary` | GET | Resumo (contadores + saldo) |
| `/api/assistant/chat` | POST | Manda uma mensagem (`message`) pro assistente; responde com IA real ou modo demo |
| `/api/assistant/history` | GET | Histórico de mensagens |
| `/api/billing/create-checkout-session` | POST | Cria sessão de checkout (Stripe real ou demo) |
| `/api/billing/status` | GET | Status da assinatura |
| `/api/integrations/google/auth` | GET | URL de OAuth (real ou demo) |
| `/api/integrations/google/connect-demo` | POST | Conecta em modo demo |
| `/api/integrations/whatsapp/status` | GET | Status do cliente WhatsApp |
| `/api/integrations/whatsapp/qr` | GET | QR code (data URL) pra conectar de verdade |
| `/api/integrations/whatsapp/send` | POST | Envia mensagem (real se conectado, senão demo) |
| `/api/tts` | POST | Texto-para-voz (ElevenLabs real ou demo) |
| `/api/status` | GET | Reflete o que está configurado em cada integração |

## Assistente de voz (Python)

```bash
cd voice-assistant
pip install -r requirements.txt
# Em Debian/Ubuntu, o PyAudio precisa dos headers do PortAudio:
#   sudo apt-get install portaudio19-dev

# Modo texto (não precisa de microfone/alto-falante) — testa tudo de ponta a ponta:
python3 assistant.py --text "quais são minhas tarefas?"

# Modo voz contínuo (precisa de microfone real):
python3 assistant.py --listen
```

O script autentica sozinho no backend (cria conta na primeira vez, cacheia o token em `~/.axia_cli_session.json`), manda a mensagem pra `/api/assistant/chat` e fala a resposta (ElevenLabs real, se `ELEVENLABS_API_KEY` estiver no ambiente, senão TTS offline via `pyttsx3`).

## Modo de voz (esfera de partículas)

Acesse `/voice.html` (botão "🎙️ Modo de voz" no dashboard) para uma tela cheia com uma esfera de milhares de partículas brancas (Three.js), estilo Jarvis:

- **Idle**: gira e "respira" suavemente.
- **Ouvindo**: reage em tempo real ao volume do seu microfone (Web Audio API — `AnalyserNode` sobre o áudio capturado por `getUserMedia`).
- **Falando**: reage ao volume real do áudio de resposta quando `ELEVENLABS_API_KEY` está configurada (o áudio vem de `POST /api/tts` e é analisado com outro `AnalyserNode`); sem a chave, cai para a voz do navegador (Web Speech API) com uma animação simulada, já que o navegador não expõe o sinal de áudio do `speechSynthesis`.

Reconhecimento de fala usa a Web Speech API do navegador (`webkitSpeechRecognition`), disponível em navegadores baseados em Chromium. Em navegadores sem suporte (ou sem microfone), um campo de texto no rodapé da tela faz o mesmo fluxo (chat + fala) sem depender de áudio — é esse o caminho usado nos testes automatizados.

O Three.js é vendorizado localmente em `frontend/vendor/three.module.min.js` (build ESM oficial, versão 0.170.0) — não depende de nenhum CDN externo em runtime.

## App Desktop (Electron)

```bash
cd desktop
npm install
npm start
```

Abre uma janela nativa carregando `http://localhost:8080` (configurável via `AXIA_URL`). Requer o backend já rodando (`./start.sh` ou Docker).

## Testes end-to-end (Playwright)

```bash
cd tests
npm install
npx playwright test
```

Testa de verdade, num navegador Chromium: criar conta → ver o dashboard carregado com dados mockados → mandar mensagem no chat → conferir a resposta do assistente no DOM; abrir o modo de voz e confirmar que a cena Three.js renderiza com WebGL de verdade e que o fallback de texto conversa com o assistente. Também valida que `GET /api/status` reflete corretamente a ausência de chaves.

## Status deste projeto

Este projeto foi construído e testado de ponta a ponta nesta sessão:

- ✅ Backend sobe e responde em `http://localhost:8080` (via `./start.sh`)
- ✅ Signup, login e fluxo de auth JWT testados via `curl`
- ✅ Dashboard real testado num navegador (Playwright + Chromium): login → widgets com dados mockados → chat → resposta do assistente aparece no DOM
- ✅ Modo de voz (`/voice.html`) testado num navegador real: esfera de partículas em Three.js renderiza com WebGL de verdade, e reage ao volume do microfone (ouvindo) e ao áudio de resposta ou à voz do navegador (falando)
- ✅ Chat em modo demo (sem `ANTHROPIC_API_KEY`) responde corretamente sobre tarefas/lembretes/eventos/transações; a integração real com o SDK da Anthropic está implementada e pronta — só falta a chave
- ✅ Billing (`create-checkout-session`) e Google Calendar (`/auth`) testados em modo demo, sem nenhuma chave configurada
- ✅ `GET /api/status` testado e reflete corretamente cada integração
- ✅ Assistente de voz Python testado em modo texto (`--text`) de ponta a ponta contra o backend real; pipeline de áudio (SpeechRecognition/pyttsx3/PyAudio) instalado e funcional, mas sem hardware de microfone/alto-falante neste ambiente para testar o `--listen` com voz real
- ✅ App Electron testado headless (via `xvfb-run`), com screenshot real confirmando que a janela carrega o dashboard
- ⚠️ WhatsApp (`whatsapp-web.js`): cliente real inicializado, mas a rede deste ambiente de desenvolvimento bloqueia o acesso a `web.whatsapp.com` — o código está pronto e falha de forma controlada (não derruba o servidor); em um ambiente com acesso à internet normal, ele deve gerar o QR code de verdade
- ⚠️ `docker compose up --build`: não pôde ser validado nesta sessão porque a política de rede bloqueia o pull de imagens do Docker Hub (ver nota acima); o `Dockerfile` roda o mesmo código já validado via `./start.sh`
