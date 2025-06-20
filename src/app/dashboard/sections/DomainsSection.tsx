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
            {domains?.length || 0} / {domainLimit === -1 ? '∞' : domainLimit}
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
