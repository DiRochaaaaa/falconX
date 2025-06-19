import { createHash } from 'crypto'

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
