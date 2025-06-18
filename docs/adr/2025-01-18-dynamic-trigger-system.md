# ADR-004: Sistema Dinâmico de Triggers para Detecção de Ads

**Data**: 2025-01-18  
**Status**: Implementado  
**Decisor**: Sistema de Arquitetura

## Contexto

O sistema anterior utilizava triggers hard-coded (`fbclid: true, gclid: false, utm_source: false`) para detectar quando ações deveriam ser executadas. Isso causava problemas:

1. **Inflexibilidade**: Usuários não podiam configurar quais parâmetros ativariam as ações
2. **Limitação de Plataformas**: Apenas 3 parâmetros suportados (Facebook, Google, UTM)
3. **Bugs de Detecção**: `utm_source=sexo` não era detectado porque estava configurado como `false`
4. **Manutenção Complexa**: Mudanças exigiam alterações de código

## Decisão

Implementamos um **Sistema Dinâmico de Triggers** com as seguintes características:

### 1. Arquitetura Modular

```
src/modules/dashboard/
├── domain/types.ts (27 triggers de diferentes plataformas)
├── infrastructure/services/trigger-service.ts
├── ui/components/TriggerConfigModal.tsx
└── ui/sections/ActionsSection.tsx (integração)
```

### 2. Triggers Suportados

Expandimos de 3 para **27 parâmetros** cobrindo todas as principais plataformas:

**Facebook/Meta Ads**:

- `fbclid` (ativo por padrão)
- `fb_action_ids`, `fb_action_types`, `fb_source`

**Google Ads**:

- `gclid` (ativo por padrão)
- `gclsrc`, `dclid`, `wbraid`, `gbraid`

**UTM Parameters**:

- `utm_source`, `utm_medium`, `utm_campaign` (ativos por padrão)
- `utm_term`, `utm_content`

**TikTok Ads**:

- `ttclid` (ativo por padrão)
- `tt_content`

**Outras Plataformas**:

- Twitter/X: `twclid`
- LinkedIn: `li_fat_id`, `lipi`
- YouTube: `ytclid`
- Genéricos: `ref`, `source`, `medium`, `campaign`, `ad_id`, `creative_id`, `placement_id`

### 3. Banco de Dados

Nova tabela `user_trigger_configs`:

```sql
CREATE TABLE falconx.user_trigger_configs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id),
    trigger_params JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 4. Interface de Usuário

- **Modal de Configuração**: Interface visual para ativar/desativar triggers
- **Agrupamento por Categoria**: Organização por plataforma (Facebook, Google, UTM, etc.)
- **Feedback Visual**: Indicadores de quantos triggers estão ativos
- **Persistência**: Configurações salvas automaticamente

### 5. Lógica de Detecção Aprimorada

```typescript
// Verifica triggers tanto no referrer quanto na currentUrl
if (referrer && hasParams) -> verifica triggers
if (!found && currentUrl && hasParams) -> verifica triggers
if (!triggers_configurados) -> sempre executa
```

## Consequências

### ✅ Benefícios

1. **Flexibilidade Total**: Usuários configuram seus próprios triggers
2. **Cobertura Completa**: Suporte para todas as principais plataformas de ads
3. **Sem Hard-Code**: Sistema completamente configurável
4. **Arquitetura Limpa**: Separação clara entre domain, application, infrastructure e UI
5. **Performance**: Índices otimizados e cache inteligente
6. **UX Profissional**: Interface intuitiva com feedback visual

### ⚠️ Riscos Mitigados

1. **Compatibilidade**: Sistema mantém fallback para configurações antigas
2. **Performance**: Queries otimizadas com índices específicos
3. **Usabilidade**: Padrões inteligentes pré-configurados

### 📊 Métricas de Sucesso

- **Cobertura**: 27 triggers vs 3 anteriores (+800%)
- **Flexibilidade**: 100% configurável pelo usuário
- **Detecção**: Corrigido bug do `utm_source` e outros parâmetros
- **Arquitetura**: Seguindo princípios SOLID e clean architecture

## Implementação

### Arquivos Criados

- `src/modules/dashboard/infrastructure/services/trigger-service.ts`
- `src/modules/dashboard/ui/components/TriggerConfigModal.tsx`
- `database/add-trigger-config-table.sql`

### Arquivos Modificados

- `src/modules/dashboard/domain/types.ts` (27 triggers definidos)
- `src/modules/dashboard/ui/sections/ActionsSection.tsx` (integração)
- `src/app/api/execute-action/route.ts` (detecção aprimorada)
- `src/lib/types/database.ts` (nova tabela)

### Próximos Passos

1. **Executar SQL**: `database/add-trigger-config-table.sql` no Supabase
2. **Migração**: Usuários existentes receberão configurações padrão
3. **Monitoramento**: Acompanhar taxa de detecção e configurações dos usuários

## Notas Técnicas

- **Padrão Singleton**: TriggerService instanciado uma vez por componente
- **Cache Local**: Configurações carregadas sob demanda
- **Validação**: Todos os triggers validados antes de salvar
- **Fallback**: Sistema funciona mesmo sem configuração (usa padrões)

---

**Este ADR documenta uma melhoria fundamental na flexibilidade e cobertura do sistema de detecção de ads, eliminando hard-coding e expandindo significativamente as capacidades de detecção.**
