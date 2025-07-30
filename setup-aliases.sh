#!/bin/bash

# Criar aliases para os terminais
echo "Configurando aliases para facilitar o uso..."

PROJETO_PATH="/Users/Raphael/Downloads/leads/marketing-automation-vercel"

# Adicionar aliases ao .zshrc ou .bashrc
if [ -f ~/.zshrc ]; then
  SHELL_CONFIG=~/.zshrc
elif [ -f ~/.bashrc ]; then
  SHELL_CONFIG=~/.bashrc
else
  SHELL_CONFIG=~/.bash_profile
fi

echo "" >> $SHELL_CONFIG
echo "# Aliases para Marketing Automation Project" >> $SHELL_CONFIG
echo "alias dev-terminal='cd $PROJETO_PATH && ./terminal-dev.sh'" >> $SHELL_CONFIG
echo "alias prod-terminal='cd $PROJETO_PATH && ./terminal-prod.sh'" >> $SHELL_CONFIG
echo "alias projeto='cd $PROJETO_PATH'" >> $SHELL_CONFIG

echo "✅ Aliases configurados em $SHELL_CONFIG"
echo ""
echo "🎯 Agora você pode usar:"
echo "• dev-terminal    → Abre terminal de desenvolvimento" 
echo "• prod-terminal   → Abre terminal de produção"
echo "• projeto         → Vai para pasta do projeto"
echo ""
echo "⚡ Para ativar agora: source $SHELL_CONFIG"
echo "⚡ Ou abra novos terminais"