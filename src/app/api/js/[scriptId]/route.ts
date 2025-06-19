import { NextRequest, NextResponse } from 'next/server'

// Headers para cache e CORS - SEM CACHE para evitar problemas de deploy
const scriptHeaders = {
  'Content-Type': 'application/javascript; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
}

/**
 * GET /api/js/[scriptId] - Serve script JavaScript dinâmico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scriptId: string }> }
) {
  try {
    const { scriptId } = await params

    // Validar formato básico do script ID
    if (!scriptId || !scriptId.startsWith('fx_') || scriptId.length !== 15) {
      return new NextResponse('// Script not found', {
        status: 404,
        headers: scriptHeaders,
      })
    }

    // Para agora, aceitar qualquer script ID válido
    // TODO: Implementar validação com banco de dados
    const script = await generateBasicScript(scriptId)

    return new NextResponse(script, {
      status: 200,
      headers: scriptHeaders,
    })
  } catch (error) {
    return new NextResponse(`// Error: ${error}`, {
      status: 500,
      headers: scriptHeaders,
    })
  }
}

/**
 * Busca userId real usando lookup na tabela generated_scripts
 * Implementação completa com fallback para compatibilidade
 */
async function extractUserIdFromScriptId(scriptId: string): Promise<string> {
  const { scriptIdToUserId } = await import('@/lib/script-utils')
  
  const userId = await scriptIdToUserId(scriptId)
  
  if (userId) {
    return userId
  }
  
  // Fallback: usar hash como identificador temporário
  return scriptId.replace('fx_', '')
}

/**
 * Gera script básico para teste
 */
async function generateBasicScript(scriptId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const userId = await extractUserIdFromScriptId(scriptId)

  return `
(function() {
  console.log('FalconX Script Loaded - ID: ${scriptId}');
  
  // Detectar clone
  fetch('${baseUrl}/api/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: '${userId}',
      currentDomain: location.hostname,
      currentUrl: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }).then(response => response.json())
  .then(data => {
    if (data.status === 'clone_detected') {
      console.log('Clone detected, executing action...');
      // Executar ação
      fetch('${baseUrl}/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '${userId}',
          cloneDomain: location.hostname,
          currentUrl: location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      }).then(response => response.json())
      .then(actionData => {
        console.log('Action executed:', actionData);
        
        // 🚀 EXECUTAR AÇÕES - Copiado do script legado que funciona
        switch(actionData.action) {
          case 'redirect':
            if (actionData.url) {
              window.location.href = actionData.url;
            }
            break;
          case 'blank':
            document.body.innerHTML = '';
            document.body.style.background = '#000';
            break;
          case 'message':
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;font-size:24px;color:#333;text-align:center;background:#f5f5f5;">' + (actionData.customMessage || 'Site não autorizado') + '</div>';
            break;
        }
      });
    }
  }).catch(error => {
    console.log('FalconX: Silent error handling');
  });
})();`.trim()
}

// Função utilitária removida do export para compatibilidade com Next.js routes
