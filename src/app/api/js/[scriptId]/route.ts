import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
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

// Headers para cache e CORS
const scriptHeaders = {
  'Content-Type': 'application/javascript; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1h browser, 24h CDN
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
}

/**
 * Gera hash do userId para criar scriptId único
 */
function generateScriptId(userId: string): string {
  const SECRET_KEY = process.env.SCRIPT_SECRET_KEY || 'falconx-secret-2025'
  const hash = createHash('sha256')
    .update(userId + SECRET_KEY)
    .digest('hex')
  return `fx_${hash.substring(0, 12)}`
}

/**
 * Valida se o scriptId corresponde a um userId válido
 */
function validateScriptId(scriptId: string, userId: string): boolean {
  return generateScriptId(userId) === scriptId
}

/**
 * Gera script ofuscado para o usuário
 */
function generateObfuscatedScript(userId: string, baseUrl: string): string {
  // Codificar URLs em Base64 para ofuscação
  const detectUrl = Buffer.from(`${baseUrl}/api/collect`).toString('base64')
  const actionUrl = Buffer.from(`${baseUrl}/api/process`).toString('base64')
  const userIdEncoded = Buffer.from(userId).toString('base64')

  return `
(function(_0xa1b2,_0xc3d4){
  const _0xe5f6='${detectUrl}';
  const _0xg7h8='${actionUrl}';
  const _0xi9j0='${userIdEncoded}';
  
  function _0xk1l2(){
    const _0xm3n4=atob(_0xe5f6);
    const _0xo5p6=atob(_0xi9j0);
    
    fetch(_0xm3n4,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        uid:_0xo5p6,
        dom:location.hostname,
        url:location.href,
        ref:document.referrer,
        ua:navigator.userAgent,
        ts:new Date().toISOString()
      })
    }).then(_0xq7r8=>_0xq7r8.json())
    .then(_0xs9t0=>{
      if(_0xs9t0.status==='detected'){
        _0xu1v2();
      }
    }).catch(_0xw3x4=>console.log(''));
  }
  
  function _0xu1v2(){
    const _0xy5z6=atob(_0xg7h8);
    const _0xa7b8=atob(_0xi9j0);
    
    fetch(_0xy5z6,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        uid:_0xa7b8,
        dom:location.hostname,
        url:location.href,
        ua:navigator.userAgent,
        ref:document.referrer
      })
    }).then(_0xc9d0=>_0xc9d0.json())
    .then(_0xe1f2=>{
      switch(_0xe1f2.action){
        case 'redirect':
          if(_0xe1f2.url){location.href=_0xe1f2.url;}
          break;
        case 'blank':
          document.body.innerHTML='';
          document.body.style.background='#000';
          break;
        case 'message':
          document.body.innerHTML='<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;font-size:24px;color:#333;text-align:center;background:#f5f5f5;">'+(_0xe1f2.customMessage||'Site não autorizado')+'</div>';
          break;
      }
    }).catch(_0xg3h4=>console.log(''));
  }
  
  _0xk1l2();
  setInterval(_0xk1l2,120000);
  
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){_0xk1l2();}
  });
  
  window.addEventListener('focus',()=>{
    _0xk1l2();
  });
})();`
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * GET /api/js/[scriptId] - Serve script JavaScript dinâmico
 */
export async function GET(request: NextRequest, { params }: { params: { scriptId: string } }) {
  const startTime = Date.now()
  const { scriptId } = params

  try {
    // Validar formato do scriptId
    if (!scriptId || !scriptId.startsWith('fx_') || scriptId.length !== 15) {
      logger.warn('Script ID inválido', { scriptId })
      return new NextResponse('// Script not found', {
        status: 404,
        headers: scriptHeaders,
      })
    }

    // Buscar todos os usuários para validar o scriptId
    // (Otimização futura: cache de scriptId -> userId)
    const { data: profiles, error } = await supabaseAdmin.from('profiles').select('id')

    if (error) {
      logger.error('Erro ao buscar perfis', new Error(error.message))
      return new NextResponse('// Service unavailable', {
        status: 503,
        headers: scriptHeaders,
      })
    }

    // Encontrar usuário correspondente ao scriptId
    let validUserId: string | null = null
    for (const profile of profiles || []) {
      if (validateScriptId(scriptId, profile.id)) {
        validUserId = profile.id
        break
      }
    }

    if (!validUserId) {
      logger.warn('Script ID não encontrado', { scriptId })
      return new NextResponse('// Script not found', {
        status: 404,
        headers: scriptHeaders,
      })
    }

    // Verificar se o usuário tem plano ativo (opcional)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan_id')
      .eq('id', validUserId)
      .single()

    if (!profile) {
      logger.warn('Perfil não encontrado', { userId: validUserId })
      return new NextResponse('// User not found', {
        status: 404,
        headers: scriptHeaders,
      })
    }

    // Gerar script ofuscado
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://falconx.com'
    const script = generateObfuscatedScript(validUserId, baseUrl)

    // Log da requisição (sem dados sensíveis)
    logger.info('Script servido', {
      scriptId,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      processingTime: Date.now() - startTime,
    })

    return new NextResponse(script, {
      status: 200,
      headers: scriptHeaders,
    })
  } catch (error) {
    logger.error('Erro ao servir script', error instanceof Error ? error : new Error(String(error)))

    return new NextResponse('// Service error', {
      status: 500,
      headers: scriptHeaders,
    })
  }
}

// Função utilitária para uso em outros módulos
export { generateScriptId }
