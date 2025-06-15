import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exemplo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'exemplo-key'

// Configuração para funcionar SEM confirmação de email
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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