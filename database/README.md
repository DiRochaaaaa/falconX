# 🗄️ Scripts de Banco de Dados - FalconX

Este diretório contém todos os scripts SQL necessários para configurar e manter o banco de dados do FalconX.

## 📋 Visão Geral

O FalconX utiliza **Supabase** (PostgreSQL) como banco de dados principal, com autenticação integrada e Row Level Security (RLS) para isolamento de dados.

## 🚀 Scripts Principais

### 1. `falconx-database-setup-safe.sql` ⭐

**Script principal de configuração inicial**

- ✅ Criação de todas as tabelas necessárias
- ✅ Configuração de Row Level Security (RLS)
- ✅ Criação de políticas de segurança
- ✅ Índices otimizados para performance
- ✅ Funções e triggers automáticos

**Uso**: Execute este script no Supabase SQL Editor para setup completo.

### 2. `fix-permissions-falconx.sql`

**Correção de permissões e políticas RLS**

- 🔧 Corrige problemas de acesso
- 🔧 Atualiza políticas de segurança
- 🔧 Garante isolamento correto entre usuários

**Uso**: Execute se houver problemas de permissão no sistema.

### 3. `setup-final-simples.sql`

**Setup simplificado para desenvolvimento**

- 🛠️ Versão minimalista do setup
- 🛠️ Ideal para testes e desenvolvimento local
- 🛠️ Menos validações, mais agilidade

**Uso**: Para ambientes de desenvolvimento/teste.

### 4. `falconx-useful-queries.sql`

**Queries úteis para administração**

- 📊 Consultas de análise de dados
- 📊 Relatórios de uso do sistema
- 📊 Queries de debugging e monitoramento

**Uso**: Para análise e manutenção do sistema.

### 5. `RESOLVER-AGORA.sql`

**Script de correções urgentes**

- 🚨 Correções críticas de produção
- 🚨 Patches de segurança
- 🚨 Fixes de bugs urgentes

**Uso**: Apenas em situações críticas.

## 🏗️ Estrutura do Banco

### Tabelas Principais

| Tabela               | Descrição            | Relacionamentos                       |
| -------------------- | -------------------- | ------------------------------------- |
| `profiles`           | Perfis de usuários   | Estende `auth.users`                  |
| `plans`              | Planos de assinatura | Referenciado por `user_subscriptions` |
| `user_subscriptions` | Assinaturas ativas   | `profiles` → `plans`                  |
| `allowed_domains`    | Domínios autorizados | Pertence a `profiles`                 |
| `detected_clones`    | Clones detectados    | Pertence a `profiles`                 |
| `clone_actions`      | Ações configuradas   | `profiles` → `detected_clones`        |
| `detection_logs`     | Logs detalhados      | `profiles` → `detected_clones`        |
| `generated_scripts`  | Scripts únicos       | Pertence a `profiles`                 |

### Enums Utilizados

```sql
-- Tipos de planos
CREATE TYPE plan_type_enum AS ENUM ('free', 'bronze', 'silver', 'gold');

-- Status de assinatura
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Tipos de ações
CREATE TYPE action_type_enum AS ENUM ('redirect', 'block', 'alert');
```

## 🔒 Segurança (RLS)

### Políticas Implementadas

- **Isolamento por Usuário**: Cada usuário vê apenas seus próprios dados
- **API Keys Protegidas**: Acesso controlado às chaves de API
- **Logs Privados**: Detecções isoladas por conta
- **Auditoria**: Todas as operações são logadas

### Exemplo de Política RLS

```sql
-- Usuários só veem seus próprios domínios
CREATE POLICY "Users can only see their own domains" ON allowed_domains
    FOR ALL USING (auth.uid() = user_id);
```

## 📊 Índices de Performance

### Índices Críticos

```sql
-- Busca rápida por API key
CREATE UNIQUE INDEX idx_profiles_api_key ON profiles(api_key);

-- Consultas de domínios por usuário
CREATE INDEX idx_allowed_domains_user_domain ON allowed_domains(user_id, domain);

-- Detecções por clone e data
CREATE INDEX idx_detection_logs_clone_timestamp ON detection_logs(clone_id, timestamp DESC);

-- Busca de clones por domínio
CREATE INDEX idx_detected_clones_domain_user ON detected_clones(clone_domain, user_id);
```

## 🚀 Como Usar

### 1. Setup Inicial (Primeira vez)

```bash
# No Supabase SQL Editor, execute:
1. falconx-database-setup-safe.sql
```

### 2. Após Setup, gere os tipos TypeScript

```bash
npm run db:types
```

### 3. Se houver problemas de permissão

```bash
# Execute no Supabase SQL Editor:
fix-permissions-falconx.sql
```

### 4. Para análise e monitoramento

```bash
# Use as queries de:
falconx-useful-queries.sql
```

## 🔧 Manutenção

### Backup Regular

- Supabase faz backup automático
- Para backup manual: Dashboard → Settings → Database → Backup

### Monitoramento

- Use as queries em `falconx-useful-queries.sql`
- Monitor de performance no Supabase Dashboard
- Logs de erro na aba Logs

### Migrações

- Sempre use scripts incrementais
- Teste em ambiente de desenvolvimento primeiro
- Documente mudanças no CHANGELOG.md

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Permissão RLS

```sql
-- Execute fix-permissions-falconx.sql
-- Ou verifique se o usuário está autenticado
SELECT auth.uid(); -- Deve retornar UUID válido
```

#### 2. Performance Lenta

```sql
-- Verifique índices
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Analise queries lentas
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

#### 3. Dados Inconsistentes

```sql
-- Use queries de verificação em falconx-useful-queries.sql
-- Exemplo: verificar integridade referencial
SELECT * FROM allowed_domains ad
LEFT JOIN profiles p ON ad.user_id = p.id
WHERE p.id IS NULL;
```

## 📈 Próximos Passos

- [ ] **Particionamento** de tabelas de logs por data
- [ ] **Materialização** de views de relatórios
- [ ] **Replicação** para análise (read replicas)
- [ ] **Arquivamento** de dados antigos

---

**Para mais informações, consulte o [Schema Completo](../docs/database-schema.md)**
