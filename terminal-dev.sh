#!/bin/bash

# Terminal para DEVELOPMENT
clear
echo "🔵 =================================="
echo "🔵   TERMINAL DEVELOPMENT"
echo "🔵 =================================="
echo ""
echo "📂 Branch: development"
echo "🌐 URL: Vercel Preview (auto-deploy)"
echo "🚀 Uso: Testes e desenvolvimento"
echo ""
echo "Comandos principais:"
echo "• git status"
echo "• git add ."
echo "• git commit -m 'feat: sua mensagem'"
echo "• git push origin development"
echo ""
echo "=================================="

# Garantir que está no branch development
git checkout development

# Mostrar status atual
echo "📊 Status atual do development:"
git status --short
echo ""
echo "🔍 Últimos commits:"
git log --oneline -3
echo ""
echo "💡 Pronto para trabalhar no DEVELOPMENT!"
echo "💡 Use este terminal apenas para development"

# Deixar no prompt personalizado
export PS1="🔵 DEV [\W] $ "
exec bash --rcfile /dev/stdin <<< 'export PS1="🔵 DEV [\W] $ "'