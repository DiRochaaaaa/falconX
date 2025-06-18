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

// Headers de CORS
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
  try {
    interface RequestBody {
      userId: string
      cloneDomain: string
      userAgent?: string
      referrer?: string
    }

    const body: RequestBody = await request.json()
    const { userId, cloneDomain, referrer } = body

    if (!userId || !cloneDomain) {
      return NextResponse.json(
        { error: 'userId e cloneDomain são obrigatórios' },
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
      return NextResponse.json({ error: 'Erro interno' }, { status: 500, headers: corsHeaders })
    }

    if (!actions || actions.length === 0) {
      return NextResponse.json(
        {
          action: 'none',
          message: 'Nenhuma ação configurada',
        },
        { headers: corsHeaders }
      )
    }

    // Executar primeira ação ativa (pode ser expandido para múltiplas ações)
    const action = actions[0]

    // Verificar se deve executar a ação baseado na porcentagem
    const shouldExecute = Math.random() * 100 <= action.redirect_percentage

    if (!shouldExecute) {
      return NextResponse.json(
        {
          action: 'skip',
          message: 'Ação não executada devido à porcentagem configurada',
        },
        { headers: corsHeaders }
      )
    }

    // Verificar triggers (fbclid, gclid, etc.)
    const triggerParams = action.trigger_params || {}
    const url = new URL(referrer || 'https://example.com')
    const hasRequiredTrigger = Object.entries(triggerParams).some(([param, enabled]) => {
      if (!enabled) return false
      return url.searchParams.has(param)
    })

    // Se tem triggers configurados mas nenhum foi encontrado, não executar
    if (Object.values(triggerParams).some(Boolean) && !hasRequiredTrigger) {
      return NextResponse.json(
        {
          action: 'skip',
          message: 'Triggers não encontrados na URL',
        },
        { headers: corsHeaders }
      )
    }

    // Executar ação baseada no tipo
    switch (action.action_type) {
      case 'redirect_traffic':
        return NextResponse.json(
          {
            action: 'redirect',
            url: action.redirect_url,
            message: 'Redirecionamento configurado',
          },
          { headers: corsHeaders }
        )

      case 'blank_page':
        return NextResponse.json(
          {
            action: 'blank',
            message: 'Página em branco configurada',
          },
          { headers: corsHeaders }
        )

      case 'custom_message':
        return NextResponse.json(
          {
            action: 'message',
            message: 'Site não autorizado. Acesse o site oficial.',
            customMessage: action.redirect_url || 'Este site não é autorizado.',
          },
          { headers: corsHeaders }
        )

      default:
        return NextResponse.json(
          {
            action: 'none',
            message: 'Tipo de ação não reconhecido',
          },
          { headers: corsHeaders }
        )
    }
  } catch (error) {
    logger.error(
      'Erro na execução de ação',
      error instanceof Error ? error : new Error(String(error))
    )

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
