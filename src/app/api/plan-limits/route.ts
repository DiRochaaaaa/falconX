import { NextRequest, NextResponse } from 'next/server'
import { getUserPlanInfo } from '@/lib/supabase'
import { checkCloneLimits } from '@/modules/dashboard/application/use-cases/check-clone-limits'
import { getPlanInfo } from '@/lib/plan-utils'
import { authenticateRequest, authorizeUserAccess, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/security/auth-middleware'
import { getProtectedCorsHeaders } from '@/lib/security/cors-config'
import { rateLimiter, getRequestIdentifier } from '@/lib/security/rate-limiter'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // 1. CORS headers seguros
    const origin = request.headers.get('origin')
    const corsHeaders = getProtectedCorsHeaders(origin)

    // 2. Rate limiting rigoroso (API crítica)
    const identifier = getRequestIdentifier(request)
    const rateLimit = rateLimiter.checkLimit(identifier, 'critical')
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
      
      logger.securityEvent('plan_limits_rate_limited', {
        identifier,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter,
          message: 'Muitas tentativas. Tente novamente em alguns minutos.'
        },
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': (rateLimit.remainingRequests || 0).toString(),
          }
        }
      )
    }

    // 3. AUTENTICAÇÃO OBRIGATÓRIA
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      logger.securityEvent('plan_limits_unauthorized_access', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        error: authResult.error
      })
      
      return createUnauthorizedResponse('Token de autenticação obrigatório')
    }

    // 4. Obter userId dos parâmetros OU usar do token autenticado
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    
    // Se não especificou userId, usar o do token autenticado
    const userId = requestedUserId || authResult.userId!
    
    // 5. AUTORIZAÇÃO: Usuário só pode acessar seus próprios dados
    if (requestedUserId && !authorizeUserAccess(authResult.userId!, requestedUserId)) {
      logger.securityEvent('plan_limits_unauthorized_user_access', {
        authenticatedUserId: authResult.userId,
        requestedUserId,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      return createForbiddenResponse('Acesso negado: você só pode acessar seus próprios dados')
    }

    // 6. Buscar informações completas do usuário e plano
    const userPlanInfo = await getUserPlanInfo(userId)
    
    if (!userPlanInfo) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404, headers: corsHeaders }
      )
    }

    // 7. Buscar dados de limites atualizados
    const limits = await checkCloneLimits(userId)

    // 8. Buscar informações detalhadas do plano
    const planDetails = getPlanInfo(userPlanInfo.plan.slug as any)

    // 9. Calcular dados de blocked clones (clones detectados mas não contabilizados)
    const totalDetectedClones = limits.currentCount + limits.extraUsed
    const blockedClones = Math.max(0, totalDetectedClones - planDetails.cloneLimit)

    // 10. Calcular próxima data de reset se necessário
    let nextResetDate = limits.resetDate
    
    // Verificar se precisa resetar baseado na data
    const now = new Date()
    const resetDateObj = new Date(limits.resetDate)
    if (now >= resetDateObj) {
      const nextReset = new Date(now)
      nextReset.setMonth(nextReset.getMonth() + 1)
      nextResetDate = nextReset.toISOString()
    }

    // 11. Log de acesso autorizado
    logger.info('Plan limits accessed', {
      userId,
      authenticatedUserId: authResult.userId,
      planSlug: userPlanInfo.plan.slug,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: userPlanInfo.id,
        email: userPlanInfo.email,
        full_name: userPlanInfo.full_name,
      },
      plan: {
        ...userPlanInfo.plan,
        details: planDetails, // Informações completas do plano
      },
      subscription: {
        ...userPlanInfo.subscription,
        next_reset_date: nextResetDate,
      },
      usage: {
        // Dados de uso atual
        currentClones: limits.currentCount,
        cloneLimit: limits.limit,
        extraClones: limits.extraUsed,
        blockedClones, // NOVO: clones detectados mas não contados
        
        // Dados calculados
        usageProgress: planDetails.cloneLimit > 0 
          ? Math.min((limits.currentCount / planDetails.cloneLimit) * 100, 100)
          : 0,
        canDetectMore: limits.canDetectClone,
        
        // Alertas
        alertLevel: (() => {
          const progress = planDetails.cloneLimit > 0 
            ? (limits.currentCount / planDetails.cloneLimit) * 100 
            : 0
          if (progress >= 100) return 'danger'
          if (progress >= 80) return 'warning'
          return 'success'
        })(),
        
        // Dados temporais
        resetDate: nextResetDate,
        daysUntilReset: Math.ceil(
          (new Date(nextResetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        
        // Dados financeiros
        extraCost: limits.extraUsed * planDetails.extraClonePrice,
        
        // Metadados
        lastUpdated: new Date().toISOString(),
      },
      limits: limits, // Dados brutos para compatibilidade
    }, { headers: corsHeaders })

  } catch (error) {
    logger.error('Erro na API plan-limits:', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
        // NÃO vazar detalhes do erro para o cliente por segurança
      },
      { status: 500, headers: getProtectedCorsHeaders() }
    )
  }
}

// Suporte a preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: getProtectedCorsHeaders(origin)
  })
} 