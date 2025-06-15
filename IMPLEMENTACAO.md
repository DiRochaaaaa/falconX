# 🚀 Falcon X - Guia de Implementação Completo

## 📋 Pré-requisitos
- ✅ Next.js com TypeScript instalado
- ✅ Supabase configurado
- ✅ Schema `falconx` criado no Supabase

---

## 🔧 Passo 1: Configurar o Banco de Dados

### 1.1 Executar o Script Principal
1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Cole o conteúdo de `falconx-database-setup.sql`
4. Execute o script
5. Verifique se todas as tabelas foram criadas no schema `falconx`

### 1.2 Verificar a Criação
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'falconx';
```

---

## 🔐 Passo 2: Configurar Autenticação

### 2.1 Configurar Supabase Auth no Next.js
```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 2.2 Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 2.3 Cliente Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 📊 Passo 3: Implementar Funcionalidades Básicas

### 3.1 Sistema de Login/Registro
- Página de login (`/login`)
- Página de registro (`/register`)
- Middleware de autenticação
- Redirecionamentos protegidos

### 3.2 Dashboard Principal
- Estatísticas básicas (total de clones detectados)
- Lista de domínios permitidos
- Lista de clones detectados (conforme plano)

### 3.3 Gerenciamento de Domínios
- Adicionar domínios permitidos
- Remover domínios
- Validação de domínios

---

## 🛡️ Passo 4: Geração do Script Anti-Clone

### 4.1 Endpoint para Gerar Script
```typescript
// pages/api/generate-script.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verificar autenticação
  // 2. Buscar usuário e seus domínios permitidos
  // 3. Gerar script ofuscado
  // 4. Salvar na tabela generated_scripts
  // 5. Retornar script para o usuário
}
```

### 4.2 Script Template
O script deve:
- Detectar o domínio atual
- Verificar se está na lista de permitidos
- Se não estiver, fazer chamada para API de detecção
- Aplicar ações configuradas (redirecionamento)

---

## 📡 Passo 5: API de Detecção

### 5.1 Endpoint de Detecção
```typescript
// pages/api/detect-clone.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verificar API key
  // 2. Validar domínio
  // 3. Registrar detecção
  // 4. Verificar ações configuradas
  // 5. Retornar ação a executar
}
```

### 5.2 Log de Detecções
- Registrar todas as detecções
- Atualizar contadores
- Manter histórico

---

## 💰 Passo 6: Sistema de Planos

### 6.1 Verificação de Limites
```typescript
// Função para verificar se usuário pode ver mais domínios
function canViewMoreDomains(userPlan: string, currentCount: number): boolean {
  const limits = {
    free: 0,
    bronze: 10,
    silver: 50, 
    gold: 200
  };
  return currentCount < limits[userPlan];
}
```

### 6.2 Webhook de Pagamento
```typescript
// pages/api/webhook/payment.ts
// Receber webhook do gateway de pagamento
// Atualizar assinatura do usuário
// Alterar plano ativo
```

---

## ⚡ Passo 7: Implementar Ações

### 7.1 Redirecionamento com fbclid
```javascript
// No script ofuscado
if (window.location.search.includes('fbclid')) {
  if (Math.random() < (redirectPercentage / 100)) {
    window.location.href = redirectUrl;
  }
}
```

### 7.2 Configuração de Ações
- Interface para configurar ações por clone
- Salvar na tabela `clone_actions`
- Aplicar em tempo real

---

## 🔒 Passo 8: Segurança e Performance

### 8.1 Rate Limiting
```typescript
// Implementar rate limiting nas APIs
// Prevenir abuso do sistema
```

### 8.2 Validações
- Validar domínios
- Sanitizar entradas
- Verificar permissões

### 8.3 Monitoramento
- Logs de erro
- Métricas de performance
- Alertas de segurança

---

## 📱 Passo 9: Interface do Usuário

### 9.1 Componentes Principais
- Dashboard com KPIs
- Tabela de clones detectados
- Formulário de domínios
- Configurador de ações
- Gerador de script

### 9.2 Responsividade
- Design mobile-first
- Interface intuitiva
- Feedback visual

---

## 🧪 Passo 10: Testes

### 10.1 Testes do Script
1. Criar domínio de teste
2. Instalar script em domínio permitido ✅
3. Instalar script em domínio não permitido ❌ (deve detectar)
4. Testar redirecionamento com fbclid

### 10.2 Testes da API
- Autenticação
- Detecção de clones
- Aplicação de ações
- Limites de planos

---

## 🚀 Passo 11: Deploy

### 11.1 Ambiente de Produção
- Configurar variáveis de ambiente
- Otimizar banco de dados
- Configurar CDN para scripts

### 11.2 Monitoramento
- Logs de aplicação
- Métricas de uso
- Alertas de erro

---

## 📈 Próximos Passos (Futuro)

### Funcionalidades Adicionais
- [ ] Página em branco (blank_page)
- [ ] Mensagens customizadas
- [ ] Análise de tráfego
- [ ] Integração com Google Analytics
- [ ] API para desenvolvedores
- [ ] Dashboard para parceiros

### Melhorias
- [ ] Machine Learning para detectar padrões
- [ ] Relatórios avançados
- [ ] Notificações em tempo real
- [ ] App mobile

---

## 🆘 Troubleshooting

### Problemas Comuns
1. **RLS não funcionando**: Verificar políticas de segurança
2. **Script não detectando**: Verificar domínios permitidos
3. **Redirecionamento não funciona**: Verificar parâmetros fbclid
4. **API lenta**: Otimizar queries e índices

### Comandos Úteis
```sql
-- Ver logs de erro
SELECT * FROM falconx.detection_logs 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Verificar usuários ativos
SELECT COUNT(*) FROM falconx.profiles 
WHERE updated_at >= NOW() - INTERVAL '24 hours';
```

---

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Verificar documentação do Supabase
2. Consultar arquivo `falconx-useful-queries.sql`
3. Revisar logs de erro
4. Testar em ambiente de desenvolvimento primeiro

---

**✅ Com essa estrutura, o Falcon X estará pronto para funcionar como um SaaS robusto e escalável!** 