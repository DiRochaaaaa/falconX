'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, initialized, error } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)
  const redirectingRef = useRef(false)

  useEffect(() => {
    // Só processar após inicialização completa
    if (!initialized) {
      setShouldRender(false)
      return
    }

    // Se não há usuário e não está redirecionando ainda
    if (!user && !redirectingRef.current) {
      redirectingRef.current = true
      setShouldRender(false)

      // Pequeno delay para evitar flash
      setTimeout(() => {
        router.push(redirectTo)
      }, 100)
      return
    }

    // Se há usuário autenticado
    if (user) {
      redirectingRef.current = false
      setShouldRender(true)
    }
  }, [user, initialized, router, redirectTo])

  // Reset redirecting flag quando componente desmonta
  useEffect(() => {
    return () => {
      redirectingRef.current = false
    }
  }, [])

  // Ainda inicializando ou carregando
  if (!initialized || loading) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Erro na autenticação
  if (error) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-red-500/10 p-4">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Erro de Autenticação</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Não autenticado - mostrar loading durante redirecionamento
  if (!user) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-300">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Autenticado mas ainda não deveria renderizar
  if (!shouldRender) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo protegido
  return <>{children}</>
}
