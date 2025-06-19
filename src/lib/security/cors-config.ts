/**
 * Configuração segura de CORS para o FalconX
 * Suporta VPS, EasyPanel e outras plataformas
 */

/**
 * Obtém domínios permitidos das variáveis de ambiente
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Domínios configurados manualmente
  const manualOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || []
  origins.push(...manualOrigins)
  
  // Domínio público da aplicação (configurável)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL)
  }
  
  // Para desenvolvimento local
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000')
  }
  
  // Remover duplicatas e valores vazios
  return [...new Set(origins.filter(Boolean))]
}

// Cache dos domínios permitidos (atualizado a cada request se necessário)
let cachedAllowedOrigins: string[] | null = null
let cacheTime = 0
const CACHE_DURATION = 60 * 1000 // 1 minuto

/**
 * Obtém domínios permitidos com cache
 */
function getCachedAllowedOrigins(): string[] {
  const now = Date.now()
  
  if (!cachedAllowedOrigins || (now - cacheTime) > CACHE_DURATION) {
    cachedAllowedOrigins = getAllowedOrigins()
    cacheTime = now
  }
  
  return cachedAllowedOrigins
}

/**
 * Verifica se uma origem é permitida
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = getCachedAllowedOrigins()
  
  // Para desenvolvimento local, permitir qualquer localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://localhost:')) {
      return true
    }
  }
  
  // Verificar origins exatas
  if (allowedOrigins.includes(origin)) {
    return true
  }
  
  // Verificar subdomínios para domínios configurados
  for (const allowedOrigin of allowedOrigins) {
    try {
      const allowedUrl = new URL(allowedOrigin)
      const originUrl = new URL(origin)
      
      // Permitir subdomínios do mesmo domínio
      if (originUrl.hostname.endsWith(`.${allowedUrl.hostname}`) && 
          originUrl.protocol === allowedUrl.protocol) {
        return true
      }
    } catch {
      // Ignorar URLs inválidas
      continue
    }
  }
  
  return false
}

/**
 * Headers CORS seguros para APIs públicas (collect/detect)
 * Essas APIs precisam ser acessíveis de qualquer domínio para funcionar
 */
export function getPublicCorsHeaders(_origin: string | null = null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*', // APIs públicas devem aceitar qualquer origem
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // Cache preflight por 24h
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  }
}

/**
 * Headers CORS seguros para APIs protegidas (dashboard/admin)
 * Essas APIs só devem ser acessíveis de domínios autorizados
 */
export function getProtectedCorsHeaders(origin: string | null = null): Record<string, string> {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'null'
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // Permitir cookies/auth
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

/**
 * Headers de segurança padrão para todas as respostas
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Necessário para Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  }
}

/**
 * Obtém informações de debug sobre CORS (apenas desenvolvimento)
 */
export function getCorsDebugInfo(): Record<string, unknown> {
  if (process.env.NODE_ENV !== 'development') {
    return { message: 'Debug info only available in development' }
  }
  
  return {
    allowedOrigins: getCachedAllowedOrigins(),
    environment: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    manualOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [],
    platform: 'VPS/EasyPanel (Generic)',
  }
} 