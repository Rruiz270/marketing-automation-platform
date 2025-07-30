#!/bin/bash

echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""
echo "Tentando porta 8080..."

# Mata processos anteriores se existirem
pkill -f "next dev" 2>/dev/null

# Espera um segundo
sleep 1

# Inicia o servidor
PORT=8080 npm run dev &

# Espera o servidor iniciar
sleep 3

# Abre o navegador
echo ""
echo "✅ Abrindo http://localhost:8080"
open http://localhost:8080

echo ""
echo "📌 Servidor rodando em: http://localhost:8080"
echo "📌 Para parar: Ctrl+C"
echo ""