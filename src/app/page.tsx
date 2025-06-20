'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icons } from '@/components/Icons'

export default function Home() {
  return (
    <div className="bg-gradient-main min-h-screen">
      {/* Header */}
      <motion.header 
        className="glass-strong sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <motion.div 
              className="text-2xl font-bold text-gradient cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Falcon X
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-ghost">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary">
                <Icons.Shield className="h-4 w-4" />
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl text-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-falcon-500/10 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-falcon-400/5 blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [360, 180, 0],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="mb-8 text-5xl font-bold text-white md:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            >
              Proteja seus{' '}
              <motion.span 
                className="text-gradient"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              >
                Funnels
              </motion.span>
              <br />
              contra Clones
            </motion.h1>
            
            <motion.p 
              className="mx-auto mb-12 max-w-3xl text-xl text-gray-300 lg:text-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            >
              Detecte automaticamente quando alguém copia seu funil de vendas e tome ações imediatas
              para proteger seu negócio com nossa tecnologia de ponta.
            </motion.p>
            
            <motion.div 
              className="flex flex-col justify-center gap-6 sm:flex-row"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/register"
                  className="btn-primary flex items-center justify-center gap-3 px-8 py-4 text-lg shadow-xl shadow-falcon-500/25"
                >
                  <Icons.Shield className="h-6 w-6" />
                  Começar Grátis
                  <Icons.ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link href="#features" className="btn-secondary px-8 py-4 text-lg">
                  <Icons.Eye className="h-5 w-5" />
                  Ver Recursos
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating stats */}
          <motion.div 
            className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          >
            {[
              { label: "Clones Detectados", value: "10,000+", icon: Icons.Shield },
              { label: "Sites Protegidos", value: "2,500+", icon: Icons.Globe },
              { label: "Ações Automáticas", value: "50,000+", icon: Icons.Lightning }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="card p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1 + index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-falcon-500/20 rounded-2xl flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-falcon-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="mb-6 text-4xl font-bold text-white lg:text-6xl">
              Como o <span className="text-gradient">Falcon X</span> Protege Você
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-400 lg:text-2xl">
              Sistema completo de detecção e proteção contra clones de funnels com tecnologia de ponta
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Icons.Eye,
                title: "Detecção em Tempo Real",
                description: "Monitore a web 24/7 em busca de cópias do seu funil. Receba alertas instantâneos quando um clone for detectado.",
                color: "falcon",
                delay: 0
              },
              {
                icon: Icons.ShieldCheck,
                title: "Script Invisível",
                description: "Código obfuscado e invisível que não afeta a performance do seu site, detectando todas as tentativas de clonagem.",
                color: "falcon",
                delay: 0.2
              },
              {
                icon: Icons.Lightning,
                title: "Ações Automáticas",
                description: "Configure ações automáticas como redirecionamento, bloqueio de acesso ou notificações legais aos clones.",
                color: "falcon",
                delay: 0.4
              },
              {
                icon: Icons.BarChart,
                title: "Dashboard Avançado",
                description: "Painel completo com estatísticas detalhadas, gráficos em tempo real e relatórios de detecção.",
                color: "falcon",
                delay: 0.6
              },
              {
                icon: Icons.Settings,
                title: "Configuração Flexível",
                description: "Ajuste triggers, ações e parâmetros de detecção conforme suas necessidades específicas.",
                color: "falcon",
                delay: 0.8
              },
              {
                icon: Icons.Users,
                title: "Suporte Premium",
                description: "Equipe especializada pronta para ajudar você a configurar e otimizar sua proteção.",
                color: "falcon",
                delay: 1
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="card card-hover p-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: feature.delay }}
                whileHover={{ scale: 1.02, y: -10 }}
              >
                <motion.div 
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-falcon-500/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon className="h-8 w-8 text-falcon-400" />
                </motion.div>
                <h3 className="mb-4 text-xl font-semibold text-white lg:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 lg:py-32 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="mb-6 text-4xl font-bold text-white lg:text-6xl">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-400 lg:text-2xl">
              Escolha o plano ideal para proteger seus funnels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Gratuito",
                price: "R$ 0",
                period: "/mês",
                description: "Perfeito para começar",
                features: ["1 clone/mês", "Todas as funcionalidades", "Dashboard completo", "Suporte email"],
                cta: "Começar Grátis",
                popular: false,
                color: "gray"
              },
              {
                name: "Prata",
                price: "R$ 79",
                period: "/mês",
                description: "Ideal para pequenos negócios",
                features: ["10 clones/mês", "R$1 por extra", "Todas as funcionalidades", "Suporte prioritário"],
                cta: "Começar",
                popular: true,
                color: "falcon"
              },
              {
                name: "Diamante",
                price: "R$ 299",
                period: "/mês",
                description: "Para grandes empresas",
                features: ["50 clones/mês", "R$1 por extra", "Relatórios avançados", "Suporte dedicado"],
                cta: "Começar",
                popular: false,
                color: "gray"
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`card p-8 relative ${plan.popular ? 'border-falcon-500/50 bg-falcon-500/5' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -10 }}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="bg-falcon-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      POPULAR
                    </span>
                  </motion.div>
                )}
                
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-semibold text-white">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-falcon-400">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="mb-8 text-sm text-gray-400">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex}
                        className="flex items-center gap-3 text-gray-300"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + featureIndex * 0.1 }}
                      >
                        <div className="w-5 h-5 bg-falcon-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icons.Check className="h-3 w-3 text-white" />
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/register" 
                    className={plan.popular ? "btn-primary w-full" : "btn-secondary w-full"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 px-8 py-4">
              <Icons.ShieldCheck className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-300 font-medium">
                💎 Proteção garantida ou seu dinheiro de volta em 30 dias
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32">
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="card p-12 bg-gradient-to-r from-falcon-500/10 to-falcon-600/5 border-falcon-500/20">
            <motion.h2 
              className="mb-6 text-4xl font-bold text-white lg:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Pronto para Proteger seu Negócio?
            </motion.h2>
            <motion.p 
              className="mb-8 text-xl text-gray-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              Junte-se a milhares de empreendedores que já protegem seus funnels com o Falcon X
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="btn-primary px-12 py-4 text-xl shadow-2xl shadow-falcon-500/25"
              >
                <Icons.Shield className="h-6 w-6" />
                Começar Agora Gratuitamente
                <Icons.ArrowRight className="h-6 w-6" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-2xl font-bold text-gradient mb-4">Falcon X</div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A maneira mais inteligente de proteger seus funnels contra clones. 
              Tecnologia de ponta, fácil de usar, resultados garantidos.
            </p>
          </motion.div>
          <motion.div 
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            © 2024 Falcon X. Todos os direitos reservados. Protegendo seu negócio com excelência.
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
