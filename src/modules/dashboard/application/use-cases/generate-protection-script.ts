/**
 * Gera script de proteção via API backend
 * NOVA VERSÃO: Chama API route segura que roda no servidor
 * @param userId - ID do usuário (não usado diretamente)
 * @param baseUrl - URL base da aplicação
 * @returns Script de proteção compacto
 */
export async function generateProtectionScript(userId: string, baseUrl: string): Promise<string> {
  try {
    // ✅ CHAMAR API ROUTE SEGURA (servidor)
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ baseUrl })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate script')
    }

    const data = await response.json()
    return data.script

  } catch (error) {
    console.error('❌ Erro ao gerar script:', error)
    
    // Fallback: gerar script básico sem salvar no banco
    const fallbackScriptId = 'fx_temp_' + Math.random().toString(36).substring(2, 8)
    return `<script src="${baseUrl}/api/js/${fallbackScriptId}" async defer></script>`
  }
}

/**
 * Obtém token de autenticação do Supabase
 * @returns Token JWT ou throws error
 */
async function getAuthToken(): Promise<string> {
  // Verificar se estamos no browser
  if (typeof window === 'undefined') {
    throw new Error('getAuthToken só pode ser chamado no browser')
  }

  // Importar dinamicamente para evitar problemas SSR
  const { supabase } = await import('@/lib/supabase')
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.access_token) {
    throw new Error('Usuário não autenticado')
  }

  return session.access_token
}

/**
 * Gera script inline como fallback (para comparação)
 * @param userId - ID do usuário
 * @param baseUrl - URL base da aplicação
 * @returns Script inline completo (versão antiga)
 */
export function generateLegacyProtectionScript(userId: string, baseUrl: string): string {
  return `
<script>
(function(){
  const userId = '${userId}';
  const detectUrl = '${baseUrl}/api/detect';
  const actionUrl = '${baseUrl}/api/execute-action';
  
  function detectClone() {
    fetch(detectUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        currentDomain: window.location.hostname,
        currentUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).then(response => response.json())
    .then(data => {
      // Se clone foi detectado, executar ações
      if (data.status === 'clone_detected') {
        executeAction();
      }
    }).catch(err => console.log('FalconX: Detection error'));
  }
  
  function executeAction() {
    fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
             userId: userId,
             cloneDomain: window.location.hostname,
             currentUrl: window.location.href,
             userAgent: navigator.userAgent,
             referrer: document.referrer
           })
    }).then(response => response.json())
    .then(actionData => {
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
    }).catch(err => console.log('FalconX: Action error'));
  }
  
  // Detecção inicial
  detectClone();
  
  // Polling otimizado - reduzido para 2 minutos
  setInterval(detectClone, 120000);
  
  // Detecção baseada em eventos para melhor responsividade
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      detectClone();
    }
  });
  
  window.addEventListener('focus', () => {
    detectClone();
  });
})();
</script>
  `.trim()
}

// Função generateScriptId importada de @/lib/script-utils
