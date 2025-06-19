'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-main min-h-screen">
      {/* Header */}
      <header className="glass-strong border-b border-green-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-gradient text-2xl font-bold">Falcon X</h1>
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
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="animate-fade-in">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Proteja seus <span className="text-gradient">Funnels</span>
              <br />
              contra Clones
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300">
              Detecte automaticamente quando alguém copia seu funil de vendas e tome ações imediatas
              para proteger seu negócio.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Começar Grátis
              </Link>
              <Link href="#features" className="btn-secondary px-8 py-4 text-lg">
                Ver Recursos
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-glow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-green-500/10 blur-3xl"></div>
          <div
            className="animate-glow absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-green-400/5 blur-3xl"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-in mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Como o <span className="text-gradient">Falcon X</span> Protege Você
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Sistema completo de detecção e proteção contra clones de funnels
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card card-hover animate-slide-in">
              <div className="bg-gradient-green mb-6 flex h-16 w-16 items-center justify-center rounded-lg p-4">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Detecção em Tempo Real</h3>
              <p className="text-gray-400">
                Monitore a web 24/7 em busca de cópias do seu funil. Receba alertas instantâneos
                quando um clone for detectado.
              </p>
            </div>

            <div className="card card-hover animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-green-light mb-6 flex h-16 w-16 items-center justify-center rounded-lg p-4">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Script Invisível</h3>
              <p className="text-gray-400">
                Código obfuscado e invisível que não afeta a performance do seu site, e detecta
                todas as tentativas de clonagem.
              </p>
            </div>

            <div className="card card-hover animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-green-500 p-4">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Ações Automáticas</h3>
              <p className="text-gray-400">
                Configure ações automáticas como envio de DMCA, notificações legais ou bloqueio de
                acesso aos clones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gradient-card px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-in mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">Planos para Todos os Tamanhos</h2>
            <p className="text-xl text-gray-400">
              Escolha o plano ideal para proteger seus funnels - todas as funcionalidades em todos os planos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {/* Free Plan */}
            <div className="card card-hover animate-fade-in">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-white">Gratuito</h3>
                <div className="mb-4 text-3xl font-bold text-green-400">
                  R$0<span className="text-sm text-gray-400">/mês</span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    1 clonador/mês
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Todas as funcionalidades
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Dashboard completo
                  </li>
                </ul>
                
                <Link href="/register" className="btn-secondary">
                  Começar Grátis
                </Link>
              </div>
            </div>

            {/* Bronze Plan */}
            <div className="card card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-white">Bronze</h3>
                <div className="mb-4 text-3xl font-bold text-green-400">
                  R$39<span className="text-sm text-gray-400">/mês</span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    5 clonadores/mês
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    R$1 por extra
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Todas as funcionalidades
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Começar
                </Link>
              </div>
            </div>

            {/* Silver Plan */}
            <div className="card card-hover animate-fade-in border-2 border-green-500/30" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </span>
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-white">Prata</h3>
                <div className="mb-4 text-3xl font-bold text-green-400">
                  R$79<span className="text-sm text-gray-400">/mês</span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    10 clonadores/mês
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    R$1 por extra
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Todas as funcionalidades
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Começar
                </Link>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="card card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-white">Ouro</h3>
                <div className="mb-4 text-3xl font-bold text-green-400">
                  R$149<span className="text-sm text-gray-400">/mês</span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    20 clonadores/mês
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    R$1 por extra
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Todas as funcionalidades
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Começar
                </Link>
              </div>
            </div>

            {/* Diamond Plan */}
            <div className="card card-hover animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-white">Diamante</h3>
                <div className="mb-4 text-3xl font-bold text-green-400">
                  R$299<span className="text-sm text-gray-400">/mês</span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    50 clonadores/mês
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    R$1 por extra
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-4 w-4 text-green-400"
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
                    Todas as funcionalidades
                  </li>
                </ul>
                <Link href="/register" className="btn-primary">
                  Começar
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-6 py-4">
              <svg className="mr-3 h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-400">
                <strong>Flexibilidade Total:</strong> Se ultrapassar seu limite mensal, pague apenas R$ 1,00 por clonador adicional detectado nos planos pagos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <h2 className="mb-6 text-4xl font-bold text-white">
              Pronto para Proteger seus Funnels?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Junte-se a centenas de empreendedores que já protegem seus negócios com o Falcon X
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Começar Agora - É Grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-gradient mb-4 text-xl font-bold">Falcon X</h3>
              <p className="text-gray-400">
                Proteja seus funnels contra clones com tecnologia avançada de detecção.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-400 transition-colors hover:text-white">
                    Documentação
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 transition-colors hover:text-white">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Contato
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Suporte</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 transition-colors hover:text-white">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-gray-400 transition-colors hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2024 Falcon X. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
