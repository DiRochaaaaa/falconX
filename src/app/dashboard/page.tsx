'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useRecentDetections, useAllowedDomains } from '@/hooks/useDataCache'
import DashboardLayout from '@/components/DashboardLayout'
import { Icons } from '@/components/Icons'
import { useState, Suspense, lazy, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Lazy load components for better performance
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'))
const RecentDetections = lazy(() => import('@/components/dashboard/RecentDetections'))
const QuickActions = lazy(() => import('@/components/dashboard/QuickActions'))

// Loading skeleton component
function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-700 rounded h-4 w-1/2"></div>
    </div>
  )
}

// Error message component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="card border-red-500/20 bg-red-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icons.Warning className="h-5 w-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
        <button onClick={onRetry} className="btn-ghost text-sm">
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}

// Seções do SPA
type Section = 'dashboard' | 'domains' | 'scripts' | 'actions'

// Tipos necessários
interface UserProfile {
  id?: string
  email?: string
  full_name?: string
  plan_type?: string
}

interface User {
  id: string
  email?: string
}

// Componente de Domínios
function DomainsSection({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  
  const { 
    data: domains, 
    loading, 
    error: domainsError, 
    refresh: refreshDomains 
  } = useAllowedDomains(user?.id || '')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()
  const canAddMore = planLimits.domains === -1 || (domains?.length || 0) < planLimits.domains

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('Usuário não autenticado')
      return
    }

    if (!newDomain.trim()) {
      setError('Digite um domínio válido')
      return
    }

    if (!validateDomain(newDomain.trim())) {
      setError('Formato de domínio inválido')
      return
    }

    if (!canAddMore) {
      setError(`Limite de ${planLimits.domains} domínios atingido para o plano ${profile?.plan_type || 'free'}`)
      return
    }

    setIsAdding(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('allowed_domains')
        .insert([
          {
            user_id: user.id,
            domain: newDomain.trim().toLowerCase(),
            is_active: true
          }
        ])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Este domínio já está cadastrado')
        } else {
          setError('Erro ao adicionar domínio')
        }
        return
      }

      setNewDomain('')
      await refreshDomains()
    } catch {
      setError('Erro ao adicionar domínio')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleDomain = async (domainId: string, currentStatus: boolean) => {
    if (!user?.id) return

    try {
      const { error: updateError } = await supabase
        .from('allowed_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId)
        .eq('user_id', user.id)

      if (updateError) {
        setError('Erro ao atualizar status do domínio')
        return
      }

      await refreshDomains()
    } catch {
      setError('Erro ao atualizar status do domínio')
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!user?.id) return

    try {
      const { error: deleteError } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)
        .eq('user_id', user.id)

      if (deleteError) {
        setError('Erro ao excluir domínio')
        return
      }

      await refreshDomains()
    } catch {
      setError('Erro ao excluir domínio')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient mb-2">Domínios Permitidos</h2>
          <p className="text-gray-300">
            Gerencie os domínios que devem ser protegidos contra clonagem
          </p>
        </div>
        <div className="glass-strong rounded-lg px-4 py-2">
          <span className="text-sm text-gray-400">
            {domains?.length || 0} / {planLimits.domains === -1 ? '∞' : planLimits.domains}
          </span>
        </div>
      </div>

      {/* Formulário para adicionar domínio */}
      <div className="card p-6">
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="exemplo.com"
                className="input-primary w-full"
                disabled={isAdding || !canAddMore}
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !canAddMore}
              className="btn btn-primary px-6"
            >
              {isAdding ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
          
          {!canAddMore && (
            <p className="text-yellow-400 text-sm">
              Limite de domínios atingido. Faça upgrade do seu plano para adicionar mais.
            </p>
          )}
        </form>

        {/* Mensagens de erro */}
        {(error || domainsError) && (
          <ErrorMessage 
            error={error || domainsError || ''} 
            onRetry={() => {
              setError('')
              refreshDomains()
            }} 
          />
        )}
      </div>

      {/* Lista de domínios */}
      <div className="card">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton className="h-32" />
          </div>
        ) : domains && domains.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {domains.map((domain: { id: string; domain: string; is_active: boolean; created_at: string }) => (
              <div key={domain.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-3 w-3 rounded-full ${domain.is_active ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                  <div>
                    <p className="text-white font-medium">{domain.domain}</p>
                    <p className="text-sm text-gray-400">
                      Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleDomain(domain.id, domain.is_active)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      domain.is_active 
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {domain.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icons.Globe className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum domínio cadastrado</h3>
            <p className="text-gray-400 mb-4">Adicione seu primeiro domínio para começar a proteção.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Scripts
function ScriptsSection({ user, profile }: { user: User | null, profile: UserProfile | null }) {
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient mb-2">Scripts de Proteção</h2>
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
      <div className="card p-6 border-blue-500/20 bg-blue-500/5">
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
      <div className="card">
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
      <div className="grid md:grid-cols-2 gap-6">
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
  )
}

// Componente de Ações (placeholder)
function ActionsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Ações de Proteção</h2>
        <p className="text-gray-300">
          Configure as ações que devem ser executadas quando um clone for detectado
        </p>
      </div>

      <div className="card p-8 text-center">
        <Icons.Lightning className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Em Desenvolvimento</h3>
        <p className="text-gray-400">Esta seção está sendo desenvolvida e estará disponível em breve.</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, initialized } = useAuth()
  const router = useRouter()
  const [showError, setShowError] = useState('')
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  
  // Redirecionar usuários não logados para a landing page
  useEffect(() => {
    if (initialized && !user) {
      router.push('/')
    }
  }, [initialized, user, router])
  
  // Usar hooks de cache otimizados - só quando user e inicialização estiverem prontos
  const shouldLoadData = !!(user?.id && initialized)
  
  const { 
    data: stats, 
    loading: loadingStats, 
    error: statsError, 
    refresh: refreshStats,
    isStale: statsStale 
  } = useDashboardStats(shouldLoadData ? user.id : '')
  
  const { 
    data: recentDetections, 
    loading: loadingDetections, 
    error: detectionsError, 
    refresh: refreshDetections,
    isStale: detectionsStale 
  } = useRecentDetections(shouldLoadData ? user.id : '')

  const getPlanLimits = () => {
    switch (profile?.plan_type) {
      case 'bronze': return { domains: 5, price: 29.99 }
      case 'silver': return { domains: 15, price: 59.99 }
      case 'gold': return { domains: -1, price: 99.99 }
      default: return { domains: 1, price: 0 }
    }
  }

  const planLimits = getPlanLimits()

  const handleRefreshAll = async () => {
    if (!shouldLoadData) return
    
    try {
      await Promise.all([refreshStats(), refreshDetections()])
      setShowError('')
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      setShowError('Erro ao atualizar dados')
    }
  }

  // Mostrar loading se ainda não inicializou ou não tem dados básicos
  if (!initialized || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-main flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-gray-300 animate-pulse">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Navegação interna
  const sections = [
    { id: 'dashboard' as Section, name: 'Dashboard', icon: Icons.Dashboard },
    { id: 'domains' as Section, name: 'Domínios', icon: Icons.Globe },
    { id: 'scripts' as Section, name: 'Scripts', icon: Icons.Code },
    { id: 'actions' as Section, name: 'Ações', icon: Icons.Lightning },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com Navegação Interna */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">FalconX</h1>
            <p className="text-gray-400 mt-1">
              Bem-vindo de volta, {profile?.full_name || 'Usuário'}!
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {(statsStale || detectionsStale) && activeSection === 'dashboard' && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <Icons.Warning className="h-4 w-4" />
                <span>Dados desatualizados</span>
              </div>
            )}
            {activeSection === 'dashboard' && (
              <button 
                onClick={handleRefreshAll}
                className="btn-ghost flex items-center space-x-2"
                disabled={loadingStats || loadingDetections}
              >
                <Icons.Settings className={`h-4 w-4 ${(loadingStats || loadingDetections) ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            )}
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="glass-strong rounded-xl mb-8 p-2">
          <nav className="flex space-x-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-green-500/20 text-green-400 shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo das Seções */}
        <div className="space-y-8">
          {/* Error Messages para Dashboard */}
          {activeSection === 'dashboard' && showError && (
            <div className="animate-fade-in">
              <ErrorMessage 
                error={showError} 
                onRetry={() => setShowError('')} 
              />
            </div>
          )}

          {activeSection === 'dashboard' && statsError && (
            <div className="animate-fade-in">
              <ErrorMessage 
                error={`Erro nas estatísticas: ${statsError}`} 
                onRetry={() => refreshStats()} 
              />
            </div>
          )}

          {activeSection === 'dashboard' && detectionsError && (
            <div className="animate-fade-in">
              <ErrorMessage 
                error={`Erro nas detecções: ${detectionsError}`} 
                onRetry={() => refreshDetections()} 
              />
            </div>
          )}

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Cards with Suspense */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Suspense fallback={<LoadingSkeleton className="h-32" />}>
                  <StatsCards 
                    stats={stats}
                    loading={loadingStats}
                    planLimits={planLimits}
                  />
                </Suspense>
              </div>

              {/* Recent Detections with Suspense */}
              <Suspense fallback={<LoadingSkeleton className="h-64" />}>
                <RecentDetections 
                  detections={recentDetections || []}
                  loading={loadingDetections}
                />
              </Suspense>

              {/* Quick Actions with Suspense */}
              <Suspense fallback={<LoadingSkeleton className="h-32" />}>
                <QuickActions />
              </Suspense>
            </div>
          )}

          {/* Domains Section */}
          {activeSection === 'domains' && (
            <div className="animate-fade-in">
              <DomainsSection user={user} profile={profile} />
            </div>
          )}

          {/* Scripts Section */}
          {activeSection === 'scripts' && (
            <div className="animate-fade-in">
              <ScriptsSection user={user} profile={profile} />
            </div>
          )}

          {/* Actions Section */}
          {activeSection === 'actions' && (
            <div className="animate-fade-in">
              <ActionsSection />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 