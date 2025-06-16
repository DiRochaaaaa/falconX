'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'
import { supabase } from '@/lib/supabase'


interface DashboardStats {
  allowedDomains: number
  detectedClones: number
  totalDetections: number
  activeActions: number
}

interface Detection {
  id: string
  domain: string
  detected_at: string
  action_taken: string
  user_agent: string
  ip_address: string
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentDetections, setRecentDetections] = useState<Detection[]>([])
  const [error, setError] = useState('')

  const loadDashboardStats = useCallback(async () => {
    if (!user?.id) {
      setLoadingStats(false)
      return
    }

    try {
      // Buscar domínios permitidos
      const { count: allowedDomainsCount } = await supabase
        .from('allowed_domains')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Buscar clones únicos detectados (usando original_domain como agrupamento)
      const { data: uniqueClones } = await supabase
        .from('detected_clones')
        .select('original_domain')
        .eq('user_id', user.id)

      const uniqueClonesCount = new Set(uniqueClones?.map(c => c.original_domain) || []).size

      // Buscar total de detecções
      const { count: totalDetectionsCount } = await supabase
        .from('detected_clones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Buscar ações ativas
      const { count: activeActionsCount } = await supabase
        .from('clone_actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Buscar detecções recentes para o feed
      const { data: recentDetectionsData } = await supabase
        .from('detected_clones')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(5)

      const stats: DashboardStats = {
        allowedDomains: allowedDomainsCount || 0,
        detectedClones: uniqueClonesCount || 0,
        totalDetections: totalDetectionsCount || 0,
        activeActions: activeActionsCount || 0
      }

      const detections: Detection[] = (recentDetectionsData || []).map(detection => ({
        id: detection.id,
        domain: detection.clone_domain || 'Domínio não identificado',
        detected_at: detection.detected_at,
        action_taken: detection.action_taken || 'Nenhuma ação',
        user_agent: detection.user_agent || 'N/A',
        ip_address: detection.ip_address || 'N/A'
      }))

      setStats(stats)
      setRecentDetections(detections)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setError('Erro ao carregar dados do dashboard')
      
      // Em caso de erro, mostrar dados zerados em vez de mock
      setStats({
        allowedDomains: 0,
        detectedClones: 0,
        totalDetections: 0,
        activeActions: 0
      })
      setRecentDetections([])
    } finally {
      setLoadingStats(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadDashboardStats()
    }
  }, [user?.id, loadDashboardStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Navigation */}
      <Navigation />
      
      {/* Header */}
      <div className="glass border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
              <p className="text-gray-300">Bem-vindo de volta, {profile?.full_name || profile?.email || 'Usuário'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-strong rounded-lg px-4 py-2">
                <span className="text-sm text-gray-400">Plano:</span>
                <span className="ml-2 text-green-400 font-semibold capitalize">{profile?.plan_type || 'free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-green rounded-lg">
                <Icons.Globe className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Domínios Monitorados</p>
                <p className="text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats?.allowedDomains}
                  {planLimits.domains > 0 && (
                    <span className="text-sm text-green-400">/{planLimits.domains}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Icons.Warning className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Clones Detectados</p>
                <p className="text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats?.detectedClones}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Icons.Dashboard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total de Detecções</p>
                <p className="text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats?.totalDetections}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-green-light rounded-lg">
                <Icons.Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Ações Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {loadingStats ? '...' : stats?.activeActions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card animate-slide-in">
            <h3 className="text-xl font-semibold text-white mb-6">Ações Rápidas</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 glass-strong rounded-lg hover:border-green-400/60 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-green rounded-lg mr-3">
                    <Icons.Plus className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Adicionar Domínio</span>
                </div>
                <Icons.ChevronDown className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors rotate-[-90deg]" />
              </button>
              
              <a href="/scripts" className="w-full flex items-center justify-between p-4 glass-strong rounded-lg hover:border-green-400/60 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-green-light rounded-lg mr-3">
                    <Icons.Code className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Gerar Script Global</span>
                </div>
                <Icons.ChevronDown className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors rotate-[-90deg]" />
              </a>
              
              <button className="w-full flex items-center justify-between p-4 glass-strong rounded-lg hover:border-green-400/60 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-lg mr-3">
                    <Icons.Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Configurar Ações</span>
                </div>
                <Icons.ChevronDown className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors rotate-[-90deg]" />
              </button>
            </div>
          </div>

          <div className="card animate-slide-in" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-semibold text-white mb-6">Status do Plano</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plano Atual:</span>
                <span className="text-green-400 font-semibold capitalize">{profile?.plan_type || 'free'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Preço:</span>
                <span className="text-white font-semibold">
                  {planLimits.price === 0 ? 'Gratuito' : `$${planLimits.price}/mês`}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Domínios:</span>
                <span className="text-white font-semibold">
                  {planLimits.domains === -1 ? 'Ilimitados' : `${stats?.allowedDomains}/${planLimits.domains}`}
                </span>
              </div>

              {profile?.plan_type === 'free' && (
                <div className="mt-6 p-4 glass-strong rounded-lg border border-green-500/30">
                  <p className="text-sm text-gray-300 mb-3">Upgrade seu plano para:</p>
                  <ul className="text-xs text-gray-400 space-y-1 mb-4">
                    <li>• Mais domínios monitorados</li>
                    <li>• Detecção avançada</li>
                    <li>• Ações automáticas</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                  <button className="btn-primary w-full">
                    Fazer Upgrade
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card animate-fade-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-xl font-semibold text-white mb-6">Atividade Recente</h3>
          <div className="space-y-3">
            {loadingStats ? (
              <div className="text-center py-12">
                <Icons.Spinner className="h-8 w-8 mx-auto mb-4 text-green-400" />
                <p className="text-gray-300">Carregando atividades recentes...</p>
              </div>
            ) : recentDetections.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-green rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icons.Check className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-300 text-lg">Nenhum clone detectado ainda</p>
                <p className="text-gray-500 mt-2">
                  {stats?.allowedDomains === 0 ? 'Adicione domínios para começar o monitoramento' : 'Seus domínios estão seguros!'}
                </p>
              </div>
            ) : (
              recentDetections.map((detection, index) => (
                <div key={detection.id} className="glass-strong rounded-lg p-4 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                        <Icons.Warning className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{detection.domain}</p>
                        <p className="text-gray-400 text-sm">
                          Ação: {detection.action_taken} • {new Date(detection.detected_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">IP: {detection.ip_address}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 