import { NextRequest, NextResponse } from 'next/server'

// Headers para cache e CORS
const scriptHeaders = {
  'Content-Type': 'application/javascript; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
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
    const script = generateBasicScript(scriptId)

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
 * Converte scriptId para userId (reverso da função generateScriptId)
 * Para agora, vamos usar o próprio scriptId como userId temporariamente
 * TODO: Implementar lookup real no banco de dados
 */
function extractUserIdFromScriptId(scriptId: string): string {
  // Por enquanto, usar o scriptId como identificador único
  // Na implementação real, fazer lookup no banco para encontrar o userId
  return scriptId.replace('fx_', '')
}

/**
 * Gera script básico para teste
 */
function generateBasicScript(scriptId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const userId = extractUserIdFromScriptId(scriptId)

  return `
(function() {
  console.log('FalconX Script Loaded - ID: ${scriptId}');
  
  // Detectar clone
  fetch('${baseUrl}/api/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: btoa('${userId}'), // userId em Base64
      dom: location.hostname, // domain -> dom
      url: location.href,
      ref: document.referrer, // referrer -> ref
      ua: navigator.userAgent, // userAgent -> ua
      ts: new Date().toISOString() // timestamp -> ts
    })
  }).then(response => response.json())
  .then(data => {
    if (data.status === 'detected') {
      console.log('Clone detected, executing action...');
      // Executar ação
      fetch('${baseUrl}/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: btoa('${userId}'), // userId em Base64
          dom: location.hostname, // domain -> dom
          url: location.href
        })
      }).then(response => response.json())
      .then(actionData => {
        console.log('Action executed:', actionData);
      });
    }
  }).catch(error => {
    console.log('FalconX: Silent error handling');
  });
})();`.trim()
}

// Função utilitária removida do export para compatibilidade com Next.js routes
