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

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

/**
 * POST /api/process - API genérica para processamento de ações (substitui /api/execute-action)
 * Parâmetros ofuscados para não revelar a função
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse do body com suporte aos formatos antigo e novo
    type RequestBody = {
      uid?: string // userId (codificado em Base64) - formato novo
      dom?: string // cloneDomain - formato novo
      scriptId?: string // formato antigo
      domain?: string // formato antigo
      url?: string
      ref?: string // referrer (formato novo)
      referrer?: string // referrer (formato antigo)
      ua?: string // userAgent (formato novo)
      userAgent?: string // userAgent (formato antigo)
    }

    let body: RequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: corsHeaders })
    }

    // Detectar formato e normalizar parâmetros
    let uid: string, dom: string, url: string | undefined, ref: string | undefined

    if (body.uid && body.dom) {
      // Formato novo (ofuscado)
      uid = body.uid
      dom = body.dom
      url = body.url
      ref = body.ref
    } else if (body.scriptId && body.domain) {
      // Formato antigo (compatibilidade)
      const userId = body.scriptId.replace('fx_', '')
      uid = Buffer.from(userId, 'utf-8').toString('base64')
      dom = body.domain
      url = body.url
      ref = body.referrer
    } else {
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

    // Buscar ações ativas do usuário
    const { data: actions, error: actionsError } = await supabaseAdmin
      .from('clone_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('clone_id', null) // Ações globais

    if (actionsError) {
      logger.error('Erro ao buscar ações', new Error(actionsError.message))
      return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: corsHeaders })
    }

    if (!actions || actions.length === 0) {
      return NextResponse.json(
        {
          action: 'none',
          message: 'No actions configured',
        },
        { headers: corsHeaders }
      )
    }

    // Buscar configuração de triggers do usuário
    const { data: triggerConfig, error: triggerError } = await supabaseAdmin
      .from('user_trigger_configs')
      .select('trigger_params')
      .eq('user_id', userId)
      .single()

    if (triggerError && triggerError.code !== 'PGRST116') {
      logger.error('Erro ao buscar configuração de triggers', new Error(triggerError.message))
      return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: corsHeaders })
    }

    // Se não tem configuração de triggers, usar padrão
    const triggerParams = triggerConfig?.trigger_params || { fbclid: true }

    // Executar primeira ação ativa (pode ser expandido para múltiplas ações)
    const action = actions[0]

    // Verificar se deve executar a ação baseado na porcentagem
    const shouldExecute = Math.random() * 100 <= action.redirect_percentage

    if (!shouldExecute) {
      logger.info('Ação não executada devido à porcentagem', {
        userId,
        cloneDomain: dom,
        percentage: action.redirect_percentage,
      })
      return NextResponse.json(
        {
          action: 'none',
          message: 'Action not triggered by percentage',
        },
        { headers: corsHeaders }
      )
    }

    // Verificar triggers configurados
    let shouldTrigger = false

    // Verificar fbclid na URL ou referrer
    if (triggerParams.fbclid) {
      const hasUrlFbclid = url && url.includes('fbclid=')
      const hasRefFbclid = ref && ref.includes('fbclid=')
      if (hasUrlFbclid || hasRefFbclid) {
        shouldTrigger = true
        logger.info('Trigger fbclid ativado', { userId, cloneDomain: dom })
      }
    }

    // Verificar utm_source se configurado
    if (triggerParams.utm_source) {
      const hasUtmSource = url && url.includes('utm_source=')
      if (hasUtmSource) {
        shouldTrigger = true
        logger.info('Trigger utm_source ativado', { userId, cloneDomain: dom })
      }
    }

    // Se não há triggers configurados ou nenhum foi ativado, executar sempre
    if (!triggerParams.fbclid && !triggerParams.utm_source) {
      shouldTrigger = true
    }

    if (!shouldTrigger) {
      logger.info('Ação não executada - triggers não ativados', {
        userId,
        cloneDomain: dom,
        triggerParams,
      })
      return NextResponse.json(
        {
          action: 'none',
          message: 'No triggers activated',
        },
        { headers: corsHeaders }
      )
    }

    // Executar ação baseada no tipo
    let response
    switch (action.action_type) {
      case 'redirect':
        response = {
          action: 'redirect',
          url: action.redirect_url,
          message: 'Redirecting to original site',
        }
        break

      case 'blank':
        response = {
          action: 'blank',
          message: 'Blanking page',
        }
        break

      case 'message':
        response = {
          action: 'message',
          customMessage: 'Site não autorizado',
          message: 'Showing custom message',
        }
        break

      default:
        response = {
          action: 'none',
          message: 'Unknown action type',
        }
    }

    logger.info('Ação executada', {
      userId,
      cloneDomain: dom,
      actionType: action.action_type,
      processingTime: Date.now() - startTime,
    })

    return NextResponse.json(response, { headers: corsHeaders })
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
