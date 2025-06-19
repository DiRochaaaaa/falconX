import { logger } from '@/lib/logger'

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

/**
 * Rate limiter em memória (para produção usar Redis)
 * Diferentes limites para diferentes tipos de endpoint
 */
class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  
  // Configurações de rate limiting por tipo de endpoint
  private configs = {
    // APIs públicas (mais restritivas)
    public: {
      maxRequests: 50,      // 50 requests
      windowMs: 60 * 1000,  // por minuto
      blockDuration: 5 * 60 * 1000, // block por 5 min
    },
    
    // APIs protegidas (menos restritivas para usuários autenticados)
    protected: {
      maxRequests: 200,     // 200 requests  
      windowMs: 60 * 1000,  // por minuto
      blockDuration: 2 * 60 * 1000, // block por 2 min
    },
    
    // APIs críticas (muito restritivas)
    critical: {
      maxRequests: 10,      // 10 requests
      windowMs: 60 * 1000,  // por minuto
      blockDuration: 10 * 60 * 1000, // block por 10 min
    }
  }

  /**
   * Verifica se um identificador (IP/userId) pode fazer a request
   */
  checkLimit(
    identifier: string, 
    type: 'public' | 'protected' | 'critical' = 'public'
  ): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
    const now = Date.now()
    const config = this.configs[type]
    const key = `${type}:${identifier}`
    
    let entry = this.limits.get(key)

    // Se não existe entrada ou janela expirou, resetar
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false
      }
      this.limits.set(key, entry)
      
      return { 
        allowed: true,
        resetTime: entry.resetTime,
        remainingRequests: config.maxRequests - 1
      }
    }

    // Se está bloqueado, verificar se o block expirou
    if (entry.blocked) {
      const blockResetTime = entry.resetTime + config.blockDuration
      if (now < blockResetTime) {
        return { 
          allowed: false, 
          resetTime: blockResetTime,
          remainingRequests: 0
        }
      } else {
        // Block expirou, resetar
        entry.blocked = false
        entry.count = 1
        entry.resetTime = now + config.windowMs
        return { 
          allowed: true,
          resetTime: entry.resetTime,
          remainingRequests: config.maxRequests - 1
        }
      }
    }

    // Verificar se atingiu o limite
    if (entry.count >= config.maxRequests) {
      entry.blocked = true
      
      logger.securityEvent('rate_limit_exceeded', {
        identifier,
        type,
        count: entry.count,
        limit: config.maxRequests
      })
      
      return { 
        allowed: false, 
        resetTime: entry.resetTime + config.blockDuration,
        remainingRequests: 0
      }
    }

    // Incrementar contador
    entry.count++
    
    return { 
      allowed: true,
      resetTime: entry.resetTime,
      remainingRequests: config.maxRequests - entry.count
    }
  }

  /**
   * Força o reset de um identificador (para casos especiais)
   */
  resetIdentifier(identifier: string, type: string = 'public'): void {
    const key = `${type}:${identifier}`
    this.limits.delete(key)
  }

  /**
   * Limpeza periódica de entradas expiradas (para economizar memória)
   */
  cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []
    
    for (const [key, entry] of this.limits.entries()) {
      const config = this.configs[key.split(':')[0] as keyof typeof this.configs]
      if (!config) continue
      
      const totalExpireTime = entry.resetTime + config.blockDuration
      if (now > totalExpireTime) {
        toDelete.push(key)
      }
    }
    
    toDelete.forEach(key => this.limits.delete(key))
    
    if (toDelete.length > 0) {
      logger.info(`Rate limiter cleanup: removed ${toDelete.length} expired entries`)
    }
  }

  /**
   * Estatísticas do rate limiter
   */
  getStats(): { totalEntries: number; blockedEntries: number } {
    let blockedEntries = 0
    
    for (const entry of this.limits.values()) {
      if (entry.blocked) blockedEntries++
    }
    
    return {
      totalEntries: this.limits.size,
      blockedEntries
    }
  }
}

// Instância singleton
export const rateLimiter = new RateLimiter()

// Cleanup automático a cada 5 minutos
if (typeof window === 'undefined') { // Apenas no servidor
  setInterval(() => {
    rateLimiter.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Helper para extrair identificador da request (IP + UserAgent)
 */
export function getRequestIdentifier(request: Request): string {
  const headers = request.headers
  const ip = headers.get('x-forwarded-for') || 
             headers.get('x-real-ip') || 
             'unknown'
  
  // Para requests autenticadas, adicionar mais contexto
  const userAgent = headers.get('user-agent') || 'unknown'
  const shortUA = userAgent.substring(0, 50) // Evitar identificadores muito longos
  
  return `${ip}:${shortUA}`
} 