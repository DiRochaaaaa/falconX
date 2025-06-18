'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Icons } from '@/components/Icons'
import { TriggerService } from '../../infrastructure/services/trigger-service'
import { TriggerParam, DEFAULT_TRIGGER_PARAMS } from '../../domain/types'

interface TriggerConfigModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSave?: () => void
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
    <div className="fixed right-4 top-4 z-[60] max-w-sm">
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

export function TriggerConfigModal({ isOpen, onClose, userId, onSave }: TriggerConfigModalProps) {
  const [triggerParams, setTriggerParams] = useState<TriggerParam[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const triggerService = useMemo(() => new TriggerService(), [])

  const loadTriggerConfig = useCallback(async () => {
    setLoading(true)
    try {
      const config = await triggerService.getUserTriggerConfig(userId)
      setTriggerParams(config)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setToast({ message: 'Erro ao carregar configuração de triggers', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [triggerService, userId])

  useEffect(() => {
    if (isOpen && userId) {
      loadTriggerConfig()
    }
  }, [isOpen, userId, loadTriggerConfig])

  const handleToggleTrigger = (key: string) => {
    setTriggerParams(prev =>
      prev.map(trigger =>
        trigger.key === key ? { ...trigger, enabled: !trigger.enabled } : trigger
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await triggerService.saveTriggerConfig(userId, triggerParams)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
      } else {
        setToast({ message: 'Configuração salva com sucesso!', type: 'success' })
        onSave?.()
        setTimeout(() => onClose(), 1500)
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setToast({ message: 'Erro ao salvar configuração', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSaving(true)
      try {
        const result = await triggerService.resetToDefaults(userId)
        if (result.error) {
          setToast({ message: result.error, type: 'error' })
        } else {
          setTriggerParams(DEFAULT_TRIGGER_PARAMS)
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

  // Filtrar triggers baseado na busca
  const filteredTriggers = triggerParams.filter(
    trigger =>
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const enabledCount = triggerParams.filter(t => t.enabled).length

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="glass relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Configurar Triggers</h2>
              <p className="text-sm text-gray-400">
                {enabledCount} de {triggerParams.length} triggers ativos
              </p>
            </div>
            <button onClick={onClose} className="btn-ghost p-2" disabled={saving}>
              <Icons.X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="border-b border-white/10 p-4">
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
          </div>

          {/* Content */}
          <div className="max-h-[50vh] overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 p-6">
            <button
              onClick={handleReset}
              className="btn-ghost text-sm"
              disabled={saving || loading}
            >
              <Icons.RotateCcw className="mr-2 h-4 w-4" />
              Restaurar Padrões
            </button>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary" disabled={saving}>
                Cancelar
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving || loading}>
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
        </div>
      </div>

      {toast && (
        <SimpleToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
