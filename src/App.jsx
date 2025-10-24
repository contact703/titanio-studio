import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Database,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react'
import './App.css'
import AssistantChat from './components/AssistantChat.jsx'
import { Button } from './components/ui/button.jsx'
import {
  loadContactData,
  persistContactData,
  saveContactDraft
} from './lib/contactStorage.js'
import { getBackendHealth } from './lib/googleAds.js'

const PLAN_OPTIONS = [
  {
    id: 'music',
    title: 'Plano Premium Música & Vídeo',
    price: 'A partir de $3.000',
    summary:
      'Inclui composição com Suno AI e MusicGPT, stems completos, videoclipes em 4K e consultoria criativa dedicada.',
    features: [
      'Produção musical dual-provider (Suno AI + MusicGPT)',
      'Videoclipes gerados com Kling / Runway e edição via InVideo AI',
      'Direitos comerciais com suporte do agente legal integrado'
    ],
    checkoutUrl: 'https://titaniostudio.com/pagamento?plano=music-premium'
  },
  {
    id: 'video',
    title: 'Plano Standard Videoclipe IA',
    price: 'A partir de $2.000',
    summary:
      'Fluxo completo de roteiro a entrega com lip-sync, revisões ilimitadas e publicação automatizada.',
    features: [
      'Geração de cenas em 4K com Kling, Runway e Wan 2.5',
      'Revisões ilimitadas pelo chat InVideo AI',
      'Entrega pronta para YouTube, Instagram e Metricool'
    ],
    checkoutUrl: 'https://titaniostudio.com/pagamento?plano=video-standard'
  },
  {
    id: 'ads',
    title: 'Plano Campanhas Google Ads',
    price: 'Sob consulta',
    summary:
      'Configuramos, otimizamos e monitoramos campanhas com a API oficial Google Ads v16 conectada ao seu catálogo.',
    features: [
      'Criação de campanhas Search/Video com refresh automático de token',
      'Otimização diária de budget e públicos',
      'Relatórios semanais e integração com Supabase CRM'
    ],
    checkoutUrl: 'https://titaniostudio.com/pagamento?plano=google-ads'
  },
  {
    id: 'legal',
    title: 'Plano Consultoria Legal IA',
    price: 'Incluído nos planos pagos',
    summary:
      'Chat jurídico RAG com GPT-4/Claude, referências oficiais e acompanhamento das atualizações legislativas.',
    features: [
      'Respostas com citação de leis e Termos de Serviço',
      'Checklist de licenciamento e fair use por projeto',
      'Atualizações mensais de jurisprudência e ToS'
    ],
    checkoutUrl: 'https://titaniostudio.com/pagamento?plano=legal'
  }
]

const AI_RECOMMENDATIONS = [
  {
    id: 'llama-concierge',
    title: 'Titanio LLaMA Concierge',
    description:
      'Modelo proprietário baseado em LLaMA para responder rapidamente dúvidas gerais, status de integrações e orientações iniciais.',
    bestFor: 'Perguntas rápidas sobre processos, pagamentos e status.',
    planLabel: 'Incluso em todos os planos',
    planId: null
  },
  {
    id: 'music-gpt',
    title: 'MusicGPT Maestro',
    description:
      'Geração musical avançada com stems separados, voices AI e personalização completa.',
    bestFor: 'Artistas que precisam de faixas exclusivas com múltiplas versões.',
    planLabel: 'Recomendado: Plano Premium Música & Vídeo',
    planId: 'music'
  },
  {
    id: 'suno-express',
    title: 'Suno Express',
    description:
      'Entrega em minutos de trilhas completas com prompts simples e ajustes rápidos.',
    bestFor: 'Quem precisa lançar um single com velocidade e ótima relação custo-benefício.',
    planLabel: 'Recomendado: Plano Standard Videoclipe IA',
    planId: 'video'
  },
  {
    id: 'legal-guardian',
    title: 'Agente Legal RAG',
    description:
      'Especialista em direitos autorais que cruza legislações e termos de uso para cada projeto.',
    bestFor: 'Produtores que desejam operar com segurança jurídica internacional.',
    planLabel: 'Recomendado: Plano Consultoria Legal IA',
    planId: 'legal'
  },
  {
    id: 'ads-orchestrator',
    title: 'Orquestrador Google Ads',
    description:
      'Automação completa da API v16 com criação e otimização diária de campanhas.',
    bestFor: 'Campanhas de lançamento e sempre-on para artistas.',
    planLabel: 'Recomendado: Plano Campanhas Google Ads',
    planId: 'ads'
  }
]

