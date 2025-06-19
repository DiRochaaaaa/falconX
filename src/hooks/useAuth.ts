'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getUserPlanInfo } from '@/lib/supabase'
import { clearUserCache } from './useDataCache'
import { ProfileWithPlan } from '@/lib/types/database'
import { PlanUsage } from './usePlanLimits'

/**
 * Hook de autenticação com dados completos de plano e limites
 */
interface AuthState {
  user: User | null
  profile: ProfileWithPlan | null
  usage: PlanUsage | null // NOVO: dados de uso do plano
  loading: boolean
  initialized: boolean
  error: string | null
}

export function useAuth() {
  const mountedRef = useRef(true)
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    usage: null,
    loading: true,
    initialized: false,
    error: null,
  })

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setAuthState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const loadUserProfile = useCallback(
    async (
      userId: string,
      _userEmail?: string,
      _userFullName?: string
    ): Promise<ProfileWithPlan | null> => {
      if (!mountedRef.current) return null

      try {
        const profileWithPlan = await getUserPlanInfo(userId)
        if (profileWithPlan) {
          // Converter usage para formato do hook
          const usage: PlanUsage = {
            currentClones: profileWithPlan.usage.currentClones,
            cloneLimit: profileWithPlan.usage.cloneLimit,
            extraClones: profileWithPlan.usage.extraClones,
            resetDate: profileWithPlan.usage.resetDate,
            canDetectMore: profileWithPlan.usage.canDetectMore,
            usageProgress: profileWithPlan.usage.usageProgress,
            alertLevel: profileWithPlan.usage.usageProgress >= 100 ? 'danger' 
              : profileWithPlan.usage.usageProgress >= 80 ? 'warning' 
              : 'success',
            planInfo: {
              cloneLimit: profileWithPlan.plan.clone_limit,
              domainLimit: profileWithPlan.plan.slug === 'free' ? 3 
                : profileWithPlan.plan.slug === 'bronze' ? 10
                : profileWithPlan.plan.slug === 'silver' ? 25
                : -1, // gold e diamond = ilimitado
              price: profileWithPlan.plan.price,
              extraClonePrice: profileWithPlan.plan.extra_clone_price,
              features: {
                realTimeDetection: true,
                customActions: profileWithPlan.plan.slug !== 'free',
                advancedAnalytics: ['silver', 'gold', 'diamond'].includes(profileWithPlan.plan.slug),
                prioritySupport: ['gold', 'diamond'].includes(profileWithPlan.plan.slug),
                apiAccess: ['gold', 'diamond'].includes(profileWithPlan.plan.slug),
              },
              name: profileWithPlan.plan.name,
              description: profileWithPlan.plan.slug === 'free' ? 'Ideal para testar o sistema'
                : profileWithPlan.plan.slug === 'bronze' ? 'Perfeito para pequenos negócios'
                : profileWithPlan.plan.slug === 'silver' ? 'Para quem está crescendo'
                : profileWithPlan.plan.slug === 'gold' ? 'Para negócios estabelecidos'
                : 'Para grandes empresas',
            },
            planSlug: profileWithPlan.plan.slug,
            lastUpdated: profileWithPlan.usage.lastUpdated,
          }

          updateAuthState({ profile: profileWithPlan, usage, error: null })
          return profileWithPlan
        }
        return null
      } catch (error) {
        console.error('Error loading user profile:', error)
        updateAuthState({ profile: null, usage: null, error: 'Erro ao carregar perfil' })
        return null
      }
    },
    [updateAuthState]
  )

  const refreshUserData = useCallback(async () => {
    if (authState.user?.id) {
      await loadUserProfile(authState.user.id, authState.user.email || undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadUserProfile]) // Remover dependências do authState para evitar loops

  // Função de signup atualizada
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
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

        if (error) {
          console.error('Erro no signup:', error)
          updateAuthState({ error: 'Erro ao criar conta' })
          return { data: null, error }
        }

        // Create profile with default free plan subscription
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            throw profileError
          }

          // Create default subscription for free plan
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: data.user.id,
              plan_id: 1, // Free plan ID
              clone_limit: 1,
            })

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError)
            throw subscriptionError
          }
        }

        return data
      } catch (error) {
        console.error('Erro no signup:', error)
        updateAuthState({ error: 'Erro ao criar conta' })
        return { data: null, error: error as any }
      }
    },
    [updateAuthState]
  )

  const signIn = useCallback(async (email: string, password: string) => {
    updateAuthState({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      updateAuthState({ error: 'Erro ao fazer login', loading: false })
      throw error
    }
    return data
  }, [updateAuthState])

  const signOut = useCallback(async () => {
    updateAuthState({ loading: true })
    const { error } = await supabase.auth.signOut()
    if (error) {
      updateAuthState({ error: 'Erro ao fazer logout', loading: false })
      throw error
    }
    
         // Limpar cache
     if (authState.user?.id) {
       clearUserCache(authState.user.id)
     }
    updateAuthState({
      user: null,
      profile: null,
      usage: null,
      loading: false,
      error: null,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateAuthState])

  // Configurar listeners de autenticação
  useEffect(() => {
    let mounted = true
    mountedRef.current = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          updateAuthState({ user: session.user })
          await loadUserProfile(session.user.id, session.user.email || undefined)
        }

        updateAuthState({ loading: false, initialized: true })
      } catch (error) {
        console.error('Erro na inicialização:', error)
        if (mounted) {
          updateAuthState({ 
            loading: false, 
            initialized: true, 
            error: 'Erro na inicialização' 
          })
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        updateAuthState({ user: session?.user ?? null })

        if (session?.user) {
          // [APLICANDO CORREÇÃO SUPABASE BUG] - usar setTimeout para evitar deadlock
          setTimeout(async () => {
            if (mounted) {
              await loadUserProfile(session.user.id, session.user.email || undefined)
            }
          }, 0)
        } else {
          updateAuthState({ 
            profile: null, 
            usage: null,
            loading: false 
          })
        }
      }
    )

    return () => {
      mounted = false
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [loadUserProfile, updateAuthState])

  return {
    user: authState.user,
    profile: authState.profile,
    usage: authState.usage, // NOVO: dados de uso
    loading: authState.loading,
    initialized: authState.initialized,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    loadUserProfile,
    refreshUserData, // NOVO: função para refresh manual
  }
}
