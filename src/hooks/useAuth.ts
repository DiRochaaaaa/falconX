'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User, AuthSession } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

// Cache para otimização
const authCache = {
  session: null as AuthSession | null,
  profile: null as UserProfile | null,
  timestamp: 0,
  CACHE_DURATION: 30000, // 30 segundos
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  
  // Cleanup timeouts
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  // Cache helpers
  const isCacheValid = useCallback(() => {
    return Date.now() - authCache.timestamp < authCache.CACHE_DURATION
  }, [])

  const updateCache = useCallback((session: AuthSession | null, profile: UserProfile | null) => {
    authCache.session = session
    authCache.profile = profile
    authCache.timestamp = Date.now()
  }, [])

  const loadProfile = useCallback(async (userId: string, useCache = true) => {
    try {
      // Verificar cache primeiro
      if (useCache && isCacheValid() && authCache.profile?.id === userId) {
        setProfile(authCache.profile)
        return authCache.profile
      }

      // Timeout otimizado para profile
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Profile timeout')), 5000)
        timeoutRefs.current.push(timeout)
      })

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as { data: UserProfile | null; error: any }

      if (error && error.code === 'PGRST116') {
        // Profile não existe - criar profile básico
        const basicProfile: UserProfile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || 'Usuário',
          plan_type: 'free',
          api_key: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(basicProfile)
        updateCache(authCache.session, basicProfile)
        return basicProfile
      } else if (error) {
        console.error('Erro ao carregar perfil:', error)
        setProfile(null)
        return null
      } else {
        setProfile(data)
        updateCache(authCache.session, data)
        return data
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setProfile(null)
      return null
    }
  }, [user?.email, user?.user_metadata?.full_name, isCacheValid, updateCache])

  const checkAuth = useCallback(async (useCache = true) => {
    try {
      // Verificar cache primeiro
      if (useCache && isCacheValid() && authCache.session) {
        setUser(authCache.session.user)
        setProfile(authCache.profile)
        setIsAuthenticated(true)
        setLoading(false)
        return { session: authCache.session, profile: authCache.profile }
      }

      // Timeout otimizado para sessão
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Session timeout')), 3000)
        timeoutRefs.current.push(timeout)
      })
      
      const sessionPromise = supabase.auth.getSession()
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: AuthSession | null } }
      
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
      
      if (session?.user) {
        const profile = await loadProfile(session.user.id, useCache)
        updateCache(session, profile)
        return { session, profile }
      } else {
        setProfile(null)
        updateCache(null, null)
        return { session: null, profile: null }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
      updateCache(null, null)
      return { session: null, profile: null }
    } finally {
      setLoading(false)
    }
  }, [loadProfile, isCacheValid, updateCache])

  useEffect(() => {
    setMounted(true)
    
    // Safety timeout mais agressivo
    const safetyTimeout = setTimeout(() => {
      console.log('Auth safety timeout: forçando loading = false')
      setLoading(false)
    }, 8000) // Reduzido para 8 segundos
    timeoutRefs.current.push(safetyTimeout)
    
    // Verificação inicial rápida
    checkAuth(true).then(() => {
      clearTimeout(safetyTimeout)
    })

    // Listener otimizado para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Invalidar cache em mudanças
          authCache.timestamp = 0
          
          setUser(session?.user ?? null)
          setIsAuthenticated(!!session?.user)
          
          if (session?.user) {
            await loadProfile(session.user.id, false) // Não usar cache em mudanças
          } else {
            setProfile(null)
            setLoading(false)
          }
        } catch (error) {
          console.error('Erro no auth state change:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeouts()
    }
  }, [checkAuth, loadProfile, clearTimeouts])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (data?.user) {
        // Invalidar cache
        authCache.timestamp = 0
        return { data, error: null }
      }

      // Fallback para login se signup falhar
      if (error) {
        console.log('Tentando fazer login...')
        return await signIn(email, password)
      }

      return { data, error }
    } catch (err) {
      console.error('Erro no signup:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (data?.session) {
        // Invalidar cache
        authCache.timestamp = 0
      }
      
      return { data, error }
    } catch (err) {
      console.error('Erro no signin:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      // Limpar cache e estado
      authCache.timestamp = 0
      authCache.session = null
      authCache.profile = null
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
      
      return { error }
    } catch (err) {
      console.error('Erro no signout:', err)
      return { error: err instanceof Error ? err : new Error('Erro desconhecido') }
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = useCallback(() => {
    authCache.timestamp = 0 // Invalidar cache
    return checkAuth(false) // Forçar nova verificação
  }, [checkAuth])

  return {
    user,
    profile,
    loading,
    mounted,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    refreshAuth,
  }
} 