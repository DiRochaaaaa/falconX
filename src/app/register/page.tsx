'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      console.error('Erro no registro:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-gradient-main flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="card animate-fade-in text-center">
            <div className="bg-gradient-green mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full p-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Conta criada com sucesso!</h2>
            <p className="mb-4 text-gray-400">
              Bem-vindo ao Falcon X! Redirecionando para o dashboard...
            </p>
            <div className="loading-spinner mx-auto h-6 w-6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-main flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="animate-fade-in text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Falcon X</h1>
          <h2 className="mb-2 text-2xl font-semibold text-white">Criar sua conta</h2>
          <p className="text-gray-400">Comece a proteger seus funnels gratuitamente</p>
        </div>

        {/* Form */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="animate-fade-in rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-300">
                Nome Completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="input-primary"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-primary"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-primary"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-primary"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                Aceito os{' '}
                <a href="#" className="text-green-400 transition-colors hover:text-green-300">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-green-400 transition-colors hover:text-green-300">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2 h-4 w-4"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Criar Conta Grátis
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-2 text-gray-400">Ou</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="font-medium text-green-400 transition-colors hover:text-green-300"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="mb-4 text-center text-lg font-semibold text-white">
            Plano Gratuito Inclui:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="bg-gradient-green mr-3 rounded-full p-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">1 domínio monitorado</span>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-green mr-3 rounded-full p-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Detecção básica de clones</span>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-green mr-3 rounded-full p-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Dashboard com estatísticas</span>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-green mr-3 rounded-full p-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Suporte por email</span>
            </div>
          </div>
          <div className="glass-strong mt-4 rounded-lg border border-green-500/30 p-3">
            <p className="text-center text-xs text-green-400">
              ✨ Upgrade a qualquer momento para mais recursos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
