import { logger } from '@/lib/logger'

/**
 * Sistema de auditoria de segurança
 * Registra eventos críticos para monitoramento e forense
 */

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'unauthorized_access' | 'data_breach_attempt' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string | undefined
  ip: string
  userAgent: string
  endpoint: string
  details: Record<string, unknown>
  timestamp: string
}

export interface AuditMetrics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  uniqueIPs: number
  suspiciousIPs: string[]
  lastUpdated: string
}

class SecurityAuditor {
  private events: SecurityEvent[] = []
  private readonly MAX_EVENTS = 10000 // Manter apenas os últimos 10k eventos em memória
  private suspiciousIPs = new Set<string>()
  private ipAttempts = new Map<string, number>()

  /**
   * Registra um evento de segurança
   */
  logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: {
      userId: string | undefined
      ip: string
      userAgent: string
      endpoint: string
      metadata: Record<string, unknown> | undefined
    }
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      endpoint: details.endpoint,
      details: details.metadata || {},
      timestamp: new Date().toISOString(),
    }

    // Adicionar à lista local
    this.events.push(event)

    // Manter apenas os eventos mais recentes
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift()
    }

    // Rastrear IPs suspeitos
    this.trackSuspiciousActivity(details.ip, type, severity)

    // Log estruturado para observabilidade
    logger.securityEvent(`${type}_${severity}`, {
      type,
      severity,
      userId: details.userId,
      ip: details.ip,
      endpoint: details.endpoint,
      ...details.metadata,
    })

    // Alertas críticos
    if (severity === 'critical') {
      this.triggerCriticalAlert(event)
    }
  }

  /**
   * Rastreia atividades suspeitas por IP
   */
  private trackSuspiciousActivity(ip: string, type: SecurityEvent['type'], severity: SecurityEvent['severity']): void {
    const currentAttempts = this.ipAttempts.get(ip) || 0
    const newAttempts = currentAttempts + (severity === 'critical' ? 3 : severity === 'high' ? 2 : 1)
    
    this.ipAttempts.set(ip, newAttempts)
    
    // Marcar como suspeito se muitas tentativas
    if (newAttempts >= 10) {
      this.suspiciousIPs.add(ip)
      
      logger.securityEvent('ip_marked_suspicious', {
        ip,
        attempts: newAttempts,
        type
      })
    }
  }

  /**
   * Dispara alertas para eventos críticos
   */
  private triggerCriticalAlert(event: SecurityEvent): void {
    // Em produção: enviar para Slack, email, Sentry, etc.
    console.error('🚨 ALERTA CRÍTICO DE SEGURANÇA:', {
      type: event.type,
      ip: event.ip,
      endpoint: event.endpoint,
      timestamp: event.timestamp,
    })
    
    // Log crítico estruturado
    logger.error('Critical security event detected', new Error(`${event.type} from ${event.ip}`))
  }

  /**
   * Verifica se um IP é suspeito
   */
  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip)
  }

  /**
   * Obtém tentativas de um IP
   */
  getIPAttempts(ip: string): number {
    return this.ipAttempts.get(ip) || 0
  }

  /**
   * Obtém métricas de segurança
   */
  getMetrics(): AuditMetrics {
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}
    const uniqueIPs = new Set<string>()

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
      uniqueIPs.add(event.ip)
    })

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      uniqueIPs: uniqueIPs.size,
      suspiciousIPs: Array.from(this.suspiciousIPs),
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Obtém eventos recentes filtrados
   */
  getRecentEvents(filters?: {
    type?: SecurityEvent['type']
    severity?: SecurityEvent['severity']
    ip?: string
    userId?: string
    limit?: number
    since?: Date
  }): SecurityEvent[] {
    let filtered = [...this.events]

    if (filters) {
      if (filters.type) filtered = filtered.filter(e => e.type === filters.type)
      if (filters.severity) filtered = filtered.filter(e => e.severity === filters.severity)
      if (filters.ip) filtered = filtered.filter(e => e.ip === filters.ip)
      if (filters.userId) filtered = filtered.filter(e => e.userId === filters.userId)
      if (filters.since) {
        const sinceTime = filters.since.getTime()
        filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= sinceTime)
      }
      if (filters.limit) filtered = filtered.slice(-filters.limit)
    }

    return filtered.reverse() // Mais recentes primeiro
  }

  /**
   * Reseta estatísticas de um IP (para casos de falso positivo)
   */
  resetIPStatistics(ip: string): void {
    this.ipAttempts.delete(ip)
    this.suspiciousIPs.delete(ip)
    
    logger.info('IP statistics reset', { ip })
  }

  /**
   * Limpeza periódica de dados antigos
   */
  cleanup(): void {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 24) // Manter apenas últimas 24h em memória

    const originalLength = this.events.length
    this.events = this.events.filter(event => new Date(event.timestamp) > cutoff)

    // Reset de IPs que não tiveram atividade recente
    const recentIPs = new Set(this.events.map(e => e.ip))
    for (const ip of this.suspiciousIPs) {
      if (!recentIPs.has(ip)) {
        this.suspiciousIPs.delete(ip)
        this.ipAttempts.delete(ip)
      }
    }

    const cleaned = originalLength - this.events.length
    if (cleaned > 0) {
      logger.info(`Security audit cleanup: removed ${cleaned} old events`)
    }
  }
}

// Instância singleton
export const securityAuditor = new SecurityAuditor()

// Limpeza automática a cada hora
if (typeof window === 'undefined') { // Apenas no servidor
  setInterval(() => {
    securityAuditor.cleanup()
  }, 60 * 60 * 1000) // 1 hora
}

/**
 * Helpers para registrar eventos específicos
 */
export const auditHelpers = {
  authFailure: (ip: string, userAgent: string, endpoint: string, details?: Record<string, unknown>) => {
    securityAuditor.logSecurityEvent('auth_failure', 'high', {
      ip,
      userAgent,
      endpoint,
      userId: undefined,
      metadata: details
    })
  },

  rateLimitExceeded: (ip: string, userAgent: string, endpoint: string, details?: Record<string, unknown>) => {
    securityAuditor.logSecurityEvent('rate_limit', 'medium', {
      ip,
      userAgent,
      endpoint,
      userId: undefined,
      metadata: details
    })
  },

  unauthorizedAccess: (ip: string, userAgent: string, endpoint: string, userId?: string, details?: Record<string, unknown>) => {
    securityAuditor.logSecurityEvent('unauthorized_access', 'high', {
      ip,
      userAgent,
      endpoint,
      userId,
      metadata: details
    })
  },

  dataBreachAttempt: (ip: string, userAgent: string, endpoint: string, userId?: string, details?: Record<string, unknown>) => {
    securityAuditor.logSecurityEvent('data_breach_attempt', 'critical', {
      ip,
      userAgent,
      endpoint,
      userId,
      metadata: details
    })
  },

  suspiciousActivity: (ip: string, userAgent: string, endpoint: string, details?: Record<string, unknown>) => {
    securityAuditor.logSecurityEvent('suspicious_activity', 'medium', {
      ip,
      userAgent,
      endpoint,
      userId: undefined,
      metadata: details
    })
  }
} 