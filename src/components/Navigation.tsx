'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Icons } from './Icons'

interface NavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const { profile, signOut } = useAuth()
  const router = useRouter()
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
  const isActiveLink = (section: string) => {
    return activeSection === section
  }

  // Classe para links ativos
  const getLinkClass = (section: string) => {
    const baseClass =
      'px-3 py-2 rounded-md text-sm font-medium transition-colors border-b-2 flex items-center cursor-pointer'
    if (isActiveLink(section)) {
      return `${baseClass} text-white border-green-500 bg-green-500/10`
    }
    return `${baseClass} text-gray-300 hover:text-green-400 border-transparent hover:border-green-500/50`
  }

  // Classe para links mobile ativos
  const getMobileLinkClass = (section: string) => {
    const baseClass =
      'block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center cursor-pointer'
    if (isActiveLink(section)) {
      return `${baseClass} text-white bg-green-500/20`
    }
    return `${baseClass} text-gray-300 hover:text-green-400 hover:bg-white/5`
  }

  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="glass-strong relative sticky top-0 z-50 border-b border-green-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1
                className="text-gradient cursor-pointer text-2xl font-bold transition-opacity hover:opacity-80"
                onClick={() => handleSectionChange('dashboard')}
              >
                Falcon X
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <div
                  className={getLinkClass('dashboard')}
                  onClick={() => handleSectionChange('dashboard')}
                >
                  <Icons.Dashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </div>
                <div
                  className={getLinkClass('domains')}
                  onClick={() => handleSectionChange('domains')}
                >
                  <Icons.Globe className="mr-2 h-4 w-4" />
                  Domínios
                </div>
                <div
                  className={getLinkClass('scripts')}
                  onClick={() => handleSectionChange('scripts')}
                >
                  <Icons.Code className="mr-2 h-4 w-4" />
                  Scripts
                </div>
                <div
                  className={getLinkClass('actions')}
                  onClick={() => handleSectionChange('actions')}
                >
                  <Icons.Lightning className="mr-2 h-4 w-4" />
                  Ações
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center rounded-lg p-2 text-sm text-white transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <div className="bg-gradient-green mr-3 rounded-full p-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {profile?.full_name || profile?.email}
                    </div>
                    <div className="text-xs capitalize text-green-400">
                      {profile?.plan_type || 'free'}
                    </div>
                  </div>
                  <svg
                    className="ml-2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="glass-strong z-dropdown absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-green-500/20 shadow-lg">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSectionChange('profile')
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex items-center">
                          <Icons.User className="mr-3 h-4 w-4 text-green-400" />
                          Perfil
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSectionChange('settings')
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex items-center">
                          <Icons.Settings className="mr-3 h-4 w-4 text-green-400" />
                          Configurações
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSectionChange('billing')
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex items-center">
                          <Icons.CreditCard className="mr-3 h-4 w-4 text-green-400" />
                          Faturamento
                        </div>
                      </button>
                      <div className="my-1 border-t border-gray-700"></div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSignOut()
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <div className="flex items-center">
                          <Icons.Logout className="mr-3 h-4 w-4" />
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
              className="p-2 text-gray-300 hover:text-green-400 focus:text-green-400 focus:outline-none"
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
          <div className="border-t border-green-500/20 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              <div
                className={getMobileLinkClass('dashboard')}
                onClick={() => handleSectionChange('dashboard')}
              >
                <Icons.Dashboard className="mr-3 h-5 w-5" />
                Dashboard
              </div>
              <div
                className={getMobileLinkClass('domains')}
                onClick={() => handleSectionChange('domains')}
              >
                <Icons.Globe className="mr-3 h-5 w-5" />
                Domínios
              </div>
              <div
                className={getMobileLinkClass('scripts')}
                onClick={() => handleSectionChange('scripts')}
              >
                <Icons.Code className="mr-3 h-5 w-5" />
                Scripts
              </div>
              <div
                className={getMobileLinkClass('actions')}
                onClick={() => handleSectionChange('actions')}
              >
                <Icons.Lightning className="mr-3 h-5 w-5" />
                Ações
              </div>

              <div className="my-2 border-t border-gray-700"></div>

              <div
                className={getMobileLinkClass('profile')}
                onClick={() => handleSectionChange('profile')}
              >
                <Icons.User className="mr-3 h-5 w-5" />
                Perfil
              </div>
              <div
                className={getMobileLinkClass('settings')}
                onClick={() => handleSectionChange('settings')}
              >
                <Icons.Settings className="mr-3 h-5 w-5" />
                Configurações
              </div>
              <div
                className={getMobileLinkClass('billing')}
                onClick={() => handleSectionChange('billing')}
              >
                <Icons.CreditCard className="mr-3 h-5 w-5" />
                Faturamento
              </div>

              <div className="my-2 border-t border-gray-700"></div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleSignOut()
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <div className="flex items-center">
                  <Icons.Logout className="mr-3 h-5 w-5" />
                  Sair
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
