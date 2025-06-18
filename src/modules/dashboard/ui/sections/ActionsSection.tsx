'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Icons } from '@/components/Icons'
import { TriggerService } from '../../infrastructure/services/trigger-service'
import { TriggerParam } from '../../domain/types'

interface ActionsSectionProps {
  user: {
    id: string
    email?: string
  }
}

function SimpleToast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm">
      <div
        className={`rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm ${
          type === 'success'
            ? 'border-green-500 bg-green-500/10 text-green-100'
            : 'border-red-500 bg-red-500/10 text-red-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm">{message}</span>
          <button onClick={onClose} className="ml-2 text-current opacity-70 hover:opacity-100">
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ActionsSection({ user }: ActionsSectionProps) {
  const [triggerParams, setTriggerParams] = useState<TriggerParam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  const triggerService = useMemo(() => new TriggerService(), [])

  const loadTriggerConfig = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const config = await triggerService.getUserTriggerConfig(user.id)
      setTriggerParams(config)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setToast({ message: 'Erro ao carregar configuração de triggers', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [triggerService, user?.id])

  useEffect(() => {
    loadTriggerConfig()
  }, [loadTriggerConfig])

  const handleToggleTrigger = (key: string) => {
    setTriggerParams(prev =>
      prev.map(trigger =>
        trigger.key === key ? { ...trigger, enabled: !trigger.enabled } : trigger
      )
    )
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const result = await triggerService.saveTriggerConfig(user.id, triggerParams)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
      } else {
        setToast({ message: 'Configuração salva com sucesso!', type: 'success' })
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setToast({ message: 'Erro ao salvar configuração', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!user?.id) return

    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSaving(true)
      try {
        const result = await triggerService.resetToDefaults(user.id)
        if (result.error) {
          setToast({ message: result.error, type: 'error' })
        } else {
          await loadTriggerConfig() // Recarregar do banco
          setToast({ message: 'Configuração restaurada para os padrões', type: 'success' })
        }
      } catch (err) {
        console.error('Erro ao restaurar:', err)
        setToast({ message: 'Erro ao restaurar configuração', type: 'error' })
      } finally {
        setSaving(false)
      }
    }
  }

  // Filtrar triggers
  const filteredTriggers = useMemo(() => {
    return triggerParams.filter(trigger => {
      const matchesSearch =
        trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.platform.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPlatform = selectedPlatform === 'all' || trigger.platform === selectedPlatform

      return matchesSearch && matchesPlatform
    })
  }, [triggerParams, searchTerm, selectedPlatform])

  // Obter plataformas únicas
  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(triggerParams.map(t => t.platform))]
    return uniquePlatforms.sort()
  }, [triggerParams])

  const enabledCount = triggerParams.filter(t => t.enabled).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Configuração de Triggers</h2>
            <p className="text-gray-400">
              Configure quais parâmetros de URL devem ativar as ações ({enabledCount} de{' '}
              {triggerParams.length} ativos)
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset} className="btn-ghost text-sm" disabled={saving}>
              <Icons.RotateCcw className="mr-2 h-4 w-4" />
              Restaurar Padrões
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Icons.Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Busca */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar triggers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Filtro por plataforma */}
          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">Todas as plataformas</option>
            {platforms.map(platform => (
              <option key={platform} value={platform} className="bg-gray-800">
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Triggers */}
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {filteredTriggers.map(trigger => (
            <div
              key={trigger.key}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-white/5 ${
                trigger.enabled
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <code className="rounded bg-black/30 px-2 py-1 text-sm text-green-400">
                    {trigger.key}
                  </code>
                  <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                    {trigger.platform}
                  </span>
                  {trigger.enabled && (
                    <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-300">
                      Ativo
                    </span>
                  )}
                </div>
                <h4 className="mt-2 font-medium text-white">{trigger.name}</h4>
                <p className="text-sm text-gray-400">{trigger.description}</p>
              </div>

              <button
                onClick={() => handleToggleTrigger(trigger.key)}
                className={`ml-4 flex h-6 w-11 items-center rounded-full transition-colors ${
                  trigger.enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
                disabled={saving}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    trigger.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}

          {filteredTriggers.length === 0 && (
            <div className="py-12 text-center">
              <Icons.Search className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-400">Nenhum trigger encontrado</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros ou termo de busca</p>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
            <div className="text-sm text-gray-400">Triggers Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{triggerParams.length}</div>
            <div className="text-sm text-gray-400">Total Disponível</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{platforms.length}</div>
            <div className="text-sm text-gray-400">Plataformas</div>
          </div>
        </div>
      </div>

      {toast && (
        <SimpleToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
