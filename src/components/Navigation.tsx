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

  // Main navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'domains', label: 'Domínios', icon: Icons.Globe },
    { id: 'scripts', label: 'Scripts', icon: Icons.Code },
    { id: 'actions', label: 'Ações', icon: Icons.Lightning },
  ]

  // Secondary navigation items
  const secondaryItems = [
    { id: 'profile', label: 'Perfil', icon: Icons.User },
    { id: 'settings', label: 'Configurações', icon: Icons.Settings },
    { id: 'billing', label: 'Faturamento', icon: Icons.CreditCard },
  ]

  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="text-2xl font-bold text-gradient cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSectionChange('dashboard')}
            >
              Falcon X
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`btn-apple flex items-center gap-2 font-medium transition-all ${
                      isActive
                        ? 'bg-falcon-500 text-white shadow-lg shadow-falcon-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-falcon-500 to-falcon-600 rounded-full flex items-center justify-center">
                  <Icons.User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    {profile?.full_name || profile?.email || 'Usuário'}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    Plano {profile?.plan?.name || 'Gratuito'}
                  </div>
                </div>
                <Icons.ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down">
                  <div className="py-2">
                    {secondaryItems.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionChange(item.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-falcon-500/10 transition-colors"
                        >
                          <IconComponent className="h-4 w-4 text-falcon-400" />
                          {item.label}
                        </button>
                      )
                    })}
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Icons.Logout className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden mobile-header">
        <div className="flex items-center justify-between px-4 h-14">
          <div
            className="text-xl font-bold text-gradient cursor-pointer"
            onClick={() => handleSectionChange('dashboard')}
          >
            Falcon X
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-falcon-500 to-falcon-600 rounded-full flex items-center justify-center">
              <Icons.User className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {(profile?.full_name || profile?.email || 'Usuário').split(' ')[0]}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {profile?.plan?.name || 'Gratuito'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden mobile-nav">
        <div className="grid grid-cols-4 h-16">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'text-falcon-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-falcon-500/20' : ''
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Secondary Menu Floating Button */}
      <div className="md:hidden floating-menu">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-14 h-14 bg-falcon-500 hover:bg-falcon-600 rounded-full shadow-lg shadow-falcon-500/25 flex items-center justify-center transition-all ${
              isMenuOpen ? 'rotate-45' : ''
            }`}
          >
            <Icons.Plus className="h-6 w-6 text-white" />
          </button>

          {/* Floating Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-16 right-0 w-48 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="py-2">
                {secondaryItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-falcon-500/10 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 text-falcon-400" />
                      {item.label}
                    </button>
                  )
                })}
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Icons.Logout className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
