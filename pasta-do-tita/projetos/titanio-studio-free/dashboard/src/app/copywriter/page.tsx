'use client'

import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, Loader2, CheckCircle } from 'lucide-react'

const styles = [
  { id: 'casual', name: 'Casual', emoji: '😊', desc: 'Tom amigável e descontraído' },
  { id: 'professional', name: 'Profissional', emoji: '💼', desc: 'Corporativo mas acessível' },
  { id: 'urgent', name: 'Urgente', emoji: '🔥', desc: 'Call-to-action forte' },
]

const templates = [
  'Promoção de fim de semana',
  'Lançamento de produto',
  'Evento especial',
  'Depoimento de cliente',
  'Bastidores da empresa',
  'Dica rápida',
]

export default function CopywriterPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('casual')
  const [generatedCopies, setGeneratedCopies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateCopy = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      // Gera 3 variações
      const copies: string[] = []
      for (let i = 0; i < 3; i++) {
        const response = await fetch('/api/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style })
        })
        const data = await response.json()
        copies.push(data.copy)
      }
      setGeneratedCopies(copies)
    } catch (error) {
      console.error('Erro:', error)
    }
    setIsLoading(false)
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          IA Copywriter
        </h1>
        <p className="text-gray-500 mt-1">Gere copies incríveis para suas redes sociais com IA</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Quick Templates */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Templates rápidos:</label>
          <div className="flex flex-wrap gap-2">
            {templates.map(template => (
              <button
                key={template}
                onClick={() => setPrompt(template)}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Main Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Descreva o que você quer:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Post sobre estreia do filme Bacurau neste sábado às 20h com ingresso a R$30"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Estilo:</label>
          <div className="grid grid-cols-3 gap-3">
            {styles.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  style === s.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <p className="font-medium mt-1">{s.name}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCopy}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando 3 variações...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Copies com IA
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {generatedCopies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Resultados</h2>
            <button
              onClick={generateCopy}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar novamente
            </button>
          </div>

          <div className="grid gap-4">
            {generatedCopies.map((copy, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      Variação {index + 1}
                    </span>
                    <p className="mt-3 text-gray-800 whitespace-pre-wrap">{copy}</p>
                    <p className="text-xs text-gray-400 mt-2">{copy.length} caracteres</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(copy, index)}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedIndex === index 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copiedIndex === index ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
