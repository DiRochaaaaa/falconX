# ADR-2025-01-19: Correção Crítica - Constraint Única para Ações

## Status
✅ **IMPLEMENTADO** - 19/01/2025

## Contexto

### Problema Identificado
Durante auditoria do sistema, foi descoberto que usuários podiam ter **múltiplas ações ativas simultâneas**, causando:

- **Comportamento indefinido** na API `/process`
- **Conflito de lógica** (qual ação executar?)
- **Inconsistência de dados** no banco
- **Experiência confusa** para o usuário

### Dados Problemáticos Encontrados
```sql
-- Usuário com 2 ações ativas conflitantes:
user_id: 9ef5aaad-f217-4bc7-96f9-9b04728b513a
ações: [
  { action_type: "blank_page",     created_at: "2025-06-19 05:57:18" },
  { action_type: "custom_message", created_at: "2025-06-18 23:41:51" }
]
```

## Decisão

### Implementar Constraint Única
**REGRA:** Cada usuário pode ter **APENAS 1 ação ativa** por vez.

### Correções Implementadas:

#### 1. **Banco de Dados - Constraint Única**
```sql
CREATE UNIQUE INDEX idx_unique_active_action_per_user 
ON clone_actions (user_id) 
WHERE is_active = true;
```

#### 2. **Limpeza de Dados Inconsistentes**
- Removidas ações duplicadas (mantida a mais recente)
- Verificado: 0 usuários com múltiplas ações após limpeza

#### 3. **ActionService - Lógica de Substituição**
```typescript
// ANTES: INSERT direto (falhava com constraint)
await supabase.from('clone_actions').insert({...})

// DEPOIS: Desativar anterior + Inserir nova
await supabase.from('clone_actions')
  .update({ is_active: false })
  .eq('user_id', userId)
  .eq('is_active', true)

await supabase.from('clone_actions').insert({...})
```

## Consequências

### ✅ Benefícios
- **Consistência garantida** pelo banco de dados
- **Comportamento previsível** das APIs
- **UX melhorada** - sem confusão sobre qual ação está ativa
- **Prevenção de bugs** futuros

### ⚠️ Mudanças de Comportamento
- **Frontend:** "Criar ação" agora **substitui** a anterior
- **API:** Mensagem clara quando há conflito
- **Dados:** Ações anteriores ficam inativas (histórico preservado)

### 🔧 Compatibilidade
- **APIs existentes:** Funcionam normalmente
- **Scripts existentes:** Sem impacto
- **Dados históricos:** Preservados com `is_active = false`

## Implementação

### Arquivos Modificados
- `database/migration_add_unique_active_action_constraint.sql`
- `src/modules/dashboard/infrastructure/services/action-service.ts`

### Teste de Constraint
```sql
-- ✅ Teste confirmado - erro esperado:
INSERT INTO clone_actions (user_id, action_type, is_active) 
VALUES ('usuario-existente', 'redirect_traffic', true);
-- ERROR: duplicate key value violates unique constraint
```

## Monitoramento

### Verificação Contínua
```sql
-- Query para detectar violações (deve retornar 0):
SELECT user_id, COUNT(*) as active_actions
FROM clone_actions 
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### Logs de Sistema
- ActionService agora loga desativações automáticas
- Mensagens de erro claras para desenvolvedores

## Conclusão

Esta correção resolve um **bug crítico** que poderia causar comportamento imprevísível do sistema. A implementação garante:

1. **Integridade de dados** via constraint DB
2. **Lógica de negócio clara** (1 ação = 1 usuário)
3. **Experiência consistente** para usuários
4. **Base sólida** para funcionalidades futuras

**Status:** ✅ Implementado, testado e funcionando. 