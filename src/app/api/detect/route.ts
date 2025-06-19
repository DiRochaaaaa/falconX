import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { checkCloneLimits, incrementCloneCount } from '@/modules/dashboard/application/use-cases/check-clone-limits'

// Rate limiting simples em memória
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10 // máximo 10 requisições por minuto por IP/userId

function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Primeira requisição ou janela expirou
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime }
  }

  // Incrementar contador
  entry.count++
  return { allowed: true }
}

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
    // Parse do body
    interface RequestBody {
      userId: string
      currentDomain: string
      currentUrl?: string
      referrer?: string
      userAgent?: string
      action?: string
    }

    let body: RequestBody
    try {
      body = await request.json()
      logger.info('API de detecção chamada', { body })
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400, headers: corsHeaders })
    }

    const { userId, currentDomain, currentUrl, referrer, userAgent, action } = body

    // NOVA AÇÃO: Buscar total de clones detectados
    if (action === 'get_total_detected') {
      try {
        if (!userId) {
          return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
        }

        const { count, error: countError } = await supabaseAdmin
          .from('detected_clones')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (countError) {
          console.error('Erro ao contar clones:', countError)
          return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          total: count || 0 
        })
      } catch (error) {
        console.error('Erro na ação get_total_detected:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
      }
    }

    if (!userId || !currentDomain) {
      return NextResponse.json(
        { error: 'userId e currentDomain são obrigatórios' },
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
        {
          error: 'Rate limit exceeded',
          retryAfter,
          message: 'Muitas requisições. Tente novamente em alguns segundos.',
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime!).toISOString(),
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
      domain => currentDomain === domain || currentDomain.endsWith('.' + domain)
    )

    logger.info('Verificação de domínios', {
      currentDomain,
      authorizedDomains,
      isAuthorized,
      userId,
    })

    if (isAuthorized) {
      logger.info('Domínio autorizado', { currentDomain })
      return NextResponse.json(
        {
          status: 'authorized',
          message: 'Domínio autorizado',
          domain: currentDomain,
        },
        { headers: corsHeaders }
      )
    }

    // Domínio não autorizado - é um clone!
    logger.warn('Clone detectado', { currentDomain, userId })

    // Tentar inserir na tabela detected_clones
    try {
      // Primeiro, verificar se já existe um clone para este domínio
      const { data: existingClone } = await supabaseAdmin
        .from('detected_clones')
        .select('id, detection_count')
        .eq('user_id', userId)
        .eq('clone_domain', currentDomain)
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
        // Novo clone - verificar limites mas SEMPRE salvar
        const limitStatus = await checkCloneLimits(userId)
        const withinLimit = limitStatus.canDetectClone
        
        // SEMPRE salvar o clone no banco (para mostrar pressão no upgrade)
        const originalDomain =
          authorizedDomains.length > 0 ? authorizedDomains[0] : 'domain-not-configured'

        const { data: newClone, error: insertError } = await supabaseAdmin
          .from('detected_clones')
          .insert({
            user_id: userId,
            original_domain: originalDomain,
            clone_domain: currentDomain,
            detection_count: 1,
            first_detected: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_active: true, // sempre ativo para tracking
          })
          .select('id')
          .single()

        if (insertError) {
          throw insertError
        }

        cloneId = newClone?.id

        // Verificar se pode incrementar contador (diferente de salvar)
        if (withinLimit) {
          // Pode detectar - incrementa contador normalmente
          await incrementCloneCount(userId)
          logger.info('Clone registrado e contabilizado', { userId, cloneId })
        } else {
          // Limite atingido (plano gratuito) = salva mas não conta
          logger.warn('Clone registrado mas bloqueado (upgrade needed)', { userId, cloneId })
          
          // Retornar resposta especial indicando que salvou mas não conta
          return NextResponse.json(
            {
              status: 'clone_detected_blocked',
              message: 'Clone detectado mas não contabilizado - limite atingido',
              cloneId: cloneId,
              currentCount: limitStatus.currentCount,
              limit: limitStatus.limit,
              planName: limitStatus.planName,
              resetDate: limitStatus.resetDate,
              upgradeRequired: true,
              savedForTracking: true // indica que salvou para mostrar no dashboard
            },
            { status: 200, headers: corsHeaders } // 200 mas com aviso
          )
        }
      }

      logger.info('Clone registrado com sucesso', { cloneId })

      // Tentar registrar log se temos clone_id
      if (cloneId) {
        const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

        const { error: logError } = await supabaseAdmin.from('detection_logs').insert({
          user_id: userId,
          clone_id: cloneId,
          ip_address: clientIP,
          user_agent: userAgent || 'unknown',
          referrer: referrer || null,
          page_url: currentUrl || null,
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
        status: 'clone_detected',
        message: 'Clone detectado e registrado com sucesso',
        originalDomain: originalDomain,
        cloneDomain: currentDomain,
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
        status: 'clone_detected',
        message: 'Clone detectado (erro de banco de dados)',
        originalDomain: originalDomain,
        cloneDomain: currentDomain,
        dbError: dbError instanceof Error ? dbError.message : String(dbError),
        processingTime: Date.now() - startTime,
      }

      return NextResponse.json(response, { headers: corsHeaders })
    }
  } catch (error) {
    logger.error('Erro crítico', error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
