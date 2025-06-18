import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
  try {
    const body = await request.json()
    const { userId, currentDomain, currentUrl, referrer, userAgent, timestamp, fbclid, utmSource } =
      body

    // Validar dados obrigatórios
    if (!userId || !currentDomain) {
      return NextResponse.json(
        { error: 'userId e currentDomain são obrigatórios' },
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Verificar se o domínio está na lista de domínios autorizados
    const { data: allowedDomains, error: domainsError } = await supabase
      .from('allowed_domains')
      .select('domain, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (domainsError) {
      console.error('Erro ao buscar domínios autorizados:', domainsError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        {
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    // Verificar se o domínio atual está autorizado
    const isAuthorized = allowedDomains?.some(
      domain => currentDomain === domain.domain || currentDomain.endsWith('.' + domain.domain)
    )

    if (isAuthorized) {
      // Domínio autorizado - não fazer nada
      return NextResponse.json(
        {
          status: 'authorized',
          message: 'Domínio autorizado',
        },
        {
          headers: corsHeaders,
        }
      )
    }

    // Domínio não autorizado - é um clone!
    // Encontrar o domínio original mais provável
    let originalDomain = ''
    if (allowedDomains && allowedDomains.length > 0) {
      // Por simplicidade, usar o primeiro domínio como original
      // Em produção, poderia usar algoritmos mais sofisticados
      originalDomain = allowedDomains[0]?.domain || ''
    }

    // Registrar ou atualizar a detecção do clone
    const { data: existingClone, error: cloneCheckError } = await supabase
      .from('detected_clones')
      .select('id, detection_count')
      .eq('user_id', userId)
      .eq('clone_domain', currentDomain)
      .eq('original_domain', originalDomain)
      .single()

    if (cloneCheckError && cloneCheckError.code !== 'PGRST116') {
      console.error('Erro ao verificar clone existente:', cloneCheckError)
    }

    let cloneId = null

    if (existingClone) {
      // Clone já existe - incrementar contador
      cloneId = existingClone.id
      const { error: updateError } = await supabase
        .from('detected_clones')
        .update({
          detection_count: existingClone.detection_count + 1,
          last_seen: new Date().toISOString(),
        })
        .eq('id', existingClone.id)

      if (updateError) {
        console.error('Erro ao atualizar contador do clone:', updateError)
      }
    } else {
      // Novo clone - criar registro e obter ID
      const { data: newClone, error: insertError } = await supabase
        .from('detected_clones')
        .insert({
          user_id: userId,
          original_domain: originalDomain,
          clone_domain: currentDomain,
          detection_count: 1,
          first_detected: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          is_active: true,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Erro ao inserir novo clone:', insertError)
      } else {
        cloneId = newClone?.id
      }
    }

    // Registrar log de detecção se temos clone_id
    if (cloneId) {
      const clientIP =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

      const { error: logError } = await supabase.from('detection_logs').insert({
        user_id: userId,
        clone_id: cloneId,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
        page_url: currentUrl,
        timestamp: timestamp || new Date().toISOString(),
      })

      if (logError) {
        console.error('Erro ao registrar log:', logError)
      }
    }

    // Buscar ações configuradas para este clone
    const { data: actions, error: actionsError } = await supabase
      .from('clone_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)

    if (actionsError) {
      console.error('Erro ao buscar ações:', actionsError)
    }

    // Preparar resposta com ação a executar
    let actionResponse = null
    let executeCode = null

    if (actions && actions.length > 0) {
      const action = actions[0]

      // Verificar triggers
      let shouldExecute = true
      if (action.trigger_params) {
        // Se tem fbclid como trigger e não tem fbclid na URL
        if (action.trigger_params.require_fbclid && !fbclid) {
          shouldExecute = false
        }

        // Se tem utm_source como trigger e não tem utm_source na URL
        if (action.trigger_params.require_utm_source && !utmSource) {
          shouldExecute = false
        }
      }

      if (shouldExecute) {
        actionResponse = {
          action: action.action_type,
          config: {
            redirectUrl: action.redirect_url,
            percentage: action.redirect_percentage,
            message: action.custom_message,
          },
        }

        // Gerar código executável personalizado baseado na ação
        switch (action.action_type) {
          case 'redirect':
            if (action.redirect_url) {
              executeCode = `
                setTimeout(function() {
                  window.location.href = '${action.redirect_url}';
                }, 2000);
              `
            }
            break
          case 'block':
            executeCode = `
              document.body.style.display = 'none';
              document.body.innerHTML = '<div style="padding:50px;text-align:center;font-family:Arial;background:#f5f5f5;"><h1 style="color:#d32f2f;">🚫 Acesso Negado</h1><p style="color:#666;font-size:18px;">${action.custom_message || 'Este site foi detectado como clone não autorizado.'}</p></div>';
            `
            break
          case 'alert':
            executeCode = `
              alert('${action.custom_message || 'Site detectado como clone não autorizado!'}');
            `
            break
        }
      }
    }

    return NextResponse.json(
      {
        status: 'clone_detected',
        message: 'Clone detectado',
        originalDomain: originalDomain,
        cloneDomain: currentDomain,
        action: actionResponse?.action,
        config: actionResponse?.config,
        executeCode: executeCode,
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error('Erro na API de detecção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
