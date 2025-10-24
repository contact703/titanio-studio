import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Clock3,
  DollarSign,
  FileText,
  Gavel,
  MessageCircle,
  Music3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Waves
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { cn } from '@/lib/utils'

const PROJECT_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1250,
    internalCost: 410,
    timeline: '7 dias úteis',
    summary: 'Ideal para artistas independentes que trazem a própria faixa e precisam de execução ágil.',
    focus: 'Entrega rápida + duas rodadas de revisão guiadas.',
    recommendedProvider: 'suno'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 2000,
    internalCost: 520,
    timeline: '10 dias úteis',
    summary:
      'Combina upgrades visuais, três revisões e flexibilidade para contratar música IA conforme a necessidade.',
    focus: 'Equilíbrio entre qualidade 4K, revisão e add-ons personalizados.',
    recommendedProvider: 'suno'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 3000,
    internalCost: 680,
    timeline: '14 dias úteis',
    summary: 'Voltado para estúdios com demandas complexas, efeitos avançados e música IA inclusa.',
    focus: 'Projetos 4K com lip-sync, stems e consultoria jurídica completa.',
    recommendedProvider: 'musicgpt'
  }
]

const ADDONS = [
  {
    id: 'music-suno',
    label: 'Música IA Suno',
    description: 'Geração via GoAPI com ajustes rápidos e looping automático.',
    price: 75,
    cost: 0.02,
    badge: '99,6% de margem',
    providers: ['suno', 'musicgpt']
  },
  {
    id: 'music-musicgpt',
    label: 'Música IA MusicGPT',
    description: 'Stems separados, voice changing e biblioteca de 1000 vozes.',
    price: 120,
    cost: 0.03,
    badge: 'Stems inclusos',
    providers: ['musicgpt']
  },
  {
    id: 'lip-sync',
    label: 'Lip-sync avançado',
    description: 'Sincronização labial com modelos proprietários e ajustes quadro a quadro.',
    price: 50,
    cost: 8,
    badge: 'Popular no TikTok',
    providers: ['suno', 'musicgpt']
  },
  {
    id: 'metricool',
    label: 'Automação Metricool + Ads',
    description: 'Agendamento multi-plataforma, relatórios e campanha Google Ads inicial.',
    price: 110,
    cost: 25,
    badge: 'Entrega pós-lançamento',
    providers: ['suno', 'musicgpt']
  }
]

const PROVIDERS = {
  suno: {
    id: 'suno',
    name: 'Suno AI',
    cost: 0.02,
    baseTime: 2,
    deliverables: ['MP3 master', 'Loop instrumental', 'Relatório de prompt'],
    message: 'Melhor custo-benefício para validação rápida com clientes.',
    highlight: 'Tempo médio: 2 min',
    color: 'from-purple-500/30 to-cyan-500/20'
  },
  musicgpt: {
    id: 'musicgpt',
    name: 'MusicGPT',
    cost: 0.03,
    baseTime: 3.5,
    deliverables: ['MP3 master', 'Stems (vocal + instrumental)', 'Preset de voz IA', 'Relatório de direitos comerciais'],
    message: 'Fluxo completo para lançamentos premium e edições complexas.',
    highlight: 'Stems e vozes customizadas',
    color: 'from-pink-500/30 to-blue-500/20'
  }
}

const MUSIC_PROVIDER_DETAILS = {
  suno: {
    name: 'Suno AI',
    webhook: 'status:completed',
    notes: [
      'Entrega em até 2 minutos por faixa.',
      'Permite ajustes rápidos e nova versão sem custo extra.',
      'Direitos comerciais incluídos para planos Pro/Premier.'
    ],
    preview: 'Preview gerado automaticamente com waveform animado.'
  },
  musicgpt: {
    name: 'MusicGPT',
    webhook: 'status:ready_with_stems',
    notes: [
      'Dois mixes por prompt para comparar abordagens.',
      'Download imediato de stems e sheet de voz IA.',
      'Recomendações automáticas de voz com base no estilo.'
    ],
    preview: 'Dashboard com stems individuais e mixer em tempo real.'
  }
}

