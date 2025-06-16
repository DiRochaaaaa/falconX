'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, AuthSession } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const loadProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      // Timeout para evitar requests infinitos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as { data: UserProfile | null; error: any }

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, tentar criar ou aguardar trigger
        if (retryCount < 2) { // Reduzido para 2 tentativas
          console.log(`Perfil não encontrado, tentativa ${retryCount + 1}/2...`)
          setTimeout(() => loadProfile(userId, retryCount + 1), 2000) // Aumentado delay
          return
        } else {
          console.log('Perfil não encontrado após 2 tentativas, continuando sem perfil')
          setProfile(null)
        }
      } else if (error) {
        console.error('Erro ao carregar perfil:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setProfile(null)
    } finally {
      // Sempre define loading como false após tentativas
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Timeout de segurança para garantir que loading seja false
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout: forçando loading = false')
      setLoading(false)
    }, 15000) // 15 segundos máximo
    
    // Verificar sessão inicial com timeout
    const getSessionWithTimeout = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 8000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: AuthSession | null } }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setLoading(false)
        }
        clearTimeout(safetyTimeout)
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        setLoading(false)
        clearTimeout(safetyTimeout)
      }
    }

    getSessionWithTimeout()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null)
          if (session?.user) {
            await loadProfile(session.user.id)
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
      clearTimeout(safetyTimeout)
    }
  }, [loadProfile])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      // Retornar sucesso mesmo se houver "erro" de confirmação
      // pois o Supabase está configurado para não precisar de confirmação
      if (data?.user) {
        return { data, error: null }
      }

      // Se não conseguir criar usuário, tentar fazer login
      // (usuário pode já existir)
      if (error) {
        console.log('Tentando fazer login com credenciais fornecidas...')
        const loginResult = await signIn(email, password)
        if (!loginResult.error) {
          return loginResult
        }
      }

      return { data, error }
    } catch (err) {
      console.error('Erro no signup:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Erro desconhecido')
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error('Erro no signin:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Erro desconhecido')
      }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err) {
      console.error('Erro no signout:', err)
      return { error: err instanceof Error ? err : new Error('Erro desconhecido') }
    }
  }

  return {
    user,
    profile,
    loading,
    mounted,
    signUp,
    signIn,
    signOut,
  }
} 