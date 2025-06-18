'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icons } from '@/components/Icons'
import { User, UserProfile, generateProtectionScript } from '@/modules/dashboard'

interface ScriptsSectionProps {
  user: User | null
  profile: UserProfile | null
}

export default function ScriptsSection({ user }: ScriptsSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const generateScript = useCallback(async () => {
    if (!user?.id) return

    setIsGenerating(true)
    try {
      // Simular geração de script
      await new Promise(resolve => setTimeout(resolve, 1000))

      const script = generateProtectionScript(user.id, window.location.origin)
      setGeneratedScript(script)
    } finally {
      setIsGenerating(false)
    }
  }, [user?.id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback para navegadores sem clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = generatedScript
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // Gerar script automaticamente quando o componente carrega
  useEffect(() => {
    if (user?.id && !generatedScript && !isGenerating) {
      generateScript()
    }
  }, [user?.id, generatedScript, isGenerating, generateScript])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Scripts de Proteção</h2>
        <p className="text-gray-300">Gere e gerencie os scripts de proteção para seus domínios</p>
      </div>

      <div className="glass rounded-xl p-6">
        {isGenerating ? (
          <div className="py-8 text-center">
            <div className="loading-spinner mx-auto mb-4 h-16 w-16 text-green-400"></div>
            <h3 className="mb-2 text-xl font-semibold text-white">Gerando seu script...</h3>
            <p className="text-gray-400">Criando script personalizado para sua proteção</p>
          </div>
        ) : !generatedScript ? (
          <div className="py-8 text-center">
            <Icons.Code className="mx-auto mb-4 h-16 w-16 text-green-400" />
            <h3 className="mb-2 text-xl font-semibold text-white">Script Global</h3>
            <p className="mb-6 text-gray-400">
              Script único que funciona em todos os seus domínios
            </p>
            <button onClick={generateScript} className="btn btn-primary">
              <Icons.Code className="mr-2 h-4 w-4" />
              Gerar Novo Script
            </button>
          </div>
        ) : null}

        {generatedScript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white">✅ Script Pronto para Uso</h4>
                <p className="text-sm text-gray-400">Copie e cole antes do &lt;/body&gt;</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={generateScript} className="btn-ghost text-sm">
                  <Icons.RefreshCw className="mr-1 h-4 w-4" />
                  Regenerar
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`btn-primary text-sm ${copySuccess ? 'bg-green-600' : ''}`}
                >
                  {copySuccess ? (
                    <>
                      <Icons.Check className="mr-1 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="mr-1 h-4 w-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4">
              <pre className="text-sm text-gray-300">
                <code>{generatedScript}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-200">
                <strong>Como usar:</strong> Copie este script e cole antes do fechamento da tag
                &lt;/body&gt; em todos os seus funis de vendas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
