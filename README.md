# 🦅 FalconX - Sistema de Proteção Anti-Clone

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

**FalconX** é um SaaS avançado para detecção e proteção contra clonagem de funis de vendas em tempo real. Monitore seus domínios, detecte clones não autorizados e execute ações automatizadas para proteger seu negócio.

## 🚀 Funcionalidades Principais

- **🔍 Detecção em Tempo Real** - Monitora clones de funis instantaneamente
- **🛡️ Proteção Automatizada** - Ações configuráveis contra clones detectados
- **📊 Dashboard Intuitivo** - Interface SPA de alta performance
- **🎯 Multi-Planos** - Free, Bronze, Silver e Gold com limites escaláveis
- **🔐 Segurança Avançada** - Rate limiting, headers de segurança, validação rigorosa
- **📈 Analytics Detalhados** - Logs estruturados e métricas de performance

## 🏗️ Arquitetura Técnica

### Stack Principal

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript (modo estrito)
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Styling**: Tailwind CSS
- **Validação**: Zod schemas

### Estrutura do Projeto

```
src/
├── app/                 # Next.js App Router
│   ├── dashboard/       # SPA Dashboard principal
│   ├── api/            # API routes
│   └── auth/           # Páginas de autenticação
├── components/         # Componentes React reutilizáveis
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
│   ├── validations/    # Schemas Zod
│   └── types/          # Definições TypeScript
docs/                   # Documentação
├── adr/                # Architecture Decision Records
└── database-schema.md  # Esquema do banco de dados
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase

### 1. Clone e Instale

```bash
git clone <repository-url>
cd falconX
npm install
```

### 2. Configuração do Ambiente

```bash
cp env.example .env.local
```

Configure as variáveis no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=info
```

### 3. Setup do Banco de Dados

```bash
# Execute o script de setup no Supabase SQL Editor
# Arquivo: falconx-database-setup-safe.sql

# Gere os tipos TypeScript
npm run db:types
```

### 4. Inicie o Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Servidor de desenvolvimento
npm run build           # Build de produção
npm run start           # Servidor de produção
```

### Qualidade de Código

```bash
npm run lint            # Verificar código (ESLint)
npm run lint:fix        # Corrigir problemas automaticamente
npm run type-check      # Verificar tipos TypeScript
npm run format          # Formatar código (Prettier)
npm run validate        # Validação completa (tipos + lint + formato)
```

### Database

```bash
npm run db:types        # Gerar tipos do Supabase
```

## 🏛️ Arquitetura de Segurança

### Middleware de Proteção

- **Rate Limiting**: 100 req/15min por IP
- **Security Headers**: CSP, X-Frame-Options, HSTS
- **Auth Protection**: Rotas protegidas automaticamente

### Validação de Dados

- **Zod Schemas**: Validação rigorosa de entrada
- **Fail-Fast**: Erros explícitos e imediatos
- **Type Safety**: TypeScript estrito habilitado

### Logging Estruturado

```typescript
// Exemplo de uso do sistema de logging
logger.userAction('domain_added', userId, { domain: 'example.com' })
logger.securityEvent('rate_limit_exceeded', { ip: '192.168.1.1' })
```

## 📊 Planos e Limites

| Plano  | Preço    | Domínios  | Funcionalidades |
| ------ | -------- | --------- | --------------- |
| Free   | R$ 0     | 1         | Básicas         |
| Bronze | R$ 29,99 | 5         | Avançadas       |
| Silver | R$ 59,99 | 15        | Premium         |
| Gold   | R$ 99,99 | Ilimitado | Empresarial     |

## 🔄 Fluxo de Funcionamento

1. **Cadastro**: Usuário se registra e escolhe um plano
2. **Configuração**: Adiciona domínios permitidos
3. **Script**: Sistema gera código de proteção único
4. **Implementação**: Usuário adiciona script aos funis
5. **Monitoramento**: Sistema detecta uso não autorizado
6. **Ação**: Executa medidas de proteção configuradas

## 🧪 Qualidade e Testes

### Regras de Qualidade Implementadas

- ✅ **15 regras de engenharia** aplicadas
- ✅ **TypeScript estrito** com coverage ~95%
- ✅ **ESLint + Prettier** com git hooks
- ✅ **Validação automática** pré-commit
- ✅ **Logging estruturado** para observabilidade

### Automação

- **Husky**: Git hooks automáticos
- **lint-staged**: Validação pré-commit
- **CI/CD Ready**: Scripts preparados para pipeline

## 📚 Documentação

- **[Database Schema](docs/database-schema.md)** - Estrutura do banco
- **[Quality Rules](QUALITY_RULES_IMPLEMENTED.md)** - Regras implementadas
- **[ADRs](docs/adr/)** - Decisões arquiteturais

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenções

- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Code Style**: Prettier + ESLint (automático via git hooks)
- **PRs**: Máximo 400 LOC, com descrição clara

## 📝 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/falconx/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/falconx/wiki)
- **Email**: suporte@falconx.com.br

---

**Desenvolvido com ❤️ para proteger seus funis de vendas contra clonagem**
