'use client'

import { useState } from 'react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from './SocialIcons'

interface PostComposerProps {
  onSubmit: (post: { content: string; platforms: string[]; scheduledFor?: string }) => void
}

export default function PostComposer({ onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [scheduledFor, setScheduledFor] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      })
      const data = await response.json()
      setContent(data.copy)
    } catch (error) {
      console.error('Erro ao gerar:', error)
    }
    setIsGenerating(false)
  }

  const handleSubmit = () => {
    if (!content.trim() || platforms.length === 0) return
    onSubmit({ content, platforms, scheduledFor: scheduledFor || undefined })
    setContent('')
    setScheduledFor('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Criar Post</h3>

      {/* AI Generator */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Gerar com IA</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: Post sobre promoção de cinema neste fim de semana"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={generateWithAI}
            disabled={isGenerating || !aiPrompt.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Gerar
          </button>
        </div>
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva seu post aqui..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <p className="text-xs text-gray-400 mt-1 text-right">{content.length} caracteres</p>

      {/* Platforms */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-gray-600">Publicar em:</span>
        <button
          onClick={() => togglePlatform('instagram')}
          className={`p-2 rounded-lg transition-colors ${
            platforms.includes('instagram') ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <InstagramIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => togglePlatform('facebook')}
          className={`p-2 rounded-lg transition-colors ${
            platforms.includes('facebook') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <FacebookIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => togglePlatform('twitter')}
          className={`p-2 rounded-lg transition-colors ${
            platforms.includes('twitter') ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule */}
      <div className="mt-4">
        <label className="text-sm text-gray-600">Agendar para (opcional):</label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || platforms.length === 0}
        className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {scheduledFor ? 'Agendar Post' : 'Publicar Agora'}
      </button>
    </div>
  )
}
