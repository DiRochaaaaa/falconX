'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/Icons'
import { DashboardUser } from '@/modules/dashboard/domain/types'

interface BlockedClonesAlertProps {
  user: DashboardUser | null
  _limits: any
  loading: boolean
}

export default function BlockedClonesAlert({ user, loading }: BlockedClonesAlertProps) {
  const [totalDetected, setTotalDetected] = useState(0)
  const [actuallyUsed, setActuallyUsed] = useState(0)
  const [blockedClones, setBlockedClones] = useState(0)

  useEffect(() => {
    if (!user?.id || loading) return

    async function fetchRealData() {
      try {
        // Buscar dados reais da API
        const response = await fetch(`/api/plan-limits?userId=${user!.id}`)
        const data = await response.json()

        if (data.success) {
          setActuallyUsed(data.usage.currentClones + data.usage.extraClones)
          setBlockedClones(data.usage.blockedClones || 0)
          
          // Buscar total de clones detectados
          const totalResponse = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'get_total_detected',
              userId: user!.id 
            })
          })
          
          if (totalResponse.ok) {
            const totalData = await totalResponse.json()
            setTotalDetected(totalData.total || 0)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados reais:', error)
      }
    }

    fetchRealData()
  }, [user?.id, loading, user])

  // Só mostrar se há diferença entre detectados e contabilizados
  if (loading || !user || totalDetected <= actuallyUsed) {
    return null
  }

  const planName = user.plan?.name || 'Gratuito'
  const planLimit = user.plan?.clone_limit || 1
  const isFreePlan = user.plan?.slug === 'free'

  return (
    <div className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-600/5 backdrop-blur-md">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Icons.Warning className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              🎯 Clones Detectados vs Contabilizados
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{totalDetected}</div>
                  <div className="text-gray-400">Total Detectado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{actuallyUsed}</div>
                  <div className="text-gray-400">Contabilizado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{blockedClones}</div>
                  <div className="text-gray-400">Não Contados</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-amber-500/20">
                <p className="text-sm text-gray-300">
                  <strong className="text-amber-400">Explicação:</strong> {' '}
                  {isFreePlan ? (
                    <>
                      Detectamos <strong>{totalDetected} clones</strong> do seu site, mas seu plano {planName} 
                      permite apenas <strong>{planLimit} clone/mês</strong>. Os {blockedClones} clones extras 
                      foram detectados mas não contaram para seu limite.
                    </>
                  ) : (
                    <>
                      Detectamos <strong>{totalDetected} clones</strong> do seu site. Destes, {actuallyUsed} 
                      contaram para seu plano e {blockedClones} foram detectados como extras.
                    </>
                  )}
                </p>
              </div>

              {isFreePlan && blockedClones > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-400">
                    💡 Upgrade para ver todos os clones detectados
                  </div>
                  <button className="btn-primary btn-sm">
                    Fazer Upgrade
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  )
} 