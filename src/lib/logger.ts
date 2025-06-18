/**
 * Sistema de logging estruturado para observabilidade
 * Segue as regras de observabilidade antes de problemas
 */

interface LogContext {
  userId?: string | undefined
  requestId?: string | undefined
  action?: string | undefined
  domain?: string | undefined
  [key: string]: unknown
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext | undefined
  error?: Error | undefined
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry

    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }

    return JSON.stringify(logObj)
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    const formattedLog = this.formatLog(entry)

    // Em desenvolvimento, usar console com cores
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m', // green
        warn: '\x1b[33m', // yellow
        error: '\x1b[31m', // red
      }
      const reset = '\x1b[0m'

      // eslint-disable-next-line no-console
      console.log(
        `${colors[level]}[${level.toUpperCase()}]${reset} ${message}`,
        context ? context : '',
        error ? error : ''
      )
    } else {
      // Em produção, usar JSON estruturado
      // eslint-disable-next-line no-console
      console.log(formattedLog)
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error)
  }

  // Métodos específicos para o domínio da aplicação
  userAction(
    action: string,
    userId: string,
    context?: Omit<LogContext, 'userId' | 'action'>
  ): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...context,
    })
  }

  securityEvent(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      securityEvent: event,
      ...context,
    })
  }

  apiRequest(method: string, path: string, userId?: string, duration?: number): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      userId,
      duration,
    })
  }

  cloneDetection(domain: string, userId: string, isClone: boolean, context?: LogContext): void {
    this.info(`Clone detection: ${domain} - ${isClone ? 'CLONE' : 'LEGITIMATE'}`, {
      domain,
      userId,
      isClone,
      ...context,
    })
  }
}

// Singleton logger instance
export const logger = new Logger()

// Função utilitária para medir performance
export function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now()

  logger.debug(`Starting operation: ${operation}`, context)

  return fn()
    .then(result => {
      const duration = Date.now() - start
      logger.info(`Operation completed: ${operation}`, {
        ...context,
        duration,
        success: true,
      })
      return result
    })
    .catch(error => {
      const duration = Date.now() - start
      logger.error(`Operation failed: ${operation}`, error, {
        ...context,
        duration,
        success: false,
      })
      throw error
    })
}

// Função para criar context de request
export function createRequestContext(userId?: string, requestId?: string): LogContext {
  return {
    userId,
    requestId: requestId ?? crypto.randomUUID(),
  }
}
