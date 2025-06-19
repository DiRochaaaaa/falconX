'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icons } from '@/components/Icons'
import {
  User,
  UserProfile,
  generateProtectionScript,
  generateLegacyProtectionScript,
} from '@/modules/dashboard'

interface ScriptsSectionProps {
  user: User | null
  profile: UserProfile | null
}

export default function ScriptsSection({ user }: ScriptsSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [showLegacyScript, setShowLegacyScript] = useState(false)
  const [legacyScript, setLegacyScript] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const generateScript = useCallback(async () => {
    if (!user?.id) return

    setIsGenerating(true)
    try {
      // ✅ AGORA COM INSERÇÃO NO BANCO
      const script = await generateProtectionScript(user.id, window.location.origin)
      const legacy = generateLegacyProtectionScript(user.id, window.location.origin)

      setGeneratedScript(script)
      setLegacyScript(legacy)
    } finally {
      setIsGenerating(false)
    }
  }, [user?.id])

  const copyToClipboard = async (scriptToCopy: string = generatedScript) => {
    try {
      await navigator.clipboard.writeText(scriptToCopy)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback para navegadores sem clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = scriptToCopy
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
        <p className="text-gray-300">Script ultra-compacto e ofuscado para máxima discrição</p>
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
          <div className="space-y-6">
            {/* Novo Script Compacto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-white">
                    ✨ Script Compacto (NOVA VERSÃO)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Apenas 1 linha • Totalmente ofuscado • Parece analytics comum
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={generateScript} className="btn-ghost text-sm">
                    <Icons.RefreshCw className="mr-1 h-4 w-4" />
                    Regenerar
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedScript)}
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
                <pre className="text-sm text-green-400">
                  <code>{generatedScript}</code>
                </pre>
              </div>

              {/* Vantagens do Novo Script */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                  <div className="mb-2 flex items-center space-x-2">
                    <Icons.EyeOff className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Stealth</span>
                  </div>
                  <p className="text-xs text-green-200">
                    Parece um script de analytics comum. Não desperta suspeitas.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="mb-2 flex items-center space-x-2">
                    <Icons.CheckCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Ofuscado</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Código completamente ofuscado. Impossível de entender a lógica.
                  </p>
                </div>

                <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                  <div className="mb-2 flex items-center space-x-2">
                    <Icons.Zap className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Performance</span>
                  </div>
                  <p className="text-xs text-purple-200">
                    Carregamento assíncrono. Cache otimizado. Ultra-rápido.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparação com Script Antigo */}
            <div className="border-t border-gray-700 pt-6">
              <button
                onClick={() => setShowLegacyScript(!showLegacyScript)}
                className="flex items-center space-x-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Icons.ChevronDown
                  className={`h-4 w-4 transition-transform ${showLegacyScript ? 'rotate-180' : ''}`}
                />
                <span>Comparar com versão anterior (2.5KB inline)</span>
              </button>

              {showLegacyScript && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-300">
                        📜 Script Antigo (LEGADO)
                      </h4>
                      <p className="text-sm text-gray-500">
                        2.5KB inline • Código visível • Facilmente detectável
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(legacyScript)}
                      className="btn-ghost text-sm"
                    >
                      <Icons.Copy className="mr-1 h-4 w-4" />
                      Copiar Legado
                    </button>
                  </div>

                  <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-lg bg-gray-900 p-4">
                    <pre className="text-xs text-gray-400">
                      <code>{legacyScript}</code>
                    </pre>
                  </div>

                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-200">
                      <strong>⚠️ Problemas da versão antiga:</strong> Código visível, URLs expostas,
                      facilmente identificável como sistema anti-clone, tamanho grande.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instruções de Uso */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <h5 className="mb-2 font-medium text-blue-200">📋 Como usar:</h5>
              <ol className="space-y-1 text-sm text-blue-200">
                <li>
                  <strong>1.</strong> Copie o script compacto acima
                </li>
                <li>
                  <strong>2.</strong> Cole antes do fechamento da tag &lt;/body&gt;
                </li>
                <li>
                  <strong>3.</strong> Publique em todos os seus funis de vendas
                </li>
                <li>
                  <strong>4.</strong> Monitore as detecções no dashboard
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
