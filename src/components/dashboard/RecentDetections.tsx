'use client'

import { Icons } from '@/components/Icons'

interface Detection {
  id: string
  domain: string
  detected_at: string
  action_taken: string
  user_agent: string
  ip_address: string
}

interface RecentDetectionsProps {
  detections: Detection[]
  loading: boolean
}

function DetectionItem({ detection }: { detection: Detection }) {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
  }

  return (
    <div className="flex items-center space-x-4 rounded-lg border border-gray-700/50 bg-gray-800/30 p-4 transition-colors hover:border-red-500/30">
      <div className="flex-shrink-0">
        <div className="rounded-lg bg-red-500/20 p-2">
          <Icons.Warning className="h-5 w-5 text-red-400" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-white">{detection.domain}</p>
          <span className="text-xs text-gray-400">{timeAgo(detection.detected_at)}</span>
        </div>

        <div className="mt-1">
          <p className="text-xs text-gray-400">
            Ação: <span className="text-yellow-400">{detection.action_taken}</span>
          </p>
          {detection.ip_address !== 'N/A' && (
            <p className="mt-1 text-xs text-gray-500">IP: {detection.ip_address}</p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <button className="p-1 text-gray-400 transition-colors hover:text-white">
          <Icons.Lightning className="h-4 w-4" />
        </button>
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
    <div className="card animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Detecções Recentes</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <span className="text-xs text-gray-400">Atualização inteligente</span>
          </div>
          <div className="text-xs text-gray-500">(2min + eventos)</div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : detections.length > 0 ? (
        <div className="space-y-3">
          {detections.map(detection => (
            <DetectionItem key={detection.id} detection={detection} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Icons.Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">Tudo Seguro!</h3>
          <p className="text-sm text-gray-400">
            Nenhuma detecção de clone encontrada recentemente.
          </p>
        </div>
      )}
    </div>
  )
}
