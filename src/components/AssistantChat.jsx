import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const COMPLEX_INTENTS = [
  {
    id: 'music',
    keywords: [
      'crie uma música',
      'criar uma música',
      'crie musica',
      'criar musica',
      'gerar música',
      'gerar musica',
      'compose',
      'compor',
      'song',
      'faixa',
      'trilha'
    ]
  },
  {
    id: 'video',
    keywords: [
      'crie um vídeo',
      'criar um vídeo',
      'crie video',
      'criar video',
      'videoclipe',
      'clip',
      'produção de vídeo',
      'video clipe'
    ]
  },
  {
    id: 'ads',
    keywords: [
      'campanha',
      'google ads',
      'anúncio',
      'anuncio',
      'media paga',
      'ads'
    ]
  },
  {
    id: 'legal',
    keywords: [
      'advogado',
      'legal',
      'direitos autorais',
      'copyright',
      'jurídico',
      'juridico',
      'licenciamento'
    ]
  }
]

const SIMPLE_RESPONSES = [
  {
    test: (text) => /hor[aá]rio|funcion[aá]|atendimento/.test(text),
    answer:
      'Estamos disponíveis 24/7 via plataforma e respondemos mensagens humanas em até 1 dia útil.'
  },
  {
    test: (text) => /pre[cç]o|planos|quanto custa|valor/.test(text),
    answer:
      'Nossos planos estão descritos logo abaixo do chat. Posso sugerir o ideal quando você me contar sua necessidade.'
  },
  {
    test: (text) => /supabase|guardar dados|salvar dados|retomar briefing/.test(text),
    answer:
      'As informações que você compartilhar ficam salvas com Supabase + armazenamento local. Você pode continuar de onde parou quando voltar.'
  },
  {
    test: (text) => /pagamento|stripe|paypal|cart[aã]o/.test(text),
    answer:
      'Aceitamos Stripe e PayPal com cobrança internacional segura. Emitimos recibos automaticamente após cada contratação.'
  },
  {
    test: (text) => /suporte|contato|falar com humano/.test(text),
    answer:
      'Se preferir, posso encaminhar seu briefing para nosso time comercial e eles entram em contato por e-mail ou WhatsApp.'
  }
]

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Olá! Eu sou o assistente do Titanio Studio. Posso responder dúvidas rápidas aqui mesmo. Se pedir algo como criar uma música, vídeo ou campanha, vou te direcionar para os planos certos.',
    variant: 'intro'
  }
]

function normalise(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export default function AssistantChat({
  profile,
  plans,
  onPlanRequested,
  requestGoogleStatus
}) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const firstName = useMemo(() => {
    if (!profile?.name) return null
    return profile.name.trim().split(' ')[0]
  }, [profile?.name])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      const intent = await resolveIntent(trimmed, {
        plans,
        onPlanRequested,
        requestGoogleStatus,
        firstName
      })

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: intent.message,
        variant: intent.variant,
        planId: intent.planId
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
      <header className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/20">
          <Bot className="size-5 text-purple-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Assistente Titanio
          </span>
          <span className="text-sm text-white/80">
            {firstName ? `Como posso ajudar hoje, ${firstName}?` : 'Como posso ajudar hoje?'}
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} plans={plans} />
        ))}
        {isSending && (
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Loader2 className="size-4 animate-spin" />
            Gerando resposta...
          </div>
        )}
      </div>

      <form
        className="flex flex-col gap-3 border-t border-white/10 px-6 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSend()
        }}
      >
        <label className="text-xs font-medium uppercase tracking-wide text-white/40">
          Pergunte algo
        </label>
        <div className="flex items-center gap-3">
          <input
            className="flex-1 rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            placeholder="Ex.: Como funciona o pagamento?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={isSending || !input.trim()}
            className="bg-purple-500/90 px-5 py-6 text-sm font-semibold text-white hover:bg-purple-500"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

function ChatMessage({ message, plans }) {
  const isAssistant = message.role === 'assistant'
  const plan = message.planId ? plans.find((item) => item.id === message.planId) : null

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg transition ${
          isAssistant
            ? 'bg-white/[0.06] text-white'
            : 'bg-purple-500/90 text-white'
        }`}
      >
        <RichText>{message.content}</RichText>
        {message.variant === 'plan' && plan && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/10 px-3 py-2 text-xs text-purple-100">
            <Sparkles className="size-4" />
            <span>
              Confira os detalhes do plano <strong>{plan.title}</strong> logo abaixo.
            </span>
          </div>
        )}
        {message.variant === 'status-ok' && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            <CheckCircle2 className="size-4" />
            <span>Integração monitorada e pronta para uso.</span>
          </div>
        )}
        {message.variant === 'status-error' && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            <AlertTriangle className="size-4" />
            <span>
              Não consegui confirmar a integração agora. Nossa equipe pode ajudar pelo plano de campanhas.
            </span>
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

async function resolveIntent(message, {
  plans,
  onPlanRequested,
  requestGoogleStatus,
  firstName
}) {
  const normalised = normalise(message)

  if (/status .*google ads|status do google ads|google ads status|status .*api do google/.test(normalised)) {
    if (typeof requestGoogleStatus === 'function') {
      const status = await requestGoogleStatus()
      if (status?.ok) {
        return {
          message:
            'O backend do Google Ads respondeu com sucesso. Já conseguimos criar campanhas e atualizar budgets diretamente pela API v16.',
          variant: 'status-ok'
        }
      }
      return {
        message:
          'Não obtive resposta da API agora. Podemos revisar as credenciais no Plano Campanhas Google Ads ou retentar em instantes.',
        variant: 'status-error'
      }
    }
  }

  const complexIntent = COMPLEX_INTENTS.find((intent) =>
    intent.keywords.some((keyword) => normalised.includes(normalise(keyword)))
  )

  if (complexIntent) {
    const plan = plans.find((item) => item.id === complexIntent.id)
    if (typeof onPlanRequested === 'function') {
      onPlanRequested(complexIntent.id)
    }

    const intro = plan
      ? `Esse pedido é melhor conduzido com o plano ${plan.title}.`
      : 'Esse pedido é melhor conduzido com um dos nossos planos especializados.'

    const summary = plan?.summary
      ? `\n\nResumo do plano: ${plan.summary}`
      : ''

    return {
      message:
        `${intro}\n\nPosso conectar você com o time comercial para abrir a produção. Basta confirmar seus dados no formulário ao lado.${summary}`,
      variant: 'plan',
      planId: complexIntent.id
    }
  }

  const simpleRule = SIMPLE_RESPONSES.find((rule) => rule.test(normalised))
  if (simpleRule) {
    return {
      message: simpleRule.answer,
      variant: 'simple'
    }
  }

  return {
    message:
      firstName
        ? `Obrigado, ${firstName}! Se quiser ajuda com algo mais elaborado (música, vídeo, anúncios ou consultoria legal), me avise que eu indico o plano certo.`
        : 'Posso responder perguntas rápidas aqui mesmo. Se precisar que criemos algo por você, me diga e eu indico o plano certo.',
    variant: 'simple'
  }
}
