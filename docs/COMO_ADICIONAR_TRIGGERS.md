# Como Adicionar Novos Triggers para Todos os Usuários

## 📋 Visão Geral

Este guia explica como adicionar novos triggers de detecção para todos os usuários existentes do sistema FalconX.

## 🔧 Processo em 3 Etapas

### 1. **Adicionar Triggers no Código (Frontend)**

Edite o arquivo `src/modules/dashboard/domain/types.ts` e adicione os novos triggers no array `DEFAULT_TRIGGER_PARAMS`:

```typescript
// Exemplo: Adicionando triggers do Instagram
{
  key: 'igclid',
  name: 'Instagram Click ID',
  description: 'Identificador de clique do Instagram Ads',
  platform: 'Instagram',
  category: 'other',
  enabled: true,
},
{
  key: 'ig_source',
  name: 'Instagram Source',
  description: 'Fonte do Instagram',
  platform: 'Instagram',
  category: 'other',
  enabled: false,
},
```

### 2. **Atualizar Banco de Dados (Backend)**

Use o script SQL `database/add-new-triggers-for-all-users.sql`:

1. **Edite o script** e substitua a variável `new_triggers` pelos triggers que você quer adicionar:

```sql
new_triggers JSONB := '{
    "igclid": true,
    "ig_source": false,
    "snapclid": true,
    "snap_campaign": false
}';
```

2. **Execute no Supabase Dashboard**:
   - Vá para SQL Editor
   - Cole o script modificado
   - Execute

### 3. **Fazer Deploy das Mudanças**

```bash
git add -A
git commit -m "feat: adicionar triggers do Instagram e Snapchat"
git push
npm run build
```

## 📝 Exemplo Prático

### Cenário: Adicionar Triggers do Pinterest

1. **No código** (`types.ts`):

```typescript
{
  key: 'pinterest_id',
  name: 'Pinterest Campaign ID',
  description: 'ID da campanha do Pinterest',
  platform: 'Pinterest',
  category: 'other',
  enabled: false,
},
{
  key: 'pin_source',
  name: 'Pinterest Source',
  description: 'Fonte do Pinterest',
  platform: 'Pinterest',
  category: 'other',
  enabled: false,
}
```

2. **No SQL**:

```sql
new_triggers JSONB := '{
    "pinterest_id": false,
    "pin_source": false
}';
```

3. **Resultado**: Todos os usuários agora têm os triggers do Pinterest disponíveis (desabilitados por padrão).

## ⚠️ Boas Práticas

### ✅ Fazer

- **Sempre testar** em ambiente de desenvolvimento primeiro
- **Usar nomes descritivos** para os triggers
- **Documentar** a fonte/plataforma do trigger
- **Definir padrão sensato** (enabled: true/false)
- **Fazer backup** antes de executar scripts SQL

### ❌ Não Fazer

- **Nunca remover** triggers existentes (pode quebrar configurações)
- **Não usar** caracteres especiais nos nomes de triggers
- **Não executar** scripts em produção sem testar

## 🚀 Triggers Sugeridos para Futuras Adições

```typescript
// Snapchat Ads
{ key: 'snapclid', name: 'Snapchat Click ID', platform: 'Snapchat' }

// Instagram Ads
{ key: 'igclid', name: 'Instagram Click ID', platform: 'Instagram' }

// Pinterest Ads
{ key: 'pinterest_id', name: 'Pinterest Campaign ID', platform: 'Pinterest' }

// Reddit Ads
{ key: 'reddit_click_id', name: 'Reddit Click ID', platform: 'Reddit' }

// Microsoft Ads (Bing)
{ key: 'msclkid', name: 'Microsoft Click ID', platform: 'Microsoft' }

// Apple Search Ads
{ key: 'apple_search_id', name: 'Apple Search ID', platform: 'Apple' }
```

## 🔍 Verificação

Para verificar se os triggers foram adicionados corretamente:

```sql
-- Ver todos os triggers disponíveis
SELECT DISTINCT jsonb_object_keys(trigger_params) as trigger_name
FROM public.user_trigger_configs;

-- Ver quantos usuários têm cada trigger
SELECT
    key,
    COUNT(*) as users_with_trigger,
    COUNT(*) FILTER (WHERE value::boolean = true) as users_enabled
FROM public.user_trigger_configs,
     jsonb_each(trigger_params)
GROUP BY key
ORDER BY key;
```

## 📞 Suporte

Se houver problemas:

1. Verifique os logs do Supabase
2. Teste em usuário específico primeiro
3. Faça rollback se necessário
4. Consulte a documentação do sistema
