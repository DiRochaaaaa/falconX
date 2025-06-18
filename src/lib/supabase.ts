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
  plan_type: 'free' | 'bronze' | 'silver' | 'gold'
  api_key: string
  created_at: string
  updated_at: string
}
