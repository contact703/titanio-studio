import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import {
  loadContactData,
  persistContactData
} from '@/lib/contactStorage.js'

const AI_MODELS = [
  {
    id: 'llama',
    label: 'Titanio LLaMA',
    emoji: '🦙',
    description: 'Responde dúvidas rápidas sobre o estúdio e integrações.'
  },
  {
    id: 'gpt4',
    label: 'GPT-4 Legal',
    emoji: '⚖️',
    description: 'Especialista em direitos autorais e uso comercial de IA.'
  },
  {
    id: 'suno',
    label: 'Suno Música IA',
    emoji: '🎵',
    description: 'Criação de trilhas originais em minutos dentro da plataforma.'
  },
  {
    id: 'kling',
    label: 'Kling Vídeo IA',
    emoji: '🎬',
    description: 'Renderiza videoclipes e assets visuais de alta qualidade.'
  },
  {
    id: 'ads',
    label: 'Orquestrador Google Ads',
    emoji: '📣',
    description: 'Automação completa de campanhas para lançamentos de artistas.'
  }
]

const PLAN_URLS = {
  music: 'https://titaniostudio.com/pagamento?plano=music-premium',
  video: 'https://titaniostudio.com/pagamento?plano=video-standard',
  ads: 'https://titaniostudio.com/pagamento?plano=google-ads',
  legal: 'https://titaniostudio.com/pagamento?plano=legal'
}

const COMPLEX_INTENTS = [
  {
    id: 'music',
    planName: 'Premium Música & Vídeo',
    keywords: [
      'crie uma música',
      'criar uma música',
      'crie musica',
      'criar musica',
      'gerar música',
      'gerar musica',
      'compor',
      'faixa',
      'trilha sonora',
      'song'
    ],
    model: 'suno'
  },
  {
    id: 'video',
    planName: 'Standard Videoclipe IA',
    keywords: [
      'crie um vídeo',
      'criar um vídeo',
      'crie video',
      'criar video',
      'videoclipe',
      'clip',
      'produção de vídeo',
      'roteiro de vídeo'
    ],
    model: 'kling'
  },
  {
    id: 'ads',
    planName: 'Campanhas Google Ads',
    keywords: ['campanha', 'google ads', 'anúncio', 'anuncio', 'ads', 'media paga'],
    model: 'ads'
  },
  {
    id: 'legal',
    planName: 'Consultoria Legal IA',
    keywords: ['advogado', 'legal', 'direitos autorais', 'copyright', 'jurídico', 'juridico'],
    model: 'gpt4'
  }
]

const SIMPLE_RESPONSES = [
  {
    test: (text) => /direito[s]? autoral|copyright|licen(c|ç)a/.test(text),
    answer:
      'Simples dúvidas sobre direitos autorais são respondidas diretamente aqui. Conte o contexto e explico com base no nosso modelo Titanio LLaMA.'
  },
  {
    test: (text) => /pagamento|stripe|paypal|cart(ã|a)o/.test(text),
    answer:
      'Você pode pagar pelos planos com Stripe ou PayPal, com cobrança internacional segura e recibo automático.'
  },
  {
    test: (text) => /supabase|dados|guardar informa[cç][aã]o/.test(text),
    answer:
      'Guardamos os seus dados com Supabase e armazenamento local criptografado. Assim você não precisa reenviar briefing.'
  },
  {
    test: (text) => /hor[aá]rio|atendimento|suporte/.test(text),
    answer:
      'Nosso suporte humano responde em até um dia útil e o chat LLaMA fica disponível 24/7.'
  }
]

const INITIAL_MESSAGES = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      'Olá! Eu sou o Assistente Titanio impulsionado pelo modelo Titanio LLaMA. O que você quer fazer hoje?'
  }
]

function normalise(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function withLlamaSignature(text) {
  return `${text}\n\n(Resposta fornecida pelo modelo Titanio LLaMA.)`
}

async function generateLlamaReply(question) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return `Estou aqui para ajudar com respostas rápidas sobre o Titanio Studio. Você mencionou: “${question}”. Conte mais detalhes ou pergunte sobre direitos autorais, pagamentos ou integrações.`
}

function extractName(text) {
  const match = text.match(/meu nome e\s+([a-zà-ú\s]{2,})/i)
  if (match) {
    return match[1].trim().replace(/\s+/g, ' ')
  }
  return null
}

function detectEmail(text) {
  const match = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
  return match ? match[0] : null
}

function selectModelFor(text) {
  const normalised = normalise(text)
  if (!normalised) return 'llama'

  const complex = COMPLEX_INTENTS.find((intent) =>
    intent.keywords.some((keyword) => normalised.includes(normalise(keyword)))
  )

  if (complex?.model) {
    return complex.model
  }

  if (/direito|copyright|contrato/.test(normalised)) {
    return 'gpt4'
  }

  return 'llama'
}

