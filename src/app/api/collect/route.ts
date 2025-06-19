import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { getPublicCorsHeaders } from '@/lib/security/cors-config'
import { rateLimiter, getRequestIdentifier } from '@/lib/security/rate-limiter'
import { validateOrThrow } from '@/lib/validations/schemas'
import { z } from 'zod'

// Cliente Supabase com service role para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Schema de validação para requests de detecção
const CollectRequestSchema = z.object({
  // Formato novo (ofuscado)
  uid: z.string().optional(),
  dom: z.string().optional(),
  url: z.string().url().optional().or(z.string().max(2048).optional()),
  ref: z.string().max(2048).optional(),
  ua: z.string().max(512).optional(),
  
  // Formato antigo (compatibilidade)
  scriptId: z.string().regex(/^fx_[a-zA-Z0-9]{11}$/).optional(),
  domain: z.string().min(1).max(253).optional(),
  userAgent: z.string().max(512).optional(),
  referrer: z.string().max(2048).optional(),
}).refine(
  (data) => {
    // Deve ter pelo menos um formato válido
    const hasNewFormat = data.uid && data.dom
    const hasOldFormat = data.scriptId && data.domain
    return hasNewFormat || hasOldFormat
  },
  { message: 'Formato de request inválido' }
)

// Headers de CORS para permitir requisições cross-origin
const corsHeaders = getPublicCorsHeaders()

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Rate limiting público mais rigoroso
    const identifier = getRequestIdentifier(request)
    const rateLimit = rateLimiter.checkLimit(identifier, 'public')
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
      
      logger.securityEvent('collect_rate_limited', {
        identifier,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter,
          message: 'Muitas requisições. Tente novamente em alguns segundos.'
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': (rateLimit.remainingRequests || 0).toString(),
          },
        }
      )
    }

    // 2. Validação rigorosa da entrada
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON data' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. Validar schema com Zod
    let validatedData
    try {
      validatedData = validateOrThrow(CollectRequestSchema, body)
    } catch (error) {
      logger.securityEvent('collect_invalid_data', {
        error: error instanceof Error ? error.message : String(error),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        body: JSON.stringify(body).substring(0, 200) // Log limitado
      })
      
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 4. Detectar formato e normalizar parâmetros
    let uid: string, dom: string, url: string | undefined, ref: string | undefined, ua: string | undefined

    if (validatedData.uid && validatedData.dom) {
      // Formato novo (ofuscado)
      uid = validatedData.uid
      dom = validatedData.dom
      url = validatedData.url
      ref = validatedData.ref
      ua = validatedData.ua
    } else if (validatedData.scriptId && validatedData.domain) {
      // Formato antigo (compatibilidade) - usar lookup para pegar UUID real
      const { scriptIdToUserId } = await import('@/lib/script-utils')
      const realUserId = await scriptIdToUserId(validatedData.scriptId)
      
      if (!realUserId) {
        logger.securityEvent('collect_invalid_script_id', {
          scriptId: validatedData.scriptId,
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        })
        
        return NextResponse.json(
          { error: 'Invalid script identifier' },
          { status: 400, headers: corsHeaders }
        )
      }
      
      uid = Buffer.from(realUserId, 'utf-8').toString('base64')
      dom = validatedData.domain
      url = validatedData.url
      ref = validatedData.referrer
      ua = validatedData.userAgent
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 5. Decodificar userId do Base64 com validação
    let userId: string
    try {
      userId = Buffer.from(uid, 'base64').toString('utf-8')
      
      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid UUID format')
      }
    } catch {
      logger.securityEvent('collect_invalid_user_id', {
        uid: uid.substring(0, 20) + '...', // Log parcial por segurança
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      return NextResponse.json(
        { error: 'Invalid identifier' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 6. Buscar domínios autorizados do usuário no banco
    const { data: allowedDomains, error: domainsError } = await supabaseAdmin
      .from('allowed_domains')
      .select('domain')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (domainsError) {
      logger.error('Erro ao buscar domínios autorizados', new Error(domainsError.message))
      // Em caso de erro, assumir que não é autorizado para não comprometer a segurança
    }

    const authorizedDomains = allowedDomains?.map(d => d.domain) || []
    const isAuthorized = authorizedDomains.some(
      domain => dom === domain || dom.endsWith('.' + domain)
    )

    logger.info('Verificação de domínios', {
      currentDomain: dom,
      authorizedDomains: authorizedDomains.length, // Log só a quantidade por segurança
      isAuthorized,
      userId: userId.substring(0, 8) + '...', // Log parcial
    })

    if (isAuthorized) {
      logger.info('Domínio autorizado', { currentDomain: dom })
      return NextResponse.json(
        {
          status: 'authorized',
          message: 'Domain authorized',
          domain: dom,
        },
        { headers: corsHeaders }
      )
    }

    // Domínio não autorizado - é um clone!
    logger.warn('Clone detectado', { currentDomain: dom, userId: userId.substring(0, 8) + '...' })

    // Resto da lógica de detecção de clone permanece igual...
    // [manter código existente para registro de clone]

    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

      // Buscar ou criar registro do clone
      const { data: existingClone, error: findError } = await supabaseAdmin
        .from('detected_clones')
        .select('id, detection_count, unique_visitors_count, slugs_data')
        .eq('user_id', userId)
        .eq('clone_domain', dom)
        .single()

      let cloneId: number | null = null

      if (findError && findError.code !== 'PGRST116') {
        logger.error('Erro ao buscar clone existente', new Error(findError.message))
      }

      if (existingClone) {
        cloneId = existingClone.id

        const newCount = (existingClone.detection_count || 0) + 1
        const newSlugsData = existingClone.slugs_data || []

        const { error: updateError } = await supabaseAdmin
          .from('detected_clones')
          .update({
            detection_count: newCount,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slugs_data: newSlugsData,
          })
          .eq('id', existingClone.id)

        if (updateError) {
          logger.error('Erro ao atualizar clone', new Error(updateError.message))
        } else {
          logger.info('Clone atualizado', { cloneId, newCount })
        }
      } else {
        const originalDomain = authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

        const { data: newClone, error: insertError } = await supabaseAdmin
          .from('detected_clones')
          .insert({
            user_id: userId,
            clone_domain: dom,
            original_domain: originalDomain,
            detection_count: 1,
            first_detected: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_active: true,
            unique_visitors_count: 1,
            slugs_data: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (insertError) {
          logger.error('Erro ao inserir novo clone', new Error(insertError.message))
        } else {
          cloneId = newClone?.id || null
          logger.info('Novo clone registrado', { cloneId, domain: dom })
        }
      }

      // Tentar registrar log se temos clone_id
      if (cloneId) {
        const { error: logError } = await supabaseAdmin.from('detection_logs').insert({
          user_id: userId,
          clone_id: cloneId,
          ip_address: clientIP,
          user_agent: ua || 'unknown',
          referrer: ref || null,
          page_url: url || null,
          timestamp: new Date().toISOString(),
        })

        if (logError) {
          logger.error('Erro ao registrar log', new Error(logError.message))
        }
      }

      const originalDomain = authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

      const response = {
        status: 'detected',
        message: 'Clone detected and registered successfully',
        originalDomain: originalDomain,
        cloneDomain: dom,
        cloneId: cloneId,
        processingTime: Date.now() - startTime,
      }

      return NextResponse.json(response, { headers: corsHeaders })
    } catch (dbError) {
      logger.error(
        'Erro de banco de dados',
        dbError instanceof Error ? dbError : new Error(String(dbError))
      )

      // Retornar sucesso mesmo com erro de banco para não quebrar o script
      const originalDomain = authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

      const response = {
        status: 'detected',
        message: 'Clone detected (database error)',
        originalDomain: originalDomain,
        cloneDomain: dom,
        processingTime: Date.now() - startTime,
      }

      return NextResponse.json(response, { headers: corsHeaders })
    }
  } catch (error) {
    logger.error('Erro crítico em /api/collect', error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString()
        // NÃO vazar detalhes por segurança
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
