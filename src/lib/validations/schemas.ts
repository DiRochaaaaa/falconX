import { z } from 'zod'

/**
 * Schema de validação para domínios
 * Valida formato de domínio e garante que não seja vazio
 */
export const DomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domínio é obrigatório')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      'Formato de domínio inválido'
    )
    .transform(val => val.toLowerCase().trim()),
  is_active: z.boolean().default(true),
})

/**
 * Schema de validação para perfil de usuário
 */
export const UserProfileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido'),
  plan_type: z.enum(['free', 'bronze', 'silver', 'gold']).default('free'),
})

/**
 * Schema de validação para detecção de clone
 */
export const CloneDetectionSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  currentDomain: z.string().min(1, 'Domínio atual é obrigatório'),
  currentUrl: z.string().url('URL inválida'),
  referrer: z.string().optional(),
  userAgent: z.string().min(1, 'User Agent é obrigatório'),
  timestamp: z.string().datetime('Timestamp inválido'),
})

/**
 * Schema de validação para configuração de ações
 */
export const ActionConfigSchema = z.object({
  type: z.enum(['redirect', 'blank_page', 'custom_message']),
  config: z.record(z.unknown()),
  is_active: z.boolean().default(true),
})

/**
 * Schema de validação para login
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

/**
 * Schema de validação para registro
 */
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type DomainInput = z.infer<typeof DomainSchema>
export type UserProfileInput = z.infer<typeof UserProfileSchema>
export type CloneDetectionInput = z.infer<typeof CloneDetectionSchema>
export type ActionConfigInput = z.infer<typeof ActionConfigSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>

/**
 * Função utilitária para validação com erro explícito
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errorMessages = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ')

    throw new Error(`Validation failed: ${errorMessages}`)
  }

  return result.data
}
