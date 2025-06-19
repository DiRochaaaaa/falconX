# ADR: Arquitetura Consistente de Planos

**Data:** 2025-01-19  
**Status:** ✅ Implementado  
**Contexto:** Correção de inconsistência crítica na arquitetura de planos  

## Problema Identificado

O sistema tinha **DUAS FONTES DE VERDADE** para planos, causando inconsistências:

### ❌ Arquitetura Anterior (Inconsistente)
```
profiles.plan_type = 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
user_subscriptions.plan_id = NULL (ignorado)
```

**Problemas:**
- Código usava `profiles.plan_type` como string simples
- Tabela `plans` existia mas era ignorada
- `user_subscriptions.plan_id` estava sempre NULL
- Dados de preços/limites hardcoded no código
- Impossível fazer mudanças de planos dinâmicas

## Solução Implementada

### ✅ Nova Arquitetura (Consistente)
```
profiles.plan_type ↔️ plans.slug (sincronizados)
user_subscriptions.plan_id → plans.id (FK obrigatório)
plans = FONTE ÚNICA DE VERDADE
```

## Implementação

### 1. **Banco de Dados**
```sql
-- Corrigir user_subscriptions para usar plan_id correto
UPDATE user_subscriptions SET plan_id = 1 WHERE clone_limit = 1; -- free
UPDATE user_subscriptions SET plan_id = 2 WHERE clone_limit = 5; -- bronze

-- Trigger atualizado para usar plan_id
CREATE FUNCTION handle_new_user() -- usa plans.id
```

### 2. **Backend**
```typescript
// checkCloneLimits() - Nova implementação
const { data: subscription } = await supabase
  .from('user_subscriptions')
  .select(`
    *,
    plans (id, name, slug, clone_limit, price)
  `)
  .eq('user_id', userId)
  .single()

// Fonte única: subscription.plans.slug
planType: subscription.plans.slug
canDetectMore: subscription.plans.slug !== 'free'
```

### 3. **Tipos TypeScript**
```typescript
// Database.user_subscriptions.Insert
plan_id: number // OBRIGATÓRIO - referencia plans.id

// Função nova
getPlanFromDatabase(planSlug: string) // busca dados reais
```

## Benefícios

### ✅ **Consistência Total**
- Uma única fonte de verdade (`plans` table)
- Sincronização automática entre `profiles.plan_type` ↔️ `plans.slug`
- Dados sempre consistentes

### ✅ **Flexibilidade**
- Mudanças de preços via banco (sem deploy)
- Novos planos via INSERT na tabela `plans`
- Recursos dinâmicos via `plans.features` JSONB

### ✅ **Manutenibilidade**
- Código mais limpo (sem hardcoded values)
- Fácil auditoria de mudanças de planos
- Relatórios financeiros precisos

## Estado Final

### **Verificação Executada:**
```sql
✅ 4 usuários - TOTALMENTE CONSISTENTE
✅ profiles.plan_type = plans.slug
✅ user_subscriptions.clone_limit = plans.clone_limit  
✅ plan_id sempre preenchido (nunca NULL)
```

### **Fluxo Novo Usuário:**
1. 🟢 Trigger busca `plans.id` WHERE `slug = 'free'`
2. 🟢 Cria `profiles` com `plan_type = 'free'`
3. 🟢 Cria `user_subscriptions` com `plan_id = 1`
4. 🟢 Código usa `subscription.plans.*` como fonte única

## Decisão

**ADOTADA:** Arquitetura com `plans` table como fonte única de verdade.

**REJEITADA:** Manter `profiles.plan_type` como fonte única (perderia flexibilidade).

Esta decisão garante consistência total e flexibilidade para futuras expansões do sistema de planos. 