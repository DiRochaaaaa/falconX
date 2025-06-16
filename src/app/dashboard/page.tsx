'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections } from '@/hooks/useDataCache'
import DashboardLayout from '@/components/DashboardLayout'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Lazy load components for better performance
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'))
const RecentDetections = lazy(() => import('@/components/dashboard/RecentDetections'))
const QuickActions = lazy(() => import('@/components/dashboard/QuickActions'))

// Loading skeleton component
function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-700 rounded h-4 w-1/2"></div>
    </div>
  )
}

// Error message component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="card border-red-500/20 bg-red-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icons.Warning className="h-5 w-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
        <button onClick={onRetry} className="btn-ghost text-sm">
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, initialized } = useAuth()
  const router = useRouter()
  const [showError, setShowError] = useState('')
  
  // Redirecionar usuários não logados para a landing page
  useEffect(() => {
    if (initialized && !user) {
      router.push('/')
    }
  }, [initialized, user, router])
  
  // Usar hooks de cache otimizados - só quando user e inicialização estiverem prontos
  const shouldLoadData = !!(user?.id && initialized)
  
  const { 
    data: stats, 
    loading: loadingStats, 
    error: statsError, 
    refresh: refreshStats,
    isStale: statsStale 
  } = useDashboardStats(shouldLoadData ? user.id : '')
  
  const { 
    data: recentDetections, 
    loading: loadingDetections, 
    error: detectionsError, 
    refresh: refreshDetections,
    isStale: detectionsStale 
  } = useRecentDetections(shouldLoadData ? user.id : '')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  const handleRefreshAll = async () => {
    if (!shouldLoadData) return
    
    try {
      await Promise.all([refreshStats(), refreshDetections()])
      setShowError('')
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      setShowError('Erro ao atualizar dados')
    }
  }

  // Mostrar loading se ainda não inicializou ou não tem dados básicos
  if (!initialized || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-main flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-gray-300 animate-pulse">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Bem-vindo de volta, {profile?.full_name || 'Usuário'}!
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {(statsStale || detectionsStale) && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <Icons.Warning className="h-4 w-4" />
                <span>Dados desatualizados</span>
              </div>
            )}
            <button 
              onClick={handleRefreshAll}
              className="btn-ghost flex items-center space-x-2"
              disabled={loadingStats || loadingDetections}
            >
              <Icons.Settings className={`h-4 w-4 ${(loadingStats || loadingDetections) ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {showError && (
          <div className="mb-6 animate-fade-in">
            <ErrorMessage 
              error={showError} 
              onRetry={() => setShowError('')} 
            />
          </div>
        )}

        {statsError && (
          <div className="mb-6 animate-fade-in">
            <ErrorMessage 
              error={`Erro nas estatísticas: ${statsError}`} 
              onRetry={() => refreshStats()} 
            />
          </div>
        )}

        {detectionsError && (
          <div className="mb-6 animate-fade-in">
            <ErrorMessage 
              error={`Erro nas detecções: ${detectionsError}`} 
              onRetry={() => refreshDetections()} 
            />
          </div>
        )}

        {/* Stats Cards with Suspense */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Suspense fallback={<LoadingSkeleton className="h-32" />}>
            <StatsCards 
              stats={stats}
              loading={loadingStats}
              planLimits={planLimits}
            />
          </Suspense>
        </div>

        {/* Recent Detections with Suspense */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSkeleton className="h-64" />}>
            <RecentDetections 
              detections={recentDetections || []}
              loading={loadingDetections}
            />
          </Suspense>
        </div>

        {/* Quick Actions with Suspense */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSkeleton className="h-32" />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  )
} 