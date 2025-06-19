# 🚀 Sistema de Script Loader - FalconX

## 📋 Visão Geral

O FalconX implementou um sistema revolucionário de **Script Loader** que substitui o script inline tradicional por uma solução ultra-compacta, ofuscada e stealth.

## ✨ Nova Arquitetura

### **Antes (Script Inline)**

```html
<script>
  ;(function () {
    const userId = '123e4567-e89b-12d3-a456-426614174000'
    const detectUrl = 'https://app.com/api/detect'
    const actionUrl = 'https://app.com/api/execute-action'

    function detectClone() {
      // ~2.5KB de código visível
      // URLs expostas
      // Lógica óbvia
    }

    detectClone()
    setInterval(detectClone, 120000)
  })()
</script>
```

### **Agora (Script Loader)**

```html
<script src="https://falconx.com/api/js/fx_a1b2c3d4e5f6.js" async defer></script>
```

## 🎯 Vantagens do Novo Sistema

### **1. 🕵️ Stealth Máximo**

- Parece um script de analytics comum (Google, Facebook, etc.)
- Não desperta suspeitas em quem está clonando
- URL genérica sem referências óbvias ao anti-clone

### **2. 🔒 Ofuscação Total**

- Código JavaScript completamente ofuscado
- Variáveis com nomes aleatórios (`_0xa1b2`, `_0xc3d4`)
- URLs codificadas em Base64
- Lógica fragmentada e ilegível

### **3. ⚡ Performance Superior**

- **80 bytes** vs **2.5KB** (97% menor!)
- Carregamento assíncrono (`async defer`)
- Cache otimizado (1h browser, 24h CDN)
- Reduz tempo de carregamento da página

### **4. 🔄 Atualizações Automáticas**

- Mudanças no sistema sem recolocar script
- Versionamento automático
- Rollback instantâneo se necessário

### **5. 🛡️ Segurança Aprimorada**

- UserID nunca exposto no código
- Endpoints genéricos (`/api/collect`, `/api/process`)
- Rate limiting por IP + UserID
- Headers de segurança otimizados

## 🏗️ Arquitetura Técnica

### **Fluxo de Funcionamento**

```mermaid
graph TD
    A[Site do Usuário] --> B[Script Loader 80 bytes]
    B --> C[GET /api/js/fx_abc123.js]
    C --> D[Script Ofuscado Dinâmico]
    D --> E[Execução no Browser]
    E --> F[POST /api/collect]
    F --> G[Detecção de Clone]
    G --> H[POST /api/process]
    H --> I[Execução de Ação]
```

### **Componentes**

#### **1. Script Loader (`/api/js/[scriptId].js`)**

- Gera script único por usuário
- Valida scriptId com hash SHA256
- Retorna JavaScript ofuscado
- Headers de cache otimizados

#### **2. API Collect (`/api/collect`)**

- Substitui `/api/detect`
- Parâmetros ofuscados (`uid`, `dom`, `url`)
- UserID codificado em Base64
- Rate limiting inteligente

#### **3. API Process (`/api/process`)**

- Substitui `/api/execute-action`
- Lógica de triggers preservada
- Respostas genéricas
- Execução baseada em porcentagem

## 🔧 Implementação

### **Geração de Script ID**

```typescript
function generateScriptId(userId: string): string {
  const SECRET_KEY = process.env.SCRIPT_SECRET_KEY
  const hash = createHash('sha256')
    .update(userId + SECRET_KEY)
    .digest('hex')
  return `fx_${hash.substring(0, 12)}`
}
```

### **Script Ofuscado (Exemplo)**

