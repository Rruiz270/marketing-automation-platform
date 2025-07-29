# 🤖 AI Marketing Automation Platform - Alumni English School

Uma plataforma completa de automação de marketing com inteligência artificial, especialmente otimizada para escolas de inglês como a Alumni. Gerencie campanhas publicitárias, crie conteúdo automatizado e otimize performance com IA.

## 🚀 Deploy Rápido no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rruiz270/marketing-automation-platform)

**🌐 Demo Live:** https://marketing-automation-platform-f8v9.vercel.app/

## ✨ Funcionalidades Principais

### 🎯 **AI Campaign Generator (Novo!)**
- **Gerador de Campanhas Específico para Alumni**: Prompts otimizados para escolas de inglês
- **3 Etapas de Criação**: Setup → Revisão → Geração
- **Conteúdo Multi-Plataforma**: Google Ads, Facebook, Instagram, LinkedIn, Email
- **Sugestões Visuais**: Conceitos para imagens, vídeos e infográficos
- **Estratégia de Campanha**: Planos de 6 semanas com alocação de orçamento

### 🤖 **AI Automation Suite**
1. **Coleta Automatizada de Dados**: APIs do Google Ads e Facebook
2. **Detecção de Tendências**: Alertas inteligentes baseados em performance
3. **Ajustes Automáticos de Orçamento**: Otimização com modo seguro
4. **Geração de Criativos com IA**: DALL-E, texto e vídeos
5. **Testes A/B Automatizados**: Implementação e análise contínua
6. **Monitoramento de Concorrentes**: Scraping de bibliotecas de anúncios
7. **Analytics Preditivos**: Forecasting com alertas de performance
8. **Sistema de Auditoria**: Logs completos com níveis de confiança

### 🔗 **Integrações de API**
- **Plataformas de Anúncios**: Google Ads, Meta (Facebook/Instagram), TikTok, LinkedIn, Twitter
- **Serviços de IA**: OpenAI GPT-4, Claude (Anthropic), ElevenLabs, DALL-E
- **Banco de Dados**: MongoDB Atlas com pooling de conexões
- **Autenticação**: OAuth2 para todas as plataformas

### 📊 **Dashboard Inteligente**
- **Métricas em Tempo Real**: ROAS, CTR, Conversões, Revenue
- **Gráficos Interativos**: Performance histórica e forecasting
- **Insights de IA**: Recomendações automatizadas com níveis de confiança
- **Gerenciamento de Campanhas**: Interface unificada para todas as plataformas

## 🏗️ Arquitetura do Sistema

```
marketing-automation-vercel/
├── 📁 components/
│   ├── AiCampaignGenerator.js     # Gerador de campanhas para Alumni
│   ├── AiCreativeGenerator.js     # Geração de criativos com IA
│   └── ApiConnectionManager.js    # Gerenciador de conexões de API
├── 📁 pages/
│   ├── index.js                   # Dashboard principal
│   └── 📁 api/
│       ├── 📁 ai/                 # Endpoints de IA
│       │   ├── creative-generation.js
│       │   ├── budget-automation.js
│       │   ├── predictive-analytics.js
│       │   └── audit-system.js
│       ├── 📁 integrations/       # Integrações de API
│       └── 📁 campaigns/          # Gerenciamento de campanhas
├── 📁 lib/
│   ├── 📁 models/                 # Modelos de dados MongoDB
│   └── 📁 integrations/           # Integrações com plataformas
└── 📄 API_SETUP_GUIDE.md         # Guia de configuração de APIs
```

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+
- Conta MongoDB Atlas
- Chaves de API (OpenAI, Google Ads, Facebook, etc.)

### Instalação
```bash
# 1. Clone o repositório
git clone https://github.com/Rruiz270/marketing-automation-platform.git
cd marketing-automation-vercel

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Acessar a aplicação
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3000/api

## 🌐 Deploy no Vercel

### Opção 1: Botão de Deploy
Clique no botão "Deploy with Vercel" acima e siga o assistente.

### Opção 2: Integração Git (Recomendado)
1. Faça push para GitHub
2. Conecte o repositório no dashboard do Vercel
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### Opção 3: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

## ⚙️ Variáveis de Ambiente

### Obrigatórias
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/marketing-automation
JWT_SECRET=seu-jwt-secret-aqui
```

### APIs de Anúncios (Opcionais)
```env
# Google Ads
GOOGLE_ADS_CLIENT_ID=seu-client-id
GOOGLE_ADS_CLIENT_SECRET=seu-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=seu-developer-token

# Meta (Facebook/Instagram)
FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret

# TikTok
TIKTOK_APP_ID=seu-app-id
TIKTOK_SECRET=seu-secret
```

