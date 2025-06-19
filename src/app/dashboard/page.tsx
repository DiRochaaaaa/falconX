'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections } from '@/hooks/useDataCache'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy, useEffect } from 'react'
import PlanLimitStatus from '@/components/dashboard/PlanLimitStatus'
import BlockedClonesAlert from '@/components/dashboard/BlockedClonesAlert'

// Modular imports
import {
  Section,
  User,
  DashboardUser,
  LoadingSkeleton,
  ErrorMessage,
  ActionsSection,
} from '@/modules/dashboard'

// Lazy load components for better performance
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'))
const RecentDetections = lazy(() => import('@/components/dashboard/RecentDetections'))

// Lazy load other sections
const DomainsSection = lazy(() => import('./sections/DomainsSection'))
const ScriptsSection = lazy(() => import('./sections/ScriptsSection'))
const ProfileSection = lazy(() => import('./sections/ProfileSection'))
const SettingsSection = lazy(() => import('./sections/SettingsSection'))
const BillingSection = lazy(() => import('./sections/BillingSection'))

// Main Dashboard Section Component
function DashboardSection({ user, profile, usage }: { user: User | null; profile: DashboardUser | null; usage: any }) {
  const [blockedClonesCount, setBlockedClonesCount] = useState(0)

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

  // Buscar dados de clones bloqueados
  useEffect(() => {
    async function fetchBlockedClones() {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/plan-limits?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setBlockedClonesCount(data.usage?.blockedClones || 0)
        }
      } catch (error) {
        console.error('Erro ao buscar clones bloqueados:', error)
      }
    }

    fetchBlockedClones()
  }, [user?.id])

  const getPlanLimits = () => {
    switch (profile?.plan?.slug) {
      case 'bronze':
        return { domains: 5, price: 39.90 }
      case 'silver':
        return { domains: 10, price: 79.90 }
      case 'gold':
        return { domains: 20, price: 149.90 }
      case 'diamond':
        return { domains: 50, price: 299.90 }
      default:
        return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  const handleUpgrade = () => {
    // Implementar navegação para billing
  }

  return (
    <div className="bg-gradient-main min-h-screen">
      {/* Alerta de Clones Bloqueados */}
      {blockedClonesCount > 0 && (
        <div className="mb-8">
          <BlockedClonesAlert
            user={profile}
            _limits={planLimits}
            loading={false}
          />
        </div>
      )}

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
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500/10 to-emerald-600/10 px-4 py-2 text-sm font-medium text-green-400 ring-1 ring-green-500/20 backdrop-blur-sm">
            <Icons.Crown className="mr-2 h-4 w-4" />
                          Plano {profile?.plan?.name?.toUpperCase() ?? 'GRATUITO'}
          </div>
          <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20">
            <div className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></div>
            Sistema Ativo
          </div>
          <div className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20">
            <Icons.Lightning className="mr-1 h-3 w-3" />
            {planLimits.domains === -1
              ? 'Ilimitado'
              : `${stats?.allowedDomains || 0}/${planLimits.domains} domínios`}
          </div>
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

        {/* Grid com Status do Plano + Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status do Plano */}
          <div className="lg:col-span-1">
            <PlanLimitStatus 
              usage={usage}
              onUpgrade={handleUpgrade}
            />
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        </div>
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
  const { user, profile, usage } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('dashboard')

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section)
  }

  const renderSection = () => {
    const sectionProps = { user, profile }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection {...sectionProps} usage={usage} />
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
        return <DashboardSection {...sectionProps} usage={usage} />
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