```javascript
;(function (_0xa1b2, _0xc3d4) {
  const _0xe5f6 = 'aHR0cHM6Ly9mYWxjb254LmNvbS9hcGkvY29sbGVjdA=='
  const _0xg7h8 = 'aHR0cHM6Ly9mYWxjb254LmNvbS9hcGkvcHJvY2Vzcw=='
  const _0xi9j0 = 'MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAw'

  function _0xk1l2() {
    const _0xm3n4 = atob(_0xe5f6)
    const _0xo5p6 = atob(_0xi9j0)

    fetch(_0xm3n4, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: _0xo5p6,
        dom: location.hostname,
        url: location.href,
        ref: document.referrer,
        ua: navigator.userAgent,
        ts: new Date().toISOString(),
      }),
    })
      .then(_0xq7r8 => _0xq7r8.json())
      .then(_0xs9t0 => {
        if (_0xs9t0.status === 'detected') {
          _0xu1v2()
        }
      })
      .catch(_0xw3x4 => console.log(''))
  }

  // ... resto do código ofuscado
})()
```

## 📊 Comparação Detalhada

| Aspecto          | Script Inline (Antigo) | Script Loader (Novo)   |
| ---------------- | ---------------------- | ---------------------- |
| **Tamanho**      | ~2.5KB                 | ~80 bytes              |
| **Stealth**      | ❌ Óbvio               | ✅ Parece analytics    |
| **Ofuscação**    | ❌ Código visível      | ✅ Totalmente ofuscado |
| **Performance**  | ❌ Bloqueia parsing    | ✅ Assíncrono          |
| **Cache**        | ❌ Sem cache           | ✅ Cache otimizado     |
| **Atualizações** | ❌ Manual              | ✅ Automáticas         |
| **Segurança**    | ❌ UserID exposto      | ✅ UserID oculto       |
| **URLs**         | ❌ APIs expostas       | ✅ Endpoints genéricos |

## 🛠️ Configuração

### **Variáveis de Ambiente**

```bash
# Chave secreta para geração de Script IDs
SCRIPT_SECRET_KEY=sua-chave-secreta-para-scripts-2025

# URL base da aplicação
NEXT_PUBLIC_APP_URL=https://falconx.com
```

### **Headers de Cache**

```typescript
const scriptHeaders = {
  'Content-Type': 'application/javascript; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1h browser, 24h CDN
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
}
```

## 🔍 Detecção de Problemas

### **Script ID Inválido**

```javascript
// Formato esperado: fx_abc123def456 (15 caracteres)
if (!scriptId.startsWith('fx_') || scriptId.length !== 15) {
  return new NextResponse('// Script not found', { status: 404 })
}
```

### **Rate Limiting**

```javascript
// 100 requests por minuto por IP + UserID
const rateLimitIdentifier = `${userId}:${clientIP}`
```

### **Logs de Monitoramento**

```typescript
logger.info('Script servido', {
  scriptId,
  userAgent: request.headers.get('user-agent'),
  referer: request.headers.get('referer'),
  processingTime: Date.now() - startTime,
})
```

## 🚀 Próximos Passos

### **Fase 2: Ofuscação Avançada**

- [ ] Biblioteca de ofuscação automática
- [ ] Rotação de variáveis por requisição
- [ ] Strings embaralhadas dinamicamente

### **Fase 3: CDN Integration**

- [ ] CloudFlare Workers
- [ ] Edge caching global
- [ ] Failover automático

### **Fase 4: Analytics Avançados**

- [ ] Métricas de performance do script
- [ ] Detecção de tentativas de reverse engineering
- [ ] Alertas de uso suspeito

## 📈 Impacto Esperado

### **Para o Usuário**

- ✅ Script mais discreto e profissional
- ✅ Melhor performance do site
- ✅ Menor chance de detecção pelos clones
- ✅ Atualizações automáticas

### **Para o Sistema**

- ✅ Redução de 97% no tráfego de scripts
- ✅ Cache otimizado reduz carga do servidor
- ✅ Logs mais detalhados para analytics
- ✅ Segurança aprimorada

---

## 🎉 Conclusão

O novo **Sistema de Script Loader** representa uma evolução significativa na arquitetura do FalconX, oferecendo:

1. **Máxima discrição** - Parece analytics comum
2. **Performance superior** - 97% menor e assíncrono
3. **Segurança aprimorada** - Ofuscação total
4. **Manutenibilidade** - Atualizações automáticas

Esta implementação coloca o FalconX na vanguarda dos sistemas de proteção anti-clone, oferecendo uma solução verdadeiramente stealth e profissional.
