# 🦅 FalconX - Proteção Avançada de Funis

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Security](https://img.shields.io/badge/security-enterprise--grade-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-strict-blue.svg)

> **SaaS de proteção contra clonagem de funis de vendas com detecção em tempo real e sistema de resposta automatizada.**

---

## 🎯 **Sobre o FalconX**

O **FalconX** é uma solução enterprise para proteger seus funis de vendas contra clonagem não autorizada. Detecta uso indevido em tempo real e executa ações de proteção automatizadas.

### **🔥 Recentemente Atualizado - Janeiro 2025**
- ✅ **Auditoria completa de segurança** realizada
- ✅ **6 vulnerabilidades críticas** corrigidas
- ✅ **Sistema de autenticação JWT** implementado
- ✅ **Rate limiting multicamadas** ativo
- ✅ **CORS dinâmico e seguro** configurado
- ✅ **Sistema de auditoria** em tempo real

**Pontuação de Segurança**: 9/10 🛡️ *(antes: 3/10)*

---

## ⚡ **Funcionalidades**

### **Detecção Inteligente**
- 🔍 **Monitoramento em tempo real** de domínios não autorizados
- 🤖 **Script invisível** embedado nos funis
- 📊 **Dashboard completo** com estatísticas detalhadas
- 🎯 **Detecção por subdomínio** e wildcards

### **Sistema de Resposta**
- 🚫 **Redirecionamento automático** para site original
- 📄 **Página em branco** para quebrar o funil clonado
- 💬 **Mensagem personalizada** de site não autorizado
- ⚙️ **Configuração por clone** detectado

### **Planos Flexíveis**
- 🆓 **Free**: 1 clone detectado, básico
- 🥉 **Bronze**: 5 clones, R$ 29,99/mês
- 🥈 **Silver**: 15 clones, R$ 59,99/mês
- 🥇 **Gold**: Ilimitado, R$ 99,99/mês
- 💎 **Diamond**: Enterprise, R$ 199,99/mês

---

## 🛡️ **Segurança Enterprise-Grade**

### **Recém Implementado (2025)**
- **JWT Authentication**: APIs críticas protegidas
- **Rate Limiting Inteligente**: 3 níveis de proteção
- **CORS Dinâmico**: Configuração automática para VPS/EasyPanel
- **Input Validation**: Schemas Zod em todos os endpoints
- **Audit Logging**: Monitoramento de eventos suspeitos
- **Security Headers**: CSP, HSTS, XSS Protection

### **Compliance**
- ✅ **OWASP Top 10** compliant
- ✅ **LGPD/GDPR** requirements
- ✅ **ISO 27001** controls

> 📖 **[Ver Auditoria Completa](docs/security/SECURITY_AUDIT_SUMMARY.md)**

---

## 🚀 **Tecnologias**

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Middleware
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT
- **Styling**: Tailwind CSS
- **Security**: Rate Limiting + CORS + Validation
- **Monitoring**: Structured Logging + Audit System
- **Deploy**: VPS + EasyPanel (ou similar)

---

## 📦 **Instalação**

### **1. Clone e Setup**
```bash
git clone https://github.com/seu-usuario/falconx.git
cd falconx
npm install
```

### **2. Configuração de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Configurar variáveis obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# CORS - Configuração para VPS/EasyPanel
ALLOWED_ORIGINS=https://seudominio.com,https://app.seudominio.com
NEXT_PUBLIC_APP_URL=https://app.seudominio.com
```

### **3. Executar**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

---

## 🏛️ **Arquitetura de Segurança**

### **Middleware de Proteção**
- **Rate Limiting**: 50 req/min (público), 200 req/min (protegido), 10 req/min (crítico)
- **Security Headers**: CSP, X-Frame-Options, HSTS automáticos
- **Auth Protection**: Rotas protegidas com JWT

### **CORS Inteligente**
```typescript
// APIs públicas: CORS * (para scripts funcionarem)
/api/collect, /api/detect → Access-Control-Allow-Origin: *

// APIs protegidas: CORS restritivo
/api/plan-limits → Apenas domínios autorizados
```

### **Validação de Dados**
- **Zod Schemas**: Validação rigorosa de entrada
- **Fail-Fast**: Erros explícitos e imediatos
- **Type Safety**: TypeScript estrito habilitado

### **Logging Estruturado**
```typescript
// Exemplo de uso do sistema de logging
logger.userAction('domain_added', userId, { domain: 'example.com' })
logger.securityEvent('rate_limit_exceeded', { ip: '192.168.1.1' })
```

---

## 📊 **Planos e Limites**

| Plano     | Preço      | Clones | Domínios  | Funcionalidades |
|-----------|------------|--------|-----------|-----------------|
| **Free**  | R$ 0       | 1      | 1         | Básicas         |
| **Bronze** | R$ 29,99   | 5      | 3         | Avançadas       |
| **Silver** | R$ 59,99   | 15     | 10        | Premium         |
| **Gold**  | R$ 99,99   | 50     | Ilimitado | Empresarial     |
| **Diamond** | R$ 199,99 | Ilimitado | Ilimitado | Enterprise   |

---

## 🔄 **Fluxo de Funcionamento**

1. **Cadastro**: Usuário se registra e escolhe um plano
2. **Configuração**: Adiciona domínios permitidos no dashboard
3. **Script**: Sistema gera código de proteção único e ofuscado
4. **Implementação**: Usuário adiciona script aos funis de vendas
5. **Monitoramento**: Sistema detecta uso não autorizado em tempo real
6. **Ação**: Executa medidas de proteção configuradas automaticamente

---

## 🧪 **Qualidade e Testes**

### **Regras de Qualidade Implementadas**
- ✅ **15 regras de engenharia** aplicadas
- ✅ **TypeScript estrito** com coverage ~95%
- ✅ **ESLint + Prettier** com git hooks
- ✅ **Validação automática** pré-commit
- ✅ **Logging estruturado** para observabilidade

### **Automação**
- **Husky**: Git hooks automáticos
- **lint-staged**: Validação pré-commit
- **CI/CD Ready**: Scripts preparados para pipeline

### **Debug de Segurança** (Desenvolvimento)
```bash
# Verificar configuração CORS
curl http://localhost:3000/api/debug/cors

# Testar origem específica
curl -X POST http://localhost:3000/api/debug/cors \
  -H "Content-Type: application/json" \
  -d '{"testOrigin": "https://meudominio.com"}'
```

---

## 📚 **Documentação**

### **Arquitetura e Design**
- **[Database Schema](docs/database-schema.md)** - Estrutura completa do banco
- **[Script Loader System](docs/SCRIPT_LOADER_SYSTEM.md)** - Sistema de lookup seguro
- **[ADRs](docs/adr/)** - Decisões arquiteturais documentadas

### **Segurança**
- **[Auditoria de Segurança](docs/security/SECURITY_AUDIT_SUMMARY.md)** - Relatório completo
- **[Configuração CORS](docs/security/CORS_CONFIGURATION.md)** - Guia detalhado
- **[ADR de Segurança](docs/adr/2025-01-20-comprehensive-security-audit.md)** - Implementação técnica

### **Desenvolvimento**
- **[Regras de Qualidade](docs/QUALITY_RULES_IMPLEMENTED.md)** - 15 regras aplicadas
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Organização do código
- **[Changelog](docs/CHANGELOG.md)** - Histórico de mudanças

---

## 🔧 **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run build                  # Build de produção
npm run start                  # Servidor de produção

# Qualidade
npm run lint                   # ESLint
npm run lint:fix              # Corrigir problemas automaticamente
npm run type-check             # Verificação TypeScript
npm run format                 # Prettier
npm run validate              # Validação completa (lint + types + format)

# Banco de dados
npm run db:types              # Gerar tipos TypeScript do Supabase

# Git hooks
npm run pre-commit            # Hook pré-commit (automático)
```

---

## 🚀 **Deploy em Produção**

### **VPS + EasyPanel (Recomendado)**
1. Configurar variáveis no painel do EasyPanel
2. Definir `NEXT_PUBLIC_APP_URL` com seu domínio
3. Configurar `ALLOWED_ORIGINS` com domínios adicionais

### **Exemplo de Configuração EasyPanel**
```bash
# Environment Variables no EasyPanel
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://meuapp.com.br
ALLOWED_ORIGINS=https://meuapp.com.br,https://admin.meuapp.com.br
```

### **Outros VPS (Docker, PM2, etc.)**
1. Configurar todas as variáveis de ambiente
2. Build: `npm run build`
3. Start: `npm start` ou PM2

---

## 📞 **Suporte e Contato**

### **Reportar Vulnerabilidades**
- 🔒 **Email**: security@falconx.com
- ⏱️ **Response Time**: < 24h para vulnerabilidades críticas

### **Suporte Técnico**
- 💬 **Email**: dev@falconx.com
- 🔧 **GitHub Issues**: Para bugs e feature requests

### **Comunidade**
- 📖 **Documentação**: Sempre atualizada
- 🤝 **Contribuições**: PRs bem-vindos
- 📋 **Roadmap**: Issues com label `enhancement`

---

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🏆 **Reconhecimentos**

- **Next.js Team** - Framework excepcional
- **Supabase** - Backend-as-a-Service poderoso
- **EasyPanel** - Plataforma VPS simplificada
- **Tailwind CSS** - Framework CSS utilitário

---

**Desenvolvido com ❤️ pela equipe FalconX**

> 🦅 **Proteja seus funis. Monitore em tempo real. Aja automaticamente.**
