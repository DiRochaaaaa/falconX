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

const defaultConfig: CacheConfig = {
  duration: 30000, // 30 segundos
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

export function useDataCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  userId: string,
  config: Partial<CacheConfig> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const finalConfig = { ...defaultConfig, ...config }
  const mountedRef = useRef(true)

  // Só executar se tiver userId válido
  const shouldExecute = !!userId && userId.trim() !== '' && finalConfig.enabled !== false

  const isCacheValid = useCallback((cacheItem: CacheItem<T>) => {
    return (
      Date.now() - cacheItem.timestamp < finalConfig.duration &&
      cacheItem.userId === userId // Verificar se o cache pertence ao usuário atual
    )
  }, [finalConfig.duration, userId])

  const fetchData = useCallback(async (forceRefresh = false) => {
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
        userId: userId
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
  }, [key, queryFn, isCacheValid, shouldExecute, userId])

  const refresh = useCallback(() => {
    return fetchData(true)
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
    isStale: data && userId ? 
      !isCacheValid((getUserCache(userId).get(key) as CacheItem<T>) || { data: data, timestamp: 0, userId }) : 
      false
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

      const { data } = await supabase
        .from('detected_clones')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen', { ascending: false })
        .limit(5)

      return (data || []).map(detection => ({
        id: detection.id,
        domain: detection.clone_domain || 'Domínio não identificado',
        detected_at: detection.last_seen,
        action_taken: 'Clone Detectado',
        user_agent: detection.user_agent || 'N/A',
        ip_address: detection.ip_address || 'N/A'
      }))
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