const PROFILE_FIELDS = [
  { key: 'name', label: 'Nome completo', placeholder: 'Ex.: Maria Silva' },
  { key: 'email', label: 'E-mail', placeholder: 'exemplo@dominio.com' },
  {
    key: 'goal',
    label: 'Objetivo principal',
    placeholder: 'Ex.: Lançar um single com videoclipe e campanha'
  }
]

export default function App() {
  const [profile, setProfile] = useState({ name: '', email: '', goal: '' })
  const [profileSource, setProfileSource] = useState(null)
  const [syncState, setSyncState] = useState('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [highlightedPlan, setHighlightedPlan] = useState(null)
  const [googleStatus, setGoogleStatus] = useState({ state: 'idle', checkedAt: null })

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const result = await loadContactData()
      if (!isMounted) return
      if (result?.data) {
        setProfile({
          name: result.data.name ?? '',
          email: result.data.email ?? '',
          goal: result.data.details ?? result.data.goal ?? ''
        })
      }
      if (result?.source) {
        setProfileSource(result.source)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const profileIsEmpty = useMemo(
    () => !profile.name && !profile.email && !profile.goal,
    [profile]
  )

  useEffect(() => {
    if (syncState !== 'pending') return

    const timeout = setTimeout(async () => {
      if (!profile.email) {
        setSyncState(profileIsEmpty ? 'idle' : 'local')
        return
      }

      setSyncState('syncing')
      const result = await persistContactData({
        name: profile.name,
        email: profile.email,
        solution: profile.goal,
        details: profile.goal
      })

      if (result?.storedInSupabase) {
        setSyncState('synced')
        setLastSyncedAt(new Date())
      } else {
        setSyncState('local')
      }
    }, 700)

    return () => clearTimeout(timeout)
  }, [profile, profileIsEmpty, syncState])

  const refreshGoogleStatus = useCallback(async () => {
    setGoogleStatus({ state: 'loading', checkedAt: null })
    const result = await getBackendHealth().catch(() => ({ ok: false }))
    setGoogleStatus({
      state: result?.ok ? 'ok' : 'error',
      checkedAt: new Date()
    })
    return result
  }, [])

  useEffect(() => {
    refreshGoogleStatus()
  }, [refreshGoogleStatus])

  const handleFieldChange = (key, value) => {
    setProfile((previous) => {
      const next = { ...previous, [key]: value }
      saveContactDraft({
        name: next.name,
        email: next.email,
        solution: next.goal,
        details: next.goal
      })
      return next
    })
    setSyncState('pending')
  }

  const handlePlanRedirect = useCallback(
    (planId) => {
      setHighlightedPlan(planId)
      const plan = PLAN_OPTIONS.find((item) => item.id === planId)

      if (plan?.checkoutUrl && typeof window !== 'undefined') {
        window.open(plan.checkoutUrl, '_blank', 'noopener')
      }
    },
    []
  )

  return (
    <div className="app-container min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/20">
              <Sparkles className="size-5 text-purple-300" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Titanio Studio</h1>
              <p className="text-sm text-white/60">
                Plataforma completa para música, vídeo, campanhas e consultoria legal.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
            <StatusPill icon={Bot} label="Assistente IA" />
            <StatusPill icon={ShieldCheck} label="Agente Legal" />
            <StatusPill icon={Zap} label="Google Ads API v16" />
            <StatusPill icon={Database} label="Supabase CRM" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          <AssistantChat
            profile={profile}
            plans={PLAN_OPTIONS}
            aiRecommendations={AI_RECOMMENDATIONS}
            onPlanRequested={(planId) => {
              handlePlanRedirect(planId)
            }}
            requestGoogleStatus={refreshGoogleStatus}
          />

          <aside className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <MessageSquare className="size-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Seus dados salvos</h2>
                <p className="text-xs text-white/60">
                  Informe como prefere ser contactado. Salvamos localmente e no Supabase.
                </p>
              </div>
            </div>

            <form className="space-y-4">
              {PROFILE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    {field.label}
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40"
                    placeholder={field.placeholder}
                    value={profile[field.key] || ''}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  />
                </div>
              ))}
            </form>

            <ProfileStatus
              profileSource={profileSource}
              syncState={syncState}
              lastSyncedAt={lastSyncedAt}
            />
          </aside>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Planos recomendados</h2>
            <Button
              className="bg-purple-500/80 px-4 py-5 text-sm font-semibold text-white hover:bg-purple-500"
              onClick={() => setHighlightedPlan(null)}
              type="button"
            >
              Limpar destaque
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PLAN_OPTIONS.map((plan) => (
              <article
                key={plan.id}
                className={`flex h-full flex-col gap-4 rounded-2xl border bg-white/[0.02] p-6 transition ${
                  highlightedPlan === plan.id
                    ? 'border-purple-400/60 ring-2 ring-purple-500/40'
                    : 'border-white/10 hover:border-purple-400/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                    <p className="text-sm text-white/60">{plan.summary}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 text-purple-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.checkoutUrl && (
                  <Button
                    type="button"
                    className="mt-auto w-full justify-center bg-purple-500/90 text-sm font-semibold text-white hover:bg-purple-500"
                    onClick={() => handlePlanRedirect(plan.id)}
                  >
                    Ir para pagamento
                  </Button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Status das integrações</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <IntegrationCard
              title="Google Ads Backend"
              description="Servidor Node que renova tokens OAuth e cria campanhas pela API v16."
              state={googleStatus.state}
              checkedAt={googleStatus.checkedAt}
              onRefresh={refreshGoogleStatus}
            />
            <IntegrationCard
              title="Supabase Briefing Store"
              description="Tabela REST sincronizada com seus dados de contato e objetivos."
              state={profile.email ? (syncState === 'synced' ? 'ok' : 'pending') : 'local'}
            />
            <IntegrationCard
              title="Pagamentos Stripe"
              description="Cobrança internacional segura para todos os planos e add-ons."
              state="ok"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Titanio Studio. Todos os direitos reservados.</span>
          <div className="flex flex-wrap items-center gap-4">
            <a className="flex items-center gap-2 hover:text-white" href="mailto:contato@titaniostudio.com">
              <Mail className="size-4" /> contato@titaniostudio.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatusPill({ icon, label }) {
  const IconComponent = icon
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
      <IconComponent className="size-4 text-white/60" />
      <span>{label}</span>
    </span>
  )
}

function ProfileStatus({ profileSource, syncState, lastSyncedAt }) {
  let message = 'Aguardando informações.'
  let tone = 'text-white/50'

  if (syncState === 'pending') {
    message = 'Salvando alterações...'
    tone = 'text-purple-200'
  } else if (syncState === 'syncing') {
    message = 'Enviando dados para o Supabase...'
    tone = 'text-purple-200'
  } else if (syncState === 'synced') {
    message = `Sincronizado com Supabase${lastSyncedAt ? ` em ${formatTime(lastSyncedAt)}` : ''}.`
    tone = 'text-emerald-200'
  } else if (syncState === 'local') {
    message = 'Guardado localmente. Informe um e-mail para sincronizar com Supabase.'
    tone = 'text-amber-200'
  }

  const origin = profileSource === 'supabase' ? 'Dados carregados do Supabase.' : profileSource === 'local' ? 'Dados carregados deste dispositivo.' : ''

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-sm">
      <div className={`font-medium ${tone}`}>{message}</div>
      {origin && <p className="mt-1 text-xs text-white/40">{origin}</p>}
    </div>
  )
}

function IntegrationCard({ title, description, state, checkedAt, onRefresh }) {
  const isLoading = state === 'loading'
  const isOk = state === 'ok'
  const isError = state === 'error'
  const isLocal = state === 'local'
  const isPending = state === 'pending'

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="space-y-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {(isLoading || isPending) && (
            <Loader2 className="size-4 animate-spin text-purple-200" />
          )}
          {isOk && <CheckCircle2 className="size-4 text-emerald-300" />}
          {isError && <AlertCircle className="size-4 text-amber-300" />}
          {isLocal && <Database className="size-4 text-white/50" />}
          <span className="text-white/70">
            {(isLoading || isPending) && 'Verificando...'}
            {isOk && 'Operacional'}
            {isError && 'Atenção necessária'}
            {isLocal && 'Dados locais'}
          </span>
        </span>
        {typeof onRefresh === 'function' && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onRefresh}
            type="button"
          >
            Atualizar
          </Button>
        )}
      </div>
      {checkedAt && (
        <p className="mt-2 text-xs text-white/40">Última verificação: {formatTime(checkedAt)}</p>
      )}
    </div>
  )
}

function formatTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
