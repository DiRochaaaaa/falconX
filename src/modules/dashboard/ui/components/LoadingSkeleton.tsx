interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="mb-4 h-6 w-3/4 rounded-lg bg-gray-700/50"></div>
      <div className="mb-3 h-4 w-1/2 rounded bg-gray-700/30"></div>
      <div className="h-4 w-2/3 rounded bg-gray-700/30"></div>
    </div>
  )
}
