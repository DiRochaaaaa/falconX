'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Icons } from '@/components/Icons'
import { User, ActionData } from '../../domain'
import { ActionService, CreateActionRequest } from '../../infrastructure'
import { getActionIcon, getActionName } from '../../application'

interface ActionsSectionProps {
  user: User | null
}

export function ActionsSection({ user }: ActionsSectionProps) {
  const [actions, setActions] = useState<ActionData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CreateActionRequest>({
    action_type: 'redirect_traffic',
    redirect_url: '',
    redirect_percentage: 100,
    trigger_params: { fbclid: true, gclid: false, utm_source: false },
  })

  const actionService = useMemo(() => new ActionService(), [])

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
      trigger_params: { fbclid: true, gclid: false, utm_source: false },
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
  }, [loadActions])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gradient mb-2 text-2xl font-bold">Ações Configuradas</h2>
          <p className="text-gray-300">
            Configure as ações a serem executadas quando clones forem detectados
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Icons.Plus className="mr-2 h-4 w-4" />
          Nova Ação
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-xl p-6">
          <div className="py-8 text-center">
            <div className="loading-spinner mx-auto mb-4 h-8 w-8"></div>
            <p className="text-gray-400">Carregando ações...</p>
          </div>
        </div>
      ) : actions.length === 0 ? (
        <div className="glass rounded-xl p-6">
          <div className="py-8 text-center">
            <Icons.Lightning className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold text-white">Nenhuma Ação Configurada</h3>
            <p className="mb-6 text-gray-400">
              Configure ações para serem executadas quando clones forem detectados
            </p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Criar Primeira Ação
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map(action => {
            const IconComponent = getActionIcon(action.action_type)
            return (
              <div key={action.id} className="glass rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {getActionName(action.action_type)}
                      </h3>
                      {action.redirect_url && (
                        <p className="text-sm text-gray-400">→ {action.redirect_url}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {action.redirect_percentage}% dos visitantes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAction(action.id, action.is_active)}
                      className={`btn-ghost text-sm ${
                        action.is_active ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {action.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => deleteAction(action.id)}
                      className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Icons.Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-xl p-6">
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
                <label className="mb-2 block text-sm font-medium text-gray-300">Tipo de Ação</label>
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

              {formData.action_type === 'redirect_traffic' && (
                <div>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Porcentagem de Ação ({formData.redirect_percentage}%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.redirect_percentage}
                  onChange={e =>
                    setFormData({ ...formData, redirect_percentage: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Criar Ação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
