import { NextRequest, NextResponse } from 'next/server'
import { createClient, User } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

interface AuthResult {
  success: boolean
  userId?: string
  error?: string
  user?: User
}

/**
 * Middleware de autenticação para APIs protegidas
 * Verifica JWT token e retorna informações do usuário
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // 1. Extrair token do Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Authorization header missing or invalid format'
      }
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 2. Verificar token com Supabase (usando client normal, NÃO service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      logger.securityEvent('invalid_token_attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      
      return {
        success: false,
        error: 'Invalid or expired token'
      }
    }

    // 3. Log de acesso válido
    logger.info('API access granted', {
      userId: user.id,
      email: user.email,
      endpoint: request.nextUrl.pathname
    })

    return {
      success: true,
      userId: user.id,
      user
    }

  } catch (error) {
    logger.error('Authentication error', error instanceof Error ? error : new Error(String(error)))
    return {
      success: false,
      error: 'Authentication service error'
    }
  }
}

/**
 * Middleware de autorização - verifica se user pode acessar recursos de outro user
 */
export function authorizeUserAccess(authenticatedUserId: string, requestedUserId: string): boolean {
  // Por segurança: usuário só pode acessar seus próprios dados
  return authenticatedUserId === requestedUserId
}

/**
 * Helper para criar resposta de erro não autorizado
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { 
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString()
    },
    { status: 401 }
  )
}

/**
 * Helper para criar resposta de acesso negado
 */
export function createForbiddenResponse(message: string = 'Access denied'): NextResponse {
  return NextResponse.json(
    { 
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString()
    },
    { status: 403 }
  )
} 