import { generateScriptId } from '@/lib/script-utils'

/**
 * Gera script de proteção personalizado para o usuário
 * NOVA VERSÃO: Script loader minimalista + arquivo JS externo
 * @param userId - ID do usuário
 * @param baseUrl - URL base da aplicação
 * @returns Script de proteção compacto
 */
export function generateProtectionScript(userId: string, baseUrl: string): string {
  const scriptId = generateScriptId(userId)

  // Script loader super compacto - apenas 1 linha!
  const loaderScript = `<script src="${baseUrl}/api/js/${scriptId}.js" async defer></script>`

  return loaderScript
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