export default function AssistantChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [audioDescriptionEnabled, setAudioDescriptionEnabled] = useState(false)
  const [activeModel, setActiveModel] = useState('llama')
  const [modelInfoOpen, setModelInfoOpen] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '' })

  const recognitionRef = useRef(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const result = await loadContactData()
      if (!mounted) return
      if (result?.data) {
        setProfile({
          name: result.data.name ?? '',
          email: result.data.email ?? ''
        })
        if (result.data.name) {
          const firstName = result.data.name.split(' ')[0]
          setMessages((prev) => [
            ...prev,
            {
              id: 'assistant-return',
              role: 'assistant',
              content: `Bem-vindo de volta, ${firstName}! Pode continuar de onde parou.`
            }
          ])
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const recommendedModel = useMemo(() => {
    const lastUserMessage = [...messages].reverse().find((item) => item.role === 'user')
    if (!lastUserMessage) {
      return activeModel
    }
    return selectModelFor(lastUserMessage.content)
  }, [messages, activeModel])

  const selectedModel = useMemo(
    () => AI_MODELS.find((model) => model.id === recommendedModel) ?? AI_MODELS[0],
    [recommendedModel]
  )

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    window.speechSynthesis.speak(utterance)
  }, [])

  const describeIfEnabled = useCallback(
    (description) => {
      if (audioDescriptionEnabled) {
        speak(description)
      }
    },
    [audioDescriptionEnabled, speak]
  )

  const handleAudioToggle = () => {
    const nextState = !audioDescriptionEnabled
    setAudioDescriptionEnabled(nextState)
    speak(`Modo audiodescrição ${nextState ? 'ativado' : 'desativado'}`)
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-audio-${Date.now()}`,
        role: 'assistant',
        content: nextState
          ? 'Ativei a audiodescrição. Passe o mouse sobre os botões e elementos para ouvir descrições.'
          : 'Desativei a audiodescrição. Você pode reativar quando preferir.'
      }
    ])
  }

  const handleAudioHover = () => {
    speak(
      `Modo audiodescrição ${audioDescriptionEnabled ? 'ativado' : 'desativado'}`
    )
  }

  const handleVoiceCommand = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-voice-${Date.now()}`,
          role: 'assistant',
          content:
            'Não identifiquei suporte a comandos de voz neste navegador. Tente usar Chrome ou Edge para habilitar a captura.'
        }
      ])
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = recognitionRef.current ?? new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0]?.transcript ?? ''
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        describeIfEnabled(`Transcrição capturada: ${transcript}`)
      }
    }

    recognition.onerror = (event) => {
      console.error('speech recognition error', event)
      setIsListening(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-voice-error-${Date.now()}`,
          role: 'assistant',
          content:
            'Não consegui concluir a captura de voz. Você pode tentar novamente ou digitar sua mensagem.'
        }
      ])
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    describeIfEnabled('Captura de voz iniciada. Fale sua solicitação e aguarde a transcrição.')
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const email = detectEmail(trimmed)
    if (email && email !== profile.email) {
      const name = extractName(trimmed) ?? profile.name
      setProfile({ name: name ?? '', email })
      persistContactData({
        name: name ?? '',
        email,
        solution: 'assistente',
        details: trimmed
      }).catch((error) => {
        console.warn('[assistant] Falha ao persistir dados no Supabase', error)
      })
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)
    describeIfEnabled('Mensagem enviada. Gerando resposta do assistente Titanio.')

    try {
      const response = await routeMessage(trimmed)
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        variant: response.variant
      }
      setMessages((prev) => [...prev, assistantMessage])
      setActiveModel(response.recommendedModel ?? 'llama')

      if (response.planId) {
        const planUrl = PLAN_URLS[response.planId]
        if (planUrl && typeof window !== 'undefined') {
          window.open(planUrl, '_blank', 'noopener,noreferrer')
        }
      }
    } finally {
      setIsSending(false)
    }
  }

  const modelLogos = useMemo(
    () =>
      AI_MODELS.map((model) => (
        <span
          key={model.id}
          aria-hidden="true"
          className="text-lg"
        >
          {model.emoji}
        </span>
      )),
    []
  )

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70">
          <Sparkles className="size-3" />
          Assistente Titanio em produção
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white">Assistente Titanio</h1>
        <p className="mt-2 text-base text-white/70">O que você quer fazer hoje?</p>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1 justify-between border-white/20 bg-white/5 text-left text-white hover:bg-white/10"
          onClick={() => {
            setModelInfoOpen((prev) => !prev)
            describeIfEnabled(
              `IA recomendada: ${selectedModel.label}. Clique novamente para ocultar.`
            )
          }}
          onMouseEnter={() =>
            describeIfEnabled(
              `Botão de seleção automática de IA. Atualmente recomendado: ${selectedModel.label}.`
            )
          }
        >
          <div className="flex items-center gap-3">
            <Bot className="size-4 text-purple-200" />
            <div>
              <p className="text-sm font-semibold text-white">IA recomendada</p>
              <p className="text-xs text-white/70">{selectedModel.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">{modelLogos}</div>
        </Button>

        <Button
          type="button"
          variant={audioDescriptionEnabled ? 'secondary' : 'outline'}
          className="flex-1 justify-center border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={handleAudioToggle}
          onMouseEnter={handleAudioHover}
        >
          <span>{audioDescriptionEnabled ? 'Audiodescrição ativa' : 'Ativar audiodescrição'}</span>
        </Button>
      </div>

      {modelInfoOpen && (
        <div
          className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
          onMouseEnter={() =>
            describeIfEnabled(
              `Detalhes da IA recomendada: ${selectedModel.label}. ${selectedModel.description}`
            )
          }
        >
          <p className="font-semibold">
            {selectedModel.emoji} {selectedModel.label}
          </p>
          <p>{selectedModel.description}</p>
        </div>
      )}

      <div
        className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-black/60 shadow-2xl"
        onMouseEnter={() => describeIfEnabled('Janela de mensagens do chat Titanio.')}
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              audioDescriptionEnabled={audioDescriptionEnabled}
              describe={describeIfEnabled}
            />
          ))}
          {isSending && (
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Loader2 className="size-4 animate-spin" />
              Gerando resposta com o modelo Titanio LLaMA...
            </div>
          )}
        </div>

        <form
          className="border-t border-white/10 bg-black/60 px-6 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleSend()
          }}
        >
          <label className="sr-only" htmlFor="assistant-input">
            Mensagem para o Assistente Titanio
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                id="assistant-input"
                className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40"
                placeholder="Digite aqui ou use o microfone para falar"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onFocus={() => describeIfEnabled('Campo para digitar sua mensagem.')}
                disabled={isSending}
              />
              <button
                type="button"
                onClick={handleVoiceCommand}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                onMouseEnter={() =>
                  describeIfEnabled(
                    isListening
                      ? 'Captura de voz em andamento. Clique para finalizar.'
                      : 'Clique para falar com o assistente usando sua voz.'
                  )
                }
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                <span className="sr-only">{isListening ? 'Parar voz' : 'Falar'}</span>
              </button>
            </div>
            <Button
              type="submit"
              disabled={isSending || !input.trim()}
              className="w-full justify-center bg-purple-500/90 text-white hover:bg-purple-500 sm:w-auto"
              onMouseEnter={() => describeIfEnabled('Enviar mensagem para o assistente.')}
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChatMessage({ message, audioDescriptionEnabled, describe }) {
  const isAssistant = message.role === 'assistant'
  const bubbleClasses = isAssistant
    ? 'bg-white/10 text-white'
    : 'bg-purple-500/80 text-white'

  const handleHover = () => {
    if (!audioDescriptionEnabled) return
    const prefix = isAssistant ? 'Mensagem do assistente: ' : 'Sua mensagem: '
    describe(`${prefix}${message.content}`)
  }

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${bubbleClasses}`}
        onMouseEnter={handleHover}
        onFocus={handleHover}
        tabIndex={audioDescriptionEnabled ? 0 : -1}
      >
        <RichText>{message.content}</RichText>
        {message.variant === 'plan' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
            <AlertTriangle className="size-3" />
            <span>Direcionamos você para a página de pagamento correspondente.</span>
          </div>
        )}
      </div>
    </div>
  )
}

function RichText({ children }) {
  if (typeof children !== 'string') {
    return <>{children}</>
  }

  return children.split('\n').map((part, index) => (
    <p key={index} className={index > 0 ? 'mt-2' : undefined}>
      {part}
    </p>
  ))
}

async function routeMessage(message) {
  const normalised = normalise(message)

  const complexIntent = COMPLEX_INTENTS.find((intent) =>
    intent.keywords.some((keyword) => normalised.includes(normalise(keyword)))
  )

  if (complexIntent) {
    return {
      message: `Esse pedido é considerado complexo. Estou direcionando para o plano ${complexIntent.planName} para continuar com nossa equipe especializada.`,
      variant: 'plan',
      planId: complexIntent.id,
      recommendedModel: complexIntent.model ?? 'llama'
    }
  }

  const simpleRule = SIMPLE_RESPONSES.find((rule) => rule.test(normalised))
  if (simpleRule) {
    return {
      message: withLlamaSignature(simpleRule.answer),
      variant: 'simple',
      recommendedModel: 'llama'
    }
  }

  const llamaAnswer = await generateLlamaReply(message)
  return {
    message: withLlamaSignature(llamaAnswer),
    variant: 'simple',
    recommendedModel: 'llama'
  }
}
