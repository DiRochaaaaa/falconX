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
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [loading, isAuthenticated, router, redirectTo])

  // Mostrar loading enquanto verifica auth
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-300 animate-pulse">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não autenticado - não mostrar nada enquanto redireciona
  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
} 