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

// Toast Apple-style com verde
function AppleToast({
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div
        className={`backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border ${
          type === 'success' 
            ? 'bg-falcon-50/90 border-falcon-200/50 text-falcon-800' 
            : 'bg-red-50/90 border-red-200/50 text-red-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-falcon-500 flex items-center justify-center">
              <Icons.CheckCircle className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <Icons.AlertCircle className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Apple Toggle Switch com verde
function AppleSwitch({
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
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-falcon-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? 'bg-falcon-500' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// Ícone de Plataforma
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

// Card de Ação Apple-style com verde
function AppleActionCard({
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
    <div className="card card-hover animate-scale-in">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              action.is_active ? 'bg-falcon-500/20' : 'bg-gray-500/20'
            }`}>
              <ActionIcon className={`h-6 w-6 ${
                action.is_active ? 'text-falcon-400' : 'text-gray-400'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {getActionTypeLabel(action.action_type)}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  action.is_active 
                    ? 'bg-falcon-100/20 text-falcon-300 border border-falcon-500/30'
                    : 'bg-gray-100/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {action.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              
              {action.redirect_url && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2 break-all">
                  {action.redirect_url}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Icons.Percent className="h-3 w-3" />
                  <span>Execução: {action.redirect_percentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Calendar className="h-3 w-3" />
                  <span>{new Date(action.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <AppleSwitch
            enabled={action.is_active}
            onChange={() => onToggle(action.id, !action.is_active)}
            disabled={disabled}
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-t border-white/10 bg-white/[0.02] px-6 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(action)}
            disabled={disabled}
            className="btn-secondary flex-1 h-10 text-sm"
          >
            <Icons.Edit className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(action.id)}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-2xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Icons.Trash className="h-4 w-4" />
            Deletar
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal Apple-style com verde
function AppleActionModal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Editar Ação' : 'Nova Ação'}
            </h2>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <Icons.X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            {isEditing ? 'Modifique os dados da ação' : 'Configure uma nova ação de proteção'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Tipo de Ação */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Tipo de Ação</label>
            <div className="space-y-2">
              {[
                { value: 'redirect_traffic', label: 'Redirecionamento', icon: Icons.ArrowRight },
                { value: 'blank_page', label: 'Página em Branco', icon: Icons.EyeOff },
                { value: 'custom_message', label: 'Mensagem Customizada', icon: Icons.MessageSquare },
              ].map((option) => {
                const IconComponent = option.icon
                const isSelected = formData.action_type === option.value
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-falcon-500/50 bg-falcon-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="action_type"
                      value={option.value}
                      checked={isSelected}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          action_type: e.target.value as CreateActionRequest['action_type'],
                          redirect_url: '',
                        }))
                      }
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isSelected ? 'bg-falcon-500/20' : 'bg-gray-500/20'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        isSelected ? 'text-falcon-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className="font-medium text-white">{option.label}</span>
                    {isSelected && (
                      <Icons.CheckCircle className="h-5 w-5 text-falcon-400 ml-auto" />
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Campo condicional */}
          {formData.action_type === 'redirect_traffic' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                URL de Redirecionamento
              </label>
              <input
                type="url"
                value={formData.redirect_url}
                onChange={e => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                className="input-apple"
                placeholder="https://exemplo.com"
                required
              />
            </div>
          )}

          {formData.action_type === 'custom_message' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Mensagem Customizada
              </label>
              <textarea
                value={formData.redirect_url}
                onChange={e => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                rows={3}
                className="input-apple resize-none"
                placeholder="Site não autorizado. Acesse o site oficial."
                required
              />
            </div>
          )}

          {/* Porcentagem */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">
                Porcentagem de Execução
              </label>
              <span className="text-sm font-medium text-falcon-400">
                {formData.redirect_percentage}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="100"
                value={formData.redirect_percentage}
                onChange={e =>
                  setFormData(prev => ({ ...prev, redirect_percentage: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${formData.redirect_percentage}%, #374151 ${formData.redirect_percentage}%, #374151 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>1% - Mínimo</span>
              <span>100% - Sempre</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost flex-1 h-12"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Icons.Save className="h-4 w-4" />
                  {isEditing ? 'Salvar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente principal
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
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-white/10 rounded-2xl" />
          <div className="h-6 w-96 bg-white/5 rounded-xl" />
        </div>

        {/* Tabs Skeleton */}
        <div className="h-16 bg-white/10 rounded-2xl animate-pulse" />

        {/* Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Gerenciar <span className="text-gradient">Ações</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Configure ações automáticas para proteger seus domínios contra clones
          </p>
        </div>

        {/* Tabs Apple-style com verde */}
        <div className="glass rounded-3xl p-2 border border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-2xl font-medium transition-all ${
                activeTab === 'actions'
                  ? 'bg-falcon-500 text-white shadow-lg shadow-falcon-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icons.Zap className="h-5 w-5" />
              <span>Ações</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeTab === 'actions' ? 'bg-white/20' : 'bg-gray-500/20'
              }`}>
                {actions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('triggers')}
              className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-2xl font-medium transition-all ${
                activeTab === 'triggers'
                  ? 'bg-falcon-500 text-white shadow-lg shadow-falcon-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icons.Settings className="h-5 w-5" />
              <span>Triggers</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeTab === 'triggers' ? 'bg-white/20' : 'bg-gray-500/20'
              }`}>
                {enabledCount}
              </span>
            </button>
          </div>
        </div>

        {/* Conteúdo da Aba Ações */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Header da seção */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Ações Configuradas</h2>
                <p className="text-gray-400">
                  {actions.length} ação{actions.length !== 1 ? 'ões' : ''} configurada{actions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
                disabled={actionsSaving}
              >
                <Icons.Plus className="h-5 w-5" />
                Nova Ação
              </button>
            </div>

            {/* Lista de Ações */}
            {actions.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-falcon-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icons.Zap className="h-8 w-8 text-falcon-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Nenhuma ação configurada</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Crie sua primeira ação para proteger seus domínios automaticamente quando clones forem detectados
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  <Icons.Plus className="h-5 w-5" />
                  Criar Primeira Ação
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {actions.map(action => (
                  <AppleActionCard
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Aba Triggers */}
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-falcon-400 mb-1">{enabledCount}</div>
                <div className="text-sm text-gray-400">Ativos</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-falcon-400 mb-1">{triggerParams.length}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-falcon-400 mb-1">
                  {[...new Set(triggerParams.map(t => t.platform))].length}
                </div>
                <div className="text-sm text-gray-400">Plataformas</div>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Configuração de Triggers</h2>
                <p className="text-gray-400">
                  Configure quais parâmetros de URL devem ativar as ações de proteção
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    const allEnabled = triggerParams.every(t => t.enabled)
                    setTriggerParams(prev =>
                      prev.map(trigger => ({ ...trigger, enabled: !allEnabled }))
                    )
                  }}
                  className="btn-ghost"
                  disabled={triggerSaving}
                >
                  {triggerParams.every(t => t.enabled) ? (
                    <>
                      <Icons.Square className="h-4 w-4" />
                      Desmarcar Todos
                    </>
                  ) : (
                    <>
                      <Icons.CheckSquare className="h-4 w-4" />
                      Selecionar Todos
                    </>
                  )}
                </button>
                <button
                  onClick={handleResetTriggers}
                  className="btn-ghost"
                  disabled={triggerSaving}
                >
                  <Icons.RotateCcw className="h-4 w-4" />
                  Restaurar
                </button>
                <button
                  onClick={handleSaveTriggers}
                  className="btn-primary"
                  disabled={triggerSaving}
                >
                  {triggerSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="h-4 w-4" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista de Triggers */}
            <div className="space-y-3">
              {triggerParams.map(trigger => (
                <div
                  key={trigger.name}
                  className={`card transition-all ${
                    trigger.enabled
                      ? 'border-falcon-500/50 bg-falcon-500/5'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 p-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      trigger.enabled ? 'bg-falcon-500/20' : 'bg-gray-500/20'
                    }`}>
                      <PlatformIcon
                        platform={trigger.platform}
                        className={`h-6 w-6 ${trigger.enabled ? 'text-falcon-400' : 'text-gray-400'}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-lg mb-1">{trigger.label}</h4>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {trigger.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <code className="bg-black/30 px-2 py-1 rounded-lg font-mono text-xs text-falcon-400">
                          {trigger.name}
                        </code>
                        {trigger.enabled && (
                          <span className="bg-falcon-500/20 text-falcon-300 px-2 py-1 rounded-full text-xs font-medium border border-falcon-500/30">
                            Ativo
                          </span>
                        )}
                      </div>
                    </div>

                    <AppleSwitch
                      enabled={trigger.enabled}
                      onChange={() => handleToggleTrigger(trigger.name)}
                      disabled={triggerSaving}
                    />
                  </div>
                </div>
              ))}

              {triggerParams.length === 0 && (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icons.Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Nenhum trigger encontrado</h3>
                  <p className="text-gray-400">
                    Verifique sua configuração ou recarregue a página
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreateForm && (
        <AppleActionModal
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

      {/* Toast */}
      {toast && (
        <AppleToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