const LEGAL_RESPONSES = [
  {
    keywords: ['suno', 'comercial'],
    answer:
      'Sim. Termos Suno v2.1 (seção 4.2) permitem uso comercial para assinantes Pro e Premier. Guarde o comprovante da assinatura, o prompt utilizado e mantenha créditos Suno regulares.',
    references: ['Suno Terms of Service v2.1 §4.2', 'US Copyright Office - AI Works (2023)']
  },
  {
    keywords: ['musicgpt', 'stems'],
    answer:
      'Os stems do MusicGPT podem ser usados comercialmente, desde que vinculados ao produto final (ex.: videoclipe). A redistribuição isolada dos stems exige licença adicional. Recomenda-se anexar o contrato ao projeto no CRM.',
    references: ['MusicGPT Enterprise License 2025', 'EU AI Act - Art. 52']
  },
  {
    keywords: ['youtube', 'strike'],
    answer:
      'Conteúdos gerados com IA podem sofrer análise automática no YouTube. Registre os prompts e mantenha evidências do direito comercial. Em caso de strike indevido, utilize o processo de dispute anexando a licença Suno/MusicGPT.',
    references: ['YouTube Terms of Service 2024', 'DMCA §512(f)']
  },
  {
    keywords: ['brasil', 'lei 9.610'],
    answer:
      'No Brasil, a Lei 9.610/98 se aplica ao resultado final. Recomenda-se registrar a obra derivada na Biblioteca Nacional e manter contrato que especifique autoria humana na direção criativa do projeto Titanio Studio.',
    references: ['Lei 9.610/98', 'INPI - Guia de Obras Audiovisuais']
  }
]

const SUGGESTED_QUESTIONS = [
  'Posso monetizar videoclipes com música do Suno?',
  'Como provar direitos sobre stems do MusicGPT?',
  'Quais cuidados ao publicar no YouTube?',
  'Como fica a lei de direitos autorais no Brasil?'
]

