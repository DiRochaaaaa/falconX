'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Icons } from '@/components/Icons'
import { ActionData, User } from '../../domain'
import { ActionService, TriggerService, CreateActionRequest } from '../../infrastructure'
import { LoadingSkeleton, TriggerConfigModal } from '../'

interface ActionsSectionProps {
  user: User
}

export function ActionsSection({ user }: ActionsSectionProps) {
  const [actions, setActions] = useState<ActionData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTriggerConfig, setShowTriggerConfig] = useState(false)
  const [activeTriggers, setActiveTriggers] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<CreateActionRequest>({
    action_type: 'redirect_traffic',
    redirect_url: '',
    redirect_percentage: 100,
  })

  const actionService = useMemo(() => new ActionService(), [])
  const triggerService = useMemo(() => new TriggerService(), [])

  const loadActions = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const data = await actionService.loadActions(user.id)
      setActions(data)
    } finally {
      setLoading(false)
    }
  }, [user?.id, actionService])

  const loadActiveTriggers = useCallback(async () => {
    if (!user?.id) return

    try {
      const triggers = await triggerService.getActiveTriggers(user.id)
      setActiveTriggers(triggers)
    } catch (error) {
      console.error('Erro ao carregar triggers ativos:', error)
    }
  }, [user?.id, triggerService])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    const result = await actionService.createAction(user.id, formData)

    if (result.error) {
      console.error('Erro ao criar ação:', result.error)
      return
    }

    setShowForm(false)
    setFormData({
      action_type: 'redirect_traffic',
      redirect_url: '',
      redirect_percentage: 100,
    })
    loadActions()
  }

  const toggleAction = async (actionId: number, isActive: boolean) => {
    const result = await actionService.toggleAction(actionId, isActive)
    if (result.error) {
      console.error('Erro ao atualizar ação:', result.error)
      return
    }
    loadActions()
  }

  const deleteAction = async (actionId: number) => {
    const result = await actionService.deleteAction(actionId)
    if (result.error) {
      console.error('Erro ao deletar ação:', result.error)
      return
    }
    loadActions()
  }

  useEffect(() => {
    loadActions()
    loadActiveTriggers()
  }, [loadActions, loadActiveTriggers])

  const activeTriggerCount = Object.values(activeTriggers).filter(Boolean).length
  const activeTriggerKeys = Object.keys(activeTriggers).filter(key => activeTriggers[key])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ações Automáticas</h2>
          <p className="text-gray-400">
            Configure ações que serão executadas quando clones forem detectados
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTriggerConfig(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Icons.Settings className="h-4 w-4" />
            Configurar Triggers ({activeTriggerCount})
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Icons.Plus className="h-4 w-4" />
            Nova Ação
          </button>
        </div>
      </div>

      {/* Card de informações sobre triggers */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-500/20 p-3">
            <Icons.Lightning className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Triggers Ativos</h3>
            <p className="text-sm text-gray-400">
              Parâmetros que ativarão as ações quando detectados em URLs de clones
            </p>
            {activeTriggerKeys.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeTriggerKeys.map(key => (
                  <code key={key} className="rounded bg-black/30 px-2 py-1 text-sm text-green-400">
                    {key}
                  </code>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-yellow-400">
                ⚠️ Nenhum trigger configurado - ações sempre serão executadas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de ações */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Icons.Lightning className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-xl font-semibold text-white">Nenhuma Ação Configurada</h3>
            <p className="mb-6 text-gray-400">
              Configure suas primeiras ações automáticas para proteger seus funnels
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Icons.Plus className="mr-2 h-4 w-4" />
              Criar Primeira Ação
            </button>
          </div>
        ) : (
          actions.map(action => (
            <div key={action.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        action.action_type === 'redirect_traffic'
                          ? 'bg-blue-500/20 text-blue-400'
                          : action.action_type === 'blank_page'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      <Icons.Lightning className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {action.action_type === 'redirect_traffic'
                          ? 'Redirecionamento'
                          : action.action_type === 'blank_page'
                            ? 'Página em Branco'
                            : 'Mensagem Personalizada'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Probabilidade: {action.redirect_percentage}%</span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            action.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {action.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {action.redirect_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400">URL de destino:</p>
                      <code className="text-sm text-green-400">{action.redirect_url}</code>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-sm text-gray-400">Triggers configurados:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(action.trigger_params || {})
                        .filter(([_, enabled]) => enabled)
                        .map(([key]) => (
                          <code
                            key={key}
                            className="rounded bg-black/30 px-2 py-1 text-xs text-green-400"
                          >
                            {key}
                          </code>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAction(action.id, !action.is_active)}
                    className={`btn-ghost text-sm ${
                      action.is_active ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {action.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => deleteAction(action.id)}
                    className="btn-ghost text-sm text-red-400"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de nova ação */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Nova Ação</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost text-sm"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Tipo de Ação
                  </label>
                  <select
                    value={formData.action_type}
                    onChange={e => {
                      const value = e.target.value as CreateActionRequest['action_type']
                      setFormData({ ...formData, action_type: value })
                    }}
                    className="input-primary w-full"
                  >
                    <option value="redirect_traffic">Redirecionamento</option>
                    <option value="blank_page">Página em Branco</option>
                    <option value="custom_message">Mensagem Custom</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Probabilidade de Execução (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.redirect_percentage}
                    onChange={e =>
                      setFormData({ ...formData, redirect_percentage: Number(e.target.value) })
                    }
                    className="input-primary w-full"
                  />
                </div>

                {formData.action_type === 'redirect_traffic' && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      URL de Redirecionamento
                    </label>
                    <input
                      type="url"
                      value={formData.redirect_url}
                      onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                      className="input-primary w-full"
                      placeholder="https://seusite.com"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <h4 className="font-medium text-blue-400">Triggers</h4>
                <p className="text-sm text-gray-400">
                  Esta ação usará os triggers configurados globalmente ({activeTriggerCount}{' '}
                  ativos).
                </p>
                <button
                  type="button"
                  onClick={() => setShowTriggerConfig(true)}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  Configurar triggers →
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de configuração de triggers */}
      <TriggerConfigModal
        isOpen={showTriggerConfig}
        onClose={() => setShowTriggerConfig(false)}
        userId={user.id}
        onSave={loadActiveTriggers}
      />
    </div>
  )
}
