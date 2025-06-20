'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'

export default function DebugTokenPage() {
  const [session, setSession] = useState<any>(null)
  const [tokenDecoded, setTokenDecoded] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTokenInfo() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        if (session?.access_token) {
          // Decodificar JWT manualmente (só a parte payload)
          const payload = session.access_token.split('.')[1]
          const decoded = JSON.parse(atob(payload))
          setTokenDecoded(decoded)
        }
      } catch (error) {
        console.error('Erro ao obter token:', error)
      } finally {
        setLoading(false)
      }
    }

    getTokenInfo()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Token copiado para clipboard!')
  }

  if (loading) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-8">
          <div className="animate-spin h-8 w-8 border-4 border-green-500/20 border-t-green-500 rounded-full mx-auto"></div>
          <p className="text-white mt-4">Carregando informações do token...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Icons.Warning className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Não Autenticado</h2>
          <p className="text-gray-400 mb-4">Você precisa fazer login para ver seu token JWT</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-main min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔐 Debug Token JWT</h1>
          <p className="text-gray-400">Informações detalhadas sobre seu token de autenticação</p>
        </div>

        {/* Informações da Sessão */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Icons.User className="h-5 w-5 mr-2 text-green-500" />
            Informações do Usuário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">User ID:</span>
              <div className="text-white font-mono bg-black/20 p-2 rounded mt-1 break-all">
                {session.user.id}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <div className="text-white font-mono bg-black/20 p-2 rounded mt-1">
                {session.user.email}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Último Login:</span>
              <div className="text-white font-mono bg-black/20 p-2 rounded mt-1">
                {new Date(session.user.last_sign_in_at || '').toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Expiração do Token:</span>
              <div className="text-white font-mono bg-black/20 p-2 rounded mt-1">
                {new Date((tokenDecoded?.exp || 0) * 1000).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Token JWT */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Icons.Key className="h-5 w-5 mr-2 text-blue-500" />
            Seu Token JWT
          </h2>
          <div className="relative">
            <textarea
              className="w-full h-32 bg-black/20 text-white font-mono text-xs p-4 rounded border border-gray-600 resize-none"
              value={session.access_token}
              readOnly
            />
            <button
              onClick={() => copyToClipboard(session.access_token)}
              className="absolute top-2 right-2 btn-ghost btn-sm"
              title="Copiar token"
            >
              <Icons.Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ⚠️ <strong>IMPORTANTE:</strong> Nunca compartilhe este token! Ele dá acesso total à sua conta.
          </p>
        </div>

        {/* Token Decodificado */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Icons.Code className="h-5 w-5 mr-2 text-purple-500" />
            Token Decodificado (Payload)
          </h2>
          <pre className="bg-black/20 text-green-400 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(tokenDecoded, null, 2)}
          </pre>
        </div>

        {/* Como Usar */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Icons.Info className="h-5 w-5 mr-2 text-orange-500" />
            Como Usar o Token
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-white font-semibold mb-2">1. Em requisições HTTP:</h3>
              <pre className="bg-black/20 text-gray-300 p-3 rounded text-xs overflow-x-auto">
{`fetch('/api/plan-limits?userId=${session.user.id}', {
  headers: {
    'Authorization': 'Bearer ${session.access_token.substring(0, 30)}...'
  }
})`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">2. Validação do Token:</h3>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• O token expira em <strong>1 hora</strong></li>
                <li>• Supabase renova automaticamente quando necessário</li>
                <li>• APIs verificam a assinatura para garantir autenticidade</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">3. Segurança:</h3>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• ✅ Token é enviado via HTTPS</li>
                <li>• ✅ Expira automaticamente</li>
                <li>• ✅ Não contém senha</li>
                <li>• ❌ Nunca compartilhe com terceiros</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  )
} 