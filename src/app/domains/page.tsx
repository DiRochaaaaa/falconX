'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAllowedDomains } from '@/hooks/useDataCache'
import DashboardLayout from '@/components/DashboardLayout'
import { Icons } from '@/components/Icons'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

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
  
  // Usar hook de cache otimizado - só quando user estiver disponível
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
      setError(`Limite de ${planLimits.domains} domínios atingido para o plano ${profile?.plan_type || 'free'}`)
      return
    }

    setIsAdding(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('allowed_domains')
        .insert([
          {
            user_id: user.id,
            domain: newDomain.trim().toLowerCase(),
            is_active: true
          }
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
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Domínios Permitidos</h1>
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
          <form onSubmit={handleAddDomain} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="exemplo.com"
                  className="input-primary w-full"
                  disabled={isAdding || !canAddMore}
                />
              </div>
              <button
                type="submit"
                disabled={isAdding || !canAddMore}
                className="btn btn-primary px-6"
              >
                {isAdding ? (
                  <>
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
            </div>
            
            {!canAddMore && (
              <p className="text-yellow-400 text-sm mt-2">
                Limite de domínios atingido. Faça upgrade do seu plano para adicionar mais.
              </p>
            )}
          </form>

          {/* Mensagens de erro */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {domainsError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">Erro ao carregar domínios: {domainsError}</p>
            </div>
          )}

          {/* Lista de domínios */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando domínios...</p>
              </div>
            ) : domains && domains.length > 0 ? (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="glass-strong rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${domain.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{domain.domain}</h3>
                      <p className="text-gray-400 text-sm">
                        Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                        {!domain.is_active && <span className="ml-2 text-yellow-400">(Inativo)</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleDomain(domain.id, domain.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        domain.is_active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                      title={domain.is_active ? 'Desativar domínio' : 'Ativar domínio'}
                    >
                      {domain.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                      title="Excluir domínio"
                    >
                      <Icons.Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icons.Globe className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum domínio cadastrado</h3>
                <p className="text-gray-400 mb-6">
                  Adicione domínios para começar a protegê-los contra clonagem
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 