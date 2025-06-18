'use client'

import { Icons } from '@/components/Icons'

interface DashboardStats {
  allowedDomains: number
  detectedClones: number
  totalDetections: number
  activeActions: number
}

interface PlanLimits {
  domains: number
  price: number
}

interface StatsCardsProps {
  stats: DashboardStats | null
  loading: boolean
  planLimits: PlanLimits
}

function StatCard({
  icon: Icon,
  title,
  value,
  loading,
  color = 'green',
  subtitle,
  trend,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  title: string
  value: string | number
  loading: boolean
  color?: 'green' | 'orange' | 'red' | 'blue'
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/5',
      border: 'border-green-500/20',
      icon: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-400',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500/10 to-orange-600/5',
      border: 'border-orange-500/20',
      icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
      text: 'text-orange-400',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500/10 to-red-600/5',
      border: 'border-red-500/20',
      icon: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-400',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-400',
    },
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null
    return trend === 'up' ? '↗' : '↘'
  }

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return ''
    return trend === 'up' ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/10 ${colorClasses[color].bg} ${colorClasses[color].border} hover:border-${color}-400/40`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg shadow-lg ${colorClasses[color].icon}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-white">
                  {loading ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-700/50"></span>
                  ) : (
                    value
                  )}
                </p>
                {trend && !loading && (
                  <span className={`text-sm font-medium ${getTrendColor()}`}>{getTrendIcon()}</span>
                )}
              </div>
              {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  )
}

export default function StatsCards({ stats, loading, planLimits }: StatsCardsProps) {
  return (
    <>
      <StatCard
        icon={Icons.Globe}
        title="Domínios Monitorados"
        value={
          loading
            ? '...'
            : `${stats?.allowedDomains || 0}${planLimits.domains > 0 ? `/${planLimits.domains}` : ''}`
        }
        loading={loading}
        color="green"
        subtitle={planLimits.domains > 0 ? `Limite: ${planLimits.domains}` : 'Ilimitado'}
        trend="neutral"
      />

      <StatCard
        icon={Icons.Warning}
        title="Clones Detectados"
        value={loading ? '...' : stats?.detectedClones || 0}
        loading={loading}
        color="red"
        subtitle="Últimos 30 dias"
        trend={stats?.detectedClones && stats.detectedClones > 0 ? 'up' : 'neutral'}
      />

      <StatCard
        icon={Icons.Dashboard}
        title="Total de Detecções"
        value={loading ? '...' : stats?.totalDetections || 0}
        loading={loading}
        color="orange"
        subtitle="Desde o início"
        trend="up"
      />

      <StatCard
        icon={Icons.Lightning}
        title="Ações Ativas"
        value={loading ? '...' : stats?.activeActions || 0}
        loading={loading}
        color="blue"
        subtitle="Configurações ativas"
        trend="neutral"
      />
    </>
  )
}
