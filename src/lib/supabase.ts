import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida no .env.local')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida no .env.local')
}

// Usar valores fallback apenas para build (não funcionais)
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

// Configuração para funcionar SEM confirmação de email
export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Configurações para desenvolvimento sem email
    flowType: 'implicit',
  },
  db: {
    schema: 'falconx'
  },
  global: {
    headers: {
      'x-application-name': 'falconx'
    }
  }
})

// Tipos para o usuário
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan_type: 'free' | 'bronze' | 'silver' | 'gold'
  api_key: string
  created_at: string
  updated_at: string
} 