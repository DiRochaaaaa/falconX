'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function TestAuth() {
  const { user, profile, loading, initialized, error, isAuthenticated } = useAuth()
  const router = useRouter()

  return (
    <div className="bg-gradient-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-gradient mb-8 text-3xl font-bold">Teste de Autenticação</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Estado Atual */}
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-white">Estado Atual</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Loading:</span>
                <span className={loading ? 'text-orange-400' : 'text-green-400'}>
                  {loading ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Initialized:</span>
                <span className={initialized ? 'text-green-400' : 'text-orange-400'}>
                  {initialized ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error:</span>
                <span className={error ? 'text-red-400' : 'text-green-400'}>
                  {error || 'Nenhum'}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Usuário */}
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-white">Dados do Usuário</h2>
            {user ? (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">ID:</span>
                  <p className="break-all text-sm text-white">{user.id}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Criado em:</span>
                  <p className="text-white">{new Date(user.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Nenhum usuário logado</p>
            )}
          </div>

          {/* Perfil */}
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-white">Perfil</h2>
            {profile ? (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Nome:</span>
                  <p className="text-white">{profile.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Plano:</span>
                  <p className="capitalize text-white">{profile.plan_type}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white">{profile.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Nenhum perfil carregado</p>
            )}
          </div>

          {/* Ações */}
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-white">Ações</h2>
            <div className="space-y-3">
              <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">
                Ir para Dashboard
              </button>
              <button onClick={() => router.push('/login')} className="btn-secondary w-full">
                Ir para Login
              </button>
              <button onClick={() => window.location.reload()} className="btn-ghost w-full">
                Recarregar Página
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="card mt-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Debug Info</h2>
          <pre className="overflow-x-auto text-xs text-gray-300">
            {JSON.stringify(
              {
                user: user ? { id: user.id, email: user.email } : null,
                profile: profile
                  ? {
                      id: profile.id,
                      full_name: profile.full_name,
                      plan_type: profile.plan_type,
                    }
                  : null,
                loading,
                initialized,
                isAuthenticated,
                error,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}
