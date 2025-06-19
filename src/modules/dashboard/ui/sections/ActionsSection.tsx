'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Icons } from '@/components/Icons'
import { TriggerService } from '../../infrastructure/services/trigger-service'
import { ActionService, CreateActionRequest } from '../../infrastructure/services/action-service'
import { TriggerParam, ActionData } from '../../domain/types'

interface ActionsSectionProps {
  user: {
    id: string
    email?: string
  }
}

// Toast Premium Component
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
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="animate-slide-in fixed right-4 top-4 z-50 max-w-sm">
      <div
        className={`glass rounded-xl border-l-4 p-4 shadow-2xl backdrop-blur-lg ${
          type === 'success' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {type === 'success' ? (
              <Icons.CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Icons.AlertCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Apple Toggle Component
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
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
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

// Platform Icon Component
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

// Action Card Component
function ActionCard({
  action,
  onToggle,
  onEdit,
  onDelete,
  disabled = false,
}: {
  action: ActionData
  onToggle: (id: number, isActive: boolean) => void
  onEdit: (action: ActionData) => void
  onDelete: (id: number) => void
  disabled?: boolean
}) {
  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'redirect_traffic':
        return 'Redirecionamento'
      case 'blank_page':
        return 'Página em Branco'
      case 'custom_message':
        return 'Mensagem Customizada'
      default:
        return type
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'redirect_traffic':
        return Icons.ArrowRight
      case 'blank_page':
        return Icons.EyeOff
      case 'custom_message':
        return Icons.MessageSquare
      default:
        return Icons.Zap
    }
  }

  const ActionIcon = getActionTypeIcon(action.action_type)

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        action.is_active ? 'border-green-500/30 bg-green-900/10' : 'border-gray-700 bg-gray-800/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              action.is_active ? 'bg-green-500/20' : 'bg-gray-700/50'
            }`}
          >
            <ActionIcon
              className={`h-5 w-5 ${action.is_active ? 'text-green-400' : 'text-gray-400'}`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">{getActionTypeLabel(action.action_type)}</h4>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  action.is_active
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {action.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            {action.redirect_url && (
              <p className="mt-1 text-sm text-gray-400">{action.redirect_url}</p>
            )}

            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
              <span>Execução: {action.redirect_percentage}%</span>
              <span>{new Date(action.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(action)}
            disabled={disabled}
            className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
          >
            Editar
          </button>

          <button
            onClick={() => onDelete(action.id)}
            disabled={disabled}
            className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            Deletar
          </button>

          <button
            onClick={() => onToggle(action.id, !action.is_active)}
            disabled={disabled}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              action.is_active ? 'bg-green-500' : 'bg-gray-600'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                action.is_active ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

// Action Form Component (Reutilizável para Criar e Editar)
function ActionForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEditing = false,
}: {
  initialData?: ActionData | undefined
  onSubmit: (data: CreateActionRequest) => void
  onCancel: () => void
  loading?: boolean
  isEditing?: boolean
}) {
  const [formData, setFormData] = useState<CreateActionRequest>(() => {
    if (initialData) {
      return {
        action_type: initialData.action_type,
        redirect_url: initialData.redirect_url || '',
        redirect_percentage: initialData.redirect_percentage,
      }
    }
    return {
      action_type: 'redirect_traffic',
      redirect_url: '',
      redirect_percentage: 100,
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Editar Ação' : 'Nova Ação'}
          </h3>
          <p className="text-sm text-gray-400">
            {isEditing ? 'Modifique os dados da ação' : 'Configure uma nova ação de proteção'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Tipo de Ação</label>
            <select
              value={formData.action_type}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  action_type: e.target.value as CreateActionRequest['action_type'],
                  redirect_url: '',
                }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="redirect_traffic">Redirecionamento</option>
              <option value="blank_page">Página em Branco</option>
              <option value="custom_message">Mensagem Customizada</option>
            </select>
          </div>

          {formData.action_type === 'redirect_traffic' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                URL de Redirecionamento
              </label>
              <input
                type="url"
                value={formData.redirect_url}
                onChange={e => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                placeholder="https://exemplo.com"
                required
              />
            </div>
          )}

          {formData.action_type === 'custom_message' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Mensagem Customizada
              </label>
              <input
                type="text"
                value={formData.redirect_url}
                onChange={e => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                placeholder="Site não autorizado. Acesse o site oficial."
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Porcentagem de Execução ({formData.redirect_percentage}%)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.redirect_percentage}
              onChange={e =>
                setFormData(prev => ({ ...prev, redirect_percentage: parseInt(e.target.value) }))
              }
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>1%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600 disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ActionsSection({ user }: ActionsSectionProps) {
  // Estados para triggers
  const [triggerParams, setTriggerParams] = useState<TriggerParam[]>([])
  const [triggerLoading, setTriggerLoading] = useState(true)
  const [triggerSaving, setTriggerSaving] = useState(false)

  // Estados para ações
  const [actions, setActions] = useState<ActionData[]>([])
  const [actionsLoading, setActionsLoading] = useState(true)
  const [actionsSaving, setActionsSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAction, setEditingAction] = useState<ActionData | null>(null)

  // Estados globais
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'actions' | 'triggers'>('actions')

  const triggerService = useMemo(() => new TriggerService(), [])
  const actionService = useMemo(() => new ActionService(), [])

  const loadTriggerConfig = useCallback(async () => {
    if (!user?.id) return

    setTriggerLoading(true)
    try {
      const config = await triggerService.getTriggerConfig(user.id)
      setTriggerParams(config)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setToast({ message: 'Erro ao carregar configuração de triggers', type: 'error' })
    } finally {
      setTriggerLoading(false)
    }
  }, [triggerService, user?.id])

  const loadActions = useCallback(async () => {
    if (!user?.id) return

    setActionsLoading(true)
    try {
      const data = await actionService.loadActions(user.id)
      setActions(data)
    } catch (error) {
      console.error('Erro ao carregar ações:', error)
      setToast({ message: 'Erro ao carregar ações', type: 'error' })
    } finally {
      setActionsLoading(false)
    }
  }, [actionService, user?.id])

  // Carregar dados iniciais
  useEffect(() => {
    loadTriggerConfig()
    loadActions()
  }, [loadTriggerConfig, loadActions])

  const handleToggleTrigger = (name: string) => {
    setTriggerParams(prev =>
      prev.map(trigger =>
        trigger.name === name ? { ...trigger, enabled: !trigger.enabled } : trigger
      )
    )
  }

  const handleSaveTriggers = async () => {
    if (!user?.id) return

    setTriggerSaving(true)
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
      setTriggerSaving(false)
    }
  }

  const handleResetTriggers = async () => {
    if (!user?.id) return

    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setTriggerSaving(true)
      try {
        // Recarrega configuração padrão do servidor
        const config = await triggerService.getTriggerConfig(user.id)
        setTriggerParams(config)
        setToast({ message: 'Configuração resetada!', type: 'success' })
      } catch {
        setToast({ message: 'Erro ao resetar configuração', type: 'error' })
      } finally {
        setTriggerSaving(false)
      }
    }
  }

  const handleCreateAction = async (data: CreateActionRequest) => {
    if (!user?.id) return

    setActionsSaving(true)
    try {
      if (editingAction) {
        // Editar ação existente
        const result = await actionService.updateAction(editingAction.id, data)
        if (result.error) {
          setToast({ message: result.error, type: 'error' })
        } else {
          await loadActions()
          setEditingAction(null)
          setShowCreateForm(false)
          setToast({ message: 'Ação atualizada com sucesso!', type: 'success' })
        }
      } else {
        // Criar nova ação
        const result = await actionService.createAction(user.id, data)
        if (result.error) {
          setToast({ message: result.error, type: 'error' })
        } else {
          await loadActions()
          setShowCreateForm(false)
          setToast({ message: 'Ação criada com sucesso!', type: 'success' })
        }
      }
    } catch {
      setToast({
        message: editingAction ? 'Erro ao atualizar ação' : 'Erro ao criar ação',
        type: 'error',
      })
    } finally {
      setActionsSaving(false)
    }
  }

  const enabledCount = triggerParams.filter(t => t.enabled).length

  if (triggerLoading || actionsLoading) {
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
          {/* Header Principal */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Gerenciar <span className="text-gradient">Ações</span>
                </h1>
                <p className="text-gray-400">
                  Configure ações automáticas para proteger seus domínios contra clones
                </p>
              </div>
            </div>

            {/* Navegação por Abas */}
            <div className="flex space-x-1 rounded-lg bg-gray-800/50 p-1">
              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'actions'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Minhas Ações
              </button>
              <button
                onClick={() => setActiveTab('triggers')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'triggers'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Configurar Triggers
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba Ações */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Header da seção de ações */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">Ações Configuradas</h2>
                  <p className="text-sm text-gray-400">
                    {actions.length} ação{actions.length !== 1 ? 'ões' : ''} configurada
                    {actions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                  disabled={actionsSaving}
                >
                  <Icons.Plus className="h-4 w-4" />
                  Nova Ação
                </button>
              </div>

              {/* Lista de Ações */}
              <div className="space-y-3">
                {actions.length === 0 ? (
                  <div className="rounded-lg border border-gray-700 bg-gray-800/30 py-12 text-center">
                    <div className="mx-auto mb-4 w-fit rounded-full bg-gray-500/10 p-3">
                      <Icons.Zap className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">Nenhuma ação configurada</h3>
                    <p className="mb-4 text-sm text-gray-400">
                      Crie sua primeira ação para proteger seus domínios automaticamente
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn-primary inline-flex items-center gap-2 px-4 py-2"
                    >
                      <Icons.Plus className="h-4 w-4" />
                      Criar Primeira Ação
                    </button>
                  </div>
                ) : (
                  actions.map(action => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onToggle={async (id, isActive) => {
                        setActionsSaving(true)
                        try {
                          const result = await actionService.toggleAction(id, isActive)
                          if (result.error) {
                            setToast({ message: result.error, type: 'error' })
                          } else {
                            await loadActions()
                            setToast({
                              message: `Ação ${isActive ? 'ativada' : 'desativada'} com sucesso!`,
                              type: 'success',
                            })
                          }
                        } catch {
                          setToast({ message: 'Erro ao atualizar ação', type: 'error' })
                        } finally {
                          setActionsSaving(false)
                        }
                      }}
                      onEdit={action => {
                        setEditingAction(action)
                        setShowCreateForm(true)
                      }}
                      onDelete={async id => {
                        if (confirm('Tem certeza que deseja deletar esta ação?')) {
                          setActionsSaving(true)
                          try {
                            const result = await actionService.deleteAction(id)
                            if (result.error) {
                              setToast({ message: result.error, type: 'error' })
                            } else {
                              await loadActions()
                              setToast({ message: 'Ação deletada com sucesso!', type: 'success' })
                            }
                          } catch {
                            setToast({ message: 'Erro ao deletar ação', type: 'error' })
                          } finally {
                            setActionsSaving(false)
                          }
                        }
                      }}
                      disabled={actionsSaving}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Conteúdo da Aba Triggers */}
          {activeTab === 'triggers' && (
            <div className="space-y-6">
              {/* Header da seção de triggers */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">Configuração de Triggers</h2>
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
                      disabled={triggerSaving}
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
                      onClick={handleResetTriggers}
                      className="btn-ghost flex items-center justify-center px-3 py-2 text-sm"
                      disabled={triggerSaving}
                    >
                      <Icons.RotateCcw className="mr-2 h-4 w-4" />
                      Restaurar Padrões
                    </button>
                    <button
                      onClick={handleSaveTriggers}
                      className="btn-primary flex items-center justify-center px-4 py-2 text-sm font-medium"
                      disabled={triggerSaving}
                    >
                      {triggerSaving ? (
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
                    <div className="text-lg font-bold text-green-400 sm:text-xl">
                      {enabledCount}
                    </div>
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
                  <h3 className="text-lg font-semibold text-white">Triggers Disponíveis</h3>
                </div>

                <div className="space-y-2">
                  {triggerParams.map(trigger => (
                    <div
                      key={trigger.name}
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
                          <h4 className="truncate font-semibold text-white">{trigger.label}</h4>
                          <p className="line-clamp-2 text-sm text-gray-400">
                            {trigger.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="rounded bg-black/30 px-2 py-0.5 font-mono text-xs text-green-400">
                              {trigger.name}
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
                            onChange={() => handleToggleTrigger(trigger.name)}
                            disabled={triggerSaving}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {triggerParams.length === 0 && (
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
          )}
        </div>
      </div>

      {/* Formulário de Criação/Edição de Ação */}
      {showCreateForm && (
        <ActionForm
          initialData={editingAction || undefined}
          onSubmit={handleCreateAction}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingAction(null)
          }}
          loading={actionsSaving}
          isEditing={!!editingAction}
        />
      )}

      {/* Toast Premium */}
      {toast && (
        <EnhancedToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
