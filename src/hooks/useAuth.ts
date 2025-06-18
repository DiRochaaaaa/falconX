'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'
import { clearUserCache } from './useDataCache'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const mountedRef = useRef(true)

  const loadProfile = useCallback(
    async (userId: string, userEmail?: string, userFullName?: string) => {
      if (!mountedRef.current) return null

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!mountedRef.current) return null

        if (error && error.code === 'PGRST116') {
          // Profile não existe - criar profile básico
          const basicProfile: UserProfile = {
            id: userId,
            email: userEmail || '',
            full_name: userFullName || 'Usuário',
            plan_type: 'free',
            api_key: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setProfile(basicProfile)
          return basicProfile
        } else if (error) {
          console.error('Erro ao carregar perfil:', error)
          setProfile(null)
          return null
        } else {
          setProfile(data)
          return data
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        if (mountedRef.current) {
          setProfile(null)
        }
        return null
      }
    },
    []
  )

  const initializeAuth = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (!mountedRef.current) return

      if (error) {
        console.error('Erro ao verificar sessão inicial:', error)
        setUser(null)
        setProfile(null)
        setInitialized(true)
        setLoading(false)
        return
      }

      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name
        )
      } else {
        setProfile(null)
      }

      setInitialized(true)
      setLoading(false)
    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error)
      if (mountedRef.current) {
        setUser(null)
        setProfile(null)
        setInitialized(true)
        setLoading(false)
      }
    }
  }, [loadProfile])

  useEffect(() => {
    mountedRef.current = true

    // Inicialização
    initializeAuth()

    // Listener para mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return

      // Auth state change event

      // Atualizar estado do usuário imediatamente
      const previousUserId = user?.id
      setUser(session?.user ?? null)

      // Lidar com eventos específicos
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name
        )
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        // Limpar cache do usuário anterior ao fazer logout
        if (previousUserId) {
          clearUserCache(previousUserId)
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Manter perfil existente, só atualizar user se necessário
        if (!profile) {
          await loadProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name
          )
        }
      }

      // Garantir que loading seja desabilitado
      if (mountedRef.current) {
        setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [initializeAuth, loadProfile, user?.id, profile])

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

      return { data, error }
    } catch (error) {
      console.error('Erro no signup:', error)
      return { data: null, error }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { data, error }
    } catch (error) {
      console.error('Erro no signin:', error)
      return { data: null, error }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const currentUserId = user?.id

      const { error } = await supabase.auth.signOut()

      if (!error && mountedRef.current) {
        setUser(null)
        setProfile(null)

        // Limpar cache do usuário ao fazer logout
        if (currentUserId) {
          clearUserCache(currentUserId)
        }
      }

      return { error }
    } catch (error) {
      console.error('Erro no signout:', error)
      return { error }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const checkAuth = useCallback(async () => {
    return initializeAuth()
  }, [initializeAuth])

  return {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user && initialized,
    signUp,
    signIn,
    signOut,
    checkAuth,
  }
}
