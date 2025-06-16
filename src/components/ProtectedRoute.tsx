'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!loading) {
      hasInitialized.current = true
      if (!isAuthenticated) {
        router.push(redirectTo)
      }
    }
  }, [loading, isAuthenticated, router, redirectTo])

  // Só mostrar loading na primeira inicialização
  if (loading && !hasInitialized.current) {
    return fallback || (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-300 animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  // Não autenticado - não mostrar nada enquanto redireciona
  if (!isAuthenticated || !user) {
    return null
  }

  // Mostrar conteúdo diretamente sem transição desnecessária
  return <>{children}</>
} 