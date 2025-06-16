'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <header className="glass-strong border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient">Falcon X</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-ghost">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Proteja seus <span className="text-gradient">Funnels</span><br />
              contra Clones
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Detecte automaticamente quando alguém copia seu funil de vendas e tome ações imediatas para proteger seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Começar Grátis
              </Link>
              <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                Ver Recursos
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-glow" style={{animationDelay: '1s'}}></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4">
              Como o <span className="text-gradient">Falcon X</span> Protege Você
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Sistema completo de detecção e proteção contra clones de funnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover animate-slide-in">
              <div className="bg-gradient-green rounded-lg p-4 w-16 h-16 mb-6 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Detecção em Tempo Real</h3>
              <p className="text-gray-400">
                Monitore a web 24/7 em busca de cópias do seu funil. Receba alertas instantâneos quando um clone for detectado.
              </p>
            </div>

            <div className="card card-hover animate-slide-in" style={{animationDelay: '0.2s'}}>
              <div className="bg-gradient-green-light rounded-lg p-4 w-16 h-16 mb-6 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Script Invisível</h3>
              <p className="text-gray-400">
                Código obfuscado e invisível que não afeta a performance do seu site, mas detecta tentativas de clonagem.
              </p>
            </div>

            <div className="card card-hover animate-slide-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-4 w-16 h-16 mb-6 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Ações Automáticas</h3>
              <p className="text-gray-400">
                Configure ações automáticas como envio de DMCA, notificações legais ou bloqueio de acesso aos clones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-400">
              Escolha o plano ideal para proteger seus funnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="card card-hover animate-fade-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Gratuito</h3>
                <div className="text-3xl font-bold text-green-400 mb-4">$0<span className="text-sm text-gray-400">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1 domínio
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Detecção básica
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dashboard
                  </li>
                </ul>
                <Link href="/register" className="btn-secondary">
                  Começar Grátis
                </Link>
              </div>
            </div>

            {/* Bronze Plan */}
            <div className="card card-hover animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Bronze</h3>
                <div className="text-3xl font-bold text-green-400 mb-4">$29<span className="text-sm text-gray-400">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 domínios
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Detecção avançada
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ações básicas
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Escolher Bronze
                </Link>
              </div>
            </div>

            {/* Silver Plan */}
            <div className="card card-hover animate-fade-in border-green-400/40" style={{animationDelay: '0.2s'}}>
              <div className="absolute whitespace-nowrap -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-green text-white px-3 py-1 rounded-full text-xs font-medium">
                  Mais Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Silver</h3>
                <div className="text-3xl font-bold text-green-400 mb-4">$59<span className="text-sm text-gray-400">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    15 domínios
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Detecção premium
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ações automáticas
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Escolher Silver
                </Link>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="card card-hover animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Gold</h3>
                <div className="text-3xl font-bold text-green-400 mb-4">$99<span className="text-sm text-gray-400">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Domínios ilimitados
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    IA avançada
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Suporte prioritário
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Escolher Gold
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para Proteger seus Funnels?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Comece gratuitamente e veja como o Falcon X pode proteger seu negócio contra clones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Começar Grátis Agora
              </Link>
              <Link href="/login" className="btn-ghost text-lg px-8 py-4">
                Já tenho uma conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-green-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gradient mb-4">Falcon X</h3>
              <p className="text-gray-400 text-sm">
                Proteja seus funnels de vendas contra clones com detecção em tempo real e ações automáticas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Termos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Falcon X. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 