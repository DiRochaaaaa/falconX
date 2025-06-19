# ADR-009: Remoção da Coluna plan_type e Normalização da Arquitetura de Planos

**Status:** ✅ Implementado  
**Data:** 2025-01-19  
**Decisor:** Arquiteto do Sistema  

## Contexto

O sistema FalconX tinha uma **violação grave de normalização** na estrutura do banco de dados:

- **Dupla fonte da verdade**: `profiles.plan_type` (text) e `user_subscriptions.plan_id` (FK)
- **Redundância de dados**: Mesma informação armazenada em dois lugares
- **Risco de inconsistência**: Possibilidade de `plan_type` e `plan_id` terem valores conflitantes
- **Violação da 3ª Forma Normal**: Dependência transitiva entre plano e perfil

### Problemas Identificados

```sql
-- Cenário perigoso possível:
-- profiles.plan_type = 'bronze'
-- user_subscriptions.plan_id = 3 (que é 'silver')
-- Qual é o plano real do usuário? 🤔
```

## Decisão

**Remover completamente a coluna `profiles.plan_type`** e usar `user_subscriptions` como **única fonte da verdade** para informações de planos.

### Estrutura Final

```sql
-- ANTES (problemático)
profiles: id, email, plan_type, api_key, ...
user_subscriptions: user_id, plan_id, current_count, ...
plans: id, name, slug, price, ...

-- DEPOIS (normalizado)
profiles: id, email, api_key, ...  -- SEM plan_type
user_subscriptions: user_id, plan_id, current_count, ...
plans: id, name, slug, price, ...

-- Consulta para obter plano do usuário:
SELECT p.*, pl.name, pl.slug, pl.clone_limit
FROM profiles p
JOIN user_subscriptions us ON p.id = us.user_id  
JOIN plans pl ON us.plan_id = pl.id
WHERE p.id = $user_id;
```

## Implementação

### 1. Migração de Banco de Dados

```sql
-- Remover constraint e coluna
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_type_check;
ALTER TABLE profiles DROP COLUMN IF EXISTS plan_type;
```

### 2. Código TypeScript

- **Criada função `getUserPlanInfo()`** para buscar dados via JOIN
- **Novo tipo `ProfileWithPlan`** que inclui informações do plano
- **Atualizado `DashboardUser`** para estender `ProfileWithPlan`
- **Removidas todas as referências a `plan_type`** no código

### 3. APIs Atualizadas

- `/api/detect/` - Usa nova estrutura de limites
- `/api/plan-limits/` - Retorna dados normalizados
- `checkCloneLimits()` - Busca diretamente de `user_subscriptions`

### 4. Frontend Atualizado

- `useAuth` - Usa `getUserPlanInfo()`
- Componentes do dashboard - Usam `profile.plan.slug` e `profile.plan.name`
- Navigation - Mostra plano via JOIN

## Benefícios

✅ **Única fonte da verdade** - Elimina inconsistências  
✅ **Normalização adequada** - Segue 3ª Forma Normal  
✅ **Facilita mudanças de plano** - Atualização centralizada  
✅ **Histórico possível** - Base para tracking de mudanças  
✅ **Código mais limpo** - Menos condicionais de validação  

## Trade-offs

❌ **Performance**: JOINs são ligeiramente mais lentos que consulta direta  
✅ **Solução**: Índices adequados + cache quando necessário  

❌ **Complexidade de consulta**: Requer JOIN em vez de SELECT simples  
✅ **Solução**: Função helper `getUserPlanInfo()` abstrai complexidade  

## Validação

### Testes Realizados

```sql
-- ✅ Coluna plan_type removida
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'plan_type';
-- Resultado: vazio

-- ✅ Todos os usuários têm subscription
SELECT COUNT(*) FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id
WHERE us.user_id IS NULL;
-- Resultado: 0

-- ✅ JOIN funciona corretamente
SELECT p.email, pl.name FROM profiles p
JOIN user_subscriptions us ON p.id = us.user_id
JOIN plans pl ON us.plan_id = pl.id;
-- Resultado: 4 registros válidos
```

## Monitoramento

- **Performance**: Monitorar tempo de resposta das consultas com JOIN
- **Consistência**: Alertas se usuário sem subscription ativa
- **Funcionalidade**: Testes E2E do fluxo de planos

## Conclusão

Esta migração **corrigiu uma falha arquitetural crítica** e estabeleceu uma base sólida para:

- Sistema de billing mais robusto
- Histórico de mudanças de plano
- Extensões futuras (trials, descontos, etc.)
- Compliance com boas práticas de normalização

**Impacto**: Zero downtime, backward compatibility mantida via função helper. 