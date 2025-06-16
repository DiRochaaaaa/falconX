'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Icons } from './Icons'

export default function Navigation() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Fechar menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Função para verificar se o link está ativo
  const isActiveLink = (path: string) => {
    return pathname === path
  }

  // Classe para links ativos
  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors border-b-2 flex items-center"
    if (isActiveLink(path)) {
      return `${baseClass} text-white border-green-500 bg-green-500/10`
    }
    return `${baseClass} text-gray-300 hover:text-green-400 border-transparent hover:border-green-500/50`
  }

  // Classe para links mobile ativos
  const getMobileLinkClass = (path: string) => {
    const baseClass = "block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
    if (isActiveLink(path)) {
      return `${baseClass} text-white bg-green-500/20`
    }
    return `${baseClass} text-gray-300 hover:text-green-400 hover:bg-white/5`
  }

  return (
    <nav className="glass-strong border-b border-green-500/20 relative z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-gradient cursor-pointer hover:opacity-80 transition-opacity">
                  Falcon X
                </h1>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                  <Icons.Dashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link href="/domains" className={getLinkClass('/domains')}>
                  <Icons.Globe className="h-4 w-4 mr-2" />
                  Domínios
                </Link>
                <Link href="/scripts" className={getLinkClass('/scripts')}>
                  <Icons.Code className="h-4 w-4 mr-2" />
                  Scripts
                </Link>
                <Link href="/actions" className={getLinkClass('/actions')}>
                  <Icons.Lightning className="h-4 w-4 mr-2" />
                  Ações
                </Link>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 p-2 hover:bg-white/5 transition-colors"
                >
                  <div className="bg-gradient-green rounded-full p-2 mr-3">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{profile?.full_name || profile?.email}</div>
                    <div className="text-xs text-green-400 capitalize">{profile?.plan_type || 'free'}</div>
                  </div>
                  <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg glass-strong border border-green-500/20 z-dropdown">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icons.User className="h-4 w-4 mr-3 text-green-400" />
                          Perfil
                        </div>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icons.Settings className="h-4 w-4 mr-3 text-green-400" />
                          Configurações
                        </div>
                      </Link>
                      <Link
                        href="/billing"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icons.CreditCard className="h-4 w-4 mr-3 text-green-400" />
                          Faturamento
                        </div>
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSignOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <div className="flex items-center">
                          <Icons.Logout className="h-4 w-4 mr-3" />
                          Sair
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-green-400 focus:outline-none focus:text-green-400 p-2"
            >
              {isMobileMenuOpen ? (
                <Icons.X className="h-6 w-6" />
              ) : (
                <Icons.Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-green-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/dashboard"
                className={getMobileLinkClass('/dashboard')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icons.Dashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/domains"
                className={getMobileLinkClass('/domains')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icons.Globe className="h-5 w-5 mr-3" />
                Domínios
              </Link>
              <Link
                href="/scripts"
                className={getMobileLinkClass('/scripts')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icons.Code className="h-5 w-5 mr-3" />
                Scripts
              </Link>
              <Link
                href="/actions"
                className={getMobileLinkClass('/actions')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icons.Lightning className="h-5 w-5 mr-3" />
                Ações
              </Link>
            </div>
            
            {/* Mobile User Menu */}
            <div className="pt-4 pb-3 border-t border-green-500/20">
              <div className="flex items-center px-5">
                <div className="bg-gradient-green rounded-full p-2 mr-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-medium text-white">{profile?.full_name || profile?.email}</div>
                  <div className="text-sm text-green-400 capitalize">{profile?.plan_type || 'free'}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Configurações
                </Link>
                <Link
                  href="/billing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Faturamento
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 