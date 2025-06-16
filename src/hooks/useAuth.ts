'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

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
      setProfile(null)
      return null
    }
  }, [user?.email, user?.user_metadata?.full_name])

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erro ao verificar sessão:', error)
        setUser(null)
        setProfile(null)
        setIsAuthenticated(false)
        return
      }
      
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
      
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [loadProfile])

  useEffect(() => {
    // Verificação inicial
    checkAuth()

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        
        // Não mostrar loading para mudanças de estado que não são login/logout
        if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
          setUser(session?.user ?? null)
          setIsAuthenticated(!!session?.user)
          
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setProfile(null)
          }
          return
        }
        
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session?.user)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuth, loadProfile])

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
        return { data, error: null }
      }

      return { data: null, error }
    } catch (error) {
      console.error('Erro no signup:', error)
      return { data: null, error }
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

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro no signin:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        setUser(null)
        setProfile(null)
        setIsAuthenticated(false)
      }
      
      return { error }
    } catch (error) {
      console.error('Erro no signout:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    checkAuth
  }
} 