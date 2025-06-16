'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const colorClasses = {
    primary: 'text-green-400',
    white: 'text-white',
    gray: 'text-gray-400'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const spinner = (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {spinner}
      {text && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-main flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// Componente específico para loading de página
export function PageLoading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Componente para skeleton loading
export function SkeletonLoader({ 
  lines = 3, 
  className = '',
  animated = true 
}: { 
  lines?: number
  className?: string
  animated?: boolean
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className={`bg-gray-700 rounded h-4 ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}

// Componente para loading de cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gray-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
} 