'use client'

import { useState } from 'react'
import { Icons } from '@/components/Icons'
import { useAllowedDomains } from '@/hooks/useDataCache'
import { useAuth } from '@/hooks/useAuth'
import {
  User,
  DashboardUser,
  validateDomain,
  LoadingSkeleton,
  ErrorMessage,
  DomainService,
} from '@/modules/dashboard'

interface DomainsSectionProps {
  user: User | null
  profile: DashboardUser | null
}

export default function DomainsSection({ user, profile }: DomainsSectionProps) {
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')

  const { usage } = useAuth()

  const {
    data: domains,
    loading,
    error: domainsError,
    refresh: refreshDomains,
  } = useAllowedDomains(user?.id || '')

  const domainLimit = usage?.planInfo?.domainLimit ?? 1
  const canAddMore = domainLimit === -1 || (domains?.length || 0) < domainLimit
  const domainService = new DomainService()

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
        `Limite de ${domainLimit === -1 ? 'ilimitados' : domainLimit} domínios atingido para o plano ${profile?.plan?.name ?? 'gratuito'}`
      )
      return
    }

    setIsAdding(true)
    setError('')

    const result = await domainService.addDomain(user.id, newDomain.trim())

    if (result.error) {
      setError(result.error)
    } else {
      setNewDomain('')
      await refreshDomains()
    }

    setIsAdding(false)
  }

  const handleToggleDomain = async (domainId: string, currentStatus: boolean) => {
    if (!user?.id) return

    const result = await domainService.toggleDomain(user.id, domainId, currentStatus)
    if (result.error) {
      setError(result.error)
      return
    }

    await refreshDomains()
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!user?.id) return

    const result = await domainService.deleteDomain(user.id, domainId)
    if (result.error) {
      setError(result.error)
      return
    }

    await refreshDomains()
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header responsivo */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-gradient mb-2 text-xl md:text-2xl font-bold">Domínios Permitidos</h2>
          <p className="text-sm md:text-base text-gray-300">
            Gerencie os domínios que devem ser protegidos contra clonagem
          </p>
        </div>
        <div className="glass-strong rounded-lg px-3 py-2 md:px-4 self-start md:self-auto">
          <span className="text-xs md:text-sm text-gray-400">
            {domains?.length || 0} / {domainLimit === -1 ? '∞' : domainLimit}
          </span>
        </div>
      </div>

      {/* Formulário responsivo para adicionar domínio */}
      <form onSubmit={handleAddDomain} className="glass rounded-xl p-4 md:p-6">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="exemplo.com"
              className="input-primary w-full text-sm md:text-base"
              disabled={isAdding || !canAddMore}
            />
          </div>
          <button 
            type="submit" 
            disabled={isAdding || !canAddMore} 
            className="btn btn-primary px-4 py-2 md:px-6 md:py-3 text-sm md:text-base whitespace-nowrap"
          >
            {isAdding ? (
              <>
                <div className="loading-spinner mr-2 h-3 w-3 md:h-4 md:w-4"></div>
                <span className="hidden sm:inline">Adicionando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Icons.Plus className="mr-1 h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">+</span>
              </>
            )}
          </button>
        </div>

        {/* Mensagens responsivas */}
        {!canAddMore && (
          <p className="mt-3 text-xs md:text-sm text-yellow-400">
            Limite de domínios atingido. Faça upgrade do seu plano para adicionar mais.
          </p>
        )}

        {error && <p className="mt-3 text-xs md:text-sm text-red-400">{error}</p>}
      </form>

      {domainsError && <ErrorMessage error={domainsError} onRetry={refreshDomains} />}

      {/* Lista de domínios responsiva */}
      <div className="glass rounded-xl p-4 md:p-6">
        {loading ? (
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-12 md:h-16" />
            ))}
          </div>
        ) : domains && domains.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {domains.map(
              (domain: { id: string; domain: string; is_active: boolean; created_at: string }) => (
                <div
                  key={domain.id}
                  className="glass-strong flex flex-col space-y-3 rounded-lg p-3 md:flex-row md:items-center md:justify-between md:space-y-0 md:p-4"
                >
                  {/* Informações do domínio */}
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div
                      className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ${domain.is_active ? 'bg-green-500' : 'bg-gray-500'}`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm md:text-base truncate">{domain.domain}</p>
                      <p className="text-xs md:text-sm text-gray-400">
                        Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {/* Status badge mobile */}
                    <div className="md:hidden">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        domain.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {domain.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Ações responsivas */}
                  <div className="flex items-center justify-end space-x-2 md:space-x-2">
                    <button
                      onClick={() => handleToggleDomain(domain.id, domain.is_active)}
                      className={`btn-ghost text-xs md:text-sm px-2 py-1 md:px-3 md:py-2 ${
                        domain.is_active ? 'text-yellow-400' : 'text-green-400'
                      }`}
                    >
                      <Icons.Zap className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                      <span className="hidden md:inline">
                        {domain.is_active ? 'Desativar' : 'Ativar'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="btn-ghost text-xs md:text-sm text-red-400 px-2 py-1 md:px-3 md:py-2"
                    >
                      <Icons.Trash className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                      <span className="hidden md:inline">Excluir</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="py-6 md:py-8 text-center">
            <Icons.Globe className="mx-auto mb-3 md:mb-4 h-12 w-12 md:h-16 md:w-16 text-gray-600" />
            <p className="text-sm md:text-base text-gray-400 mb-1">Nenhum domínio adicionado ainda</p>
            <p className="text-xs md:text-sm text-gray-500">
              Adicione seus domínios para começar a protegê-los
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
