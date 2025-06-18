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

// Toast melhorado com animações
function EnhancedToast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="animate-slide-in fixed right-4 top-4 z-50 max-w-sm">
      <div
        className={`glass rounded-xl border-l-4 p-4 shadow-2xl backdrop-blur-lg ${
          type === 'success'
            ? 'border-green-500 bg-green-500/10 text-green-100'
            : 'border-red-500 bg-red-500/10 text-red-100'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {type === 'success' ? (
              <Icons.CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Icons.AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 opacity-70 transition-all hover:bg-white/10 hover:opacity-100"
            aria-label="Fechar notificação"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toggle Switch Premium
// Toggle Switch Estilo Apple
function AppleToggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? 'bg-green-500' : 'bg-gray-700'
      }`}
      role="switch"
      aria-checked={enabled}
      style={{
        background: enabled
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
        style={{
          boxShadow: enabled
            ? '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      />
    </button>
  )
}

// Adicionar o novo componente para o ícone da plataforma
const PlatformIcon = ({
  platform,
  className = 'h-5 w-5',
}: {
  platform: string
  className?: string
}) => {
  const normalizedPlatform = platform.toLowerCase()
  let IconComponent

  if (normalizedPlatform.includes('facebook')) {
    IconComponent = Icons.Facebook
  } else if (normalizedPlatform.includes('google')) {
    IconComponent = Icons.Google
  } else if (normalizedPlatform.includes('tiktok')) {
    IconComponent = Icons.TikTok
  } else if (normalizedPlatform.includes('taboola')) {
    IconComponent = Icons.Taboola
  } else {
    IconComponent = Icons.Generic
  }

  return <IconComponent className={className} />
}

export function ActionsSection({ user }: ActionsSectionProps) {
  const [triggerParams, setTriggerParams] = useState<TriggerParam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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
          await loadTriggerConfig()
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

  // Usar todos os triggers sem filtro
  const filteredTriggers = triggerParams

  const enabledCount = triggerParams.filter(t => t.enabled).length

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10"></div>
            <div className="h-5 w-96 animate-pulse rounded-lg bg-white/5"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-white/10"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Compacto */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Configuração de <span className="text-gradient">Triggers</span>
                </h1>
                <p className="text-gray-400">
                  Configure quais parâmetros de URL devem ativar as ações de proteção
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">
                    <span className="font-semibold text-green-400">{enabledCount}</span> de{' '}
                    <span className="font-semibold text-white">{triggerParams.length}</span>{' '}
                    triggers ativos
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={() => {
                    const allEnabled = triggerParams.every(t => t.enabled)
                    setTriggerParams(prev =>
                      prev.map(trigger => ({ ...trigger, enabled: !allEnabled }))
                    )
                  }}
                  className="btn-secondary flex items-center justify-center px-3 py-2 text-sm"
                  disabled={saving}
                >
                  {triggerParams.every(t => t.enabled) ? (
                    <>
                      <Icons.Square className="mr-2 h-4 w-4" />
                      Desmarcar Todos
                    </>
                  ) : (
                    <>
                      <Icons.CheckSquare className="mr-2 h-4 w-4" />
                      Selecionar Todos
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="btn-ghost flex items-center justify-center px-3 py-2 text-sm"
                  disabled={saving}
                >
                  <Icons.RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar Padrões
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center justify-center px-4 py-2 text-sm font-medium"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="mr-2 h-4 w-4" />
                      Salvar Configuração
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Ultra Compactos - Uma linha sempre */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 p-2 text-center backdrop-blur-sm">
                <div className="text-lg font-bold text-green-400 sm:text-xl">{enabledCount}</div>
                <div className="text-xs text-gray-400">Ativos</div>
              </div>
              <div className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 p-2 text-center backdrop-blur-sm">
                <div className="text-lg font-bold text-blue-400 sm:text-xl">
                  {triggerParams.length}
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 p-2 text-center backdrop-blur-sm">
                <div className="text-lg font-bold text-purple-400 sm:text-xl">
                  {[...new Set(triggerParams.map(t => t.platform))].length}
                </div>
                <div className="text-xs text-gray-400">Plataformas</div>
              </div>
            </div>
          </div>

          {/* Lista de Triggers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Triggers Disponíveis
                {filteredTriggers.length !== triggerParams.length && (
                  <span className="ml-2 rounded-full bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
                    {filteredTriggers.length}
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-2">
              {filteredTriggers.map(trigger => (
                <div
                  key={trigger.key}
                  className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                    trigger.enabled
                      ? 'border-green-500/30 bg-green-900/10 shadow-sm shadow-green-500/10'
                      : 'border-gray-700 bg-gray-800/30'
                  }`}
                >
                  {/* Indicador lateral para cards ativos */}
                  {trigger.enabled && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-green-500"></div>
                  )}

                  <div className="flex items-center gap-4 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${trigger.enabled ? 'bg-green-500/10' : 'bg-gray-700/50'}`}
                    >
                      <PlatformIcon
                        platform={trigger.platform}
                        className={`h-5 w-5 ${trigger.enabled ? 'text-green-400' : 'text-gray-400'}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-white">{trigger.name}</h4>
                      <p className="line-clamp-2 text-sm text-gray-400">{trigger.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="rounded bg-black/30 px-2 py-0.5 font-mono text-xs text-green-400">
                          {trigger.key}
                        </code>
                        {trigger.enabled && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                            Ativo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden text-sm font-medium text-gray-300 sm:block">
                        {trigger.enabled ? 'Ativo' : 'Inativo'}
                      </span>
                      <AppleToggle
                        enabled={trigger.enabled}
                        onChange={() => handleToggleTrigger(trigger.key)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredTriggers.length === 0 && (
                <div className="rounded-lg border border-gray-700 bg-gray-800/30 py-12 text-center">
                  <div className="mx-auto mb-4 w-fit rounded-full bg-gray-500/10 p-3">
                    <Icons.Search className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">Nenhum trigger encontrado</h3>
                  <p className="text-sm text-gray-400">
                    Verifique sua configuração ou recarregue a página
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Premium */}
      {toast && (
        <EnhancedToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
