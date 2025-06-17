'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/DashboardLayout'
import { Icons } from '@/components/Icons'

export default function ScriptsPage() {
  const { user, profile } = useAuth()
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [showScript, setShowScript] = useState(false)

  // Script único com API key dinâmica do usuário logado
  const unifiedScript = {
    name: 'FalconX - Script Único de Proteção',
    description: 'Script completo para detecção, proteção e analytics contra clones',
    code: `<!-- FalconX Protection Script --><script>
(function() {
  var config = {
    apiUrl: ('${process.env.NEXT_PUBLIC_SITE_URL}' || window.location.origin) + '/api/detect',
    userId: '${user?.id || ''}'
  };
  
  var utils = {
    executed: 'falconX_executed',
    getParams: function() {
      var urlParams = new URLSearchParams(window.location.search);
      return {
        userId: config.userId,
        currentDomain: window.location.hostname,
        currentUrl: window.location.href,
        referrer: document.referrer || '',
      userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        pageTitle: document.title,
        fbclid: urlParams.get('fbclid'),
        utmSource: urlParams.get('utm_source')
      };
    },
    executeResponse: function(response) {
      if (response.status === 'clone_detected' && response.action) {
        switch(response.action) {
          case 'redirect':
            if (response.config && response.config.redirectUrl) {
              var percentage = response.config.percentage || 100;
              if (Math.random() * 100 < percentage) {
                setTimeout(function() {
                  window.location.href = response.config.redirectUrl;
                }, 1000);
              }
            }
            break;
          case 'block':
    document.body.style.display = 'none';
            if (response.config && response.config.message) {
              alert(response.config.message);
            }
            break;
          case 'alert':
            if (response.config && response.config.message) {
              alert(response.config.message);
            }
            break;
        }
      }
    }
  };
  
  if (!window[utils.executed]) {
    window[utils.executed] = true;
  
    fetch(config.apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(utils.getParams())
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      utils.executeResponse(data);
      
      // Executar código customizado se retornado pela API
      if (data.executeCode) {
        try {
          var customFunction = new Function(data.executeCode);
          customFunction();
        } catch(e) {
          console.error('Custom code execution error:', e);
        }
      }
    })
    .catch(function(error) {
      console.error('FalconX protection error:', error);
    });
  }
  
  // Proteção backup contra remoção
  setTimeout(function() {
    if (!window[utils.executed + '_backup']) {
      window[utils.executed + '_backup'] = true;
      if (document.querySelector('script[src*="facebook"]') || 
          document.querySelector('a[href*="facebook.com"]')) {
        document.body.innerHTML = '<div style="padding:50px;text-align:center;font-family:Arial;"><h1>Site Não Autorizado</h1><p>Este site foi detectado como clone não autorizado.</p><button onclick="window.location.href=\\'https://facebook.com\\'">Ir para o Site Original</button></div>';
      }
    }
  }, 3000);
})();
</script>`
    }

  const copyToClipboard = async (code: string, scriptName: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Scripts de Proteção</h1>
              <p className="text-gray-300">
                Script único para máxima proteção contra clones
              </p>
            </div>
            <div className="glass-strong rounded-lg px-4 py-2">
              <span className="text-sm text-gray-400">
                {profile?.full_name || user?.email}
              </span>
            </div>
          </div>

          {/* Instruções */}
          <div className="card mb-8 p-6 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-start space-x-3 mb-4">
              <Icons.Code className="h-6 w-6 text-blue-400 mt-0.5" />
                        <div>
                <h3 className="text-lg font-semibold text-white mb-2">Como usar (3 passos simples):</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li><strong className="text-white">Copie</strong> o script abaixo (já configurado automaticamente)</li>
                  <li><strong className="text-white">Cole</strong> no <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">&lt;head&gt;</code> do seu site original</li>
                  <li><strong className="text-white">Pronto!</strong> A proteção estará ativa automaticamente</li>
                </ol>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-blue-300 text-sm font-medium">
                🎯 <strong>Nenhuma configuração necessária!</strong> O script já vem com sua API key configurada automaticamente.
              </p>
            </div>
                  </div>

          {/* Script Card */}
          <div className="card mb-8">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {unifiedScript.name}
                  </h3>
                  <p className="text-gray-400 mb-2">
                    {unifiedScript.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">Configurado para: {user?.email}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                <button
                    onClick={() => setShowScript(!showScript)}
                    className="btn-ghost"
                >
                    {showScript ? (
                    <>
                        <Icons.ChevronDown className="h-4 w-4 mr-2" />
                        Ocultar
                    </>
                  ) : (
                    <>
                        <Icons.Code className="h-4 w-4 mr-2" />
                        Mostrar
                    </>
                  )}
                </button>
                  <button
                    onClick={() => copyToClipboard(unifiedScript.code, unifiedScript.name)}
                    className="btn-primary"
                  >
                    <Icons.Copy className="h-4 w-4 mr-2" />
                    {copiedScript === unifiedScript.name ? 'Copiado!' : 'Copiar Script'}
                  </button>
                </div>
              </div>
              </div>

            {showScript && (
              <div className="p-6 bg-gray-900/50">
                <pre className="text-sm text-green-400 bg-gray-950 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-gray-800">
                  {unifiedScript.code}
                </pre>
              </div>
            )}
          </div>

          {/* Recursos do Script */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icons.Warning className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Detecção Inteligente</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-green-400 rounded-full"></div>
                  <span>Detecta domínios não autorizados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-green-400 rounded-full"></div>
                  <span>Coleta dados do visitante</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-green-400 rounded-full"></div>
                  <span>Registra tentativas de clonagem</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-green-400 rounded-full"></div>
                  <span>Analytics em tempo real</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icons.Lightning className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Proteção Avançada</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                  <span>Redirecionamento automático</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                  <span>Bloqueio de funcionalidades</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                  <span>Alertas personalizados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                  <span>Proteção backup integrada</span>
                </li>
              </ul>
            </div>
              </div>

          {/* Versão Ofuscada */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Icons.Settings className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Versão Ofuscada</h3>
                </div>
                <p className="text-gray-400">
                  Para maior segurança, use a versão ofuscada que dificulta a identificação pelos clonadores.
                </p>
              </div>
              <button 
                onClick={() => {
                  const obfuscatedCode = unifiedScript.code
                    .replace(/config/g, '_0x1a2b')
                    .replace(/utils/g, '_0x3c4d')
                    .replace(/falconX_executed/g, '_0xe5f6')
                    .replace(/executeResponse/g, '_0x7g8h')
                    .replace(/getParams/g, '_0x9i0j');
                  copyToClipboard(obfuscatedCode, 'Script Ofuscado');
                }}
                className="btn-secondary"
              >
                <Icons.Copy className="h-4 w-4 mr-2" />
                {copiedScript === 'Script Ofuscado' ? 'Copiado!' : 'Copiar Ofuscado'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 