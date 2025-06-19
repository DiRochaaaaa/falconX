// Fonte única da verdade para informações de planos
export type PlanType = 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'

export interface PlanInfo {
  // Limitações principais
  cloneLimit: number        // Clones detectáveis por mês
  domainLimit: number       // Domínios que pode proteger (-1 = ilimitado)
  
  // Pricing
  price: number            // Preço mensal em R$
  extraClonePrice: number  // Preço por clone extra
  
  // Features
  features: {
    realTimeDetection: boolean
    customActions: boolean
    advancedAnalytics: boolean
    prioritySupport: boolean
    apiAccess: boolean
  }
  
  // Metadata
  name: string
  description: string
  popular?: boolean
  badge?: string
}

/**
 * Retorna informações completas de um plano específico
 * ESTA É A ÚNICA FONTE DA VERDADE PARA PLANOS
 */
export function getPlanInfo(planSlug: PlanType): PlanInfo {
  switch (planSlug) {
    case 'free':
      return {
        cloneLimit: 1,
        domainLimit: 3, // Máximo 3 domínios no gratuito
        price: 0,
        extraClonePrice: 0, // Não pode comprar extras
        features: {
          realTimeDetection: true,
          customActions: false,
          advancedAnalytics: false,
          prioritySupport: false,
          apiAccess: false,
        },
        name: 'Gratuito',
        description: 'Ideal para testar o sistema',
      }

    case 'bronze':
      return {
        cloneLimit: 5,
        domainLimit: 10,
        price: 39.90,
        extraClonePrice: 1.00,
        features: {
          realTimeDetection: true,
          customActions: true,
          advancedAnalytics: false,
          prioritySupport: false,
          apiAccess: false,
        },
        name: 'Bronze',
        description: 'Perfeito para pequenos negócios',
      }

    case 'silver':
      return {
        cloneLimit: 10,
        domainLimit: 25,
        price: 79.90,
        extraClonePrice: 1.00,
        features: {
          realTimeDetection: true,
          customActions: true,
          advancedAnalytics: true,
          prioritySupport: false,
          apiAccess: false,
        },
        name: 'Prata',
        description: 'Para quem está crescendo',
        popular: true,
      }

    case 'gold':
      return {
        cloneLimit: 20,
        domainLimit: -1, // Ilimitado
        price: 149.90,
        extraClonePrice: 1.00,
        features: {
          realTimeDetection: true,
          customActions: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
        },
        name: 'Ouro',
        description: 'Para negócios estabelecidos',
      }

    case 'diamond':
      return {
        cloneLimit: 50,
        domainLimit: -1, // Ilimitado
        price: 299.90,
        extraClonePrice: 1.00,
        features: {
          realTimeDetection: true,
          customActions: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
        },
        name: 'Diamante',
        description: 'Para grandes empresas',
        badge: 'Mais Popular',
      }

    default:
      // Fallback seguro
      return getPlanInfo('free')
  }
}

/**
 * Retorna todos os planos disponíveis
 */
export function getAllPlans(): Array<PlanInfo & { slug: PlanType }> {
  const planSlugs: PlanType[] = ['free', 'bronze', 'silver', 'gold', 'diamond']
  
  return planSlugs.map(slug => ({
    slug,
    ...getPlanInfo(slug)
  }))
}

/**
 * Calcula se o usuário pode adicionar mais domínios
 */
export function canAddMoreDomains(planSlug: PlanType, currentDomains: number): boolean {
  const planInfo = getPlanInfo(planSlug)
  
  if (planInfo.domainLimit === -1) {
    return true // Ilimitado
  }
  
  return currentDomains < planInfo.domainLimit
}

/**
 * Calcula o progresso de uso de clones (0-100%)
 */
export function getCloneUsageProgress(currentClones: number, planSlug: PlanType): number {
  const planInfo = getPlanInfo(planSlug)
  
  if (planInfo.cloneLimit === 0) {
    return 0
  }
  
  const progress = (currentClones / planInfo.cloneLimit) * 100
  return Math.min(progress, 100) // Máximo 100%
}

/**
 * Retorna o status de alerta baseado no uso
 */
export function getUsageAlertLevel(currentClones: number, planSlug: PlanType): 'success' | 'warning' | 'danger' {
  const progress = getCloneUsageProgress(currentClones, planSlug)
  
  if (progress >= 100) return 'danger'
  if (progress >= 80) return 'warning'
  return 'success'
}

/**
 * Calcula economia/gasto com clones extras
 */
export function calculateExtraCost(extraClones: number, planSlug: PlanType): number {
  const planInfo = getPlanInfo(planSlug)
  return extraClones * planInfo.extraClonePrice
} 