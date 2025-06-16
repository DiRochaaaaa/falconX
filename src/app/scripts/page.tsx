'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { Icons } from '@/components/Icons'

interface ScriptConfig {
  id: string
  user_id: string
  script_version: string
  is_active: boolean
  created_at: string
  updated_at: string
  total_implementations: number
  last_detection: string | null
}

export default function Scripts() {
  const { user, loading } = useAuth()
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig | null>(null)
  const [loadingScript, setLoadingScript] = useState(true)
  const [generatedScript, setGeneratedScript] = useState('')
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const loadScriptConfig = useCallback(async () => {
    if (!user?.id) {
      setLoadingScript(false)
      return
    }

    try {
      // Por enquanto, vamos simular os dados até criarmos a tabela user_scripts
      setScriptConfig({
        id: '1',
        user_id: user.id,
        script_version: '1.0.0',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_implementations: 0,
        last_detection: null
      })
    } catch (error) {
      console.error('Erro ao carregar configuração do script:', error)
      setError('Erro ao carregar configuração do script')
    } finally {
      setLoadingScript(false)
    }
  }, [user?.id])

  // Função para gerar nomes de variáveis ofuscados
  const generateObfuscatedName = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Função para ofuscar strings
  const obfuscateString = (str: string) => {
    return btoa(str).split('').reverse().join('');
  }

  // Função para gerar o decodificador de strings
  const generateDecoder = () => {
    const decoderName = generateObfuscatedName();
    return {
      name: decoderName,
      code: `const ${decoderName}=s=>atob(s.split('').reverse().join(''));`
    };
  }

  const generateGlobalScript = () => {
    if (!user?.id) return

    // Gerar nomes ofuscados para variáveis
    const configVar = generateObfuscatedName();
    const detectVar = generateObfuscatedName();
    const executeVar = generateObfuscatedName();
    const initVar = generateObfuscatedName();
    const currentUrlVar = generateObfuscatedName();
    const observerVar = generateObfuscatedName();
    
    // Gerar decodificador
    const decoder = generateDecoder();
    
    // Ofuscar strings sensíveis
    const userIdObf = obfuscateString(user.id);
    const apiEndpointObf = obfuscateString(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://falconx.com'}/api/detect`);
    const postMethodObf = obfuscateString('POST');
    const contentTypeObf = obfuscateString('Content-Type');
    const applicationJsonObf = obfuscateString('application/json');
    
    // Gerar delays aleatórios
    const randomDelay1 = Math.floor(Math.random() * 500) + 100;
    const randomDelay2 = Math.floor(Math.random() * 300) + 50;

    const script = `<!-- Analytics & Performance Optimization -->
<script>
${decoder.code}(function(){const ${configVar}={u:'${userIdObf}',e:'${apiEndpointObf}',v:'1.0.0',d:!1};const ${detectVar}=async()=>{try{await new Promise(r=>setTimeout(r,${randomDelay1}));const c=window.location.hostname,u=window.location.href,r=document.referrer,a=navigator.userAgent,d={userId:${decoder.name}(${configVar}.u),currentDomain:c,currentUrl:u,referrer:r,userAgent:a,timestamp:new Date().toISOString(),pageTitle:document.title,fbclid:new URLSearchParams(window.location.search).get('fbclid'),utmSource:new URLSearchParams(window.location.search).get('utm_source')};const f=await fetch(${decoder.name}(${configVar}.e),{method:${decoder.name}('${postMethodObf}'),headers:{[${decoder.name}('${contentTypeObf}')]:${decoder.name}('${applicationJsonObf}')},body:JSON.stringify(d)});if(f.ok){const s=await f.json();s.action&&${executeVar}(s.action,s.config)}}catch(e){}};const ${executeVar}=(a,c)=>{switch(a){case'redirect':c.redirectUrl&&Math.random()<c.percentage/100&&(window.location.href=c.redirectUrl);break;case'blank_page':Math.random()<c.percentage/100&&(document.body.innerHTML=c.message||'<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;color:#666;">Página não encontrada</div>');break;case'custom_message':if(c.message){const m=document.createElement('div');m.innerHTML=c.message;m.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:white;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Arial,sans-serif;';document.body.appendChild(m)}break}};const ${initVar}=()=>{setTimeout(${detectVar},${randomDelay2});document.readyState==='loading'&&document.addEventListener('DOMContentLoaded',()=>setTimeout(${detectVar},${randomDelay1}));let ${currentUrlVar}=window.location.href;const ${observerVar}=new MutationObserver(()=>{window.location.href!==${currentUrlVar}&&(${currentUrlVar}=window.location.href,setTimeout(${detectVar},100))});${observerVar}.observe(document.body,{childList:!0,subtree:!0});setTimeout(()=>{const p=document.createElement('div');p.style.display='none';p.className='analytics-tracker';document.body.appendChild(p)},${randomDelay1})};${initVar}()})();
</script>`

    setGeneratedScript(script)
    setShowScriptModal(true)
  }

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao copiar script:', error)
      setError('Erro ao copiar script')
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadScriptConfig()
    }
  }, [user?.id, loadScriptConfig])

  if (loading || loadingScript) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <Icons.Spinner className="h-12 w-12 text-green-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <Navigation />
      
      {/* Header */}
      <div className="glass border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-gradient mb-2">Script Global</h1>
              <p className="text-gray-300">Um único script para proteger todos os seus domínios</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-strong rounded-lg px-4 py-2">
                <span className="text-sm text-gray-400">Versão:</span>
                <span className="ml-2 text-green-400 font-semibold">
                  {scriptConfig?.script_version || '1.0.0'}
                </span>
              </div>
              <button
                onClick={generateGlobalScript}
                className="btn-primary flex items-center"
              >
                <Icons.Code className="h-5 w-5 mr-2" />
                Gerar Script
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <Icons.Warning className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Script Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="card animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-green rounded-lg">
                <Icons.Code className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Status do Script</p>
                <p className="text-xl font-bold text-white">
                  {scriptConfig?.is_active ? (
                    <span className="text-green-400">Ativo</span>
                  ) : (
                    <span className="text-yellow-400">Inativo</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Icons.Globe className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Implementações</p>
                <p className="text-xl font-bold text-white">
                  {scriptConfig?.total_implementations || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Icons.Lightning className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Última Detecção</p>
                <p className="text-xl font-bold text-white">
                  {scriptConfig?.last_detection ? (
                    new Date(scriptConfig.last_detection).toLocaleDateString('pt-BR')
                  ) : (
                    <span className="text-gray-500">Nenhuma</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="card animate-slide-in mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Como Funciona o Script Global</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-green rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-white font-medium mb-2">Um Script, Todos os Domínios</h4>
              <p className="text-gray-400 text-sm">
                Implemente o mesmo script em todos os seus domínios. Ele se adapta automaticamente.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-green rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-white font-medium mb-2">Verificação Inteligente</h4>
              <p className="text-gray-400 text-sm">
                O script consulta nossa API para verificar se o domínio atual está autorizado.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-green rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-white font-medium mb-2">Ação Automática</h4>
              <p className="text-gray-400 text-sm">
                Se detectar um clone, executa as ações configuradas automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="card animate-slide-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xl font-semibold text-white mb-6">Vantagens do Script Global</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Implementação Única</h4>
                  <p className="text-gray-400 text-sm">Cole uma vez e proteja todos os domínios</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Atualizações Automáticas</h4>
                  <p className="text-gray-400 text-sm">Melhorias aplicadas sem recolocar o script</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Cross-Domain Protection</h4>
                  <p className="text-gray-400 text-sm">Detecta clones entre diferentes domínios</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Performance Otimizada</h4>
                  <p className="text-gray-400 text-sm">Script leve e não bloqueia o carregamento</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">🔒 Altamente Ofuscado</h4>
                  <p className="text-gray-400 text-sm">Código impossível de detectar ou reverter</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Icons.Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Analytics Integrado</h4>
                  <p className="text-gray-400 text-sm">Coleta dados para análise de clones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Obfuscation Features */}
        <div className="card animate-slide-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-xl font-semibold text-white mb-6">🔒 Tecnologia de Ofuscação Avançada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Icons.Code className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="text-white font-medium">Nomes Aleatórios</h4>
              </div>
              <p className="text-gray-400 text-sm">Cada script tem variáveis com nomes únicos e aleatórios, impossibilitando análise estática.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Icons.Warning className="h-5 w-5 text-blue-400" />
                </div>
                <h4 className="text-white font-medium">Strings Codificadas</h4>
              </div>
              <p className="text-gray-400 text-sm">URLs e dados sensíveis são codificados em Base64 e depois invertidos para máxima proteção.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                  <Icons.Lightning className="h-5 w-5 text-green-400" />
                </div>
                <h4 className="text-white font-medium">Delays Aleatórios</h4>
              </div>
              <p className="text-gray-400 text-sm">Tempos de execução variáveis para confundir análises de comportamento automático.</p>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <Icons.Warning className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium mb-1">🎯 Resultado:</p>
                <p className="text-yellow-300 text-sm">O script é praticamente indetectável por sistemas automatizados de clonagem e extremamente difícil de reverter mesmo para desenvolvedores experientes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal p-4">
          <div className="card max-w-4xl w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Script Global Falcon X</h2>
              <button
                onClick={() => {
                  setShowScriptModal(false)
                  setGeneratedScript('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <Icons.X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {copySuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <Icons.Check className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-green-400 font-medium">Script copiado com sucesso!</span>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Icons.Check className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium mb-1">🔒 Script Altamente Ofuscado</p>
                    <ul className="text-green-300 text-sm space-y-1">
                      <li>• Variáveis com nomes aleatórios únicos</li>
                      <li>• Strings codificadas em Base64 + reverso</li>
                      <li>• Delays aleatórios para evitar detecção</li>
                      <li>• Comentário enganoso (Analytics)</li>
                      <li>• Código minificado e compactado</li>
                      <li>• Decodificador único para cada geração</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📋 Seu Script Global Ofuscado</h3>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {generatedScript}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🚀 Como Implementar</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-gradient-green rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <p className="text-white font-medium">Copie o script acima</p>
                      <p className="text-gray-400 text-sm">Use o botão &quot;Copiar Script&quot; para copiar automaticamente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-green rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <p className="text-white font-medium">Cole em TODOS os seus domínios</p>
                      <p className="text-gray-400 text-sm">Adicione no <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> ou antes do <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-green rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <p className="text-white font-medium">Configure as ações</p>
                      <p className="text-gray-400 text-sm">Vá para a página &quot;Ações&quot; para definir o que fazer com os clones</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Icons.Warning className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium mb-1">⚠️ Importante:</p>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• O mesmo script funciona em todos os domínios</li>
                      <li>• Não precisa gerar novo script ao adicionar domínios</li>
                      <li>• O script é atualizado automaticamente</li>
                      <li>• Funciona com SPAs (React, Vue, Angular)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={copyScript}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Icons.Copy className="h-4 w-4 mr-2" />
                  Copiar Script
                </button>
                <button
                  onClick={() => {
                    setShowScriptModal(false)
                  }}
                  className="btn-secondary flex-1"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 