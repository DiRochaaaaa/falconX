import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Falcon X - Proteja seus funis contra clones',
  description: 'Sistema avançado de proteção anti-clone para funis de vendas',
  keywords: ['proteção', 'funnel', 'clone', 'detecção', 'segurança'],
  authors: [{ name: 'Falcon X Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* DNS Prefetch para Supabase */}
        <link rel="dns-prefetch" href="//supabase.co" />

        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon otimizado */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Meta tags para performance e mobile */}
        <meta name="theme-color" content="#10b981" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* NOVO: Meta tag adicional para prevenir zoom */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-gradient-main min-h-screen antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
