# 🚀 Guia de Desenvolvimento Rápido

## ⚡ Fluxo de Trabalho Ideal

### Para Fazer Mudanças e Testar:

```bash
# 1. Fazer suas mudanças nos arquivos
# Edite qualquer componente em /components/
# Edite APIs em /pages/api/
# etc.

# 2. Commit e push para development
git add .
git commit -m "feat: sua descrição da mudança"
git push origin development

# 3. Aguarde 1-2 minutos
# A Vercel fará deploy automático

# 4. Acesse sua URL de preview
# https://marketing-automation-platform-git-development-*.vercel.app
```

## 🎯 URLs Importantes

### Produção (main branch):
- https://marketing-automation-platform.vercel.app

### Desenvolvimento/Testes (development branch):
- https://marketing-automation-platform-git-development-*.vercel.app
- Atualizada automaticamente a cada push

### Gitpod (Desenvolvimento na Nuvem):
- https://gitpod.io/#https://github.com/Rruiz270/marketing-automation-platform

## 🔧 Comandos Úteis

### Mudança Rápida:
```bash
# Editar arquivo
code components/ModernCampaignBuilder.js

# Commit rápido
git add . && git commit -m "fix: pequena correção" && git push origin development
```

### Ver Status:
```bash
git status
git log --oneline -5
```

### Alternar entre branches:
```bash
# Para development (testes)
git checkout development

# Para main (produção)
git checkout main
```

## 🎪 Exemplo de Mudança

### 1. Editar um arquivo:
```javascript
// Em components/ModernCampaignBuilder.js
// Mudar uma mensagem ou adicionar um console.log
console.log('Testando mudança!');
```

### 2. Deploy:
```bash
git add .
git commit -m "test: adicionei console.log"
git push origin development
```

### 3. Verificar:
- Aguardar 1-2 minutos
- Acessar URL de preview
- Abrir DevTools (F12) e ver o console.log

## 🐛 Debug Remoto

### Ver logs do servidor:
1. Acesse Vercel Dashboard
2. Clique no deployment
3. Vá em "View Details"
4. Clique em "Build Logs" ou "Function Logs"

### Testar APIs:
```bash
# Testar endpoint diretamente
curl https://sua-url-preview.vercel.app/api/health
```

## 📱 Teste em Diferentes Dispositivos

### Sua URL de preview funciona em:
- ✅ Desktop
- ✅ Mobile
- ✅ Tablet
- ✅ Qualquer dispositivo com internet

### Compartilhar para teste:
- Envie a URL para outros testarem
- Funciona de qualquer lugar do mundo

## 🎯 Vantagens do Preview

### ✅ Benefícios:
- Deploy automático em 1-2 minutos
- URL pública acessível
- Mesma performance da produção
- Não afeta produção principal
- Logs e debug disponíveis
- Funciona em qualquer dispositivo

### 💰 Custos:
- Preview deployments são gratuitos na maioria dos planos
- Não consomem créditos principais
- Ideais para desenvolvimento e testes