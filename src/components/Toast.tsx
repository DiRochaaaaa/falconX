'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Icons } from './Icons'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto remove após duração
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsRemoving(true)
        setTimeout(() => {
          onRemove(toast.id)
        }, 300)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id, onRemove])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // Tempo da animação de saída
  }

  const getToastStyles = () => {
    const baseStyles = 'border-l-4 shadow-lg backdrop-blur-sm'
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-500/10 border-green-500 text-green-100`
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-500 text-red-100`
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-500 text-yellow-100`
      case 'info':
        return `${baseStyles} bg-blue-500/10 border-blue-500 text-blue-100`
      default:
        return `${baseStyles} bg-gray-500/10 border-gray-500 text-gray-100`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icons.Check className="h-5 w-5 text-green-400" />
      case 'error':
        return <Icons.Warning className="h-5 w-5 text-red-400" />
      case 'warning':
        return <Icons.Warning className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <Icons.Dashboard className="h-5 w-5 text-blue-400" />
      default:
        return <Icons.Dashboard className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`rounded-lg p-4 mb-3 ${getToastStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 flex-1">
            <h4 className="font-medium text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            )}
            
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-sm underline mt-2 hover:no-underline transition-all"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-white transition-colors"
          >
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      duration: 5000, // 5 segundos por padrão
      ...toastData
    }
    
    setToasts(prev => [...prev, toast])
    
    // Limitar número de toasts visíveis
    if (toasts.length >= 5) {
      setToasts(prev => prev.slice(1))
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 7000 }) // Erros ficam mais tempo
  }

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
} 