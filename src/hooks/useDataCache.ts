'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CacheItem<T> {
  data: T
  timestamp: number
}

interface CacheConfig {
  duration: number // em milissegundos
  enabled?: boolean // se deve executar a query
}

const defaultConfig: CacheConfig = {
  duration: 30000, // 30 segundos
}

// Cache global para dados
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataCache = new Map<string, CacheItem<any>>()

export function useDataCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  config: Partial<CacheConfig> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const finalConfig = { ...defaultConfig, ...config }

  const isCacheValid = useCallback((cacheItem: CacheItem<T>) => {
    return Date.now() - cacheItem.timestamp < finalConfig.duration
  }, [finalConfig.duration])

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Se disabled, não executar
    if (finalConfig.enabled === false) {
      setLoading(false)
      return
    }

    setError(null)
    
    // Verificar cache primeiro
    const cached = dataCache.get(key)
    if (!forceRefresh && cached && isCacheValid(cached)) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    // Se existe cache mas está expirado, mostrar dados antigos enquanto carrega novos
    if (cached && !forceRefresh) {
      setData(cached.data)
    }

    setLoading(true)

    try {
      const result = await queryFn()
      
      // Atualizar cache
      dataCache.set(key, {
        data: result,
        timestamp: Date.now()
      })

      setData(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error(`Erro ao carregar dados para ${key}:`, error)
      
      // Se tem cache antigo, usar ele
      if (cached) {
        setData(cached.data)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, queryFn, isCacheValid, finalConfig.enabled])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    dataCache.delete(key)
  }, [key])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale: data ? !isCacheValid(dataCache.get(key) || { data: data, timestamp: 0 }) : false
  }
}

// Hooks específicos para dados do dashboard
export function useDashboardStats(userId: string) {
  const shouldFetch = !!userId && userId.trim() !== ''
  
  return useDataCache(
    `dashboard-stats-${userId || 'no-user'}`,
    async () => {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID required')
      }

      const [
        { count: allowedDomainsCount },
        { data: uniqueClones },
        { count: totalDetectionsCount },
        { count: activeActionsCount }
      ] = await Promise.all([
        supabase
          .from('allowed_domains')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        supabase
          .from('detected_clones')
          .select('original_domain')
          .eq('user_id', userId),
        
        supabase
          .from('detected_clones')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        supabase
          .from('clone_actions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true)
      ])

      const uniqueClonesCount = new Set(uniqueClones?.map(c => c.original_domain) || []).size

      return {
        allowedDomains: allowedDomainsCount || 0,
        detectedClones: uniqueClonesCount || 0,
        totalDetections: totalDetectionsCount || 0,
        activeActions: activeActionsCount || 0
      }
    },
    { 
      duration: 20000, // 20 segundos para estatísticas
      enabled: shouldFetch // Só executa se tiver userId
    }
  )
}

export function useRecentDetections(userId: string) {
  const shouldFetch = !!userId && userId.trim() !== ''
  
  return useDataCache(
    `recent-detections-${userId || 'no-user'}`,
    async () => {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID required')
      }

      const { data } = await supabase
        .from('detected_clones')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(5)

      return (data || []).map(detection => ({
        id: detection.id,
        domain: detection.clone_domain || 'Domínio não identificado',
        detected_at: detection.detected_at,
        action_taken: detection.action_taken || 'Nenhuma ação',
        user_agent: detection.user_agent || 'N/A',
        ip_address: detection.ip_address || 'N/A'
      }))
    },
    { 
      duration: 15000, // 15 segundos para detecções recentes
      enabled: shouldFetch
    }
  )
}

export function useAllowedDomains(userId: string) {
  const shouldFetch = !!userId && userId.trim() !== ''
  
  return useDataCache(
    `allowed-domains-${userId || 'no-user'}`,
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
    { 
      duration: 25000, // 25 segundos para domínios permitidos
      enabled: shouldFetch
    }
  )
} 