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
    <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-red-500/30 transition-colors">
      <div className="flex-shrink-0">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Icons.Warning className="h-5 w-5 text-red-400" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate">
            {detection.domain}
          </p>
          <span className="text-xs text-gray-400">
            {timeAgo(detection.detected_at)}
          </span>
        </div>
        
        <div className="mt-1">
          <p className="text-xs text-gray-400">
            Ação: <span className="text-yellow-400">{detection.action_taken}</span>
          </p>
          {detection.ip_address !== 'N/A' && (
            <p className="text-xs text-gray-500 mt-1">
              IP: {detection.ip_address}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <button className="p-1 text-gray-400 hover:text-white transition-colors">
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
        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg animate-pulse">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 bg-gray-700 rounded-lg"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-4 w-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentDetections({ detections, loading }: RecentDetectionsProps) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Detecções Recentes</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Tempo real</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <LoadingSkeleton />
      ) : detections.length > 0 ? (
        <div className="space-y-3">
          {detections.map((detection) => (
            <DetectionItem key={detection.id} detection={detection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <Icons.Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Tudo Seguro!</h3>
          <p className="text-gray-400 text-sm">
            Nenhuma detecção de clone encontrada recentemente.
          </p>
        </div>
      )}
    </div>
  )
} 