function ProjectEstimator() {
  const [selectedPlanId, setSelectedPlanId] = useState(PROJECT_PLANS[1].id)
  const [selectedProviderId, setSelectedProviderId] = useState('suno')
  const [selectedAddons, setSelectedAddons] = useState(['music-suno', 'lip-sync'])

  useEffect(() => {
    setSelectedAddons((prev) => {
      const withoutMusic = prev.filter((addonId) => !addonId.startsWith('music-'))
      const musicAddon = selectedProviderId === 'musicgpt' ? 'music-musicgpt' : 'music-suno'
      return [musicAddon, ...withoutMusic]
    })
  }, [selectedProviderId])

  const plan = useMemo(
    () => PROJECT_PLANS.find((item) => item.id === selectedPlanId),
    [selectedPlanId]
  )
  const provider = PROVIDERS[selectedProviderId]

  const { addonPrice, addonCost } = useMemo(() => {
    return selectedAddons.reduce(
      (accumulator, addonId) => {
        const addon = ADDONS.find((item) => item.id === addonId)
        if (!addon) return accumulator
        return {
          addonPrice: accumulator.addonPrice + addon.price,
          addonCost: accumulator.addonCost + addon.cost
        }
      },
      { addonPrice: 0, addonCost: 0 }
    )
  }, [selectedAddons])

  const totalRevenue = plan.price + addonPrice
  const totalCost = plan.internalCost + addonCost + provider.cost
  const profit = totalRevenue - totalCost
  const margin = Math.round((profit / totalRevenue) * 100)
  const estimatedTimeline = selectedProviderId === 'musicgpt' ? `${plan.timeline} + 1 dia para stems` : plan.timeline

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => {
      if (addonId.startsWith('music-')) {
        return [addonId, ...prev.filter((id) => !id.startsWith('music-'))]
      }
      if (prev.includes(addonId)) {
        return prev.filter((id) => id !== addonId)
      }
      return [...prev, addonId]
    })
  }

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-8 space-y-8">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 uppercase tracking-widest">
          <Sparkles size={16} /> Planeje um projeto real
        </span>
        <h3 className="text-2xl font-bold text-white">Simule margens e prazos</h3>
        <p className="text-gray-400 text-sm">
          Combine plano, provider de música IA e add-ons para entender custo, lucro e tempo de entrega estimado.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Selecione um plano</p>
            <div className="grid md:grid-cols-3 gap-3">
              {PROJECT_PLANS.map((planOption) => (
                <button
                  type="button"
                  key={planOption.id}
                  onClick={() => setSelectedPlanId(planOption.id)}
                  className={cn(
                    'text-left border rounded-lg p-4 transition-all bg-black/40 hover:border-purple-500/50',
                    selectedPlanId === planOption.id ? 'border-purple-400 shadow-lg shadow-purple-500/20' : 'border-white/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">{planOption.name}</span>
                    <span className="text-sm text-purple-300">{planOption.timeline}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">{planOption.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {Object.values(PROVIDERS).map((providerOption) => (
              <button
                type="button"
                key={providerOption.id}
                onClick={() => setSelectedProviderId(providerOption.id)}
                className={cn(
                  'relative overflow-hidden border rounded-lg p-4 text-left transition-all bg-gradient-to-br hover:border-purple-400/60',
                  `from-transparent to-transparent ${providerOption.color}`,
                  selectedProviderId === providerOption.id ? 'border-purple-400 shadow-lg shadow-purple-500/25' : 'border-white/10'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">{providerOption.name}</span>
                  <span className="text-xs text-purple-200">{providerOption.highlight}</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{providerOption.message}</p>
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                  <Clock3 size={14} className="text-purple-300" />
                  SLA estimado: {providerOption.baseTime.toFixed(1)} min
                </p>
              </button>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Adicione recursos extras</p>
            <div className="grid md:grid-cols-2 gap-3">
              {ADDONS.filter((addon) => addon.providers.includes(selectedProviderId)).map((addon) => {
                const isActive = selectedAddons.includes(addon.id)
                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      'border rounded-lg p-4 text-left transition-all bg-black/40 hover:border-purple-400/50',
                      isActive ? 'border-purple-400 shadow shadow-purple-500/20' : 'border-white/10'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-base">{addon.label}</span>
                      <span className="text-sm text-purple-300">+${addon.price}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">{addon.description}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs text-purple-200">
                      <Sparkles size={14} /> {addon.badge}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Resumo financeiro</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <SummaryStat icon={DollarSign} label="Receita prevista" value={`$${totalRevenue.toLocaleString('en-US')}`} />
              <SummaryStat icon={Activity} label="Lucro estimado" value={`$${profit.toLocaleString('en-US')}`} positive={profit > 0} />
              <SummaryStat icon={ShieldCheck} label="Margem" value={`${margin}%`} />
              <SummaryStat icon={Clock3} label="Prazo" value={estimatedTimeline} />
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong className="text-white">Foco:</strong> {plan.focus}
            </p>
            <p>
              <strong className="text-white">Provider:</strong> {provider.name} (custo unitário ${provider.cost.toFixed(2)})
            </p>
            <p>
              <strong className="text-white">Add-ons ativos:</strong> {selectedAddons.map((addonId) => ADDONS.find((addon) => addon.id === addonId)?.label).join(', ')}
            </p>
          </div>

          <div className="rounded-lg border border-purple-500/40 bg-purple-500/10 p-4 text-sm text-purple-100">
            <p>
              <Sparkles size={16} className="inline mr-2" /> Recomenda-se registrar o projeto no CRM e anexar recibos dos providers
              para auditoria jurídica.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MusicGeneratorPlayground() {
  const [selectedProviderId, setSelectedProviderId] = useState('suno')
  const [formValues, setFormValues] = useState({
    prompt: 'Upbeat pop song about chasing dreams',
    genre: 'Pop',
    mood: 'Inspirador',
    duration: '2-3 min',
    vocal: 'Com letra'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const providerDetails = PROVIDERS[selectedProviderId]

  const handleInputChange = (field) => (event) => {
    setFormValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const estimatedTime = useMemo(() => {
    let base = providerDetails.baseTime
    if (formValues.duration === '3-4 min') base += 1.5
    if (formValues.duration === '4-5 min') base += 2.5
    if (formValues.vocal === 'Instrumental') base -= 0.3
    if (selectedProviderId === 'musicgpt') base += 0.5
    return Math.max(1.5, base).toFixed(1)
  }, [providerDetails.baseTime, formValues.duration, formValues.vocal, selectedProviderId])

  const handleGenerate = (event) => {
    event.preventDefault()
    if (!formValues.prompt.trim()) return

    setIsGenerating(true)
    setTimeout(() => {
      const details = MUSIC_PROVIDER_DETAILS[selectedProviderId]
      setResult({
        id: Date.now(),
        provider: details.name,
        estimatedTime,
        webhook: details.webhook,
        notes: details.notes,
        preview: details.preview
      })
      setIsGenerating(false)
    }, 700)
  }

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 uppercase tracking-widest">
            <Music3 size={16} /> Playground de Música IA
          </span>
          <h3 className="text-2xl font-bold text-white mt-2">Monte um prompt e visualize a entrega</h3>
        </div>
        <div className="flex gap-2">
          {Object.values(PROVIDERS).map((providerOption) => (
            <button
              type="button"
              key={providerOption.id}
              onClick={() => setSelectedProviderId(providerOption.id)}
              className={cn(
                'px-4 py-2 rounded-md text-sm border transition-all',
                selectedProviderId === providerOption.id
                  ? 'border-cyan-400 bg-cyan-500/20 text-white'
                  : 'border-white/10 text-gray-300 hover:border-cyan-400/50'
              )}
            >
              {providerOption.name}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleGenerate}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white" htmlFor="prompt">
            Prompt criativo
          </label>
          <textarea
            id="prompt"
            rows="3"
            value={formValues.prompt}
            onChange={handleInputChange('prompt')}
            className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Gênero" value={formValues.genre} onChange={handleInputChange('genre')} options={['Pop', 'Trap', 'Rock', 'Eletrônica']} />
          <FormField label="Mood" value={formValues.mood} onChange={handleInputChange('mood')} options={['Inspirador', 'Melancólico', 'Energético', 'Romântico']} />
          <FormField label="Duração" value={formValues.duration} onChange={handleInputChange('duration')} options={['1-2 min', '2-3 min', '3-4 min', '4-5 min']} />
          <FormField label="Vocal" value={formValues.vocal} onChange={handleInputChange('vocal')} options={['Com letra', 'Sem letra', 'Instrumental']} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-300 flex items-center gap-2">
            <Clock3 size={16} className="text-cyan-300" /> Estimativa de geração: {estimatedTime} minutos
          </p>
          <Button type="submit" size="lg" className="bg-cyan-500 hover:bg-cyan-600" disabled={isGenerating}>
            {isGenerating ? 'Gerando...' : 'Simular geração'}
            <PlayCircle size={18} />
          </Button>
        </div>
      </form>

      {result && (
        <div className="border border-cyan-400/40 rounded-lg p-6 bg-cyan-500/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h4 className="text-lg font-semibold text-white">{result.provider}</h4>
            <span className="text-sm text-cyan-200">Webhook • {result.webhook}</span>
          </div>
          <p className="text-sm text-gray-200">Entrega estimada em {result.estimatedTime} minutos</p>
          <p className="text-sm text-gray-300">{result.preview}</p>
          <ul className="space-y-2 text-sm text-gray-200">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <Waves size={16} className="mt-0.5 text-cyan-300" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function LegalAgentDemo() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content:
        'Sou o Agente Legal Titanio. Pergunte sobre direitos autorais, licenças ou políticas de plataformas e responderei com referências.'
    }
  ])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endOfMessagesRef = useRef(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!question.trim()) return

    const currentQuestion = question.trim()
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }])
    setQuestion('')
    setIsLoading(true)

    setTimeout(() => {
      const normalized = currentQuestion.toLowerCase()
      const match = LEGAL_RESPONSES.find((item) =>
        item.keywords.some((keyword) => normalized.includes(keyword))
      )

      const reply = match
        ? {
            role: 'agent',
            content: match.answer,
            references: match.references
          }
        : {
            role: 'agent',
            content:
              'Para esse cenário recomendamos revisar os termos específicos do provider e registrar o prompt utilizado. Nosso agente jurídico pode elaborar um parecer completo em até 24h.',
            references: ['GPT-4o • Atualização mensal das fontes', 'Verifique ToS Suno, MusicGPT e plataforma de destino']
          }

      setMessages((prev) => [...prev, reply])
      setIsLoading(false)
    }, 650)
  }

  const handleSuggestion = (suggestion) => {
    setQuestion(suggestion)
  }

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-8 flex flex-col">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 uppercase tracking-widest">
          <Gavel size={16} /> Agente Legal Live
        </span>
        <h3 className="text-2xl font-bold text-white">Faça uma pergunta jurídica</h3>
        <p className="text-gray-400 text-sm">
          Base de conhecimento com leis EUA/EU/BR, ToS de provedores de IA e casos judiciais recentes. Respostas acompanham
          referências para facilitar auditoria.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs uppercase tracking-wide text-gray-400">Sugestões rápidas</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="px-3 py-1.5 text-xs rounded-full border border-pink-400/40 text-pink-100 hover:bg-pink-500/10 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-hidden border border-white/10 rounded-lg">
        <div className="h-72 overflow-y-auto bg-black/40 p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                'p-4 rounded-lg text-sm leading-relaxed border',
                message.role === 'agent'
                  ? 'border-pink-400/40 bg-pink-500/10 text-pink-100'
                  : 'border-white/10 bg-black/60 text-gray-100'
              )}
            >
              <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide">
                {message.role === 'agent' ? <ShieldCheck size={14} className="text-pink-200" /> : <MessageCircle size={14} className="text-gray-300" />}
                <span>{message.role === 'agent' ? 'Agente Legal' : 'Você'}</span>
              </div>
              <p>{message.content}</p>
              {message.references && (
                <ul className="mt-3 space-y-1 text-[11px] text-pink-100/80">
                  {message.references.map((reference) => (
                    <li key={reference} className="flex items-start gap-2">
                      <FileText size={12} className="mt-0.5" />
                      <span>{reference}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="p-4 rounded-lg border border-pink-400/40 bg-pink-500/10 text-sm text-pink-100">
              O agente está consultando a base jurídica...
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Digite sua pergunta jurídica"
          className="flex-1 px-4 py-3 bg-black/70 border border-pink-400/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
        />
        <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
          Enviar
          <MessageCircle size={16} />
        </Button>
      </form>

      <p className="text-xs text-gray-400 mt-4">
        As respostas simulam um fluxo RAG. Para pareceres formais, um advogado parceiro revisa os prompts e documentos antes da
        entrega.
      </p>
    </div>
  )
}

function SummaryStat({ icon, label, value, positive = true }) {
  const IconComponent = icon
  return (
    <div className="border border-white/10 rounded-lg p-4 bg-black/40">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
        <IconComponent size={14} className="text-purple-300" />
        <span>{label}</span>
      </div>
      <p className={cn('mt-2 text-xl font-semibold', positive ? 'text-white' : 'text-red-300')}>{value}</p>
    </div>
  )
}

function FormField({ label, value, onChange, options }) {
  return (
    <label className="text-sm text-gray-300 space-y-2">
      <span className="text-white font-semibold">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function InteractivePlayground() {
  return (
    <div className="space-y-8 xl:space-y-0 xl:grid xl:grid-cols-[1.1fr,0.9fr] xl:gap-8">
      <div className="space-y-8">
        <ProjectEstimator />
        <MusicGeneratorPlayground />
      </div>
      <div>
        <LegalAgentDemo />
      </div>
    </div>
  )
}
