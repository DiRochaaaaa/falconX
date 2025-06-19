'use client'

import { useState, useEffect, useCallback } from 'react'
import { checkCloneLimits } from '@/modules/dashboard/application/use-cases/check-clone-limits'
import { getPlanInfo, PlanInfo } from '@/lib/plan-utils'

export interface PlanUsage {
  // Dados atuais do usuário
  currentClones: number
  cloneLimit: number
  extraClones: number
  resetDate: string
  
  // Status calculados
  canDetectMore: boolean
  usageProgress: number // 0-100%
  alertLevel: 'success' | 'warning' | 'danger'
  
  // Dados do plano
  planInfo: PlanInfo
  planSlug: string
  
  // Metadados
  lastUpdated: string
}

interface UsePlanLimitsReturn {
  usage: PlanUsage | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para carregar dados de limites e uso do plano em tempo real
 * Conecta frontend com backend de forma consistente
 */
export function usePlanLimits(userId: string | null, planSlug?: string): UsePlanLimitsReturn {
  const [usage, setUsage] = useState<PlanUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsageData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar dados do backend
      const limitResult = await checkCloneLimits(userId)
      
      // Se não tem planSlug, tentar extrair do resultado
      const currentPlanSlug = planSlug || 'free' // fallback seguro
      const planInfo = getPlanInfo(currentPlanSlug as any)

      // Calcular progresso e alert level
      const usageProgress = planInfo.cloneLimit > 0 
        ? Math.min((limitResult.currentCount / planInfo.cloneLimit) * 100, 100)
        : 0

      let alertLevel: 'success' | 'warning' | 'danger' = 'success'
      if (usageProgress >= 100) alertLevel = 'danger'
      else if (usageProgress >= 80) alertLevel = 'warning'

      const usageData: PlanUsage = {
        currentClones: limitResult.currentCount,
        cloneLimit: limitResult.limit,
        extraClones: limitResult.extraUsed,
        resetDate: limitResult.resetDate,
        canDetectMore: limitResult.canDetectClone,
        usageProgress,
        alertLevel,
        planInfo,
        planSlug: currentPlanSlug,
        lastUpdated: new Date().toISOString(),
      }

      setUsage(usageData)

    } catch (err) {
      console.error('Erro ao carregar dados de limite:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [userId, planSlug])

  const refresh = useCallback(async () => {
    await loadUsageData()
  }, [loadUsageData])

  // Carregar dados iniciais
  useEffect(() => {
    loadUsageData()
  }, [loadUsageData])

  // Auto-refresh a cada 5 minutos para manter dados atualizados
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      loadUsageData()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [userId, loadUsageData])

  return {
    usage,
    loading,
    error,
    refresh,
  }
}

/**
 * Hook simplificado para verificar se pode detectar mais clones
 */
export function useCanDetectMoreClones(userId: string | null, planSlug?: string): boolean {
  const { usage } = usePlanLimits(userId, planSlug)
  return usage?.canDetectMore ?? false
}

/**
 * Hook para obter apenas o progresso de uso
 */
export function useUsageProgress(userId: string | null, planSlug?: string): number {
  const { usage } = usePlanLimits(userId, planSlug)
  return usage?.usageProgress ?? 0
} 