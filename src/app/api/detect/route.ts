import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      currentDomain,
      currentUrl,
      referrer,
      userAgent,
      timestamp,
      pageTitle,
      fbclid,
      utmSource
    } = body

    // Validar dados obrigatórios
    if (!userId || !currentDomain) {
      return NextResponse.json(
        { error: 'userId e currentDomain são obrigatórios' },
        { status: 400 }
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
        { status: 500 }
      )
    }

    // Verificar se o domínio atual está autorizado
    const isAuthorized = allowedDomains?.some(domain => 
      currentDomain === domain.domain || 
      currentDomain.endsWith('.' + domain.domain)
    )

    if (isAuthorized) {
      // Domínio autorizado - não fazer nada
      return NextResponse.json({
        status: 'authorized',
        message: 'Domínio autorizado'
      })
    }

    // Domínio não autorizado - é um clone!
    // Encontrar o domínio original mais provável
    let originalDomain = ''
    if (allowedDomains && allowedDomains.length > 0) {
      // Por simplicidade, usar o primeiro domínio como original
      // Em produção, poderia usar algoritmos mais sofisticados
      originalDomain = allowedDomains[0].domain
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

    if (existingClone) {
      // Clone já existe - incrementar contador
      const { error: updateError } = await supabase
        .from('detected_clones')
        .update({
          detection_count: existingClone.detection_count + 1,
          last_detected: new Date().toISOString()
        })
        .eq('id', existingClone.id)

      if (updateError) {
        console.error('Erro ao atualizar contador do clone:', updateError)
      }
    } else {
      // Novo clone - criar registro
      const { error: insertError } = await supabase
        .from('detected_clones')
        .insert({
          user_id: userId,
          original_domain: originalDomain,
          clone_domain: currentDomain,
          detection_count: 1,
          first_detected: new Date().toISOString(),
          last_detected: new Date().toISOString(),
          is_active: true
        })

      if (insertError) {
        console.error('Erro ao inserir novo clone:', insertError)
      }
    }

    // Registrar log de detecção
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const { error: logError } = await supabase
      .from('detection_logs')
      .insert({
        user_id: userId,
        clone_domain: currentDomain,
        original_domain: originalDomain,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
        page_url: currentUrl,
        page_title: pageTitle,
        fbclid: fbclid,
        utm_source: utmSource,
        timestamp: timestamp || new Date().toISOString()
      })

    if (logError) {
      console.error('Erro ao registrar log:', logError)
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
            message: action.custom_message
          }
        }
      }
    }

    return NextResponse.json({
      status: 'clone_detected',
      message: 'Clone detectado',
      originalDomain: originalDomain,
      cloneDomain: currentDomain,
      action: actionResponse?.action,
      config: actionResponse?.config
    })

  } catch (error) {
    console.error('Erro na API de detecção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 