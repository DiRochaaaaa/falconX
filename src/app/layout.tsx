import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Falcon X - Proteja seus funis contra clones',
  description: 'Sistema avançado de proteção anti-clone para funis de vendas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body 
        className="antialiased" 
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  )
} 