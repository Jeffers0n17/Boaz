#!/usr/bin/env bash
# AXIA - inicialização local sem Docker.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "== AXIA start.sh =="

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "-> backend/.env não existe, criando a partir de backend/.env.example"
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "-> Instalando dependências do backend (npm install)..."
  (cd "$BACKEND_DIR" && npm install)
else
  echo "-> node_modules já existe, pulando npm install (use --reinstall para forçar)"
fi

if [ "${1:-}" = "--reinstall" ]; then
  echo "-> Forçando reinstalação das dependências..."
  (cd "$BACKEND_DIR" && npm install)
fi

PORT="$(grep -E '^PORT=' "$BACKEND_DIR/.env" | tail -1 | cut -d'=' -f2)"
PORT="${PORT:-8080}"

echo "-> Subindo o backend AXIA em http://localhost:${PORT}"
echo "   (ANTHROPIC_API_KEY $(grep -q '^ANTHROPIC_API_KEY=.\+' "$BACKEND_DIR/.env" && echo 'configurada' || echo 'ausente — chat em modo demo'))"
echo "   Pressione Ctrl+C para parar."
echo

cd "$BACKEND_DIR"
exec node server.js
