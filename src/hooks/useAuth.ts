'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'
import { clearUserCache } from './useDataCache'

/**
 * Hook de autenticação com correção para deadlocks do Supabase
 *
 * CORREÇÃO APLICADA: Fix para loading infinito quando volta para aba
 * - Removido async do callback onAuthStateChange
 * - Adicionado setTimeout para evitar deadlocks conforme documentação oficial
 * - Adicionado timeout de segurança na inicialização
 *
 * Referência: https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0
 */

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    initialized: false,
    error: null,
  })

  const mountedRef = useRef(true)
  const initializingRef = useRef(false)

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    if (!mountedRef.current) return
    setAuthState(prev => ({ ...prev, ...updates }))
  }, [])

  const loadProfile = useCallback(
    async (
      userId: string,
      userEmail?: string,
      userFullName?: string
    ): Promise<UserProfile | null> => {
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
          updateAuthState({ profile: basicProfile, error: null })
          return basicProfile
        } else if (error) {
          console.error('Erro ao carregar perfil:', error)
          updateAuthState({ profile: null, error: 'Erro ao carregar perfil' })
          return null
        } else {
          updateAuthState({ profile: data, error: null })
          return data
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        updateAuthState({ profile: null, error: 'Erro ao carregar perfil' })
        return null
      }
    },
    [updateAuthState]
  )

  const initializeAuth = useCallback(async () => {
    if (!mountedRef.current || initializingRef.current) return

    initializingRef.current = true
    updateAuthState({ loading: true, error: null })

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (initializingRef.current && mountedRef.current) {
        console.warn('Auth initialization timeout - assuming not authenticated')
        updateAuthState({
          user: null,
          profile: null,
          loading: false,
          initialized: true,
          error: null,
        })
        initializingRef.current = false
      }
    }, 10000) // 10 segundos timeout

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      clearTimeout(timeoutId)

      if (!mountedRef.current) return

      if (error) {
        console.error('Erro ao verificar sessão inicial:', error)
        updateAuthState({
          user: null,
          profile: null,
          loading: false,
          initialized: true,
          error: 'Erro ao verificar autenticação',
        })
        return
      }

      const user = session?.user ?? null
      updateAuthState({ user, error: null })

      if (user) {
        try {
          await loadProfile(user.id, user.email, user.user_metadata?.full_name)
        } catch (profileError) {
          console.error('Erro ao carregar perfil durante inicialização:', profileError)
          // Continua mesmo se falhar ao carregar perfil
          updateAuthState({ error: null })
        }
      } else {
        updateAuthState({ profile: null })
      }

      updateAuthState({
        loading: false,
        initialized: true,
      })
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Erro na inicialização da autenticação:', error)
      updateAuthState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
        error: 'Erro na inicialização',
      })
    } finally {
      initializingRef.current = false
    }
  }, [updateAuthState, loadProfile])

  // Efeito de inicialização - executado apenas uma vez
  useEffect(() => {
    mountedRef.current = true
    initializeAuth()

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Dependência vazia para executar apenas uma vez

  // Efeito para listener de mudanças de auth - separado da inicialização
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current || initializingRef.current) return

      // Auth state change event
      const user = session?.user ?? null
      const previousUserId = authState.user?.id

      // Atualizar estado do usuário imediatamente
      updateAuthState({ user, error: null })

      // Usar setTimeout para evitar deadlocks conforme documentação do Supabase
      // https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0
      setTimeout(async () => {
        if (!mountedRef.current) return

        // Lidar com eventos específicos
        if (event === 'SIGNED_IN' && user) {
          updateAuthState({ loading: true })
          try {
            await loadProfile(user.id, user.email, user.user_metadata?.full_name)
          } catch (error) {
            console.error('Erro ao carregar perfil no SIGNED_IN:', error)
            updateAuthState({ error: 'Erro ao carregar perfil' })
          }
          updateAuthState({ loading: false })
        } else if (event === 'SIGNED_OUT') {
          updateAuthState({ profile: null, loading: false })
          // Limpar cache do usuário anterior ao fazer logout
          if (previousUserId) {
            clearUserCache(previousUserId)
          }
        } else if (event === 'TOKEN_REFRESHED' && user) {
          // Manter perfil existente, só atualizar user se necessário
          if (!authState.profile) {
            updateAuthState({ loading: true })
            try {
              await loadProfile(user.id, user.email, user.user_metadata?.full_name)
            } catch (error) {
              console.error('Erro ao carregar perfil no TOKEN_REFRESHED:', error)
              updateAuthState({ error: 'Erro ao carregar perfil' })
            }
            updateAuthState({ loading: false })
          }
        }

        // Garantir que loading seja desabilitado e initialized seja true
        updateAuthState({
          loading: false,
          initialized: true,
        })
      }, 0) // Executa após o callback terminar, evitando deadlocks
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [updateAuthState, loadProfile, authState.user?.id, authState.profile])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      updateAuthState({ loading: true, error: null })

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
      updateAuthState({ error: 'Erro ao criar conta' })
      return { data: null, error }
    } finally {
      updateAuthState({ loading: false })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      updateAuthState({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        updateAuthState({ error: 'Credenciais inválidas' })
      }

      return { data, error }
    } catch (error) {
      console.error('Erro no signin:', error)
      updateAuthState({ error: 'Erro ao fazer login' })
      return { data: null, error }
    } finally {
      updateAuthState({ loading: false })
    }
  }

  const signOut = async () => {
    try {
      updateAuthState({ loading: true, error: null })
      const currentUserId = authState.user?.id

      const { error } = await supabase.auth.signOut()

      if (!error) {
        updateAuthState({
          user: null,
          profile: null,
          loading: false,
        })

        // Limpar cache do usuário ao fazer logout
        if (currentUserId) {
          clearUserCache(currentUserId)
        }
      } else {
        updateAuthState({ error: 'Erro ao sair' })
      }

      return { error }
    } catch (error) {
      console.error('Erro no signout:', error)
      updateAuthState({ error: 'Erro ao sair' })
      return { error }
    } finally {
      updateAuthState({ loading: false })
    }
  }

  const checkAuth = useCallback(async () => {
    return initializeAuth()
  }, [initializeAuth])

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    initialized: authState.initialized,
    error: authState.error,
    isAuthenticated: !!authState.user && authState.initialized,
    signUp,
    signIn,
    signOut,
    checkAuth,
  }
}
