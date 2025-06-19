'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface CacheItem<T> {
  data: T
  timestamp: number
  userId: string
}

interface CacheConfig {
  duration: number // em milissegundos
  enabled?: boolean // se deve executar a query
}

// Configurações de cache otimizadas por tipo de dado
const cacheConfigs = {
  'dashboard-stats': { duration: 60000 }, // 1 minuto - dados que mudam pouco
  'recent-detections': { duration: 30000 }, // 30 segundos - dados críticos
  'allowed-domains': { duration: 300000 }, // 5 minutos - dados estáticos
}

const defaultConfig: CacheConfig = {
  duration: 60000, // 1 minuto por padrão
}

// Cache isolado por usuário para evitar vazamento de dados
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userCaches = new Map<string, Map<string, CacheItem<any>>>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserCache(userId: string): Map<string, CacheItem<any>> {
  if (!userCaches.has(userId)) {
    userCaches.set(userId, new Map())
  }
  return userCaches.get(userId)!
}

// Função para limpar cache de usuário específico
export function clearUserCache(userId: string) {
  userCaches.delete(userId)
}

// Função para limpar todo o cache (útil para logout)
export function clearAllCache() {
  userCaches.clear()
}

// NOVA: Função para forçar refresh completo dos dados críticos
export function forceRefreshCriticalData(userId: string) {
  if (!userId) return
  
  const userCache = getUserCache(userId)
  // Limpar cache de dados que dependem dos limites do plano
  userCache.delete('recent-detections')
  userCache.delete('dashboard-stats')
  
  console.warn('Cache crítico limpo para userId:', userId.substring(0, 8) + '...')
}

export function useDataCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  userId: string,
  config: Partial<CacheConfig> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar configuração específica se disponível, senão usar padrão
  const specificConfig = cacheConfigs[key as keyof typeof cacheConfigs] || defaultConfig
  const finalConfig = { ...specificConfig, ...config }

  const mountedRef = useRef(true)
  const refreshingRef = useRef(false) // Prevenir múltiplos refreshes

  // Só executar se tiver userId válido
  const shouldExecute = !!userId && userId.trim() !== '' && finalConfig.enabled !== false

  const isCacheValid = useCallback(
    (cacheItem: CacheItem<T>) => {
      return (
        Date.now() - cacheItem.timestamp < finalConfig.duration && cacheItem.userId === userId // Verificar se o cache pertence ao usuário atual
      )
    },
    [finalConfig.duration, userId]
  )

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!shouldExecute) {
        if (mountedRef.current) {
          setLoading(false)
          setData(null)
          setError(null)
        }
        return null
      }

      if (!mountedRef.current) return null

      setError(null)

      // Usar cache isolado do usuário
      const userCache = getUserCache(userId)
      const cacheKey = key
      const cached = userCache.get(cacheKey) as CacheItem<T> | undefined

      // Verificar cache primeiro
      if (!forceRefresh && cached && isCacheValid(cached)) {
        if (mountedRef.current) {
          setData(cached.data)
          setLoading(false)
        }
        return cached.data
      }

      // Se existe cache mas está expirado, mostrar dados antigos enquanto carrega novos
      if (cached && !forceRefresh && mountedRef.current) {
        setData(cached.data)
      }

      if (mountedRef.current) {
        setLoading(true)
      }

      try {
        const result = await queryFn()

        if (!mountedRef.current) return null

        // Atualizar cache com userId para segurança
        userCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          userId: userId,
        })

        setData(result)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

        if (mountedRef.current) {
          setError(errorMessage)
          console.error(`Erro ao carregar dados para ${key}:`, error)

          // Se tem cache antigo do mesmo usuário, usar ele
          if (cached && cached.userId === userId) {
            setData(cached.data)
          }
        }

        throw error
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [key, queryFn, isCacheValid, shouldExecute, userId]
  )

  const refresh = useCallback(async () => {
    // Prevenir múltiplos refreshes simultâneos
    if (refreshingRef.current) return null

    refreshingRef.current = true
    try {
      return await fetchData(true)
    } finally {
      refreshingRef.current = false
    }
  }, [fetchData])

  const invalidate = useCallback(() => {
    if (userId) {
      const userCache = getUserCache(userId)
      userCache.delete(key)
    }
  }, [key, userId])

  useEffect(() => {
    mountedRef.current = true

    if (shouldExecute) {
      fetchData()
    } else {
      setLoading(false)
      setData(null)
      setError(null)
    }

    return () => {
      mountedRef.current = false
    }
  }, [fetchData, shouldExecute])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale:
      data && userId
        ? !isCacheValid(
            (getUserCache(userId).get(key) as CacheItem<T>) || { data: data, timestamp: 0, userId }
          )
        : false,
  }
}

