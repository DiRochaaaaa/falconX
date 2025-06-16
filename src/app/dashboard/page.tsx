'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections } from '@/hooks/useDataCache'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy } from 'react'

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

// Error boundary component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
        <button
          onClick={onRetry}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <Icons.Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [showError, setShowError] = useState('')
  
  // Usar hooks de cache otimizados
  const { 
    data: stats, 
    loading: loadingStats, 
    error: statsError, 
    refresh: refreshStats,
    isStale: statsStale 
  } = useDashboardStats(user?.id || '')
  
  const { 
    data: recentDetections, 
    loading: loadingDetections, 
    error: detectionsError, 
    refresh: refreshDetections,
    isStale: detectionsStale 
  } = useRecentDetections(user?.id || '')

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
    try {
      await Promise.all([refreshStats(), refreshDetections()])
    } catch {
      setShowError('Erro ao atualizar dados')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-main">
        {/* Navigation */}
        <Navigation />
        
        {/* Header */}
        <div className="glass border-b border-green-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in">
                <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
                <p className="text-gray-300">
                  Bem-vindo de volta, {profile?.full_name || profile?.email || 'Usuário'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Indicador de dados desatualizados */}
                {(statsStale || detectionsStale) && (
                  <button
                    onClick={handleRefreshAll}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Icons.Settings className="h-4 w-4" />
                    <span className="text-sm">Atualizar</span>
                  </button>
                )}
                
                <div className="glass-strong rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-400">Plano:</span>
                  <span className="ml-2 text-green-400 font-semibold capitalize">
                    {profile?.plan_type || 'free'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </ProtectedRoute>
  )
} 