'use client'

import { Icons } from '@/components/Icons'
import { useState } from 'react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: keyof typeof Icons
  color: 'green' | 'blue' | 'orange' | 'purple'
  action: () => void
  disabled?: boolean
}

export default function QuickActions() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleAction = async (actionId: string, actionFn: () => void) => {
    setIsLoading(actionId)
    try {
      await actionFn()
    } finally {
      setIsLoading(null)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'add-domain',
      title: 'Adicionar Domínio',
      description: 'Proteja um novo domínio contra clonagem',
      icon: 'Globe',
      color: 'green',
      action: () => {
        // Navigate to domains section
        // TODO: Implement navigation to add domain
      },
    },
    {
      id: 'generate-script',
      title: 'Gerar Script',
      description: 'Crie um novo script de proteção',
      icon: 'Code',
      color: 'blue',
      action: () => {
        // Navigate to scripts section
        // TODO: Implement navigation to generate script
      },
    },
    {
      id: 'configure-action',
      title: 'Configurar Ação',
      description: 'Configure ações automáticas para clones',
      icon: 'Lightning',
      color: 'orange',
      action: () => {
        // Navigate to actions section
        // TODO: Implement navigation to configure actions
      },
    },
    {
      id: 'view-analytics',
      title: 'Ver Relatórios',
      description: 'Analise detecções e estatísticas',
      icon: 'Dashboard',
      color: 'purple',
      action: () => {
        // Navigate to analytics
        // TODO: Implement navigation to analytics
      },
    },
  ]

  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/5',
      border: 'border-green-500/20 hover:border-green-400/40',
      icon: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-400',
      hover: 'hover:shadow-green-500/10',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20 hover:border-blue-400/40',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-400',
      hover: 'hover:shadow-blue-500/10',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500/10 to-orange-600/5',
      border: 'border-orange-500/20 hover:border-orange-400/40',
      icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
      text: 'text-orange-400',
      hover: 'hover:shadow-orange-500/10',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20 hover:border-purple-400/40',
      icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-400',
      hover: 'hover:shadow-purple-500/10',
    },
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickActions.map(action => {
        const IconComponent = Icons[action.icon]
        const colors = colorClasses[action.color]
        const loading = isLoading === action.id

        return (
          <button
            key={action.id}
            onClick={() => handleAction(action.id, action.action)}
            disabled={action.disabled || loading}
            className={`group relative overflow-hidden rounded-xl border p-6 text-left backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${colors.bg} ${colors.border} ${colors.hover}`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 ${colors.icon}`}
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <IconComponent className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white group-hover:text-gray-100">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400 group-hover:text-gray-300">
                  {action.description}
                </p>
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            {/* Action indicator */}
            <div
              className={`absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 ${colors.text}`}
            >
              <Icons.Plus className="h-4 w-4" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
