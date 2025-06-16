'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, mounted } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [mounted, loading, isAuthenticated, router, redirectTo])

  // Ainda carregando auth
  if (!mounted || loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-300 animate-pulse">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não autenticado
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="glass-strong rounded-lg p-8 max-w-md mx-auto">
            <div className="text-red-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-300 mb-4">Você precisa estar logado para acessar esta página.</p>
            <button
              onClick={() => router.push(redirectTo)}
              className="btn btn-primary w-full"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 