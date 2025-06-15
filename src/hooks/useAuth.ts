'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, aguardar trigger criar automaticamente
        console.log('Perfil não encontrado, aguardando criação automática...')
        // Tentar novamente após um delay
        setTimeout(() => loadProfile(userId), 1000)
        return
      }

      if (error) {
        console.error('Erro ao carregar perfil:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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