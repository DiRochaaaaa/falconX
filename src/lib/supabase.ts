import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'
import { ProfileWithPlan } from '@/lib/types/database'

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
export async function getUserPlanInfo(userId: string): Promise<ProfileWithPlan | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_subscriptions!inner(
          id,
          plan_id,
          status,
          current_clone_count,
          clone_limit,
          extra_clones_used,
          reset_date,
          created_at,
          updated_at,
          needs_reset,
          plans!inner(
            id,
            name,
            slug,
            price,
            clone_limit,
            domain_limit,
            extra_clone_price,
            features,
            is_active
          )
        )
      `)
      .eq('id', userId)
      .eq('user_subscriptions.status', 'active')
      .single()

    if (error) {
      console.error('Erro ao buscar informações do usuário:', error)
      return null
    }

    if (!data || !data.user_subscriptions) {
      console.error('Usuário sem subscription ativa encontrado')
      return null
    }

    const subscription = data.user_subscriptions
    const plan = subscription.plans

    return {
      ...data,
      plan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        clone_limit: plan.clone_limit,
        domain_limit: plan.domain_limit,
        extra_clone_price: plan.extra_clone_price,
        features: plan.features,
        is_active: plan.is_active
      },
      subscription: {
        id: subscription.id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        current_clone_count: subscription.current_clone_count,
        clone_limit: subscription.clone_limit,
        extra_clones_used: subscription.extra_clones_used,
        reset_date: subscription.reset_date,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
        needs_reset: subscription.needs_reset
      }
    }
  } catch (error) {
    console.error('Erro crítico ao buscar informações do usuário:', error)
    return null
  }
}
