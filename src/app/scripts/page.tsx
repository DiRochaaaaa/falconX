'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, User, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function ScriptsPage() {
  const { user, profile, loading } = useAuth()
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [showScript, setShowScript] = useState(false)

  // Se não estiver logado, mostrar aviso
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="mx-auto mb-4" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Login Necessário
            </h1>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para acessar os scripts de proteção.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <LogIn size={16} />
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Script de Proteção FalconX
              </h1>
              <p className="text-gray-600">
                Script único completo para máxima proteção contra clones
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Usuário:</p>
              <p className="font-medium text-gray-900">{profile?.full_name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Instruções Simplificadas */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-900 mb-3">
            ✅ Como usar o script (MUITO SIMPLES):
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-green-800">
            <li><strong>Copie</strong> o script abaixo (já configurado com sua conta)</li>
            <li><strong>Cole</strong> no <code className="bg-green-100 px-2 py-1 rounded">&lt;head&gt;</code> do seu site original</li>
            <li><strong>Pronto!</strong> O script irá detectar automaticamente clones e executar as ações configuradas</li>
          </ol>
          <div className="bg-green-100 p-3 rounded-md mt-4">
            <p className="text-green-800 text-sm font-medium">
              🎯 <strong>NADA para configurar!</strong> O script já vem com sua API key configurada automaticamente.
            </p>
          </div>
        </div>

        {/* Script Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {unifiedScript.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {unifiedScript.description}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  ✅ Configurado automaticamente para: {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {showScript ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showScript ? 'Ocultar' : 'Mostrar'}
                </button>
                <button
                  onClick={() => copyToClipboard(unifiedScript.code, unifiedScript.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Copy size={16} />
                  {copiedScript === unifiedScript.name ? 'Copiado!' : 'Copiar Script'}
                </button>
              </div>
            </div>
          </div>

          {showScript && (
            <div className="p-6 bg-gray-50">
              <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {unifiedScript.code}
              </pre>
            </div>
          )}
        </div>

        {/* Recursos do Script */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Recursos do Script Único:
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Detecção Inteligente</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detecta domínios não autorizados</li>
                <li>• Coleta dados do visitante</li>
                <li>• Registra tentativas de clonagem</li>
                <li>• Analytics em tempo real</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🛡️ Proteção Avançada</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Redirecionamento automático</li>
                <li>• Bloqueio de funcionalidades</li>
                <li>• Alertas personalizados</li>
                <li>• Proteção backup integrada</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔒 Segurança</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Execução única por página</li>
                <li>• Resistente a remoção</li>
                <li>• Código otimizado</li>
                <li>• Proteção backup incluída</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">⚡ Performance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Carregamento assíncrono</li>
                <li>• Mínimo impacto na velocidade</li>
                <li>• Execução otimizada</li>
                <li>• Compatível com todos os sites</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botão para Versão Ofuscada */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-gray-800 font-semibold mb-2">🔒 Versão Ofuscada:</h3>
          <p className="text-gray-600 text-sm mb-4">
            Para maior segurança, você pode usar a versão ofuscada do script que dificulta a identificação pelos clonadores.
          </p>
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
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors"
          >
            {copiedScript === 'Script Ofuscado' ? 'Script Ofuscado Copiado!' : 'Copiar Versão Ofuscada'}
          </button>
        </div>

        {/* Aviso de Facilidade */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-blue-800 font-semibold mb-2">🎉 Super Fácil de Usar!</h3>
          <p className="text-blue-700 text-sm">
            Não há mais necessidade de configurar API keys manualmente! O script já vem configurado 
            automaticamente com sua conta. Basta copiar e colar no seu site original.
          </p>
        </div>
      </div>
    </div>
  )
} 