### APIs de IA (Configuradas via Interface)
- **OpenAI**: Para geração de texto e criativos
- **Claude (Anthropic)**: Para análise e copywriting avançado
- **ElevenLabs**: Para voice-overs e áudio

## 📊 API Endpoints

### Campanhas
```
GET    /api/campaigns              # Listar campanhas
POST   /api/campaigns              # Criar nova campanha
GET    /api/campaigns/[id]         # Buscar campanha específica
PUT    /api/campaigns/[id]         # Atualizar campanha
DELETE /api/campaigns/[id]         # Deletar campanha
```

### AI Services
```
POST   /api/ai/creative-generation    # Gerar criativos com IA
POST   /api/ai/budget-automation      # Automação de orçamento
POST   /api/ai/predictive-analytics   # Analytics preditivos
GET    /api/ai/audit-system          # Logs de auditoria
```

### Integrações
```
POST   /api/integrations/connect     # Conectar plataformas
GET    /api/integrations/sync-data   # Sincronizar dados
```

### AI Keys Management
```
POST   /api/ai-keys-simple          # Gerenciar chaves de API de IA
```

## 🎯 Como Usar o AI Campaign Generator

### 1. Acesse a Aba "AI Campaign Generator"
No dashboard principal, clique na aba "🎯 AI Campaign Generator"

### 2. Configure os Parâmetros da Campanha
- **Público-Alvo**: Profissionais jovens, executivos, estudantes, etc.
- **Objetivo**: Matrículas, awareness, parcerias corporativas
- **Tom**: Profissional, amigável, inspirador, urgente, premium
- **Palavras-chave**: Termos relevantes para Alumni
- **Orçamento**: Faixa de investimento

### 3. Gere Conteúdo Automatizado
O sistema criará:
- **Master Prompt**: Para usar em ChatGPT ou Claude
- **Variações de Copy**: Headlines, posts sociais, anúncios Google
- **Sugestões Visuais**: Conceitos para imagens e vídeos  
- **Estratégia de Campanha**: Plano completo de 6 semanas

### 4. Dados Específicos da Alumni Incluídos
- 60+ anos de experiência
- Status de Centro Binacional Brasil-EUA
- Metodologia exclusiva e flexibilidade
- Reconhecimento oficial dos governos
- Turmas pequenas e atenção personalizada

## 🗄️ Estrutura do Banco de Dados

