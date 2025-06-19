'use client'

import React, { useState, Suspense, lazy, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections } from '@/hooks/useDataCache'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import PlanLimitStatus from '@/components/dashboard/PlanLimitStatus'
import BlockedClonesAlert from '@/components/dashboard/BlockedClonesAlert'
import { getPlanInfo } from '@/lib/plan-utils'

// Modular imports
import {
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
    const planSlug = profile?.plan?.slug || 'free'
    const planInfo = getPlanInfo(planSlug)
    
    return {
      clones: planInfo.cloneLimit,      // Limite de clones detectáveis
      domains: planInfo.domainLimit,    // Limite de domínios monitorados
      price: planInfo.price
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
              ? 'Domínios Ilimitados'
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
  const { user, profile, usage, loading, initialized, error } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  // Loading state mais robusto
  if (!initialized || (loading && !user)) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500"></div>
          </div>
          <h2 className="text-xl font-semibold text-white">Inicializando...</h2>
          <p className="text-gray-400">Configurando seu dashboard</p>
        </div>
      </div>
    )
  }

  // Error state mais robusto
  if (error && !user) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <div className="mb-4">
            <Icons.Warning className="mx-auto h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erro de Autenticação</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Redirect to login se não tem usuário
  if (initialized && !user) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400 mb-4">Você precisa fazer login para acessar esta página</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Warning se tem usuário mas não conseguiu carregar perfil completo
  const hasPartialData = user && (!profile || !usage)

  const renderSection = () => {
    // Props seguras para todos os componentes
    const safeProps = {
      user: user,
      profile: profile || null,
      usage: usage || null,
      loading: loading,
      error: error
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection {...safeProps} />
      case 'domains':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <DomainsSection user={safeProps.user} profile={safeProps.profile} />
          </Suspense>
        )
      case 'scripts':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ScriptsSection user={safeProps.user} profile={safeProps.profile} />
          </Suspense>
        )
      case 'actions':
        return safeProps.user ? (
          <ActionsSection user={safeProps.user} />
        ) : (
          <div className="glass rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Ações</h2>
            <p className="text-gray-400">Carregando dados do usuário...</p>
          </div>
        )
      case 'profile':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <ProfileSection user={safeProps.user} profile={safeProps.profile} />
          </Suspense>
        )
      case 'settings':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <SettingsSection />
          </Suspense>
        )
      case 'billing':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <BillingSection profile={safeProps.profile} />
          </Suspense>
        )
      default:
        return <DashboardSection {...safeProps} />
    }
  }

  return (
    <div className="bg-gradient-main min-h-screen">
      <Navigation activeSection={activeSection} onSectionChange={handleSectionChange} />
      
      {/* Warning para dados parciais */}
      {hasPartialData && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="glass-strong rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Icons.Warning className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-200">
                  Dados Carregados Parcialmente
                </h3>
                <p className="text-xs text-yellow-300 mt-1">
                  Algumas informações podem não estar atualizadas. {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorBoundary>
          {renderSection()}
        </ErrorBoundary>
      </main>
    </div>
  )
}

// Componente de Error Boundary simples
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
                 <div className="glass rounded-xl p-8 text-center">
           <Icons.Warning className="mx-auto h-12 w-12 text-red-500 mb-4" />
           <h2 className="text-xl font-semibold text-white mb-2">Algo deu errado</h2>
           <p className="text-gray-400 mb-4">
             Ocorreu um erro inesperado nesta seção do dashboard.
           </p>
           <button 
             onClick={() => this.setState({ hasError: false })}
             className="btn-primary mr-2"
           >
             Tentar Novamente
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="btn-ghost"
           >
             Recarregar Página
           </button>
         </div>
      )
    }

    return this.props.children
  }
}
