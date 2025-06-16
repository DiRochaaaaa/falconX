'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Só processar após inicialização completa
    if (!initialized) return

    if (!user) {
      router.push(redirectTo)
      return
    }

    // Usuário autenticado - pode renderizar
    setShouldRender(true)
  }, [user, initialized, router, redirectTo])

  // Ainda inicializando
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Verificando autenticação..." 
          color="primary"
        />
      </div>
    )
  }

  // Não autenticado - não renderizar nada (redirecionamento em andamento)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Redirecionando..." 
          color="primary"
        />
      </div>
    )
  }

  // Só renderizar se deveria renderizar (evita flash de conteúdo)
  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Carregando..." 
          color="primary"
        />
      </div>
    )
  }

  return <>{children}</>
} 