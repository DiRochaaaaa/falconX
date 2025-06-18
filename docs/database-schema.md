# Falcon X - Database Schema Documentation

## 📋 Visão Geral do Sistema

O Falcon X é um SaaS que detecta clones de funis de vendas através de um script ofuscado.

### Fluxo Principal:

1. Usuário se cadastra e escolhe um plano
2. Usuário cadastra seus domínios permitidos
3. Sistema gera script ofuscado único
4. Usuário incorpora script em seus funis
5. Script detecta uso em domínios não autorizados
6. Sistema registra detecções e permite ações

---

## 🏗️ Estrutura do Banco de Dados

### Schema: `public` (Supabase na nuvem)

**IMPORTANTE**: O sistema utiliza Supabase na nuvem com schema `public`, não `falconx`.

## 📊 Tabelas

### 1. `profiles` - Perfis de Usuários

Extensão da tabela `auth.users` do Supabase Auth.

**Campos:**

- `id` (UUID, PK) - Referência ao auth.users
- `email` (TEXT) - Email do usuário
- `full_name` (TEXT) - Nome completo
- `avatar_url` (TEXT) - URL do avatar
- `plan_type` (ENUM) - Tipo do plano atual
- `api_key` (TEXT) - Chave única para API
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `plans` - Planos de Assinatura

Define os limites e preços dos planos.

**Campos:**

- `id` (SERIAL, PK)
- `name` (TEXT) - Nome do plano
- `price` (DECIMAL) - Preço mensal
- `domain_limit` (INTEGER) - Limite de domínios detectados
- `extra_domain_price` (DECIMAL) - Preço por domínio extra
- `features` (JSONB) - Funcionalidades do plano
- `is_active` (BOOLEAN) - Plano ativo

### 3. `user_subscriptions` - Assinaturas dos Usuários

Controla as assinaturas ativas.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Referência ao profiles
- `plan_id` (INTEGER, FK) - Referência ao plans
- `status` (ENUM) - Status da assinatura
- `started_at` (TIMESTAMP) - Início da assinatura
- `expires_at` (TIMESTAMP) - Expiração
- `webhook_data` (JSONB) - Dados do webhook de pagamento

### 4. `allowed_domains` - Domínios Permitidos

Domínios cadastrados pelo usuário onde o script pode funcionar.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Proprietário do domínio
- `domain` (TEXT) - Domínio permitido
- `is_active` (BOOLEAN) - Domínio ativo
- `created_at` (TIMESTAMP)

### 5. `generated_scripts` - Scripts Gerados

Scripts ofuscados únicos para cada usuário.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Proprietário do script
- `script_id` (TEXT) - ID único do script
- `script_content` (TEXT) - Conteúdo ofuscado
- `version` (INTEGER) - Versão do script
- `is_active` (BOOLEAN) - Script ativo
- `created_at` (TIMESTAMP)

### 6. `detected_clones` - Clones Detectados

Domínios que foram detectados usando o script sem autorização.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Usuário que foi clonado
- `clone_domain` (TEXT) - Domínio que fez o clone
- `original_domain` (TEXT) - Domínio original
- `ip_address` (INET) - IP do clone
- `user_agent` (TEXT) - User agent
- `first_detected` (TIMESTAMP) - Primeira detecção
- `last_seen` (TIMESTAMP) - Última vez visto
- `detection_count` (INTEGER) - Número de detecções
- `is_blocked` (BOOLEAN) - Se está bloqueado

### 7. `clone_actions` - Ações Configuradas

Ações que o usuário configurou para cada clone detectado.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Usuário que configurou
- `clone_id` (INTEGER, FK) - Clone alvo
- `action_type` (ENUM) - Tipo da ação
- `redirect_url` (TEXT) - URL para redirecionamento
- `redirect_percentage` (INTEGER) - % de tráfego a redirecionar
- `trigger_params` (JSONB) - Parâmetros para trigger (ex: fbclid)
- `is_active` (BOOLEAN) - Ação ativa
- `created_at` (TIMESTAMP)

### 8. `detection_logs` - Logs de Detecção

Log detalhado de todas as detecções para análise.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Usuário afetado
- `clone_id` (INTEGER, FK) - Clone relacionado
- `ip_address` (INET) - IP da detecção
- `user_agent` (TEXT) - User agent
- `referrer` (TEXT) - Referrer
- `page_url` (TEXT) - URL da página
- `timestamp` (TIMESTAMP) - Momento da detecção

### 9. `user_trigger_configs` - Configurações de Triggers

Configurações personalizadas de triggers por usuário para detecção de parâmetros de ads.

**Campos:**

- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - Usuário proprietário
- `trigger_params` (JSONB) - Configuração de triggers: `{"fbclid": true, "utm_source": true, ...}`
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Última atualização

**Triggers Suportados:**

- **Facebook/Meta**: `fbclid`, `fb_action_ids`, `fb_action_types`, `fb_source`
- **Google Ads**: `gclid`, `gclsrc`, `dclid`, `wbraid`, `gbraid`
- **UTM Parameters**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- **TikTok**: `ttclid`, `tt_content`
- **Twitter/X**: `twclid`
- **LinkedIn**: `li_fat_id`, `lipi`
- **YouTube**: `ytclid`
- **Genéricos**: `ref`, `source`, `medium`, `campaign`, `ad_id`, `creative_id`, `placement_id`

---

## 🔒 Segurança (Row Level Security)

### Políticas RLS:

- Usuários só veem seus próprios dados
- API keys são protegidas
- Logs são isolados por usuário
- Detecções são privadas por conta

---

## 🔑 Índices Importantes

- `profiles.api_key` (único)
- `allowed_domains.domain` + `user_id`
- `detected_clones.clone_domain` + `user_id`
- `detection_logs.timestamp` (para análises)

---

## 📈 Enums Utilizados

### `plan_type_enum`:

- 'free'
- 'bronze'
- 'silver'
- 'gold'

### `subscription_status_enum`:

- 'active'
- 'expired'
- 'cancelled'
- 'pending'

### `action_type_enum`:

- 'redirect_traffic'
- 'blank_page' (futuro)
- 'custom_message' (futuro)
