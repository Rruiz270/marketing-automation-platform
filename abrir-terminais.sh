#!/bin/bash

echo "🚀 Abrindo terminais de desenvolvimento..."

# Caminho do projeto
PROJECT_PATH="/Users/Raphael/Downloads/leads/marketing-automation-vercel"

# Abrir terminal de desenvolvimento
osascript -e "
tell application \"Terminal\"
    do script \"cd '$PROJECT_PATH' && ./terminal-dev.sh\"
    set custom title of front window to \"🔵 DEVELOPMENT\"
end tell
"

# Aguardar um segundo
sleep 1

# Abrir terminal de produção
osascript -e "
tell application \"Terminal\"
    do script \"cd '$PROJECT_PATH' && ./terminal-prod.sh\"
    set custom title of front window to \"🔴 PRODUCTION\"
end tell
"

echo "✅ Terminais abertos!"
echo "🔵 Terminal Development ativo"
echo "🔴 Terminal Production ativo"