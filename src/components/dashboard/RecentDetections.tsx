'use client'

import { Icons } from '@/components/Icons'

interface Detection {
  id: string
  domain: string
  detected_at: string
  action_taken: string
  user_agent: string
  ip_address: string
  slug_used?: string
  visitor_count?: number
  unique_visitors?: number
  referrer_url?: string | null
  session_duration?: number
}

interface RecentDetectionsProps {
  detections: Detection[]
  loading: boolean
}

function DetectionItem({ detection }: { detection: Detection }) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    return `${diffInDays}d atrás`
  }

  const getSlugInfo = (detection: Detection) => {
    return detection.slug_used || '/'
  }

  const getVisitorCount = (detection: Detection) => {
    return detection.visitor_count || 0
  }

  const getUniqueVisitors = (detection: Detection) => {
    return detection.unique_visitors || 0
  }

  const getRiskLevel = (detection: Detection) => {
    const uniqueVisitors = getUniqueVisitors(detection)

    if (uniqueVisitors === 0) {
      return {
        label: 'Baixo',
        color: 'bg-green-500',
        textColor: 'text-green-400',
        percentage: 25,
      }
    } else if (uniqueVisitors < 10) {
      return {
        label: 'Médio',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        percentage: 50,
      }
    } else if (uniqueVisitors < 50) {
      return {
        label: 'Alto',
        color: 'bg-gradient-to-r from-yellow-500 to-red-500',
        textColor: 'text-orange-400',
        percentage: 75,
      }
    } else {
      return {
        label: 'Crítico',
        color: 'bg-red-500',
        textColor: 'text-red-400',
        percentage: 100,
      }
    }
  }

  return (
    <div className="group rounded-lg border border-gray-700/50 bg-gray-800/30 p-3 transition-all duration-200 hover:border-red-500/30 hover:bg-gray-800/50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="rounded-lg bg-red-500/20 p-1.5">
            <Icons.Warning className="h-4 w-4 text-red-400" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Header com domínio, tempo e badge CLONE */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="truncate text-sm font-medium text-white">{detection.domain}</p>
              <div className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                <span className="text-xs font-medium text-red-400">CLONE</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">{timeAgo(detection.detected_at)}</span>
          </div>

          {/* Informações de acesso e risco */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              {(getVisitorCount(detection) > 0 || getUniqueVisitors(detection) > 0) && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Icons.User className="h-3 w-3 text-blue-400" />
                    <span className="font-semibold text-blue-300">
                      {getUniqueVisitors(detection).toLocaleString()}
                    </span>
                    <span className="text-gray-500">únicos</span>
                  </div>
                  <span className="text-gray-600">|</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-green-300">
                      {getVisitorCount(detection).toLocaleString()}
                    </span>
                    <span className="text-gray-500">total</span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">Página:</span>
                <code className="font-mono text-xs text-blue-300">{getSlugInfo(detection)}</code>
              </div>
            </div>

            {/* Nível de risco compacto */}
            <div className="flex items-center space-x-2">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-700">
                <div
                  className={`h-full rounded-full ${getRiskLevel(detection).color}`}
                  style={{ width: `${getRiskLevel(detection).percentage}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getRiskLevel(detection).textColor}`}>
                {getRiskLevel(detection).label}
              </span>
            </div>
          </div>

          {/* Alerta para alto volume baseado em visitantes únicos */}
          {getUniqueVisitors(detection) > 10 && (
            <div className="mt-2 flex items-center space-x-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs font-medium text-red-400">
                Alto impacto - {getUniqueVisitors(detection)} visitantes únicos
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center space-x-4 rounded-lg bg-gray-800/30 p-4"
        >
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gray-700"></div>
          </div>
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-700"></div>
            <div className="h-3 w-1/2 rounded bg-gray-700"></div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-4 w-4 rounded bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentDetections({ detections, loading }: RecentDetectionsProps) {
  return (
    <>
      {loading ? (
        <div className="card">
          <LoadingSkeleton />
        </div>
      ) : detections.length > 0 ? (
        <div className="space-y-4">
          {detections.map(detection => (
            <DetectionItem key={detection.id} detection={detection} />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="py-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Icons.Check className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">Tudo Seguro!</h3>
            <p className="text-sm text-gray-400">
              Nenhuma detecção de clone encontrada recentemente.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
