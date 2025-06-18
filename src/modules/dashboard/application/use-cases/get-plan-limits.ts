import { PlanLimits } from '../../domain'

export function getPlanLimits(planType?: string): PlanLimits {
  switch (planType) {
    case 'bronze':
      return { domains: 5, price: 29.99 }
    case 'silver':
      return { domains: 15, price: 59.99 }
    case 'gold':
      return { domains: -1, price: 99.99 }
    default:
      return { domains: 1, price: 0 }
  }
}
