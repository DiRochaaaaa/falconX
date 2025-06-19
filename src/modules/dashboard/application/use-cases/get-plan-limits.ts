import { PlanLimits } from '../../domain'
import { supabase } from '@/lib/supabase'

// DEPRECATED: Use getPlanFromDatabase() instead
export function getPlanLimits(planType?: string): PlanLimits {
  switch (planType) {
    case 'bronze':
      return { domains: 5, price: 39.90 }
    case 'silver':
      return { domains: 10, price: 79.90 }
    case 'gold':
      return { domains: 20, price: 149.90 }
    case 'diamond':
      return { domains: 50, price: 299.90 }
    default:
      return { domains: 1, price: 0 }
  }
}

// Nova função que busca dados reais da tabela plans
export async function getPlanFromDatabase(planSlug: string) {
  const { data: plan, error } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .single()

  if (error || !plan) {
    console.error('Erro ao buscar plano:', error)
    return null
  }

  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    price: parseFloat(plan.price),
    domains: plan.clone_limit, // compatibilidade
    clone_limit: plan.clone_limit,
    extra_clone_price: parseFloat(plan.extra_clone_price),
    features: plan.features
  }
}
