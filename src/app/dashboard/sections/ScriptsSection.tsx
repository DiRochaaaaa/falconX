'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icons } from '@/components/Icons'
import {
  User,
  DashboardUser,
  generateProtectionScript,
} from '@/modules/dashboard'

interface ScriptsSectionProps {
  user: User | null
  profile: DashboardUser | null
}

export default function ScriptsSection({ user }: ScriptsSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const generateScript = useCallback(async () => {
    if (!user?.id) return

    setIsGenerating(true)
    try {
      const script = await generateProtectionScript(user.id, window.location.origin)
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-gradient mb-2 text-xl md:text-2xl font-bold">Script de Proteção</h2>
        <p className="text-sm md:text-base text-gray-300">
          Script ultra-compacto e ofuscado para máxima proteção e discrição
        </p>
      </div>

      {/* Card principal do script */}
      <div className="glass rounded-xl p-4 md:p-6">
        {isGenerating ? (
          <div className="py-6 md:py-8 text-center">
            <div className="loading-spinner mx-auto mb-4 h-12 w-12 md:h-16 md:w-16 text-green-400"></div>
            <h3 className="mb-2 text-lg md:text-xl font-semibold text-white">Gerando seu script...</h3>
            <p className="text-sm md:text-base text-gray-400">Criando script personalizado para sua proteção</p>
          </div>
        ) : !generatedScript ? (
          <div className="py-6 md:py-8 text-center">
            <Icons.Code className="mx-auto mb-4 h-12 w-12 md:h-16 md:w-16 text-green-400" />
            <h3 className="mb-2 text-lg md:text-xl font-semibold text-white">Script Personalizado</h3>
            <p className="mb-6 text-sm md:text-base text-gray-400">
              Script único que funciona em todos os seus domínios cadastrados
            </p>
            <button onClick={generateScript} className="btn btn-primary">
              <Icons.Code className="mr-2 h-4 w-4" />
              Gerar Script
            </button>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Header do script gerado */}
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <h4 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                  <Icons.Shield className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  Seu Script de Proteção
                </h4>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Totalmente ofuscado • Parece analytics comum • Ultra-rápido
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={generateScript} 
                  className="btn-ghost text-xs md:text-sm px-3 py-2"
                  disabled={isGenerating}
                >
                  <Icons.RefreshCw className={`mr-1 h-3 w-3 md:h-4 md:w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerar
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`btn-primary text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 ${copySuccess ? 'bg-green-600' : ''}`}
                >
                  {copySuccess ? (
                    <>
                      <Icons.Check className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Script code box */}
            <div className="overflow-x-auto rounded-lg bg-gray-900 p-3 md:p-4">
              <pre className="text-xs md:text-sm text-green-400 break-all whitespace-pre-wrap">
                <code>{generatedScript}</code>
              </pre>
            </div>

            {/* Vantagens em grid responsivo */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <div className="mb-2 flex items-center space-x-2">
                  <Icons.EyeOff className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                  <span className="text-xs md:text-sm font-medium text-green-300">Stealth</span>
                </div>
                <p className="text-xs text-green-200">
                  Parece um script de analytics comum. Não desperta suspeitas.
                </p>
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                <div className="mb-2 flex items-center space-x-2">
                  <Icons.CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                  <span className="text-xs md:text-sm font-medium text-blue-300">Ofuscado</span>
                </div>
                <p className="text-xs text-blue-200">
                  Código completamente ofuscado. Impossível de entender a lógica.
                </p>
              </div>

              <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                <div className="mb-2 flex items-center space-x-2">
                  <Icons.Zap className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                  <span className="text-xs md:text-sm font-medium text-purple-300">Performance</span>
                </div>
                <p className="text-xs text-purple-200">
                  Carregamento assíncrono. Cache otimizado. Ultra-rápido.
                </p>
              </div>
            </div>

            {/* Instruções de uso responsivas */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 md:p-4">
              <h5 className="mb-3 font-medium text-blue-200 flex items-center gap-2">
                <Icons.CheckSquare className="h-4 w-4" />
                Como implementar:
              </h5>
              <ol className="space-y-2 text-xs md:text-sm text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center mt-0.5">1</span>
                  <span>Copie o script acima usando o botão &quot;Copiar&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center mt-0.5">2</span>
                  <span>Cole antes do fechamento da tag <code className="bg-blue-900/50 px-1 rounded">&lt;/body&gt;</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center mt-0.5">3</span>
                  <span>Publique em todos os seus funis de vendas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center mt-0.5">4</span>
                  <span>Monitore as detecções no dashboard</span>
                </li>
              </ol>
            </div>

            {/* Dica importante */}
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 md:p-4">
              <div className="flex items-start gap-2">
                <Icons.AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <h6 className="font-medium text-yellow-300 text-sm">💡 Dica importante</h6>
                  <p className="text-xs md:text-sm text-yellow-200 mt-1">
                    Instale o script em <strong>todas as páginas</strong> dos seus funis para proteção completa. 
                    O mesmo script funciona em todos os domínios cadastrados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
