#!/bin/bash

# Terminal para PRODUCTION
clear
echo "🔴 =================================="
echo "🔴   TERMINAL PRODUCTION"
echo "🔴 =================================="
echo ""
echo "📂 Branch: main"
echo "🌐 URL: https://marketing-automation-platform.vercel.app"
echo "⚠️  Uso: APENAS deploys finais"
echo ""
echo "⚠️  CUIDADO: Este é PRODUÇÃO!"
echo ""
echo "Comandos para deploy final:"
echo "• git checkout main"
echo "• git merge development"
echo "• git push origin main"
echo ""
echo "=================================="

# Garantir que está no branch main
git checkout main

# Mostrar status atual
echo "📊 Status atual da produção:"
git status --short
echo ""
echo "🔍 Últimos commits:"
git log --oneline -3
echo ""
echo "⚠️  ATENÇÃO: Este terminal afeta PRODUÇÃO!"
echo "💡 Use apenas quando tudo estiver testado"

# Deixar no prompt personalizado
export PS1="🔴 PROD [\W] $ "
exec bash --rcfile /dev/stdin <<< 'export PS1="🔴 PROD [\W] $ "'