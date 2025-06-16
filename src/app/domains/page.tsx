'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAllowedDomains } from '@/hooks/useDataCache'
import { useState } from 'react'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Icons } from '@/components/Icons'
import { supabase } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Domain {
  id: string
  domain: string
  created_at: string
  is_active: boolean
}

export default function Domains() {
  const { user, profile } = useAuth()
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  
  // Usar hook de cache otimizado
  const { 
    data: domains, 
    loading, 
    error: domainsError, 
    refresh: refreshDomains 
  } = useAllowedDomains(user?.id || '')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
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
    if (!user?.id || !newDomain.trim()) return

    setError('')
    setIsAdding(true)

    try {
      const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
      
      if (!validateDomain(cleanDomain)) {
        setError('Por favor, insira um domínio válido (ex: exemplo.com)')
        return
      }

      if (!canAddMore) {
        setError(`Limite de ${planLimits.domains} domínios atingido para o plano ${profile?.plan_type || 'free'}`)
        return
      }

      // Verificar se domínio já existe
      const existingDomain = domains?.find(d => d.domain === cleanDomain)
      if (existingDomain) {
        setError('Este domínio já está sendo monitorado')
        return
      }

      const { error: insertError } = await supabase
        .from('allowed_domains')
        .insert([
          {
            user_id: user.id,
            domain: cleanDomain,
            is_active: true
          }
        ])

      if (insertError) {
        console.error('Erro ao adicionar domínio:', insertError)
        setError('Erro ao adicionar domínio. Tente novamente.')
        return
      }

      setNewDomain('')
      await refreshDomains() // Atualizar cache
    } catch (error) {
      console.error('Erro ao adicionar domínio:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleDomain = async (domainId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Erro ao atualizar domínio:', error)
        setError('Erro ao atualizar status do domínio')
        return
      }

      await refreshDomains() // Atualizar cache
    } catch (error) {
      console.error('Erro ao atualizar domínio:', error)
      setError('Erro inesperado ao atualizar domínio')
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Tem certeza que deseja remover este domínio?')) return

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Erro ao deletar domínio:', error)
        setError('Erro ao remover domínio')
        return
      }

      await refreshDomains() // Atualizar cache
    } catch (error) {
      console.error('Erro ao deletar domínio:', error)
      setError('Erro inesperado ao remover domínio')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-main">
        <Navigation />
        
        {/* Header */}
        <div className="glass border-b border-green-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in">
                <h1 className="text-4xl font-bold text-gradient mb-2">Domínios Protegidos</h1>
                <p className="text-gray-300">
                  Gerencie os domínios que você deseja proteger contra clones
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="glass-strong rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-400">
                    {domains?.length || 0}
                    {planLimits.domains > 0 && `/${planLimits.domains}`} domínios
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Messages */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {domainsError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-300 text-sm">Erro ao carregar domínios: {domainsError}</span>
                </div>
                <button
                  onClick={refreshDomains}
                  className="text-red-400 hover:text-red-300"
                >
                  <Icons.Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add Domain Form */}
          <div className="card mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">Adicionar Novo Domínio</h2>
            
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                  Domínio
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="exemplo.com"
                    className="input flex-1"
                    disabled={isAdding || !canAddMore}
                  />
                  <button
                    type="submit"
                    disabled={isAdding || !canAddMore || !newDomain.trim()}
                    className="btn btn-primary min-w-[120px]"
                  >
                    {isAdding ? (
                      <div className="flex items-center">
                        <Icons.Spinner className="animate-spin h-4 w-4 mr-2" />
                        Adicionando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Icons.Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </div>
                    )}
                  </button>
                </div>
                
                {!canAddMore && (
                  <p className="text-yellow-400 text-sm mt-2">
                    Limite de domínios atingido. Faça upgrade do seu plano para adicionar mais domínios.
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Domains List */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Seus Domínios</h2>
              {domains && domains.length > 0 && (
                <button
                  onClick={refreshDomains}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icons.Settings className="h-4 w-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-700 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-12 bg-gray-700 rounded"></div>
                      <div className="h-8 w-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : domains && domains.length > 0 ? (
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-green-500/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${domain.is_active ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                        <Icons.Globe className={`h-6 w-6 ${domain.is_active ? 'text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{domain.domain}</h3>
                        <p className="text-sm text-gray-400">
                          Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleDomain(domain.id, domain.is_active)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          domain.is_active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {domain.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Icons.Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/20 rounded-full mb-4">
                  <Icons.Globe className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Nenhum domínio adicionado</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Adicione seu primeiro domínio para começar a protegê-lo contra clones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 