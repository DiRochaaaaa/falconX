'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'

interface ActionConfig {
  id: string
  user_id: string
  action_type: 'redirect' | 'blank_page' | 'custom_message'
  is_active: boolean
  config: {
    redirectUrl?: string
    message?: string
    percentage: number
  }
  created_at: string
  updated_at: string
}

export default function Actions() {
  const { user, loading } = useAuth()
  const [actions, setActions] = useState<ActionConfig[]>([])
  const [loadingActions, setLoadingActions] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAction, setEditingAction] = useState<ActionConfig | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newAction, setNewAction] = useState({
    action_type: 'redirect' as 'redirect' | 'blank_page' | 'custom_message',
    redirectUrl: '',
    message: '',
    percentage: 100,
    is_active: true
  })

  const loadActions = useCallback(async () => {
    if (!user?.id) {
      setLoadingActions(false)
      return
    }

    try {
      // Por enquanto, vamos simular os dados até criarmos a tabela user_actions
      const mockActions: ActionConfig[] = [
        {
          id: '1',
          user_id: user.id,
          action_type: 'redirect',
          is_active: true,
          config: {
            redirectUrl: 'https://google.com',
            percentage: 100
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setActions(mockActions)
    } catch (error) {
      console.error('Erro ao carregar ações:', error)
      setError('Erro ao carregar ações configuradas')
    } finally {
      setLoadingActions(false)
    }
  }, [user?.id])

  const createAction = async () => {
    if (!user?.id) return

    try {
      const actionConfig: ActionConfig = {
        id: Date.now().toString(),
        user_id: user.id,
        action_type: newAction.action_type,
        is_active: newAction.is_active,
        config: {
          ...(newAction.action_type === 'redirect' && { redirectUrl: newAction.redirectUrl }),
          ...(newAction.action_type !== 'redirect' && { message: newAction.message }),
          percentage: newAction.percentage
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setActions(prev => [...prev, actionConfig])
      setShowCreateModal(false)
      setSuccess('Ação criada com sucesso!')
      resetForm()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erro ao criar ação:', error)
      setError('Erro ao criar ação')
    }
  }

  const updateAction = async (actionId: string, updates: Partial<ActionConfig>) => {
    try {
      setActions(prev => prev.map(action => 
        action.id === actionId 
          ? { ...action, ...updates, updated_at: new Date().toISOString() }
          : action
      ))
      
      setSuccess('Ação atualizada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erro ao atualizar ação:', error)
      setError('Erro ao atualizar ação')
    }
  }

  const deleteAction = async (actionId: string) => {
    try {
      setActions(prev => prev.filter(action => action.id !== actionId))
      setSuccess('Ação removida com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erro ao remover ação:', error)
      setError('Erro ao remover ação')
    }
  }

  const resetForm = () => {
    setNewAction({
      action_type: 'redirect',
      redirectUrl: '',
      message: '',
      percentage: 100,
      is_active: true
    })
    setEditingAction(null)
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'redirect': return Icons.Globe
      case 'blank_page': return Icons.X
      case 'custom_message': return Icons.Warning
      default: return Icons.Settings
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'redirect': return 'text-blue-400'
      case 'blank_page': return 'text-red-400'
      case 'custom_message': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'redirect': return 'Redirecionamento'
      case 'blank_page': return 'Página em Branco'
      case 'custom_message': return 'Mensagem Personalizada'
      default: return 'Desconhecido'
    }
  }

  const getActionDescription = (action: ActionConfig) => {
    switch (action.action_type) {
      case 'redirect':
        return `Redireciona para: ${action.config.redirectUrl}`
      case 'blank_page':
        return action.config.message || 'Exibe página em branco'
      case 'custom_message':
        return 'Exibe mensagem personalizada'
      default:
        return 'Ação não configurada'
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadActions()
    }
  }, [user?.id, loadActions])

  if (loading || loadingActions) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <Icons.Spinner className="h-12 w-12 text-green-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <Navigation />
      
      {/* Header */}
      <div className="glass border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-gradient mb-2">Ações de Proteção</h1>
              <p className="text-gray-300">Configure o que acontece quando clones são detectados</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <Icons.Plus className="h-5 w-5 mr-2" />
              Nova Ação
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <Icons.Check className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-300 text-sm">{success}</span>
              <button
                onClick={() => setSuccess('')}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Icons.Globe className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Redirecionamento</h3>
                <p className="text-sm text-gray-400">Redireciona para outro site</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Ideal para redirecionar clones para seu site oficial ou página de aviso.
            </p>
          </div>

          <div className="card animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Icons.X className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Página em Branco</h3>
                <p className="text-sm text-gray-400">Substitui o conteúdo</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Remove todo o conteúdo da página e exibe uma mensagem personalizada.
            </p>
          </div>

          <div className="card animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
                <Icons.Warning className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Mensagem Overlay</h3>
                <p className="text-sm text-gray-400">Sobrepõe uma mensagem</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Exibe uma mensagem em tela cheia sobre o conteúdo existente.
            </p>
          </div>
        </div>

        {/* Actions List */}
        <div className="card animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Ações Configuradas</h2>
            <span className="text-sm text-gray-400">
              {actions.length} {actions.length === 1 ? 'ação' : 'ações'} configurada{actions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {actions.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhuma ação configurada</h3>
              <p className="text-gray-500 mb-6">
                Configure ações para definir o que acontece quando clones são detectados.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Icons.Plus className="h-4 w-4 mr-2" />
                Criar Primeira Ação
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => {
                const ActionIcon = getActionIcon(action.action_type)
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        action.action_type === 'redirect' ? 'bg-blue-500/20' :
                        action.action_type === 'blank_page' ? 'bg-red-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        <ActionIcon className={`h-5 w-5 ${getActionColor(action.action_type)}`} />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-white font-medium">{getActionLabel(action.action_type)}</h3>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            action.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {action.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                            {action.config.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {getActionDescription(action)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateAction(action.id, { is_active: !action.is_active })}
                        className={`p-2 rounded-lg transition-colors ${
                          action.is_active 
                            ? 'text-green-400 hover:bg-green-500/20' 
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        title={action.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {action.is_active ? <Icons.Check className="h-4 w-4" /> : <Icons.X className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingAction(action)
                          setNewAction({
                            action_type: action.action_type,
                            redirectUrl: action.config.redirectUrl || '',
                            message: action.config.message || '',
                            percentage: action.config.percentage,
                            is_active: action.is_active
                          })
                          setShowCreateModal(true)
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Icons.Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover esta ação?')) {
                            deleteAction(action.id)
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Icons.Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* How Actions Work */}
        <div className="card animate-slide-in mt-8" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xl font-semibold text-white mb-6">Como Funcionam as Ações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">1</div>
                <div>
                  <h4 className="text-white font-medium">Detecção Automática</h4>
                  <p className="text-gray-400 text-sm">O script detecta quando está rodando em um clone não autorizado</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">2</div>
                <div>
                  <h4 className="text-white font-medium">Seleção da Ação</h4>
                  <p className="text-gray-400 text-sm">Sistema escolhe uma ação ativa aleatoriamente</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">3</div>
                <div>
                  <h4 className="text-white font-medium">Verificação de Probabilidade</h4>
                  <p className="text-gray-400 text-sm">Ação é executada baseada na porcentagem configurada</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">4</div>
                <div>
                  <h4 className="text-white font-medium">Execução Silenciosa</h4>
                  <p className="text-gray-400 text-sm">Ação é executada de forma imperceptível ao clonador</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">5</div>
                <div>
                  <h4 className="text-white font-medium">Registro da Detecção</h4>
                  <p className="text-gray-400 text-sm">Evento é registrado para análise posterior</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-green rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">6</div>
                <div>
                  <h4 className="text-white font-medium">Monitoramento Contínuo</h4>
                  <p className="text-gray-400 text-sm">Sistema continua monitorando para novas tentativas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Action Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal p-4">
          <div className="card max-w-2xl w-full animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingAction ? 'Editar Ação' : 'Nova Ação'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white"
              >
                <Icons.X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tipo de Ação
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'redirect', label: 'Redirecionamento', icon: Icons.Globe },
                    { value: 'blank_page', label: 'Página em Branco', icon: Icons.X },
                    { value: 'custom_message', label: 'Mensagem Overlay', icon: Icons.Warning }
                  ].map((type) => {
                    const IconComponent = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewAction(prev => ({ ...prev, action_type: type.value as 'redirect' | 'blank_page' | 'custom_message' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          newAction.action_type === type.value
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <IconComponent className={`h-6 w-6 mx-auto mb-2 ${
                          newAction.action_type === type.value 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`} />
                        <p className="text-white text-sm font-medium">{type.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Configuration based on type */}
              {newAction.action_type === 'redirect' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de Redirecionamento
                  </label>
                  <input
                    type="url"
                    value={newAction.redirectUrl}
                    onChange={(e) => setNewAction(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="https://exemplo.com"
                    className="input-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL para onde os visitantes do clone serão redirecionados
                  </p>
                </div>
              )}

              {(newAction.action_type === 'blank_page' || newAction.action_type === 'custom_message') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {newAction.action_type === 'blank_page' ? 'Mensagem da Página' : 'Mensagem Overlay'}
                  </label>
                  <textarea
                    value={newAction.message}
                    onChange={(e) => setNewAction(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={
                      newAction.action_type === 'blank_page' 
                        ? 'Página temporariamente indisponível'
                        : '<div style="text-align:center;padding:50px;"><h1>Site Oficial</h1><p>Acesse nosso site oficial em exemplo.com</p></div>'
                    }
                    rows={4}
                    className="input-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newAction.action_type === 'blank_page' 
                      ? 'Texto que será exibido na página em branco'
                      : 'HTML que será exibido como overlay (pode incluir estilos CSS)'
                    }
                  </p>
                </div>
              )}

              {/* Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Probabilidade de Execução: {newAction.percentage}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={newAction.percentage}
                  onChange={(e) => setNewAction(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>100%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Porcentagem de chance da ação ser executada quando um clone for detectado
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newAction.is_active}
                  onChange={(e) => setNewAction(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-green-500 rounded border-gray-600 bg-gray-700 mr-3"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Ação ativa (será executada quando clones forem detectados)
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (editingAction) {
                      updateAction(editingAction.id, {
                        action_type: newAction.action_type,
                        is_active: newAction.is_active,
                        config: {
                          ...(newAction.action_type === 'redirect' && { redirectUrl: newAction.redirectUrl }),
                          ...(newAction.action_type !== 'redirect' && { message: newAction.message }),
                          percentage: newAction.percentage
                        }
                      })
                      setShowCreateModal(false)
                      resetForm()
                    } else {
                      createAction()
                    }
                  }}
                  className="btn-primary flex-1"
                  disabled={
                    (newAction.action_type === 'redirect' && !newAction.redirectUrl) ||
                    ((newAction.action_type === 'blank_page' || newAction.action_type === 'custom_message') && !newAction.message)
                  }
                >
                  {editingAction ? 'Atualizar' : 'Criar'} Ação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 