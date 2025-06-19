import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'
import { ProfileWithPlan } from '@/lib/types/database'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

// Cliente público para uso geral (frontend)
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

// Cliente administrativo para operações que precisam bypassar RLS
// CUIDADO: Este cliente tem acesso total ao banco! Use apenas em servidor.
export const supabaseAdmin = supabaseServiceRoleKey ? createClient<Database>(finalUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'x-application-name': 'falconx-admin',
    },
  },
}) : null

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
    // Debug: getUserPlanInfo iniciando busca
    
    // Usar cliente administrativo se disponível, senão usar cliente normal
    const adminClient = supabaseAdmin || supabase
    
    if (!supabaseAdmin) {
      // Service Role não configurada, usando cliente normal autenticado
    }
    
    // Cliente já definido acima
    
    // Primeira query: buscar o profile básico
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      console.error('❌ getUserPlanInfo: Erro ao buscar profile:', profileError)
      return null
    }
    
    // Profile encontrado com sucesso

    // Segunda query: buscar subscription ativa (LEFT JOIN para não falhar se não existir)
    const { data: subscriptionData, error: subscriptionError } = await adminClient
      .from('user_subscriptions')
      .select(`
        id,
        plan_id,
        status,
        current_clone_count,
        clone_limit,
        extra_clones_used,
        reset_date,
        created_at,
        updated_at,
        plans (
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
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle() // Use maybeSingle para permitir null sem erro

    // Debug subscription query result when needed

    // Se não tem subscription ativa, criar uma padrão (FREE)
    if (!subscriptionData || subscriptionError) {
      console.warn('⚠️ getUserPlanInfo: Criando subscription padrão para usuário:', userId)
      
      const { data: newSubscription, error: createError } = await adminClient
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: 1, // Free plan
          clone_limit: 1,
          status: 'active'
        })
        .select(`
          id,
          plan_id,
          status,
          current_clone_count,
          clone_limit,
          extra_clones_used,
          reset_date,
          created_at,
          updated_at,
          plans (
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
        `)
        .single()

      if (createError || !newSubscription) {
        console.error('❌ getUserPlanInfo: Erro ao criar subscription padrão:', createError)
        // Retornar dados básicos sem subscription
        return {
          ...profileData,
          plan: {
            id: 1,
            name: 'Gratuito',
            slug: 'free',
            price: 0,
            clone_limit: 1,
            domain_limit: 1,
            extra_clone_price: 0,
            features: [],
            is_active: true
          },
          subscription: {
            id: 0,
            plan_id: 1,
            status: 'active',
            current_clone_count: 0,
            clone_limit: 1,
            extra_clones_used: 0,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }

      // Usar a nova subscription criada
      const subscription = newSubscription
      const plan = Array.isArray(subscription.plans) ? subscription.plans[0] : subscription.plans

      return {
        ...profileData,
        plan: {
          id: plan?.id || 1,
          name: plan?.name || 'Gratuito',
          slug: plan?.slug || 'free',
          price: plan?.price || 0,
          clone_limit: plan?.clone_limit || 1,
          domain_limit: plan?.domain_limit || 1,
          extra_clone_price: plan?.extra_clone_price || 0,
          features: plan?.features || [],
          is_active: plan?.is_active || true
        },
        subscription: {
          id: subscription.id,
          plan_id: subscription.plan_id,
          status: subscription.status,
          current_clone_count: subscription.current_clone_count || 0,
          clone_limit: subscription.clone_limit,
          extra_clones_used: subscription.extra_clones_used || 0,
          reset_date: subscription.reset_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: subscription.created_at,
          updated_at: subscription.updated_at
        }
      }
    }

    // Se tem subscription ativa, processar normalmente
    const subscription = subscriptionData
    const plan = Array.isArray(subscription.plans) ? subscription.plans[0] : subscription.plans

    // Debug subscription processing when needed

    // Validar se o plan existe (fallback seguro)
    if (!plan) {
      console.warn('⚠️ getUserPlanInfo: Subscription sem plano associado, corrigindo...')
      
      // Corrigir subscription órfã
      await adminClient
        .from('user_subscriptions')
        .update({ plan_id: 1 }) // Definir como free
        .eq('id', subscription.id)

      return {
        ...profileData,
        plan: {
          id: 1,
          name: 'Gratuito',
          slug: 'free',
          price: 0,
          clone_limit: 1,
          domain_limit: 1,
          extra_clone_price: 0,
          features: [],
          is_active: true
        },
        subscription: {
          id: subscription.id,
          plan_id: 1,
          status: subscription.status,
          current_clone_count: subscription.current_clone_count || 0,
          clone_limit: subscription.clone_limit,
          extra_clones_used: subscription.extra_clones_used || 0,
          reset_date: subscription.reset_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: subscription.created_at,
          updated_at: subscription.updated_at
        }
      }
    }

    // Retorno normal com todos os dados
    const result = {
      ...profileData,
      plan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        clone_limit: plan.clone_limit,
        domain_limit: plan.domain_limit || 1,
        extra_clone_price: plan.extra_clone_price,
        features: plan.features || [],
        is_active: plan.is_active
      },
      subscription: {
        id: subscription.id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        current_clone_count: subscription.current_clone_count || 0,
        clone_limit: subscription.clone_limit,
        extra_clones_used: subscription.extra_clones_used || 0,
        reset_date: subscription.reset_date,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at
      }
    }
    
    // Retornando dados completos para o usuário
    return result
  } catch (error) {
    console.error('💥 getUserPlanInfo: Erro crítico ao buscar informações do usuário:', error)
    
    // Fallback de emergência - retornar dados básicos para não quebrar a aplicação
    try {
      const { data: basicProfile } = await (supabaseAdmin || supabase)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (basicProfile) {
        console.warn('🛡️ getUserPlanInfo: Usando fallback de emergência para', basicProfile.email)
        return {
          ...basicProfile,
          plan: {
            id: 1,
            name: 'Gratuito',
            slug: 'free',
            price: 0,
            clone_limit: 1,
            domain_limit: 1,
            extra_clone_price: 0,
            features: [],
            is_active: true
          },
          subscription: {
            id: 0,
            plan_id: 1,
            status: 'active',
            current_clone_count: 0,
            clone_limit: 1,
            extra_clones_used: 0,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }
    } catch (fallbackError) {
      console.error('💥 getUserPlanInfo: Erro no fallback de emergência:', fallbackError)
    }
    
    return null
  }
}
