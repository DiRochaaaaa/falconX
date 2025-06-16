'use client'

import Navigation from './Navigation'
import ProtectedRoute from './ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-main">
        <Navigation />
        <main className="transition-all duration-200 ease-in-out">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 