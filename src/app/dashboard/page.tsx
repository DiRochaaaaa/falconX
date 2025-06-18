'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections, useAllowedDomains } from '@/hooks/useDataCache'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
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
  const [copySuccess, setCopySuccess] = useState(false)

  const generateScript = useCallback(async () => {
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
          
          // Detecção inicial
          detectClone();
          
          // Polling otimizado - reduzido para 2 minutos
          setInterval(detectClone, 120000);
          
          // Detecção baseada em eventos para melhor responsividade
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              detectClone();
            }
          });
          
          window.addEventListener('focus', () => {
            detectClone();
          });
        })();
        </script>
      `.trim()

      setGeneratedScript(script)
    } finally {
      setIsGenerating(false)
    }
  }, [user?.id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback para navegadores sem clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = generatedScript
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // Gerar script automaticamente quando o componente carrega
  useEffect(() => {
    if (user?.id && !generatedScript && !isGenerating) {
      generateScript()
    }
  }, [user?.id, generatedScript, isGenerating, generateScript])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Scripts de Proteção</h2>
        <p className="text-gray-300">Gere e gerencie os scripts de proteção para seus domínios</p>
      </div>

      <div className="glass rounded-xl p-6">
        {isGenerating ? (
          <div className="py-8 text-center">
            <div className="loading-spinner mx-auto mb-4 h-16 w-16 text-green-400"></div>
            <h3 className="mb-2 text-xl font-semibold text-white">Gerando seu script...</h3>
            <p className="text-gray-400">Criando script personalizado para sua proteção</p>
          </div>
        ) : !generatedScript ? (
          <div className="py-8 text-center">
            <Icons.Code className="mx-auto mb-4 h-16 w-16 text-green-400" />
            <h3 className="mb-2 text-xl font-semibold text-white">Script Global</h3>
            <p className="mb-6 text-gray-400">
              Script único que funciona em todos os seus domínios
            </p>
            <button onClick={generateScript} className="btn btn-primary">
              <Icons.Code className="mr-2 h-4 w-4" />
              Gerar Novo Script
            </button>
          </div>
        ) : null}

        {generatedScript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white">✅ Script Pronto para Uso</h4>
                <p className="text-sm text-gray-400">Copie e cole antes do &lt;/body&gt;</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={generateScript} className="btn-ghost text-sm">
                  <Icons.RefreshCw className="mr-1 h-4 w-4" />
                  Regenerar
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`btn-primary text-sm ${copySuccess ? 'bg-green-600' : ''}`}
                >
                  {copySuccess ? (
                    <>
                      <Icons.Check className="mr-1 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="mr-1 h-4 w-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
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
interface ActionData {
  id: number
  user_id: string
  action_type: 'redirect' | 'blank_page' | 'custom_message'
  redirect_url?: string
  redirect_percentage: number
  trigger_params: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
}

function ActionsSection({ user }: { user: User | null }) {
  const [actions, setActions] = useState<ActionData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<{
    action_type: 'redirect' | 'blank_page' | 'custom_message'
    redirect_url: string
    redirect_percentage: number
    trigger_params: Record<string, boolean>
  }>({
    action_type: 'redirect',
    redirect_url: '',
    redirect_percentage: 100,
    trigger_params: { fbclid: true, gclid: false, utm_source: false },
  })

  const loadActions = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clone_actions')
        .select('*')
        .eq('user_id', user.id)
        .is('clone_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActions(data || [])
    } catch (error) {
      console.error('Erro ao carregar ações:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const { error } = await supabase.from('clone_actions').insert({
        user_id: user.id,
        action_type: formData.action_type,
        redirect_url: formData.action_type === 'redirect' ? formData.redirect_url : null,
        redirect_percentage: formData.redirect_percentage,
        trigger_params: formData.trigger_params,
        is_active: true,
      })

      if (error) throw error

      setShowForm(false)
      setFormData({
        action_type: 'redirect',
        redirect_url: '',
        redirect_percentage: 100,
        trigger_params: { fbclid: true, gclid: false, utm_source: false },
      })
      loadActions()
    } catch (error) {
      console.error('Erro ao criar ação:', error)
    }
  }

  const toggleAction = async (actionId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('clone_actions')
        .update({ is_active: !isActive })
        .eq('id', actionId)

      if (error) throw error
      loadActions()
    } catch (error) {
      console.error('Erro ao atualizar ação:', error)
    }
  }

  const deleteAction = async (actionId: number) => {
    try {
      const { error } = await supabase.from('clone_actions').delete().eq('id', actionId)

      if (error) throw error
      loadActions()
    } catch (error) {
      console.error('Erro ao deletar ação:', error)
    }
  }

  useEffect(() => {
    loadActions()
  }, [loadActions])

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'redirect':
        return <Icons.ArrowRight className="h-5 w-5 text-blue-400" />
      case 'blank_page':
        return <Icons.EyeOff className="h-5 w-5 text-red-400" />
      case 'custom_message':
        return <Icons.MessageSquare className="h-5 w-5 text-purple-400" />
      default:
        return <Icons.Lightning className="h-5 w-5 text-yellow-400" />
    }
  }

  const getActionName = (type: string) => {
    switch (type) {
      case 'redirect':
        return 'Redirecionamento'
      case 'blank_page':
        return 'Página em Branco'
      case 'custom_message':
        return 'Mensagem Custom'
      default:
        return type
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gradient mb-2 text-2xl font-bold">Ações Configuradas</h2>
          <p className="text-gray-300">
            Configure as ações a serem executadas quando clones forem detectados
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Icons.Plus className="mr-2 h-4 w-4" />
          Nova Ação
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-xl p-6">
          <div className="py-8 text-center">
            <div className="loading-spinner mx-auto mb-4 h-8 w-8"></div>
            <p className="text-gray-400">Carregando ações...</p>
          </div>
        </div>
      ) : actions.length === 0 ? (
        <div className="glass rounded-xl p-6">
          <div className="py-8 text-center">
            <Icons.Lightning className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold text-white">Nenhuma Ação Configurada</h3>
            <p className="mb-6 text-gray-400">
              Configure ações para serem executadas quando clones forem detectados
            </p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Criar Primeira Ação
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map(action => (
            <div key={action.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-gray-800/50 p-3">
                    {getActionIcon(action.action_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {getActionName(action.action_type)}
                    </h3>
                    {action.redirect_url && (
                      <p className="text-sm text-gray-400">→ {action.redirect_url}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {action.redirect_percentage}% dos visitantes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAction(action.id, action.is_active)}
                    className={`btn-ghost text-sm ${
                      action.is_active ? 'text-green-400' : 'text-gray-400'
                    }`}
                  >
                    {action.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => deleteAction(action.id)}
                    className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Nova Ação</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost text-sm"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Tipo de Ação</label>
                <select
                  value={formData.action_type}
                  onChange={e => {
                    const value = e.target.value as 'redirect' | 'blank_page' | 'custom_message'
                    setFormData({ ...formData, action_type: value })
                  }}
                  className="input-primary w-full"
                >
                  <option value="redirect">Redirecionamento</option>
                  <option value="blank_page">Página em Branco</option>
                  <option value="custom_message">Mensagem Custom</option>
                </select>
              </div>

              {formData.action_type === 'redirect' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    URL de Redirecionamento
                  </label>
                  <input
                    type="url"
                    value={formData.redirect_url}
                    onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                    className="input-primary w-full"
                    placeholder="https://seusite.com"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Porcentagem de Ação ({formData.redirect_percentage}%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.redirect_percentage}
                  onChange={e =>
                    setFormData({ ...formData, redirect_percentage: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Criar Ação
              </button>
            </div>
          </form>
        </div>
      )}
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
        return <ActionsSection user={user} />
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
