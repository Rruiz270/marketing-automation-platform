# 🚀 Guia de Desenvolvimento Local

## Desenvolvimento Local (Recomendado)

### 1. Iniciar Servidor Local
```bash
npm run dev
```
Acesse: http://localhost:3000

### 2. Parar Servidor
Pressione `Ctrl + C` no terminal

### 3. Ver Logs em Tempo Real
Os logs aparecem diretamente no terminal

## Variáveis de Ambiente Local

Crie um arquivo `.env.local` na raiz do projeto:

```env
# OpenAI API Key (opcional - usuários podem usar suas próprias)
OPENAI_API_KEY=sk-...

# Storage Path (opcional)
STORAGE_PATH=./data

# Outras configurações
NODE_ENV=development
```

## Branches de Desenvolvimento

### Branch Principal (Produção)
```bash
git checkout main
git push origin main
```
URL: https://marketing-automation-platform.vercel.app

### Branch Development (Testes)
```bash
git checkout development
git push origin development
```
URL: Preview URL gerada automaticamente

## Comandos Úteis

### Desenvolvimento
```bash
# Iniciar desenvolvimento
npm run dev

# Build local para teste
npm run build
npm run start

# Verificar erros
npm run lint
```

### Git Flow
```bash
# Criar nova feature
git checkout -b feature/nome-da-feature

# Commit e push
git add .
git commit -m "feat: descrição"
git push origin feature/nome-da-feature

# Merge para development
git checkout development
git merge feature/nome-da-feature
git push origin development

# Depois de testar, merge para main
git checkout main
git merge development
git push origin main
```

## Testando sem Deploy

### 1. Mudanças em Tempo Real
- Edite qualquer arquivo
- Salve (Cmd+S ou Ctrl+S)
- Veja mudanças instantaneamente no browser

### 2. Testando APIs
- APIs funcionam localmente em http://localhost:3000/api/...
- Dados salvos em ./data/ localmente

### 3. Debug
- Abra DevTools do browser (F12)
- Veja console.log no terminal
- Use debugger; no código

## Ngrok (Compartilhar Local)

### Instalar Ngrok
```bash
# macOS
brew install ngrok

# ou baixe de https://ngrok.com/download
```

### Usar Ngrok
```bash
# Em um terminal, rode o Next.js
npm run dev

# Em outro terminal, exponha a porta
ngrok http 3000
```

Você receberá uma URL tipo: https://abc123.ngrok.io

## VS Code Extensions Recomendadas

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **GitLens**
5. **Thunder Client** (testar APIs)

## Atalhos Úteis

- `Cmd+P` (Mac) / `Ctrl+P` (Win): Buscar arquivo
- `Cmd+Shift+F`: Buscar em todos arquivos
- `Cmd+B`: Mostrar/esconder sidebar
- `Cmd+J`: Mostrar/esconder terminal

## Problemas Comuns

### Porta 3000 em uso
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou use outra porta
npm run dev -- -p 3001
```

### Cache Issues
```bash
# Limpar cache Next.js
rm -rf .next
npm run dev
```

### Dependencies Issues
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```