// Hooks específicos para dados do dashboard
export function useDashboardStats(userId: string) {
  return useDataCache(
    'dashboard-stats',
    async () => {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID required')
      }

      const [
        { count: allowedDomainsCount },
        { data: clonesWithVisitors },
        { count: activeActionsCount },
        // 🎯 CORRIGIDO: Buscar dados do plano usando APENAS plans.clone_limit
        { data: planData }
      ] = await Promise.all([
        supabase
          .from('allowed_domains')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),

        supabase.from('detected_clones').select('unique_visitors_count').eq('user_id', userId),

        supabase
          .from('clone_actions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true),

        // 🎯 SEMPRE usar plans.clone_limit como fonte da verdade
        supabase
          .from('user_subscriptions')
          .select(`
            current_clone_count,
            extra_clones_used,
            plans!inner(
              name, 
              slug,
              clone_limit
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()
      ])

      const totalUniqueVisitors =
        clonesWithVisitors?.reduce((sum, clone) => sum + (clone.unique_visitors_count || 0), 0) || 0

      // Usar dados REAIS do plano ao invés de contagem bruta
      const subscription = planData || null
      const actualClonesUsed = subscription ? subscription.current_clone_count + subscription.extra_clones_used : 0

      return {
        allowedDomains: allowedDomainsCount || 0,
        detectedClones: actualClonesUsed, // CORRIGIDO: Usar dados do plano
        uniqueVisitors: totalUniqueVisitors,
        activeActions: activeActionsCount || 0,
      }
    },
    userId,
    {
      duration: 20000, // 20 segundos para estatísticas
    }
  )
}

export function useRecentDetections(userId: string) {
  return useDataCache(
    'recent-detections',
    async () => {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID required')
      }

      // Usar get-all-detected-clones que implementa a lógica de limitação
      const { getAllDetectedClones } = await import('@/modules/dashboard/application/use-cases/get-all-detected-clones')
      const result = await getAllDetectedClones(userId)

      // Retornar apenas os clones dentro do limite + um resumo dos bloqueados
      const detections = result.clones.map(clone => ({
        id: String(clone.id),
        domain: clone.clone_domain || 'Domínio não identificado',
        detected_at: clone.last_seen,
        action_taken: clone.is_within_limit ? 'Clone Detectado' : 'Clone Bloqueado',
        user_agent: 'N/A',
        ip_address: 'N/A', 
        slug_used: '/',
        visitor_count: clone.detection_count || 0,
        unique_visitors: clone.unique_visitors_count || 0,
        slugs_data: clone.slugs_data || [],
        session_duration: 0,
        referrer_url: null,
        is_within_limit: clone.is_within_limit,
        is_blocked: clone.is_blocked,
      }))

      // Mostrar clones dentro do limite + um alerta resumido dos bloqueados
      const withinLimit = detections.filter(d => d.is_within_limit)
      const blocked = detections.filter(d => d.is_blocked)

      // Se tem clones bloqueados, adicionar uma entrada especial de aviso
      if (blocked.length > 0) {
                 withinLimit.push({
           id: 'blocked-alert',
           domain: `⚠️ ${blocked.length} clone(s) adicional(is) bloqueado(s)`,
           detected_at: blocked[0]?.detected_at || new Date().toISOString(),
           action_taken: 'Upgrade Necessário',
           user_agent: 'N/A',
           ip_address: 'N/A',
           slug_used: '/upgrade',
           visitor_count: blocked.reduce((sum, b) => sum + (b.visitor_count || 0), 0),
           unique_visitors: blocked.reduce((sum, b) => sum + (b.unique_visitors || 0), 0),
           slugs_data: [],
           session_duration: 0,
           referrer_url: null,
           is_within_limit: false,
           is_blocked: false,
         })
      }

      return withinLimit.slice(0, 5) // Limitar a 5 itens
    },
    userId,
    {
      duration: 15000, // 15 segundos para detecções recentes
    }
  )
}

export function useAllowedDomains(userId: string) {
  return useDataCache(
    'allowed-domains',
    async () => {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID required')
      }

      const { data, error } = await supabase
        .from('allowed_domains')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    },
    userId,
    {
      duration: 25000, // 25 segundos para domínios permitidos
    }
  )
}