### Campaign Model
```javascript
{
  name: String,
  type: 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'tiktok_ads',
  status: 'active' | 'paused' | 'completed',
  budget: {
    daily: Number,
    total: Number,
    spent: Number
  },
  performance: {
    impressions: Number,
    clicks: Number,
    conversions: Number,
    cost: Number,
    revenue: Number,
    ctr: Number,
    roas: Number
  },
  aiOptimization: {
    enabled: Boolean,
    confidence: Number,
    lastOptimized: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Automation Rule Model
```javascript
{
  name: String,
  description: String,
  type: 'budget' | 'creative' | 'bidding' | 'targeting',
  conditions: [{
    metric: 'roas' | 'ctr' | 'cpc' | 'conversions',
    operator: 'gt' | 'lt' | 'eq',
    value: Number,
    duration: Number // dias
  }],
  actions: [{
    type: 'adjust_budget' | 'generate_creative' | 'pause_campaign',
    parameters: Object
  }],
  confidence: Number,
  status: 'active' | 'paused',
  executions: Number,
  lastRun: Date
}
```

## 🛡️ Segurança e Compliance

### Segurança das Credenciais
- **Criptografia**: Chaves de API criptografadas com CryptoJS
- **Armazenamento Seguro**: MongoDB com conexões SSL
- **Variáveis de Ambiente**: Credenciais nunca expostas no código
- **OAuth2**: Fluxos de autenticação padronizados

### Sistema de Auditoria
- **Logs Completos**: Todas as ações de IA registradas
- **Níveis de Confiança**: Decisões baseadas em thresholds
- **Aprovação Manual**: Ações de baixa confiança requerem aprovação
- **Modo Seguro**: Limites automáticos para proteção

### Compliance
- **LGPD/GDPR**: Armazenamento seguro de dados
- **Transparência**: Logs auditáveis de todas as operações
- **Controle de Acesso**: Permissões baseadas em usuário

## 📱 Experiência Mobile

- **Design Responsivo**: Mobile-first approach
- **Componentes Touch**: Otimizados para dispositivos móveis
- **Charts Responsivos**: Gráficos adaptáveis
- **PWA Ready**: Instalável como app nativo

## 🚀 Otimizações de Performance

### Frontend
- **Code Splitting**: Divisão automática por rotas
- **SWR**: Cache inteligente de dados
- **Image Optimization**: Componente Next.js Image
- **CSS Purging**: Tailwind CSS otimizado

### Backend
- **Serverless Functions**: Vercel Edge Functions
- **Connection Pooling**: Reutilização de conexões MongoDB
- **Cache de API**: Respostas em cache para reduzir latência
- **Compression**: Gzip automático

## 🔧 Personalizações Disponíveis

### Adicionando Novas Plataformas de Anúncios
1. Estenda o enum de tipos em `Campaign.js`
2. Adicione integração em `lib/integrations/`
3. Configure cores no dashboard
4. Implemente autenticação OAuth2

### Criando Novos Tipos de Automação
1. Adicione endpoint em `pages/api/ai/`
2. Crie modelo de dados se necessário
3. Implemente lógica de automação
4. Adicione interface no dashboard

### Customizando o AI Campaign Generator
1. Modifique dados da escola em `AiCampaignGenerator.js`
2. Ajuste prompts e templates
3. Adicione novos públicos-alvo
4. Customize estratégias de campanha

## 📈 Próximos Passos e Melhorias

### Funcionalidades Planejadas
- [ ] **Relatórios Automatizados**: Email e Slack
- [ ] **Mais Plataformas**: YouTube Ads, Pinterest, Snapchat
- [ ] **Advanced Analytics**: Cohort analysis, LTV
- [ ] **White-label**: Personalização por cliente
- [ ] **API Pública**: Endpoints para integrações externas

### Melhorias de IA
- [ ] **Modelo Personalizado**: Fine-tuning para indústria educacional
- [ ] **Análise de Sentimento**: Monitoramento de brand sentiment
- [ ] **Predição de Churn**: Alertas de perda de clientes
- [ ] **Otimização de Bid**: Algoritmos avançados de leilão

### Integrações Adicionais
- [ ] **CRM**: HubSpot, Salesforce
- [ ] **Analytics**: Google Analytics 4, Adobe Analytics
- [ ] **Email Marketing**: Mailchimp, SendGrid
- [ ] **Chat**: WhatsApp Business, Intercom

## 🔍 Monitoramento e Logs

### Métricas de Sistema
- **Performance**: Tempo de resposta das APIs
- **Erro Rate**: Taxa de erro por endpoint
- **Usage**: Uso de recursos e limites de API
- **AI Confidence**: Distribuição de níveis de confiança

### Alertas Configuráveis
- **Budget Overspend**: Gastos acima do orçamento
- **Performance Drop**: Queda significativa em métricas
- **API Failures**: Falhas de integração
- **Low Confidence**: Decisões de IA com baixa confiança

## 🤝 Contribuindo

1. **Fork** o repositório
2. **Clone** localmente
3. **Crie uma branch** para sua feature
4. **Teste** completamente
5. **Submeta um PR** com descrição detalhada

### Padrões de Código
- **ESLint**: Configuração Next.js
- **Prettier**: Formatação automática
- **Commits**: Conventional commits
- **Documentação**: Comentários em português

## 📞 Suporte e Documentação

### Recursos Disponíveis
- **README.md**: Este arquivo (documentação principal)
- **API_SETUP_GUIDE.md**: Guia de configuração de APIs
- **GitHub Issues**: Reportar bugs e solicitar features
- **Vercel Docs**: https://vercel.com/docs

### Contato
- **GitHub**: [@Rruiz270](https://github.com/Rruiz270)
- **Email**: Para suporte enterprise
- **Demo**: https://marketing-automation-platform-f8v9.vercel.app/

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

---

## 🎯 Status do Projeto

### ✅ Implementado
- ✅ Dashboard completo com métricas
- ✅ AI Campaign Generator para Alumni  
- ✅ 8 serviços de IA automation
- ✅ Integrações Google Ads e Facebook
- ✅ Sistema de auditoria completo
- ✅ Gerenciamento de APIs de IA
- ✅ Deploy automático no Vercel

### 🚧 Em Desenvolvimento
- 🔄 Autenticação de usuários
- 🔄 Relatórios em PDF
- 🔄 Integração WhatsApp Business

### 📋 Backlog
- 📝 Analytics avançados
- 📝 Multi-tenancy
- 📝 API pública
- 📝 Mobile app nativo

---

**🚀 Pronto para começar?** Clique no botão de deploy acima ou siga as instruções de instalação local!

**🎯 Quer testar?** Acesse a demo em: https://marketing-automation-platform-f8v9.vercel.app/