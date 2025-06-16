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
  subtitle 
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  title: string
  value: string | number
  loading: boolean
  color?: 'green' | 'orange' | 'red' | 'blue'
  subtitle?: string
}) {
  const colorClasses = {
    green: 'bg-gradient-green',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600'
  }

  return (
    <div className="card card-hover animate-fade-in">
      <div className="flex items-center">
        <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatsCards({ stats, loading, planLimits }: StatsCardsProps) {
  return (
    <>
      <StatCard
        icon={Icons.Globe}
        title="Domínios Monitorados"
        value={loading ? '...' : `${stats?.allowedDomains || 0}${planLimits.domains > 0 ? `/${planLimits.domains}` : ''}`}
        loading={loading}
        color="green"
      />
      
      <StatCard
        icon={Icons.Warning}
        title="Clones Detectados"
        value={loading ? '...' : stats?.detectedClones || 0}
        loading={loading}
        color="red"
      />
      
      <StatCard
        icon={Icons.Dashboard}
        title="Total de Detecções"
        value={loading ? '...' : stats?.totalDetections || 0}
        loading={loading}
        color="orange"
      />
      
      <StatCard
        icon={Icons.Lightning}
        title="Ações Ativas"
        value={loading ? '...' : stats?.activeActions || 0}
        loading={loading}
        color="blue"
      />
    </>
  )
} 