# Configuração de CORS Dinâmica - FalconX

## 📋 Visão Geral

O FalconX utiliza um sistema de CORS dinâmico e seguro que:
- ✅ **Protege APIs críticas** com domínios autorizados apenas
- ✅ **Permite APIs públicas** funcionarem de qualquer origem
- ✅ **Configura automaticamente** domínios da aplicação
- ✅ **Suporta desenvolvimento** local automático
- ✅ **Compatível com VPS, EasyPanel** e outras plataformas

---

## 🛠️ Como Funciona

### **APIs Públicas** (`/api/collect`, `/api/detect`)
```typescript
// CORS permissivo - necessário para scripts funcionarem
'Access-Control-Allow-Origin': '*'
```
**Por quê?** Esses endpoints precisam funcionar quando embedados em qualquer site.

### **APIs Protegidas** (`/api/plan-limits`, dashboard)
```typescript
// CORS restritivo - apenas domínios autorizados
'Access-Control-Allow-Origin': 'https://app.falconx.com'
```
**Por quê?** Previne ataques de sites maliciosos acessando dados sensíveis.

---

## ⚙️ Configuração

### **Variáveis de Ambiente**

```bash
# Domínios autorizados manualmente
ALLOWED_ORIGINS=https://falconx.com,https://app.falconx.com

# URL pública da aplicação (VPS, EasyPanel, etc.)
NEXT_PUBLIC_APP_URL=https://app.falconx.com
```

### **Domínios Incluídos Automaticamente**

O sistema inclui automaticamente:

1. **Desenvolvimento Local**:
   - `http://localhost:3000`
   - `http://localhost:3001` 
   - `http://127.0.0.1:3000`

2. **Produção (VPS/EasyPanel)**:
   - `${NEXT_PUBLIC_APP_URL}` (configurável)

3. **Configuração Manual**:
   - Todos os domínios em `ALLOWED_ORIGINS`

4. **Subdomínios**:
   - Automaticamente permite subdomínios dos domínios configurados
   - Ex: `app.falconx.com` permite `admin.falconx.com`

---

## 🔧 Debug e Testes

### **Endpoint de Debug** (Apenas Desenvolvimento)

```bash
# Ver configuração atual
GET http://localhost:3000/api/debug/cors

# Testar origem específica
POST http://localhost:3000/api/debug/cors
{
  "testOrigin": "https://app.falconx.com"
}
```

### **Resposta de Debug**
```json
{
  "allowedOrigins": [
    "https://falconx.com",
    "https://app.falconx.com"
  ],
  "environment": "development",
  "appUrl": "https://app.falconx.com",
  "manualOrigins": ["https://falconx.com", "https://app.falconx.com"],
  "platform": "VPS/EasyPanel (Generic)"
}
```

---

## 🚨 Resolução de Problemas

### **Erro: CORS block**
```
Access to fetch at 'https://app.falconx.com/api/plan-limits' 
from origin 'https://novo-dominio.com' has been blocked by CORS policy
```

**Solução**:
1. Adicionar domínio em `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://falconx.com,https://novo-dominio.com
```

2. Ou configurar subdomínio se aplicável:
```bash
ALLOWED_ORIGINS=https://falconx.com  # Permite *.falconx.com
```

### **APIs públicas não funcionam**
Se `/api/collect` ou `/api/detect` retornam CORS error, verifique:

1. **Header correto**: Deve retornar `Access-Control-Allow-Origin: *`
2. **Método correto**: Use `POST`, não `GET`
3. **Content-Type**: Deve ser `application/json`

### **Desenvolvimento local**
Em desenvolvimento, todos os `localhost` são permitidos automaticamente.

Se ainda tiver problemas:
```bash
# Verificar debug
curl http://localhost:3000/api/debug/cors
```

---

## 🛡️ Segurança

### **Cache Inteligente**
- Domínios são cacheados por 1 minuto
- Reduz overhead de parsing em cada request
- Permite updates dinâmicos sem restart

### **Validação Rigorosa**
- URLs malformadas são rejeitadas
- Apenas HTTPS em produção (exceto localhost)
- Subdomínios precisam ter mesmo protocolo

### **Logs de Segurança**
Tentativas de acesso não autorizadas são logadas:
```typescript
logger.securityEvent('cors_violation', {
  origin: 'https://site-malicioso.com',
  endpoint: '/api/plan-limits'
})
```

---

## 📊 Monitoramento

### **Métricas Importantes**
- Requests bloqueadas por CORS
- Origins mais frequentes
- Tentativas de acesso não autorizadas

### **Alertas**
Configure alertas para:
- Múltiplas tentativas de domínios não autorizados
- Picos de requests bloqueadas
- Novos domínios tentando acessar APIs críticas

---

## 🚀 Deploy em Produção

### **VPS + EasyPanel**
1. Configurar `NEXT_PUBLIC_APP_URL` com seu domínio
2. Adicionar domínios adicionais em `ALLOWED_ORIGINS`
3. EasyPanel: Configurar variáveis no painel de controle

### **Outros VPS (Docker, PM2, etc.)**
1. Configurar todas as variáveis de ambiente
2. Incluir domínios de staging/preview
3. Testar com endpoint de debug antes do deploy

### **Exemplo de Deploy EasyPanel**
```bash
# No painel do EasyPanel - Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://meuapp.com.br
ALLOWED_ORIGINS=https://meuapp.com.br,https://admin.meuapp.com.br
```

---

## ✅ Checklist de Configuração

- [ ] `ALLOWED_ORIGINS` configurado com domínios de produção
- [ ] `NEXT_PUBLIC_APP_URL` definido com URL da aplicação
- [ ] Testado endpoint de debug em desenvolvimento
- [ ] APIs públicas retornam `*` em CORS
- [ ] APIs protegidas retornam origem específica
- [ ] Subdomínios funcionam se necessário
- [ ] Logs de segurança configurados

---

**Lembre-se**: CORS é uma proteção do browser, não do servidor. Para segurança real, sempre use autenticação JWT em APIs sensíveis! 