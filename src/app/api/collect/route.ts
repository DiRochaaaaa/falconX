import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

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

// Headers de CORS para permitir requisições cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Rate limiting simples em memória
const RATE_LIMIT_MAX_REQUESTS = 100
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minuto
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true }
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

/**
 * POST /api/collect - API genérica para coleta de dados (substitui /api/detect)
 * Parâmetros ofuscados para não revelar a função
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse do body com parâmetros ofuscados
    interface RequestBody {
      uid: string // userId (codificado em Base64)
      dom: string // currentDomain
      url?: string // currentUrl
      ref?: string // referrer
      ua?: string // userAgent
      ts?: string // timestamp
    }

    let body: RequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: corsHeaders })
    }

    const { uid, dom, url, ref, ua } = body

    if (!uid || !dom) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Decodificar userId do Base64
    let userId: string
    try {
      userId = Buffer.from(uid, 'base64').toString('utf-8')
    } catch {
      return NextResponse.json(
        { error: 'Invalid identifier' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Rate limiting baseado em userId + IP
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitIdentifier = `${userId}:${clientIP}`
    const rateLimit = checkRateLimit(rateLimitIdentifier)

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    }

    // Buscar domínios autorizados do usuário no banco
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
      authorizedDomains,
      isAuthorized,
      userId,
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
    logger.warn('Clone detectado', { currentDomain: dom, userId })

    // Tentar inserir na tabela detected_clones
    try {
      // Primeiro, verificar se já existe um clone para este domínio
      const { data: existingClone } = await supabaseAdmin
        .from('detected_clones')
        .select('id, detection_count')
        .eq('user_id', userId)
        .eq('clone_domain', dom)
        .single()

      let cloneId = null

      if (existingClone) {
        // Clone já existe - incrementar contador
        await supabaseAdmin
          .from('detected_clones')
          .update({
            detection_count: existingClone.detection_count + 1,
            last_seen: new Date().toISOString(),
          })
          .eq('id', existingClone.id)

        cloneId = existingClone.id
        logger.info('Clone atualizado', { cloneId, newCount: existingClone.detection_count + 1 })
      } else {
        // Novo clone - inserir (usar primeiro domínio autorizado como original)
        const originalDomain =
          authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

        const { data: newClone, error: insertError } = await supabaseAdmin
          .from('detected_clones')
          .insert({
            user_id: userId,
            original_domain: originalDomain,
            clone_domain: dom,
            detection_count: 1,
            first_detected: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_active: true,
          })
          .select('id')
          .single()

        if (insertError) {
          throw insertError
        }

        cloneId = newClone?.id
      }

      logger.info('Clone registrado com sucesso', { cloneId })

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
        } else {
          logger.info('Log registrado com sucesso')
        }
      }

      const originalDomain =
        authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

      const response = {
        status: 'detected', // Mudança: 'clone_detected' -> 'detected' (mais genérico)
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
      const originalDomain =
        authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

      const response = {
        status: 'detected',
        message: 'Clone detected (database error)',
        originalDomain: originalDomain,
        cloneDomain: dom,
        dbError: dbError instanceof Error ? dbError.message : String(dbError),
        processingTime: Date.now() - startTime,
      }

      return NextResponse.json(response, { headers: corsHeaders })
    }
  } catch (error) {
    logger.error('Erro crítico', error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
