'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'

interface Domain {
  id: string
  domain: string
  is_active: boolean
  created_at: string
  last_check: string | null
  status: 'active' | 'inactive' | 'error' | 'checking'
  clones_detected: number
}

export default function Domains() {
  const { user, profile, loading } = useAuth()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [addingDomain, setAddingDomain] = useState(false)
  const [error, setError] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [success, setSuccess] = useState('')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  const loadDomains = useCallback(async () => {
    if (!user?.id) {
      setLoadingDomains(false)
      return
    }

    try {
      // Primeiro, buscar os domínios permitidos
      const { data: domainsData, error: domainsError } = await supabase
        .from('allowed_domains')
        .select('id, domain, is_active, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (domainsError) throw domainsError

      // Depois, buscar contagem de clones para cada domínio
      const domainsWithStats = await Promise.all(
        (domainsData || []).map(async (domain) => {
          const { count } = await supabase
            .from('detected_clones')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('original_domain', domain.domain)

          return {
            id: domain.id,
            domain: domain.domain,
            is_active: domain.is_active,
            created_at: domain.created_at,
            last_check: null,
            status: (domain.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'error' | 'checking',
            clones_detected: count || 0
          }
        })
      )

      setDomains(domainsWithStats)
    } catch (error) {
      console.error('Erro ao carregar domínios:', error)
      setError('Erro ao carregar domínios')
    } finally {
      setLoadingDomains(false)
    }
  }, [user?.id])

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  const addDomain = async () => {
    if (!newDomain.trim()) {
      setError('Digite um domínio válido')
      return
    }

    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
    
    if (!validateDomain(cleanDomain)) {
      setError('Formato de domínio inválido. Ex: exemplo.com')
      return
    }

    // Verificar limite do plano
    if (planLimits.domains !== -1 && domains.length >= planLimits.domains) {
      setError(`Limite de ${planLimits.domains} domínios atingido. Faça upgrade do seu plano.`)
      return
    }

    // Verificar se domínio já existe
    if (domains.some(d => d.domain === cleanDomain)) {
      setError('Este domínio já está sendo monitorado')
      return
    }

    setAddingDomain(true)
    setError('')

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .insert({
          user_id: user?.id,
          domain: cleanDomain,
          is_active: true
        })

      if (error) throw error

      setNewDomain('')
      setShowAddModal(false)
      await loadDomains()
    } catch (error) {
      console.error('Erro ao adicionar domínio:', error)
      setError('Erro ao adicionar domínio. Tente novamente.')
    } finally {
      setAddingDomain(false)
    }
  }

  const toggleDomainStatus = async (domainId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId)

      if (error) throw error

      await loadDomains()
    } catch (error) {
      console.error('Erro ao alterar status do domínio:', error)
      setError('Erro ao alterar status do domínio')
    }
  }

  const deleteDomain = async (domainId: string) => {
    if (!confirm('Tem certeza que deseja remover este domínio?')) return

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error

      await loadDomains()
    } catch (error) {
      console.error('Erro ao deletar domínio:', error)
      setError('Erro ao deletar domínio')
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadDomains()
    }
  }, [user?.id, loadDomains])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <Navigation />
      
      {/* Header */}
      <div className="glass border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-gradient mb-2">Domínios</h1>
              <p className="text-gray-300">Gerencie os domínios que você deseja proteger</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-strong rounded-lg px-4 py-2">
                <span className="text-sm text-gray-400">
                  {planLimits.domains === -1 ? 'Ilimitados' : `${domains.length}/${planLimits.domains}`}
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
                disabled={planLimits.domains !== -1 && domains.length >= planLimits.domains}
              >
                <Icons.Plus className="h-5 w-5 mr-2" />
                Adicionar Domínio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Plan Limit Warning */}
        {planLimits.domains !== -1 && domains.length >= planLimits.domains && (
          <div className="mb-6 card border-yellow-500/30 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 rounded-lg p-2 mr-4">
                  <Icons.Warning className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Limite de domínios atingido</h3>
                  <p className="text-gray-400 text-sm">Você atingiu o limite de {planLimits.domains} domínios do plano {profile?.plan_type || 'free'}.</p>
                </div>
              </div>
              <button className="btn-primary">
                Fazer Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Domains List */}
        {loadingDomains ? (
          <div className="text-center py-12">
            <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
            <p className="text-gray-300">Carregando domínios...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-12">
            <div className="card">
              <div className="p-4 bg-gradient-green rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icons.Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum domínio adicionado</h3>
              <p className="text-gray-400 mb-6">
                Adicione seu primeiro domínio para começar a monitorar clones
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Adicionar Primeiro Domínio
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {domains.map((domain, index) => (
              <div key={domain.id} className="card card-hover animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      domain.status === 'active' ? 'bg-gradient-green' :
                      domain.status === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      'bg-gray-600'
                    }`}>
                      <Icons.Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{domain.domain}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          domain.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          domain.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {domain.status === 'active' ? 'Ativo' : 
                           domain.status === 'error' ? 'Erro' : 'Inativo'}
                        </span>
                        <span>{domain.clones_detected} clones detectados</span>
                        <span>Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleDomainStatus(domain.id, domain.is_active)}
                      className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                        domain.is_active 
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {domain.is_active ? 'Pausar' : 'Ativar'}
                    </button>
                    
                    <button
                      onClick={() => deleteDomain(domain.id)}
                      className="text-sm px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Icons.Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Adicionar Domínio</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewDomain('')
                  setError('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <Icons.X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domínio
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="exemplo.com"
                  className="input-primary"
                  onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite apenas o domínio (sem http:// ou www.)
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewDomain('')
                    setError('')
                  }}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={addDomain}
                  disabled={addingDomain}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {addingDomain ? (
                    <>
                      <div className="loading-spinner h-4 w-4 mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
} 