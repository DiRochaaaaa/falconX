'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/Icons'

interface QuickAction {
  title: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  href: string
  color: 'green' | 'blue' | 'orange' | 'purple'
  disabled?: boolean
}

export default function QuickActions() {
  const router = useRouter()
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const quickActions: QuickAction[] = [
    {
      title: 'Adicionar Domínio',
      description: 'Proteger um novo domínio',
      icon: Icons.Plus,
      href: '/domains',
      color: 'green',
    },
    {
      title: 'Gerar Script',
      description: 'Criar novo script de proteção',
      icon: Icons.Code,
      href: '/scripts',
      color: 'blue',
    },
    {
      title: 'Ver Relatórios',
      description: 'Analisar detecções e estatísticas',
      icon: Icons.Dashboard,
      href: '/reports',
      color: 'orange',
      disabled: true,
    },
    {
      title: 'Configurar Ações',
      description: 'Automatizar respostas a clones',
      icon: Icons.Lightning,
      href: '/actions',
      color: 'purple',
    },
  ]

  const colorClasses = {
    green: {
      bg: 'bg-green-500/20 group-hover:bg-green-500/30',
      border: 'border-green-500/30 group-hover:border-green-500/50',
      icon: 'text-green-400',
      text: 'text-green-400',
    },
    blue: {
      bg: 'bg-blue-500/20 group-hover:bg-blue-500/30',
      border: 'border-blue-500/30 group-hover:border-blue-500/50',
      icon: 'text-blue-400',
      text: 'text-blue-400',
    },
    orange: {
      bg: 'bg-orange-500/20 group-hover:bg-orange-500/30',
      border: 'border-orange-500/30 group-hover:border-orange-500/50',
      icon: 'text-orange-400',
      text: 'text-orange-400',
    },
    purple: {
      bg: 'bg-purple-500/20 group-hover:bg-purple-500/30',
      border: 'border-purple-500/30 group-hover:border-purple-500/50',
      icon: 'text-purple-400',
      text: 'text-purple-400',
    },
  }

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return
    router.push(action.href)
  }

  return (
    <div className="card animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Ações Rápidas</h2>
        <Icons.Lightning className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(action => {
          const colors = colorClasses[action.color]
          const isHovered = hoveredAction === action.title

          return (
            <button
              key={action.title}
              onClick={() => handleActionClick(action)}
              onMouseEnter={() => setHoveredAction(action.title)}
              onMouseLeave={() => setHoveredAction(null)}
              disabled={action.disabled}
              className={`
                group relative rounded-lg border p-4 transition-all duration-200
                ${colors.bg} ${colors.border}
                ${
                  action.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:scale-105'
                }
                ${isHovered ? 'shadow-lg' : ''}
              `}
            >
              {action.disabled && (
                <div className="absolute right-2 top-2">
                  <span className="rounded bg-gray-600 px-2 py-1 text-xs text-gray-300">
                    Em breve
                  </span>
                </div>
              )}

              <div className="text-center">
                <div
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${colors.icon}`}
                >
                  <action.icon className="h-6 w-6" />
                </div>

                <h3
                  className={`mb-1 font-medium ${action.disabled ? 'text-gray-400' : 'text-white'}`}
                >
                  {action.title}
                </h3>

                <p className={`text-sm ${action.disabled ? 'text-gray-500' : 'text-gray-400'}`}>
                  {action.description}
                </p>
              </div>

              {!action.disabled && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
