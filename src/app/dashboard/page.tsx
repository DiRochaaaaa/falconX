'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections, useAllowedDomains } from '@/hooks/useDataCache'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy } from 'react'
import { supabase } from '@/lib/supabase'

// Lazy load components for better performance
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'))
const RecentDetections = lazy(() => import('@/components/dashboard/RecentDetections'))
const QuickActions = lazy(() => import('@/components/dashboard/QuickActions'))

// Loading skeleton component
function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="mb-4 h-6 w-3/4 rounded-lg bg-gray-700/50"></div>
      <div className="mb-3 h-4 w-1/2 rounded bg-gray-700/30"></div>
      <div className="h-4 w-2/3 rounded bg-gray-700/30"></div>
    </div>
  )
}

// Error message component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="card border-red-500/30 bg-red-500/10 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-red-500/20 p-2">
            <Icons.Warning className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-300">Erro no carregamento</p>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        </div>
        <button onClick={onRetry} className="btn-ghost text-sm hover:bg-red-500/10">
          <Icons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}

// Seções do SPA
type Section = 'dashboard' | 'domains' | 'scripts' | 'actions' | 'profile' | 'settings' | 'billing'

// Tipos necessários
interface UserProfile {
  id?: string
  email?: string
  full_name?: string
  plan_type?: string
}

interface User {
  id: string
  email?: string
}

// Componente Dashboard Principal
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

