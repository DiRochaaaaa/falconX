import { Icons } from '@/components/Icons'

interface ErrorMessageProps {
  error: string
  onRetry: () => void
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="card border-red-500/30 bg-red-500/10 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-red-500/20 p-2">
            <Icons.Warning className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-300">Erro no carregamento</p>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        </div>
        <button onClick={onRetry} className="btn-ghost text-sm hover:bg-red-500/10">
          <Icons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}
