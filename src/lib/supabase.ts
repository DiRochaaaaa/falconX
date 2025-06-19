import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação rigorosa em desenvolvimento
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  throw new Error(`❌ Configuração do Supabase incompleta!

Certifique-se de que as seguintes variáveis estão definidas:
${missingVars.map(v => `- ${v}`).join('\n')}

🔧 COMO RESOLVER:
1. Crie o arquivo .env.local na raiz do projeto
2. Copie o conteúdo de env.example
3. Configure suas credenciais do Supabase
4. Reinicie o servidor (npm run dev)

📁 Estrutura correta:
falconX/
├── .env.local ← Deve estar aqui!
├── env.example
└── src/...`)
}

const finalUrl = supabaseUrl
const finalKey = supabaseAnonKey

// Configuração para funcionar SEM confirmação de email
export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Configurações para desenvolvimento sem email
    flowType: 'implicit',
  },
  global: {
    headers: {
      'x-application-name': 'falconx',
    },
  },
})

// Tipos para o usuário
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan_type: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
  api_key: string
  created_at: string
  updated_at: string
}

// Helper function to get user plan information with usage data
export async function getUserPlanInfo(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_subscriptions!inner(
        plan_id,
        current_clone_count,
        clone_limit,
        extra_clones_used,
        reset_date,
        status,
        started_at,
        expires_at,
        plans!inner(
          id,
          name,
          slug,
          price,
          clone_limit,
          extra_clone_price,
          features
        )
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user plan info:', error)
    return null
  }

  // Flatten the structure for easier access
  const subscription = data.user_subscriptions[0]
  const plan = subscription.plans

  // Verificar se precisa resetar contador (mensal)
  const now = new Date()
  const resetDate = new Date(subscription.reset_date)
  const needsReset = now >= resetDate

  return {
    ...data,
    subscription: {
      plan_id: subscription.plan_id,
      current_clone_count: needsReset ? 0 : subscription.current_clone_count,
      clone_limit: subscription.clone_limit,
      extra_clones_used: needsReset ? 0 : subscription.extra_clones_used,
      reset_date: subscription.reset_date,
      status: subscription.status,
      started_at: subscription.started_at,
      expires_at: subscription.expires_at,
      needs_reset: needsReset,
    },
    plan: {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      clone_limit: plan.clone_limit,
      extra_clone_price: plan.extra_clone_price,
      features: plan.features
    },
    // Dados calculados para facilitar uso no frontend
    usage: {
      currentClones: needsReset ? 0 : subscription.current_clone_count,
      cloneLimit: subscription.clone_limit,
      extraClones: needsReset ? 0 : subscription.extra_clones_used,
      usageProgress: subscription.clone_limit > 0 
        ? Math.min(((needsReset ? 0 : subscription.current_clone_count) / subscription.clone_limit) * 100, 100)
        : 0,
      canDetectMore: plan.slug === 'free' 
        ? (needsReset ? 0 : subscription.current_clone_count) < subscription.clone_limit
        : true, // Planos pagos sempre podem (cobram extras)
      resetDate: subscription.reset_date,
      lastUpdated: new Date().toISOString(),
    }
  }
}
