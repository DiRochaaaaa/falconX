import { supabase } from '@/lib/supabase'

export interface CloneLimitResult {
  canDetectClone: boolean
  currentCount: number
  limit: number
  extraUsed: number
  resetDate: string
  planName: string
  message: string
}

export async function checkCloneLimits(userId: string): Promise<CloneLimitResult> {
  try {
    // Buscar subscription do usuário com informações do plano
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans!inner(
          id,
          name,
          slug,
          clone_limit,
          extra_clone_price
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError) {
      console.error('Erro ao buscar subscription:', subError)
      throw new Error('Erro ao verificar limites do plano')
    }

    if (!subscription) {
      throw new Error('Subscription não encontrada')
    }

    const plan = subscription.plans
    const currentCount = subscription.current_clone_count
    const limit = subscription.clone_limit
    const extraUsed = subscription.extra_clones_used
    const resetDate = subscription.reset_date

    // Verificar se precisa resetar contador (mensal)
    const now = new Date()
    const resetDateObj = new Date(resetDate)
    
    if (now >= resetDateObj) {
      // Reset mensal - resetar contadores
      const nextResetDate = new Date(now)
      nextResetDate.setMonth(nextResetDate.getMonth() + 1)
      
      const { error: resetError } = await supabase
        .from('user_subscriptions')
        .update({
          current_clone_count: 0,
          extra_clones_used: 0,
          reset_date: nextResetDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', subscription.id)

      if (resetError) {
        console.error('Erro ao resetar contadores:', resetError)
      }

      return {
        canDetectClone: true,
        currentCount: 0,
        limit,
        extraUsed: 0,
        resetDate: nextResetDate.toISOString(),
        planName: plan.name,
        message: 'Contadores resetados para o novo mês'
      }
    }

    // Verificar se pode detectar mais clones
    const canDetectClone = plan.slug === 'free' 
      ? currentCount < limit 
      : true // Planos pagos sempre podem detectar (cobram extras)

    return {
      canDetectClone,
      currentCount,
      limit,
      extraUsed,
      resetDate,
      planName: plan.name,
      message: canDetectClone 
        ? 'Pode detectar mais clones'
        : 'Limite do plano gratuito atingido'
    }

  } catch (error) {
    console.error('Erro em checkCloneLimits:', error)
    throw error
  }
}

export async function incrementCloneCount(userId: string): Promise<void> {
  try {
    // Buscar subscription atual
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans!inner(slug, clone_limit)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      throw new Error('Subscription não encontrada')
    }

    const plan = subscription.plans
    const currentCount = subscription.current_clone_count
    const limit = subscription.clone_limit

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (currentCount < limit) {
      // Ainda dentro do limite
      updateData.current_clone_count = currentCount + 1
    } else if (plan.slug !== 'free') {
      // Plano pago - incrementar extras
      updateData.extra_clones_used = subscription.extra_clones_used + 1
    }
    // Plano free no limite: não incrementa nada (já salva o clone mas não conta)

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Erro ao incrementar contador:', updateError)
      throw updateError
    }

  } catch (error) {
    console.error('Erro em incrementCloneCount:', error)
    throw error
  }
} 