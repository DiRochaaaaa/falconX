'use client'

import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/DashboardLayout'
import { Icons } from '@/components/Icons'
import { useState } from 'react'

export default function Scripts() {
  const { profile } = useAuth()
  const [selectedScript, setSelectedScript] = useState('detection')
  const [copied, setCopied] = useState(false)

  const scripts = {
    detection: {
      name: 'Script de Detecção',
      description: 'Detecta tentativas de clonagem em tempo real',
      code: `<!-- FalconX Detection Script -->
<script>
(function() {
  const apiKey = 'YOUR_API_KEY';
  const originalDomain = window.location.hostname;
  
  // Verificar se é um clone
  fetch('https://api.falconx.com/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      domain: originalDomain,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    })
  }).then(response => response.json())
    .then(data => {
      if (data.isClone) {
        // Ação para clones detectados
        console.warn('Clone detectado!');
      }
    });
})();
</script>`
    },
    protection: {
      name: 'Script de Proteção',
      description: 'Bloqueia funcionalidades em sites clonados',
      code: `<!-- FalconX Protection Script -->
<script>
(function() {
  const apiKey = 'YOUR_API_KEY';
  const allowedDomains = ['seusite.com', 'www.seusite.com'];
  
  if (!allowedDomains.includes(window.location.hostname)) {
    // Bloquear funcionalidades
    document.body.style.display = 'none';
    alert('Este site não é autorizado!');
    window.location.href = 'https://seusite.com';
  }
})();
</script>`
    },
    analytics: {
      name: 'Script de Analytics',
      description: 'Coleta dados sobre tentativas de clonagem',
      code: `<!-- FalconX Analytics Script -->
<script>
(function() {
  const apiKey = 'YOUR_API_KEY';
  
  // Coletar dados do visitante
  const data = {
    domain: window.location.hostname,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
  
  fetch('https://api.falconx.com/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify(data)
  });
})();
</script>`
    }
  }

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scripts[selectedScript as keyof typeof scripts].code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { scripts: ['detection'] }
      case 'silver': return { scripts: ['detection', 'protection'] }
      case 'gold': return { scripts: ['detection', 'protection', 'analytics'] }
      default: return { scripts: ['detection'] }
    }
  }

  const planLimits = getPlanLimits()

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Scripts de Proteção</h1>
              <p className="text-gray-300">
                Integre nossos scripts em seu site para proteção contra clonagem
              </p>
            </div>
            <div className="glass-strong rounded-lg px-4 py-2">
              <span className="text-sm text-gray-400">Plano:</span>
              <span className="ml-2 text-green-400 font-semibold capitalize">
                {profile?.plan_type || 'free'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Script Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Tipos de Script</h2>
              <div className="space-y-3">
                {Object.entries(scripts).map(([key, script]) => {
                  const isAvailable = planLimits.scripts.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => isAvailable && setSelectedScript(key)}
                      disabled={!isAvailable}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedScript === key
                          ? 'border-green-500 bg-green-500/10'
                          : isAvailable
                          ? 'border-gray-600 bg-gray-800/30 hover:border-green-500/50'
                          : 'border-gray-700 bg-gray-800/10 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${isAvailable ? 'text-white' : 'text-gray-500'}`}>
                            {script.name}
                          </h3>
                          <p className={`text-sm mt-1 ${isAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                            {script.description}
                          </p>
                        </div>
                        {!isAvailable && (
                          <Icons.Warning className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Upgrade Notice */}
              {profile?.plan_type === 'free' && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center">
                    <Icons.Warning className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-300 text-sm font-medium">Upgrade Necessário</span>
                  </div>
                  <p className="text-yellow-200 text-sm mt-2">
                    Faça upgrade para acessar scripts avançados de proteção e analytics.
                  </p>
                </div>
              )}
            </div>

            {/* Script Code */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {scripts[selectedScript as keyof typeof scripts].name}
                </h2>
                <button
                  onClick={handleCopyScript}
                  className="btn btn-secondary flex items-center"
                >
                  {copied ? (
                    <>
                      <Icons.Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="h-4 w-4 mr-2" />
                      Copiar Script
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{scripts[selectedScript as keyof typeof scripts].code}</code>
                </pre>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-blue-300 font-medium mb-2">Como usar:</h3>
                <ol className="text-blue-200 text-sm space-y-1">
                  <li>1. Substitua &apos;YOUR_API_KEY&apos; pela sua chave API</li>
                  <li>2. Cole o script no &lt;head&gt; do seu site</li>
                  <li>3. Configure os domínios permitidos na seção Domínios</li>
                  <li>4. Monitore as detecções no Dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 