// Componente de Domínios
function DomainsSection({ user, profile }: { user: User | null; profile: UserProfile | null }) {
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')

  const {
    data: domains,
    loading,
    error: domainsError,
    refresh: refreshDomains,
  } = useAllowedDomains(user?.id || '')

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
  const canAddMore = planLimits.domains === -1 || (domains?.length || 0) < planLimits.domains

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      setError('Usuário não autenticado')
      return
    }

    if (!newDomain.trim()) {
      setError('Digite um domínio válido')
      return
    }

    if (!validateDomain(newDomain.trim())) {
      setError('Formato de domínio inválido')
      return
    }

    if (!canAddMore) {
      setError(
        `Limite de ${planLimits.domains} domínios atingido para o plano ${profile?.plan_type || 'free'}`
      )
      return
    }

    setIsAdding(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('allowed_domains').insert([
        {
          user_id: user.id,
          domain: newDomain.trim().toLowerCase(),
          is_active: true,
        },
      ])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Este domínio já está cadastrado')
        } else {
          setError('Erro ao adicionar domínio')
        }
        return
      }

      setNewDomain('')
      await refreshDomains()
    } catch {
      setError('Erro ao adicionar domínio')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleDomain = async (domainId: string, currentStatus: boolean) => {
    if (!user?.id) return

    try {
      const { error: updateError } = await supabase
        .from('allowed_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId)
        .eq('user_id', user.id)

      if (updateError) {
        setError('Erro ao atualizar status do domínio')
        return
      }

      await refreshDomains()
    } catch {
      setError('Erro ao atualizar status do domínio')
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!user?.id) return

    try {
      const { error: deleteError } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)
        .eq('user_id', user.id)

      if (deleteError) {
        setError('Erro ao excluir domínio')
        return
      }

      await refreshDomains()
    } catch {
      setError('Erro ao excluir domínio')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gradient mb-2 text-2xl font-bold">Domínios Permitidos</h2>
          <p className="text-gray-300">
            Gerencie os domínios que devem ser protegidos contra clonagem
          </p>
        </div>
        <div className="glass-strong rounded-lg px-4 py-2">
          <span className="text-sm text-gray-400">
            {domains?.length || 0} / {planLimits.domains === -1 ? '∞' : planLimits.domains}
          </span>
        </div>
      </div>

      {/* Formulário para adicionar domínio */}
      <form onSubmit={handleAddDomain} className="glass rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="exemplo.com"
              className="input-primary w-full"
              disabled={isAdding || !canAddMore}
            />
          </div>
          <button type="submit" disabled={isAdding || !canAddMore} className="btn btn-primary px-6">
            {isAdding ? (
              <>
                <div className="loading-spinner mr-2 h-4 w-4"></div>
                Adicionando...
              </>
            ) : (
              'Adicionar'
            )}
          </button>
        </div>

        {!canAddMore && (
          <p className="mt-2 text-sm text-yellow-400">
            Limite de domínios atingido. Faça upgrade do seu plano para adicionar mais.
          </p>
        )}

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </form>

      {domainsError && <ErrorMessage error={domainsError} onRetry={refreshDomains} />}

      {/* Lista de domínios */}
      <div className="glass rounded-xl p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-16" />
            ))}
          </div>
        ) : domains && domains.length > 0 ? (
          <div className="space-y-4">
            {domains.map(
              (domain: { id: string; domain: string; is_active: boolean; created_at: string }) => (
                <div
                  key={domain.id}
                  className="glass-strong flex items-center justify-between rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-3 w-3 rounded-full ${domain.is_active ? 'bg-green-500' : 'bg-gray-500'}`}
                    ></div>
                    <div>
                      <p className="font-medium text-white">{domain.domain}</p>
                      <p className="text-sm text-gray-400">
                        Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleDomain(domain.id, domain.is_active)}
                      className={`btn-ghost text-sm ${domain.is_active ? 'text-yellow-400' : 'text-green-400'}`}
                    >
                      {domain.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="btn-ghost text-sm text-red-400"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Icons.Globe className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <p className="text-gray-400">Nenhum domínio adicionado ainda</p>
            <p className="text-sm text-gray-500">
              Adicione seus domínios para começar a protegê-los
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Scripts
function ScriptsSection({
  user,
  profile: _profile,
}: {
  user: User | null
  profile: UserProfile | null
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')

  const generateScript = async () => {
    if (!user?.id) return

    setIsGenerating(true)
    try {
      // Simular geração de script
      await new Promise(resolve => setTimeout(resolve, 1000))

      const script = `
        <script>
        (function(){
          const userId = '${user.id}';
          const apiUrl = '${window.location.origin}/api/detect';
          
          function detectClone() {
            fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userId,
                currentDomain: window.location.hostname,
                currentUrl: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              })
            });
          }
          
          detectClone();
          setInterval(detectClone, 30000);
        })();
        </script>
      `.trim()

      setGeneratedScript(script)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript)
      // Show success toast
    } catch {
      // Erro ao copiar para clipboard
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Scripts de Proteção</h2>
        <p className="text-gray-300">Gere e gerencie os scripts de proteção para seus domínios</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="py-8 text-center">
          <Icons.Code className="mx-auto mb-4 h-16 w-16 text-green-400" />
          <h3 className="mb-2 text-xl font-semibold text-white">Script Global</h3>
          <p className="mb-6 text-gray-400">
            Gere um script único que funciona em todos os seus domínios
          </p>

          <button onClick={generateScript} disabled={isGenerating} className="btn btn-primary">
            {isGenerating ? (
              <>
                <div className="loading-spinner mr-2 h-4 w-4"></div>
                Gerando Script...
              </>
            ) : (
              <>
                <Icons.Code className="mr-2 h-4 w-4" />
                Gerar Script
              </>
            )}
          </button>
        </div>

        {generatedScript && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Script Gerado</h4>
              <button onClick={copyToClipboard} className="btn-ghost text-sm">
                <Icons.Copy className="mr-1 h-4 w-4" />
                Copiar
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4">
              <pre className="text-sm text-gray-300">
                <code>{generatedScript}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-200">
                <strong>Como usar:</strong> Copie este script e cole antes do fechamento da tag
                &lt;/body&gt; em todos os seus funis de vendas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Ações
function ActionsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Ações Configuradas</h2>
        <p className="text-gray-300">
          Configure as ações a serem executadas quando clones forem detectados
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="py-8 text-center">
          <Icons.Lightning className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
          <h3 className="mb-2 text-xl font-semibold text-white">Configurar Ações</h3>
          <p className="mb-6 text-gray-400">Defina o que acontece quando um clone é detectado</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="glass-strong rounded-lg p-4 text-center">
                <Icons.ArrowRight className="mx-auto mb-2 h-8 w-8 text-blue-400" />
                <h4 className="mb-1 font-medium text-white">Redirecionamento</h4>
                <p className="text-sm text-gray-400">Redirecionar tráfego para seu site original</p>
              </div>

              <div className="glass-strong rounded-lg p-4 text-center">
                <Icons.EyeOff className="mx-auto mb-2 h-8 w-8 text-red-400" />
                <h4 className="mb-1 font-medium text-white">Página em Branco</h4>
                <p className="text-sm text-gray-400">Mostrar página em branco para clones</p>
              </div>

              <div className="glass-strong rounded-lg p-4 text-center">
                <Icons.MessageSquare className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                <h4 className="mb-1 font-medium text-white">Mensagem Custom</h4>
                <p className="text-sm text-gray-400">Exibir mensagem personalizada</p>
              </div>
            </div>

            <button className="btn btn-primary">Configurar Ações</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Perfil
function ProfileSection({
  user: _user,
  profile,
}: {
  user: User | null
  profile: UserProfile | null
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Meu Perfil</h2>
        <p className="text-gray-300">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-green rounded-full p-4">
              <Icons.User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {profile?.full_name || 'Usuário'}
              </h3>
              <p className="text-gray-400">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Nome Completo</label>
              <input
                type="text"
                defaultValue={profile?.full_name || ''}
                className="input-primary w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                defaultValue={profile?.email || ''}
                className="input-primary w-full"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Configurações
function SettingsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Configurações</h2>
        <p className="text-gray-300">Personalize suas preferências e configurações do sistema</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="py-8 text-center">
          <Icons.Settings className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-400">Configurações em desenvolvimento</p>
        </div>
      </div>
    </div>
  )
}

// Componente de Faturamento
function BillingSection({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Faturamento</h2>
        <p className="text-gray-300">Gerencie seu plano e informações de faturamento</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Plano Atual</h3>
              <p className="text-gray-400">Você está no plano {profile?.plan_type || 'Free'}</p>
            </div>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium capitalize text-green-400">
              {profile?.plan_type || 'Free'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Bronze</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 29,99</p>
              <p className="mb-4 text-sm text-gray-400">5 domínios</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg border border-green-500/30 p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Silver</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 59,99</p>
              <p className="mb-4 text-sm text-gray-400">15 domínios</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Gold</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 99,99</p>
              <p className="mb-4 text-sm text-gray-400">Ilimitado</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>
          </div>
        </div>
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
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection user={user} profile={profile} />
      case 'domains':
        return <DomainsSection user={user} profile={profile} />
      case 'scripts':
        return <ScriptsSection user={user} profile={profile} />
      case 'actions':
        return <ActionsSection />
      case 'profile':
        return <ProfileSection user={user} profile={profile} />
      case 'settings':
        return <SettingsSection />
      case 'billing':
        return <BillingSection profile={profile} />
      default:
        return <DashboardSection user={user} profile={profile} />
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
