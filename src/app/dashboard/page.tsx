'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections } from '@/hooks/useDataCache'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy } from 'react'

// Modular imports
import {
  Section,
  User,
  UserProfile,
  LoadingSkeleton,
  ErrorMessage,
  ActionsSection,
} from '@/modules/dashboard'

// Lazy load components for better performance
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'))
const RecentDetections = lazy(() => import('@/components/dashboard/RecentDetections'))
const QuickActions = lazy(() => import('@/components/dashboard/QuickActions'))

// Lazy load other sections
const DomainsSection = lazy(() => import('./sections/DomainsSection'))
const ScriptsSection = lazy(() => import('./sections/ScriptsSection'))
const ProfileSection = lazy(() => import('./sections/ProfileSection'))
const SettingsSection = lazy(() => import('./sections/SettingsSection'))
const BillingSection = lazy(() => import('./sections/BillingSection'))

// Main Dashboard Section Component
function DashboardSection({ user, profile }: { user: User | null; profile: UserProfile | null }) {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useDashboardStats(user?.id || '')

  const {
    data: detections,
    loading: detectionsLoading,
    error: detectionsError,
    refresh: refreshDetections,
  } = useRecentDetections(user?.id || '')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze':
        return { domains: 5, price: 29.99 }
      case 'silver':
        return { domains: 15, price: 59.99 }
      case 'gold':
        return { domains: -1, price: 99.99 }
      default:
        return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  return (
    <div className="bg-gradient-main min-h-screen">
      {/* Header Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h1 className="text-gradient mb-3 text-4xl font-bold tracking-tight">
            Bem-vindo ao Falcon X
          </h1>
          <p className="text-lg text-gray-300">
            Monitore e proteja seus funis de vendas contra clonagem em tempo real
          </p>
        </div>

        {/* Plan Info Badge */}
        <div className="bg-gradient-green/10 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-green-400 ring-1 ring-green-500/20">
          <Icons.Crown className="mr-2 h-4 w-4" />
          Plano {profile?.plan_type?.toUpperCase() || 'FREE'}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">Estatísticas</h2>
          <p className="text-gray-400">Visão geral da sua proteção</p>
        </div>

        {statsError && (
          <div className="mb-6">
            <ErrorMessage error={statsError} onRetry={refreshStats} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Suspense
            fallback={
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card">
                    <LoadingSkeleton />
                  </div>
                ))}
              </>
            }
          >
            <StatsCards stats={stats} loading={statsLoading} planLimits={planLimits} />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">Ações Rápidas</h2>
          <p className="text-gray-400">Gerencie sua proteção rapidamente</p>
        </div>

        <Suspense
          fallback={
            <div className="card">
              <LoadingSkeleton className="h-32" />
            </div>
          }
        >
          <QuickActions />
        </Suspense>
      </div>

      {/* Recent Detections Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Detecções Recentes</h2>
            <p className="text-gray-400">Últimas atividades de clonagem detectadas</p>
          </div>
          {detections && detections.length > 0 && (
            <button onClick={refreshDetections} className="btn-ghost" disabled={detectionsLoading}>
              <Icons.RefreshCw className={`h-4 w-4 ${detectionsLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {detectionsError && (
          <div className="mb-6">
            <ErrorMessage error={detectionsError} onRetry={refreshDetections} />
          </div>
        )}

        <Suspense
          fallback={
            <div className="card">
              <LoadingSkeleton className="h-64" />
            </div>
          }
        >
          <RecentDetections detections={detections || []} loading={detectionsLoading} />
        </Suspense>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('dashboard')

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section)
  }

  const renderSection = () => {
    const sectionProps = { user, profile }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection {...sectionProps} />
      case 'domains':
        return (
          <Suspense fallback={<LoadingSkeleton className="h-96" />}>
            <DomainsSection {...sectionProps} />
          </Suspense>
        )
      case 'scripts':
        return (
          <Suspense fallback={<LoadingSkeleton className="h-96" />}>
            <ScriptsSection {...sectionProps} />
          </Suspense>
        )
      case 'actions':
        return user ? <ActionsSection user={user} /> : <LoadingSkeleton className="h-96" />
      case 'profile':
        return (
          <Suspense fallback={<LoadingSkeleton className="h-96" />}>
            <ProfileSection {...sectionProps} />
          </Suspense>
        )
      case 'settings':
        return (
          <Suspense fallback={<LoadingSkeleton className="h-96" />}>
            <SettingsSection />
          </Suspense>
        )
      case 'billing':
        return (
          <Suspense fallback={<LoadingSkeleton className="h-96" />}>
            <BillingSection profile={profile} />
          </Suspense>
        )
      default:
        return <DashboardSection {...sectionProps} />
    }
  }

  return (
    <ProtectedRoute>
      <div className="bg-gradient-main min-h-screen">
        <Navigation activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="mx-auto max-w-7xl px-4 py-8 transition-all duration-300 ease-in-out sm:px-6 lg:px-8">
          {renderSection()}
        </main>
      </div>
    </ProtectedRoute>
  )
}
