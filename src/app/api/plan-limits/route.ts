import { NextRequest, NextResponse } from 'next/server'
import { getUserPlanInfo } from '@/lib/supabase'
import { checkCloneLimits } from '@/modules/dashboard/application/use-cases/check-clone-limits'
import { getPlanInfo } from '@/lib/plan-utils'

export async function GET(request: NextRequest) {
  try {
    // Obter userId dos parâmetros de consulta
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // Buscar informações completas do usuário e plano
    const userPlanInfo = await getUserPlanInfo(userId)
    
    if (!userPlanInfo) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar dados de limites atualizados
    const limits = await checkCloneLimits(userId)

    // Buscar informações detalhadas do plano
    const planDetails = getPlanInfo(userPlanInfo.plan.slug as any)

    // Calcular dados de blocked clones (clones detectados mas não contabilizados)
    const totalDetectedClones = limits.currentCount + limits.extraUsed
    const blockedClones = Math.max(0, totalDetectedClones - planDetails.cloneLimit)

    // Calcular próxima data de reset se necessário
    let nextResetDate = limits.resetDate
    
    // Verificar se precisa resetar baseado na data
    const now = new Date()
    const resetDateObj = new Date(limits.resetDate)
    if (now >= resetDateObj) {
      const nextReset = new Date(now)
      nextReset.setMonth(nextReset.getMonth() + 1)
      nextResetDate = nextReset.toISOString()
    }

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
    })

  } catch (error) {
    console.error('Erro na API plan-limits:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 