# 🎯 Guia dos 2 Terminais

## 🚀 Como Iniciar os Terminais

### Terminal 1 - Development:
```bash
cd /Users/Raphael/Downloads/leads/marketing-automation-vercel
chmod +x terminal-dev.sh
./terminal-dev.sh
```

### Terminal 2 - Production:
```bash
cd /Users/Raphael/Downloads/leads/marketing-automation-vercel
chmod +x terminal-prod.sh
./terminal-prod.sh
```

## 🎨 Visual dos Terminais

### 🔵 Terminal Development:
```
🔵 ==================================
🔵   TERMINAL DEVELOPMENT
🔵 ==================================
📂 Branch: development
🌐 URL: Vercel Preview (auto-deploy)
🚀 Uso: Testes e desenvolvimento
🔵 DEV [pasta] $
```

### 🔴 Terminal Production:
```
🔴 ==================================
🔴   TERMINAL PRODUCTION  
🔴 ==================================
📂 Branch: main
🌐 URL: https://marketing-automation-platform.vercel.app
⚠️  Uso: APENAS deploys finais
🔴 PROD [pasta] $
```

## 🔄 Workflow Recomendado

### 1. Desenvolvimento (Terminal Azul):
```bash
🔵 DEV $ git add .
🔵 DEV $ git commit -m "feat: nova funcionalidade"
🔵 DEV $ git push origin development
```
→ **Vercel faz deploy automático do preview**

### 2. Teste no Preview:
- Acesse URL de preview da Vercel
- Teste todas as funcionalidades
- Confirme que está tudo funcionando

### 3. Deploy para Produção (Terminal Vermelho):
```bash
🔴 PROD $ git merge development
🔴 PROD $ git push origin main
```
→ **Vercel atualiza produção**

## 🎯 Comandos por Terminal

### 🔵 Terminal Development (Uso Diário):
```bash
# Ver mudanças
git status
git diff

# Fazer commit
git add .
git commit -m "sua mensagem"
git push origin development

# Ver logs
git log --oneline -5

# Criar feature
git checkout -b feature/nome
```

### 🔴 Terminal Production (Uso Esporádico):
```bash
# Fazer deploy final
git merge development
git push origin main

# Ver diferenças antes do merge
git diff main development

# Rollback se necessário
git reset --hard HEAD~1
git push --force-with-lease origin main
```

## 🔒 Regras de Segurança

### ✅ PODE fazer no Development:
- Commits experimentais
- Testes quebrados
- Features incompletas
- Múltiplos commits pequenos

### ⚠️ SÓ FAÇA na Production:
- Features 100% testadas
- Código que funciona perfeitamente
- Após validação no preview

## 🎪 Exemplo de Sessão

### Manhã - Começar desenvolvimento:
1. Abrir Terminal Development (azul)
2. `git pull origin development`
3. Trabalhar normalmente
4. Commits frequentes no development

### Fim do dia - Deploy produção:
1. Testar preview final
2. Abrir Terminal Production (vermelho)  
3. `git merge development`
4. `git push origin main`
5. Verificar produção

## 💡 Dicas Importantes

### 🔵 Development:
- Use para experimentar
- Commits podem ser "work in progress"
- Preview sempre disponível
- Sem impacto em usuários

### 🔴 Production:
- Apenas código estável
- Commits bem documentados
- Afeta usuários reais
- Cuidado com rollbacks