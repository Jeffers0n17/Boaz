FROM node:22-slim

# Chromium é necessário para a integração real de WhatsApp (whatsapp-web.js
# controla o WhatsApp Web via um navegador headless). Instalamos via apt em
# vez de deixar o puppeteer baixar o seu próprio Chromium durante o
# `npm install` — mais rápido de buildar e mais previsível dentro do container.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV WHATSAPP_CHROMIUM_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV AXIA_DATA_DIR=/app/data

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY frontend/ ../frontend/

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["node", "server.js"]
