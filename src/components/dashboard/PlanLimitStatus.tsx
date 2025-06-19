'use client'

import { Icons } from '@/components/Icons'
import { PlanUsage } from '@/hooks/usePlanLimits'

interface PlanLimitStatusProps {
  usage: PlanUsage | null
  onUpgrade?: () => void
  className?: string
}

export default function PlanLimitStatus({ usage, onUpgrade, className = '' }: PlanLimitStatusProps) {
  if (!usage) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const { 
    currentClones, 
    cloneLimit, 
    extraClones, 
    usageProgress, 
    alertLevel, 
    planInfo,
    resetDate 
  } = usage

  // Calcular dias até reset
  const daysUntilReset = Math.ceil(
    (new Date(resetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  // Cores baseadas no nível de alerta
  const getProgressColor = () => {
    switch (alertLevel) {
      case 'danger': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getTextColor = () => {
    switch (alertLevel) {
      case 'danger': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      default: return 'text-green-400'
    }
  }

  const getBorderColor = () => {
    switch (alertLevel) {
      case 'danger': return 'border-red-500/20'
      case 'warning': return 'border-yellow-500/20'
      default: return 'border-green-500/20'
    }
  }

  return (
    <div className={`glass rounded-xl p-6 border ${getBorderColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Uso do Plano {planInfo.name}
          </h3>
          <p className="text-sm text-gray-400">
            {currentClones} de {cloneLimit} clones detectados este mês
          </p>
        </div>
        
        {alertLevel === 'danger' && planInfo.name === 'Gratuito' && (
          <button
            onClick={onUpgrade}
            className="btn btn-primary btn-sm"
          >
            <Icons.Crown className="w-4 h-4 mr-1" />
            Upgrade
          </button>
        )}
      </div>

      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className={getTextColor()}>
            {usageProgress.toFixed(1)}% usado
          </span>
          <span className="text-gray-400">
            {daysUntilReset} dias até reset
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(usageProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Informações Extras */}
      {extraClones > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <Icons.Plus className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium">
              {extraClones} clones extras
            </span>
            <span className="text-gray-400 ml-2">
              (R$ {(extraClones * planInfo.extraClonePrice).toFixed(2)})
            </span>
          </div>
        </div>
      )}

      {/* Alertas Contextuais */}
      {alertLevel === 'warning' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center">
                         <Icons.Warning className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-yellow-400 text-sm">
              Você está próximo do limite do seu plano
            </span>
          </div>
        </div>
      )}

      {alertLevel === 'danger' && planInfo.name === 'Gratuito' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icons.Warning className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">
                Limite atingido! Faça upgrade para detectar mais clones.
              </span>
            </div>
          </div>
        </div>
      )}

      {alertLevel === 'danger' && planInfo.name !== 'Gratuito' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center">
                         <Icons.AlertCircle className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-400 text-sm">
              Limite do plano atingido. Clones extras serão cobrados R$ {planInfo.extraClonePrice.toFixed(2)} cada.
            </span>
          </div>
        </div>
      )}

      {alertLevel === 'success' && usageProgress > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center">
            <Icons.CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-green-400 text-sm">
              Você está usando seu plano de forma eficiente!
            </span>
          </div>
        </div>
      )}

      {/* Reset Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Próximo reset:</span>
          <span>{new Date(resetDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  )
} 