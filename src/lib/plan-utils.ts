// Fonte única da verdade para informações de planos
export interface PlanInfo {
  name: string
  slug: string
  price: number
  cloneLimit: number        // Limite de clones detectáveis por mês
  domainLimit: number       // Limite de domínios monitorados simultaneamente
  extraClonePrice: number   // Preço por clone extra
  features: string[]
}

export const PLAN_CONFIGS: Record<string, PlanInfo> = {
  free: {
    name: 'Gratuito',
    slug: 'free',
    price: 0,
    cloneLimit: 1,           // 1 clone detectável por mês
    domainLimit: 1,          // 1 domínio monitorado
    extraClonePrice: 0,      // Não permite extras
    features: [
      '1 clone detectável por mês',
      '1 domínio monitorado',
      'Detecção básica',
      'Suporte por email'
    ]
  },
  bronze: {
    name: 'Bronze',
    slug: 'bronze',
    price: 39.90,
    cloneLimit: 5,           // 5 clones detectáveis por mês
    domainLimit: 3,          // 3 domínios monitorados
    extraClonePrice: 1.00,   // R$ 1,00 por clone extra
    features: [
      '5 clones detectáveis por mês',
      '3 domínios monitorados',
      'Detecção avançada',
      'Clones extras: R$ 1,00 cada',
      'Suporte prioritário'
    ]
  },
  silver: {
    name: 'Prata',
    slug: 'silver',
    price: 79.90,
    cloneLimit: 10,          // 10 clones detectáveis por mês
    domainLimit: 5,          // 5 domínios monitorados
    extraClonePrice: 1.00,
    features: [
      '10 clones detectáveis por mês',
      '5 domínios monitorados',
      'Detecção em tempo real',
      'Clones extras: R$ 1,00 cada',
      'Relatórios detalhados',
      'Suporte prioritário'
    ]
  },
  gold: {
    name: 'Ouro',
    slug: 'gold',
    price: 149.90,
    cloneLimit: 20,          // 20 clones detectáveis por mês
    domainLimit: 10,         // 10 domínios monitorados
    extraClonePrice: 1.00,
    features: [
      '20 clones detectáveis por mês',
      '10 domínios monitorados',
      'Detecção instantânea',
      'Clones extras: R$ 1,00 cada',
      'API personalizada',
      'Relatórios avançados',
      'Suporte 24/7'
    ]
  },
  diamond: {
    name: 'Diamante',
    slug: 'diamond',
    price: 299.90,
    cloneLimit: 50,          // 50 clones detectáveis por mês
    domainLimit: -1,         // Domínios ilimitados
    extraClonePrice: 1.00,
    features: [
      '50 clones detectáveis por mês',
      'Domínios ilimitados',
      'Detecção instantânea',
      'Clones extras: R$ 1,00 cada',
      'API dedicada',
      'Relatórios personalizados',
      'Suporte dedicado',
      'Consultoria inclusa'
    ]
  }
}

const FREE_PLAN: PlanInfo = {
  name: 'Gratuito',
  slug: 'free',
  price: 0,
  cloneLimit: 1,
  domainLimit: 1,
  extraClonePrice: 0,
  features: [
    '1 clone detectável por mês',
    '1 domínio monitorado',
    'Detecção básica',
    'Suporte por email'
  ]
}

/**
 * Retorna informações completas de um plano específico
 * ESTA É A ÚNICA FONTE DA VERDADE PARA PLANOS
 */
export function getPlanInfo(slug: string): PlanInfo {
  switch (slug) {
    case 'free':
      return FREE_PLAN
    case 'bronze':
      return PLAN_CONFIGS.bronze || FREE_PLAN
    case 'silver':
      return PLAN_CONFIGS.silver || FREE_PLAN
    case 'gold':
      return PLAN_CONFIGS.gold || FREE_PLAN
    case 'diamond':
      return PLAN_CONFIGS.diamond || FREE_PLAN
    default:
      return FREE_PLAN
  }
}

/**
 * Retorna todos os planos disponíveis
 */
export function getAllPlans(): PlanInfo[] {
  return Object.values(PLAN_CONFIGS)
}

/**
 * Calcula se o usuário pode adicionar mais domínios
 */
export function canAddMoreDomains(planSlug: string, currentDomains: number): boolean {
  const planInfo = getPlanInfo(planSlug)
  
  if (planInfo.domainLimit === -1) {
    return true // Ilimitado
  }
  
  return currentDomains < planInfo.domainLimit
}

/**
 * Calcula o progresso de uso de clones (0-100%)
 */
export function calculateUsageProgress(currentClones: number, cloneLimit: number): number {
  if (cloneLimit <= 0) return 0
  return Math.min((currentClones / cloneLimit) * 100, 100)
}

/**
 * Retorna o status de alerta baseado no uso
 */
export function getAlertLevel(progress: number): 'success' | 'warning' | 'danger' {
  if (progress >= 100) return 'danger'
  if (progress >= 80) return 'warning'
  return 'success'
}

/**
 * Calcula economia/gasto com clones extras
 */
export function calculateExtraCost(extraClones: number, extraClonePrice: number): number {
  return extraClones * extraClonePrice
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export function getDaysUntilReset(resetDate: string): number {
  return Math.ceil(
    (new Date(resetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
} 