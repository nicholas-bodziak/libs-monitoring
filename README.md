# Libs de Monitoração

Uma ferramenta web moderna para criação automatizada de monitores e alertas para as principais plataformas de observabilidade: **Datadog**, **Dynatrace** e **Zabbix**.

## 🎯 Visão Geral

O **Libs de Monitoração** é uma aplicação React que simplifica e automatiza o processo de criação de monitores de infraestrutura e aplicações. A ferramenta permite gerar configurações de monitoramento para três das principais plataformas do mercado, oferecendo uma interface intuitiva e padronizada.

## ✨ Funcionalidades Principais

### 🔧 Criação de Monitores
- **Criação Automatizada**: Interface guiada para criação de monitores personalizados
- **Múltiplas Plataformas**: Suporte completo para Datadog, Dynatrace e Zabbix
- **Templates Inteligentes**: Configurações pré-definidas baseadas em melhores práticas
- **Validação em Tempo Real**: Verificação automática de configurações

### 📊 Dashboard de Monitores
- **Visualização Centralizada**: Painel único para todos os monitores criados
- **Histórico Completo**: Registro de todos os monitores gerados
- **Filtros Avançados**: Busca por ferramenta, serviço ou data de criação
- **Links Diretos**: Acesso rápido aos monitores nas plataformas originais

### 🎨 Páginas Especializadas
- **Monitores Datadog**: Configurações específicas para observabilidade completa
- **Monitores Zabbix**: Triggers e alertas personalizados para infraestrutura
- **Monitores Dynatrace**: Monitoramento full-stack com IA integrada

### 💡 Boas Práticas de Observabilidade
- **Guias Especializados**: Recomendações para cada plataforma
- **Templates Otimizados**: Configurações baseadas em casos de uso reais
- **Melhores Práticas**: Guidelines para monitoramento eficiente

### 🔗 Integrações
- **Datadog Integration**: Conexão direta com APIs do Datadog
- **Extração de Dados**: Ferramenta para importar configurações existentes
- **Exportação**: Geração de arquivos de configuração prontos para uso

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool e desenvolvimento

### UI/UX
- **Shadcn/UI** - Componentes de interface
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Biblioteca de ícones
- **React Helmet Async** - SEO otimizado

### Gerenciamento de Estado
- **React Query** - Cache e sincronização de dados
- **React Hook Form** - Gerenciamento de formulários
- **Custom Hooks** - Estado local e persistência

### Backend/Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados

### Roteamento e Navegação
- **React Router DOM** - Roteamento SPA
- **Programmatic Navigation** - Navegação baseada em estado

## 🚀 Plataformas Suportadas

### 🐕 Datadog
**Observabilidade Completa**
- Monitoramento de infraestrutura
- APM (Application Performance Monitoring)
- Logs centralizados
- Métricas customizadas
- Alertas inteligentes

**Tecnologias Suportadas:**
- Kubernetes
- Node.js
- Java
- PostgreSQL
- NGINX

### 🔵 Zabbix
**Monitoramento Open Source**
- Monitoramento de infraestrutura
- Triggers customizados
- Templates reutilizáveis
- Dashboards personalizados
- Alertas multi-canal

**Tecnologias Suportadas:**
- Linux/Windows
- MySQL
- NGINX
- Docker
- Redes e SNMP

### 🟣 Dynatrace
**IA e Full-Stack**
- Monitoramento full-stack
- Análise de causa raiz automática
- IA integrada (Davis)
- Mapeamento de dependências
- User Experience Monitoring

**Tecnologias Suportadas:**
- Kubernetes
- Java/.NET
- AWS Lambda
- NGINX
- Cloud platforms

## 📁 Estrutura do Projeto

```
src/
├── components/ui/          # Componentes de interface
├── hooks/                  # Custom hooks
│   └── useMonitorStorage.ts # Gerenciamento de monitores
├── pages/                  # Páginas da aplicação
│   ├── Index.tsx          # Página inicial
│   ├── CreateMonitor.tsx  # Criação de monitores
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── DatadogMonitors.tsx # Monitores Datadog
│   ├── ZabbixMonitors.tsx # Monitores Zabbix
│   ├── DynatraceMonitors.tsx # Monitores Dynatrace
│   └── ...               # Outras páginas
├── utils/                 # Utilitários
├── integrations/         # Integrações externas
│   └── supabase/        # Configuração Supabase
└── lib/                 # Bibliotecas e configurações
```

## 🎮 Como Usar

### 1. **Página Inicial**
- Acesse a página principal
- Visualize as três plataformas suportadas
- Escolha entre as opções disponíveis

### 2. **Criar Monitor**
- Clique em "Iniciar criação do monitor"
- Selecione a plataforma desejada
- Preencha as informações do serviço
- Configure os parâmetros específicos
- Gere o monitor automaticamente

### 3. **Visualizar Monitores**
- Acesse o "Dashboard de monitores"
- Visualize todos os monitores criados
- Filtre por plataforma ou serviço
- Acesse links diretos para as plataformas

### 4. **Boas Práticas**
- Consulte o guia de "Boas Práticas de Observabilidade"
- Aprenda sobre configurações otimizadas
- Implemente padrões de monitoramento

## 🔧 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Comandos
```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### Variáveis de Ambiente
```env
# Configuração Supabase (automática no Lovable)
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🗺 Rotas da Aplicação

- `/` - Página inicial
- `/criar-monitor` - Criação de monitores
- `/dashboard` - Dashboard principal
- `/monitores/datadog` - Monitores Datadog
- `/monitores/zabbix` - Monitores Zabbix
- `/monitores/dynatrace` - Monitores Dynatrace
- `/integracoes/datadog` - Integração Datadog
- `/boas-praticas` - Guia de boas práticas
- `/extrair-solicitacoes` - Extração de dados

## 🎨 Design System

O projeto utiliza um design system baseado em:
- **Tokens semânticos** para cores e tipografia
- **Componentes reutilizáveis** com variantes
- **Modo escuro/claro** automático
- **Responsividade** mobile-first
- **Acessibilidade** WCAG 2.1

## 📱 Responsividade

- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Interface adaptada com navegação otimizada
- **Mobile**: Design mobile-first com componentes empilhados

## 🔒 Segurança

- **Autenticação via Supabase** (opcional)
- **Row Level Security** no banco de dados
- **Validação de dados** client e server-side
- **Sanitização** de inputs do usuário

## 🚀 Deploy

### Lovable (Recomendado)
1. Clique em "Publish" no editor Lovable
2. Configure domínio personalizado (opcional)
3. Aplicação disponível instantaneamente

### Manual
```bash
npm run build
# Upload da pasta dist/ para seu hosting
```

## 🤝 Contribuição

Este projeto foi desenvolvido com foco em:
- **Usabilidade**: Interface intuitiva e amigável
- **Performance**: Carregamento rápido e responsivo
- **Manutenibilidade**: Código limpo e bem estruturado
- **Escalabilidade**: Arquitetura preparada para crescimento

## 📞 Suporte

Para dúvidas ou sugestões sobre a ferramenta, utilize os recursos disponíveis na própria aplicação ou consulte a documentação das plataformas suportadas.

---

**Desenvolvido com ❤️ para simplificar o monitoramento de infraestrutura e aplicações**