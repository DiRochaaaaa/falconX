import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

// Cliente Supabase com privilégios de admin para operações de backend
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Gera script ID único baseado no userId
 * @param userId - ID do usuário
 * @returns Script ID no formato fx_abc123def456
 */
export function generateScriptId(userId: string): string {
  const SECRET_KEY = process.env.SCRIPT_SECRET_KEY || 'falconx-secret-2025'
  const hash = createHash('sha256')
    .update(userId + SECRET_KEY)
    .digest('hex')
  return `fx_${hash.substring(0, 12)}`
}

/**
 * Valida se o scriptId corresponde a um userId válido
 * @param scriptId - Script ID a ser validado
 * @param userId - User ID para comparação
 * @returns true se o scriptId é válido para o userId
 */
export function validateScriptId(scriptId: string, userId: string): boolean {
  return generateScriptId(userId) === scriptId
}

/**
 * Valida formato do Script ID
 * @param scriptId - Script ID a ser validado
 * @returns true se o formato está correto
 */
export function isValidScriptIdFormat(scriptId: string): boolean {
  return !!(scriptId && scriptId.startsWith('fx_') && scriptId.length === 15)
}

/**
 * Converte scriptId para UUID real via lookup no banco
 * @param scriptId - Script ID a ser convertido
 * @returns UUID real do usuário ou null se não encontrado
 */
export async function scriptIdToUserId(scriptId: string): Promise<string | null> {
  try {
    // 1. Primeiro, tentar lookup na tabela generated_scripts
    const { data: scriptData, error: scriptError } = await supabaseAdmin
      .from('generated_scripts')
      .select('user_id')
      .eq('script_id', scriptId)
      .eq('is_active', true)
      .single()

    if (scriptData && !scriptError) {
      return scriptData.user_id
    }

    // 2. Fallback: tentar como hash reverso (compatibilidade)
    // Buscar por todos os usuários e verificar qual hash corresponde
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id')

    if (profiles && !profilesError) {
      for (const profile of profiles) {
        if (generateScriptId(profile.id) === scriptId) {
          return profile.id
        }
      }
    }

    return null
  } catch (error) {
    console.error('Erro no scriptIdToUserId:', error)
    return null
  }
}
