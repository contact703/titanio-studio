import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import {
  Menu,
  X,
  Sparkles,
  Music,
  Film,
  ArrowRight,
  Mail,
  Instagram,
  Youtube,
  Linkedin,
  Bot,
  Scale,
  Send,
  CreditCard,
  Mic2,
  AudioWaveform,
  ShieldCheck,
  FileText,
  BookOpen,
  Database,
  Layers,
  Cpu,
  LineChart,
  Rocket,
  ClipboardList,
  CheckCircle2,
  Target,
  CalendarCheck
} from 'lucide-react'
import './App.css'
import InteractivePlayground from './sections/InteractivePlayground.jsx'
import { loadContactData, persistContactData, saveContactDraft } from './lib/contactStorage.js'

const NAV_ITEMS = [
  { id: 'services', label: 'Plataforma', color: 'border-purple-500' },
  { id: 'music', label: 'Música IA', color: 'border-cyan-400' },
  { id: 'playground', label: 'Demo Interativa', color: 'border-blue-500' },
  { id: 'legal', label: 'Agente Legal', color: 'border-pink-500' },
  { id: 'architecture', label: 'Arquitetura', color: 'border-green-400' },
  { id: 'pricing', label: 'Pricing', color: 'border-orange-400' },
  { id: 'roadmap', label: 'Roadmap', color: 'border-yellow-400' },
  { id: 'about', label: 'Sobre', color: 'border-teal-400' },
  { id: 'contact', label: 'Contato', color: 'border-blue-400' }
]

const PLATFORM_FEATURES = [
  {
    icon: Film,
    title: 'Geração de Vídeos com IA',
    description:
      'Kling, Runway e Wan 2.5 para videoclipes em 4K com opções de lip-sync, efeitos avançados e fluxos automatizados de revisão.',
    color: 'purple'
  },
  {
    icon: Bot,
    title: 'Edição via Chat com InVideo AI',
    description:
      'Refine cortes, legendas e efeitos conversando com um assistente conectado ao InVideo AI, mantendo histórico de alterações.',
    color: 'cyan'
  },
  {
    icon: Music,
    title: 'Geração de Música Integrada',
    description:
      'Fluxo dual-provider com Suno AI (GoAPI.ai) e MusicGPT para stems, voice changing e mais de 1000 vozes personalizadas.',
    color: 'green'
  },
  {
    icon: Scale,
    title: 'Agente Legal de IA',
    description:
      'Consultoria automatizada em direitos autorais, licenciamento e uso comercial com RAG e referências a ToS e legislações globais.',
    color: 'purple'
  },
  {
    icon: Send,
    title: 'Publicação Automatizada',
    description:
      'Integração com Metricool para agendamento inteligente em Instagram, YouTube e outras plataformas após a aprovação do cliente.',
    color: 'cyan'
  },
  {
    icon: CreditCard,
    title: 'Pagamentos Integrados',
    description:
      'Stripe e PayPal com planos premium, add-ons de música IA e billing automatizado para serviços e SaaS.',
    color: 'green'
  }
]

const MUSIC_PROVIDERS = [
  {
    name: 'Suno AI',
    role: 'Primário',
    highlight: 'Perfeito para projetos rápidos com excelente relação custo-benefício.',
    promptExample: '"Upbeat pop song about chasing dreams"',
    features: ['Entrega em ~2 minutos', 'Ajustes instantâneos e looping', 'Automação com geração de vídeo pós-aprovação'],
    pricing: 'Premium: +$50-100 por faixa',
    technology: 'API via GoAPI.ai (não oficial) • Custo: $0.02/música',
    icon: Mic2
  },
  {
    name: 'MusicGPT',
    role: 'Secundário Avançado',
    highlight: 'Ideal para clientes que precisam de stems, vozes customizadas e controle fino.',
    promptExample: 'Prompt detalhado com referências de estilo, arranjo e instrumentação.',
    features: ['2 versões por prompt', 'Download de stems separados', 'Voice changing com 1000+ vozes IA'],
    pricing: 'Pro Plan: $0.03/música (créditos iniciais de $20)',
    technology: 'API oficial MusicGPT • RAG de presets de voz',
    icon: AudioWaveform
  }
]

const MUSIC_WORKFLOW = [
  'Cliente escolhe upload ou geração com IA diretamente no fluxo do projeto.',
  'Prompt é enviado ao provider selecionado com presets de gênero, mood, duração e vocal.',
  'Preview em tempo real com controles de play/pause e histórico de versões.',
  'Aprovação dispara automação de vídeo e sincronização com o roteiro visual.',
  'Logs armazenam prompt, provider e direitos comerciais para auditoria.'
]

const LEGAL_CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: 'Orientação Comercial',
    description:
      'Garantia sobre usos permitidos em plataformas como YouTube, Spotify e campanhas pagas, com recomendações práticas.'
  },
  {
    icon: FileText,
    title: 'Referências Legislativas',
    description:
      'Links diretos para Suno ToS, EU AI Act, US Copyright Office, Lei 9.610/98 e jurisprudências relevantes.'
  },
  {
    icon: BookOpen,
    title: 'Base Atualizada Mensalmente',
    description:
      'Pipeline de RAG com Pinecone e embeddings GPT-4 para manter o conhecimento jurídico sempre atualizado.'
  }
]

const ARCHITECTURE_LAYERS = [
  {
    title: 'Frontend',
    items: ['React + Next.js', 'Dashboard com geração guiada', 'Componentes otimizados para conversão'],
    icon: Layers
  },
  {
    title: 'Backend',
    items: ['Node.js + Python', 'Orquestração de filas e webhooks', 'Integrações com provedores de IA'],
    icon: Cpu
  },
  {
    title: 'Dados',
    items: ['PostgreSQL (Supabase)', 'Pinecone para RAG', 'Logs auditáveis de prompts e direitos'],
    icon: Database
  }
]

const INTEGRATION_HIGHLIGHTS = [
  '🎥 Kling, Runway e Wan2.5 para vídeo',
  '💬 InVideo AI para edição via chat',
  '🎵 Suno AI + MusicGPT com fallback Mubert/Soundraw',
  '⚖️ GPT-4 / Claude 3.5 com RAG jurídico',
  '📊 Qwen + Whisper para análise de áudio',
  '💳 Stripe, PayPal, Metricool, SendGrid e Google Analytics'
]

const SERVICE_PLANS = [
  {
    name: 'Basic',
    price: '$1,250',
    includes: ['1 videoclipe (3 min) em HD 1080p', '2 revisões guiadas', 'Upload de música própria', 'Agente Legal incluído'],
    addons: ['+$75 Geração de Música IA']
  },
  {
    name: 'Standard',
    price: '$2,000',
    includes: [
      '1 videoclipe (4 min) em Full HD + 4K',
      '3 revisões',
      'Upload de música própria',
      'Agente Legal incluído',
      'Color grading profissional'
    ],
    addons: ['+$75 Música IA', '+$50 Lip-sync']
  },
  {
    name: 'Premium',
    price: '$3,000',
    includes: [
      '1 videoclipe (5 min) em 4K',
      'Revisões ilimitadas',
      'Música IA inclusa (Suno/MusicGPT)',
      'Agente Legal incluído',
      'Efeitos avançados e lip-sync'
    ],
    addons: []
  }
]

const SAAS_PLANS = [
  {
    name: 'Free',
    price: '$0/mês',
    credits: '10 créditos',
    music: 'Sem música IA',
    legal: 'Agente Legal (limitado)'
  },
  {
    name: 'Creator',
    price: '$49/mês',
    credits: '100 créditos',
    music: '5 músicas IA/mês',
    legal: 'Agente Legal completo'
  },
  {
    name: 'Pro',
    price: '$99/mês',
    credits: '300 créditos',
    music: '20 músicas IA/mês',
    legal: 'Agente Legal completo'
  },
  {
    name: 'Studio',
    price: '$299/mês',
    credits: '1000 créditos',
    music: 'Música IA ilimitada',
    legal: 'Agente Legal + consultoria'
  }
]

const ROADMAP_PHASES = [
  {
    phase: 'Fase 1 · MVP',
    timeline: 'Mês 1-2',
    status: 'Em andamento',
    items: [
      'Setup Vercel + Next.js, banco PostgreSQL e autenticação',
      'Landing page, Stripe e fundações do dashboard',
      'Upload de música e Kling API em progresso'
    ]
  },
  {
    phase: 'Fase 2 · Música IA',
    timeline: 'Mês 2-3',
    status: '🆕 Novo',
    items: [
      'Integração dual Suno + MusicGPT com fila e webhooks',
      'UI avançada com preview, stems e tooltips educacionais',
      'Beta com 5 clientes para ajustar prompts e SLAs'
    ]
  },
  {
    phase: 'Fase 3 · Agente Legal',
    timeline: 'Mês 3-4',
    status: '🆕 Novo',
    items: [
      'Coleta de legislações e termos Suno/Kling/Runway/OpenAI',
      'RAG com Pinecone + GPT-4/Claude 3.5 para respostas com referências',
      'Chat com histórico, FAQ e disclaimers legais'
    ]
  },
  {
    phase: 'Fase 4-7 · Expansão',
    timeline: 'Mês 4-8',
    status: 'Planejado',
    items: [
      'Integração InVideo AI, Metricool e automações',
      'Testes de carga, documentação e onboarding',
      'Beta fechado seguido de lançamento público'
    ]
  }
]

const WEEKLY_FOCUS = [
  {
    title: 'Geração de Música',
    tasks: [
      'Criar contas no GoAPI.ai e MusicGPT e validar chaves',
      'Testar 5 faixas em cada provider e avaliar qualidade',
      'Documentar estratégia dual-provider e resultados'
    ]
  },
  {
    title: 'Agente Legal',
    tasks: [
      'Mapear documentos legais prioritários',
      'Baixar leis, termos de serviço e casos judiciais',
      'Protótipo de prompt com GPT-4 para avaliar tom e formato'
    ]
  },
  {
    title: 'Google Ads API',
    tasks: ['Aguardar propagação da aprovação', 'Testar criação de campanha via API', 'Planejar primeira campanha Titanio']
  }
]

const DOCUMENTS_NEEDED = [
  'US Copyright Act (Title 17) e DMCA',
  'EU AI Act e AI Liability Directive',
  'Leis brasileiras 9.610/98 (Direitos Autorais) e 13.709/18 (LGPD)',
  'Termos de serviço: Suno, Kling, Runway, OpenAI, YouTube, Spotify',
  'Casos: Andersen v. Stability AI, Getty v. Stability, Thaler v. Perlmutter, Authors Guild v. OpenAI',
  'Guias: US Copyright Office AI Works, WIPO AI & IP Policy'
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [contactForm, setContactForm] = useState({ name: '', email: '', solution: '', details: '' })
  const [contactErrors, setContactErrors] = useState({})
  const [contactStatus, setContactStatus] = useState('idle')
  const [contactFeedback, setContactFeedback] = useState('')
  const [contactPrefillSource, setContactPrefillSource] = useState(null)
  const [contactInitialized, setContactInitialized] = useState(false)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', ...NAV_ITEMS.map((item) => item.id)]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let isMounted = true

    const hydrateContactForm = async () => {
      const { data, source } = await loadContactData()
      if (!isMounted) return

      if (data) {
        setContactForm({
          name: data.name ?? '',
          email: data.email ?? '',
          solution: data.solution ?? '',
          details: data.details ?? ''
        })
        if (source === 'supabase') {
          setContactPrefillSource('Carregamos automaticamente seu último briefing sincronizado pela Supabase.')
        } else if (source === 'local') {
          setContactPrefillSource('Continuamos do ponto onde você parou neste dispositivo.')
        }
      }

      setContactInitialized(true)
    }

    hydrateContactForm()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!contactInitialized) {
      return
    }
    saveContactDraft(contactForm)
  }, [contactForm, contactInitialized])

  useEffect(() => {
    if (contactStatus === 'idle') {
      return undefined
    }

    const timeout = setTimeout(() => {
      setContactStatus('idle')
      setContactFeedback('')
    }, 6000)

    return () => clearTimeout(timeout)
  }, [contactStatus])

  const handleContactChange = (field) => (event) => {
    const value = event.target.value
    setContactForm((prev) => ({ ...prev, [field]: value }))
    if (contactStatus !== 'idle') {
      setContactStatus('idle')
      setContactFeedback('')
    }
  }

  const validateContactForm = () => {
    const errors = {}
    if (!contactForm.name.trim()) {
      errors.name = 'Informe seu nome completo.'
    }
    if (!contactForm.email.trim()) {
      errors.email = 'Informe um e-mail válido.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      errors.email = 'Formato de e-mail inválido.'
    }
    if (!contactForm.solution) {
      errors.solution = 'Selecione a solução que melhor representa sua necessidade.'
    }
    if (contactForm.details.trim().length < 20) {
      errors.details = 'Descreva seu projeto com pelo menos 20 caracteres para entendermos o contexto.'
    }
    return errors
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    const errors = validateContactForm()
    setContactErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmittingContact(true)
    try {
      const { error, storedInSupabase } = await persistContactData(contactForm)
      if (error) {
        setContactStatus('error')
        setContactFeedback(
          'Não foi possível sincronizar com a Supabase agora. Seus dados continuam salvos neste dispositivo.'
        )
      } else {
        setContactStatus('success')
        setContactFeedback(
          storedInSupabase
            ? 'Briefing salvo e sincronizado com a Supabase. Você poderá continuar em qualquer dispositivo.'
            : 'Briefing salvo localmente. Adicione as variáveis de ambiente da Supabase para sincronizar na nuvem.'
        )
        setContactPrefillSource(
          storedInSupabase
            ? 'Carregamos automaticamente seu último briefing sincronizado pela Supabase.'
            : 'Continuamos do ponto onde você parou neste dispositivo.'
        )
      }
    } catch (error) {
      console.error('[contact-form] Falha ao salvar briefing:', error)
      setContactStatus('error')
      setContactFeedback('Não foi possível salvar seu briefing agora. Tente novamente em instantes.')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-extrabold text-white cursor-pointer" onClick={() => scrollToSection('hero')}>
              TITANIO<span className="text-purple-500">.</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors border-b-2 ${item.color} pb-1 ${
                    activeSection === item.id ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left text-sm font-medium transition-colors border-l-2 ${item.color} pl-4 py-2 ${
                    activeSection === item.id ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Videoclipes completos,<br />
            <span className="text-purple-500">com música original e segurança jurídica.</span>
          </h1>
          <p className="hero-subtitle">
            Titanio Studio é a plataforma SaaS para criar músicas com Suno AI ou MusicGPT, gerar videoclipes em Kling/Runway, editar via chat, publicar automaticamente e receber orientação legal em um único fluxo.
          </p>
          <div className="hero-ctas">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg"
              onClick={() => scrollToSection('services')}
            >
              Ver Plataforma 3.0
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-semibold px-8 py-6 text-lg"
              onClick={() => scrollToSection('roadmap')}
            >
              Conferir Roadmap
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Plataforma Titanio Studio 3.0</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
            Uma esteira completa para artistas, estúdios e criadores: geração de música, videoclipes, edição colaborativa, publicação automatizada e suporte jurídico. Tudo com margens de até 99% em add-ons de música.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {PLATFORM_FEATURES.map((feature) => (
              <ServiceCard
                key={feature.title}
                icon={<feature.icon size={40} />}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 uppercase tracking-widest">
                <Sparkles size={16} /> Geração de Música IA
              </span>
              <h2 className="section-title text-left mt-4">Suno AI + MusicGPT: escolha o melhor fluxo para cada projeto</h2>
              <p className="text-gray-300 text-lg leading-relaxed mt-6">
                Ofereça música original em minutos ou produções avançadas com stems, vozes customizadas e controle granular. Cada provider é tratado como um módulo plugável, com métricas de custo, qualidade e SLA monitoradas pelo backend.
              </p>
              <ul className="mt-8 space-y-3 text-gray-300">
                {MUSIC_WORKFLOW.map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 text-purple-400" size={18} />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 grid gap-6">
              {MUSIC_PROVIDERS.map((provider) => (
                <MusicProviderCard key={provider.name} provider={provider} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Playground Section */}
      <section id="playground" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Experimente o Titanio Studio</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
            Simule um projeto com música IA, estime margens e faça perguntas ao agente jurídico para entender como a plataforma funciona na prática.
          </p>
          <div className="mt-12">
            <InteractivePlayground />
          </div>
        </div>
      </section>

      {/* Legal Agent Section */}
      <section id="legal" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 uppercase tracking-widest">
              <Scale size={16} /> Agente Legal de IA
            </span>
            <h2 className="section-title mt-4">Segurança jurídica integrada para cada decisão criativa</h2>
            <p className="text-gray-400 text-lg mt-6">
              Chatbot especializado em direitos autorais, licenciamento e uso de IA. Trabalha com RAG, cita termos de serviço e aponta obrigações por região em tempo real, reduzindo riscos e acelerando aprovações.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {LEGAL_CAPABILITIES.map((capability) => (
              <LegalCapabilityCard key={capability.title} capability={capability} />
            ))}
          </div>

          <div className="mt-16 bg-black/60 border border-pink-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Exemplo real de atendimento</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-black/60 border border-white/10 rounded-lg p-6">
                <p className="text-sm font-semibold text-purple-400 mb-2">Cliente</p>
                <p className="text-gray-300 leading-relaxed">“Posso usar uma música gerada pelo Suno comercialmente?”</p>
              </div>
              <div className="bg-black/60 border border-white/10 rounded-lg p-6">
                <p className="text-sm font-semibold text-pink-400 mb-2">Agente Titanio</p>
                <p className="text-gray-300 leading-relaxed">
                  “Sim! Termos Suno (v2.1, seção 4.2) garantem direitos comerciais para planos Pro/Premier. Recomenda-se manter assinatura ativa, guardar prompt e recibos. Referências: Suno ToS, US Copyright Office (2023), EU AI Act art. 52.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Arquitetura Atualizada</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
            Uma stack moderna com camadas independentes para frontend, backend e dados. Cada módulo de IA é integrado via filas e webhooks, garantindo rastreabilidade total dos prompts e conformidade com termos de serviço.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <ArchitectureCard key={layer.title} layer={layer} />
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-10">
            <div className="bg-black/60 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <LineChart size={24} className="text-cyan-400" /> Integrações de IA
              </h3>
              <ul className="space-y-3 text-gray-300">
                {INTEGRATION_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Sparkles className="mt-1 text-cyan-400" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Rocket size={24} className="text-purple-400" /> Metas Financeiras
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Custos mensais estimados entre $344-589 com break-even em um cliente Basic/mês. Margem média projetada em 91,6% e receita potencial de $86,950 no ano 1 considerando add-on de música em 50% dos projetos.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Monitoramento de CAC, LTV e margem é feito via dashboards Mixpanel + Stripe, alimentados pelos mesmos logs de produção.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Pricing Atualizado</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
            Modelos híbridos de serviço e SaaS garantem receita recorrente e upsell com geração de música. Margem média de 91,6% considerando uso de Suno/MusicGPT como add-on.
          </p>

          <div className="mt-12 grid lg:grid-cols-2 gap-10">
            <PricingTable title="Planos de Produção" plans={SERVICE_PLANS} icon={<ClipboardList size={24} className="text-purple-400" />} />
            <PricingTable title="Planos SaaS (Futuro)" plans={SAAS_PLANS} icon={<Rocket size={24} className="text-cyan-400" />} type="saas" />
          </div>

          <div className="mt-12 bg-black/60 border border-white/10 rounded-xl p-8 text-gray-300">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Target size={24} className="text-yellow-400" /> Objetivo Financeiro Ano 1
            </h3>
            <p>
              Receita projetada de $85,000 em serviços + $1,950 em add-ons de música IA, totalizando $86,950 com lucro estimado de $79,849. Break-even atingido com apenas um cliente Basic por mês.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Roadmap 2025</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
            Linha do tempo focada em lançar a versão completa em até 8 meses, iniciando pelo MVP já em progresso e expandindo com música IA dual-provider e agente legal proprietário.
          </p>

          <div className="mt-12 grid lg:grid-cols-2 gap-10">
            {ROADMAP_PHASES.map((phase) => (
              <RoadmapPhase key={phase.phase} phase={phase} />
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-10">
            <div className="bg-black/60 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CalendarCheck size={24} className="text-purple-400" /> Prioridades da Semana
              </h3>
              <div className="space-y-6">
                {WEEKLY_FOCUS.map((focus) => (
                  <div key={focus.title}>
                    <h4 className="text-lg font-semibold text-white mb-2">{focus.title}</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      {focus.tasks.map((task) => (
                        <li key={task} className="flex items-start gap-2">
                          <Sparkles size={16} className="mt-1 text-purple-400" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen size={24} className="text-cyan-400" /> Documentação Necessária
              </h3>
              <ul className="space-y-3 text-gray-300">
                {DOCUMENTS_NEEDED.map((doc) => (
                  <li key={doc} className="flex items-start gap-3">
                    <FileText size={18} className="mt-1 text-cyan-400" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Por que o Titanio Studio é único?</h2>
          <div className="max-w-4xl mx-auto mt-12 space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Construímos a plataforma pensando na jornada completa do artista: da criação musical à publicação e compliance. A versão 3.0 combina fluxo dual de música, geração de vídeo, edição por chat, distribuição automatizada e consultoria legal especializada.
            </p>
            <p>
              Nenhum concorrente oferece simultaneamente música IA integrada e um agente jurídico treinado em legislações EUA/EU/BR e termos de uso das principais plataformas. Nosso objetivo é que cada cliente produza com confiança comercial desde o primeiro briefing.
            </p>
            <p>
              Estamos investindo entre $5k-$8k para lançar em 7-8 meses, com ROI estimado de $80k no primeiro ano. O roadmap é executado com ciclos quinzenais, validando cada integração com clientes beta e especialistas legais.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Pronto para Amplificar Sua Criatividade?</h2>
          <p className="text-center text-gray-300 text-lg mt-4 max-w-2xl mx-auto mb-12">
            Entre em contato conosco e descubra como o Titanio Studio pode transformar suas ideias em realidade.
          </p>
          <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-4">
            {contactPrefillSource && (
              <p className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-4 py-3" role="note">
                {contactPrefillSource}
              </p>
            )}
            <div className="space-y-2">
              <input
                type="text"
                value={contactForm.name}
                onChange={handleContactChange('name')}
                placeholder="Seu Nome"
                aria-invalid={Boolean(contactErrors.name)}
                aria-describedby={contactErrors.name ? 'contact-name-error' : undefined}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {contactErrors.name && (
                <p id="contact-name-error" className="text-xs text-rose-400">
                  {contactErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="email"
                value={contactForm.email}
                onChange={handleContactChange('email')}
                placeholder="Seu Email"
                aria-invalid={Boolean(contactErrors.email)}
                aria-describedby={contactErrors.email ? 'contact-email-error' : undefined}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {contactErrors.email && (
                <p id="contact-email-error" className="text-xs text-rose-400">
                  {contactErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <select
                value={contactForm.solution}
                onChange={handleContactChange('solution')}
                aria-invalid={Boolean(contactErrors.solution)}
                aria-describedby={contactErrors.solution ? 'contact-solution-error' : undefined}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Qual solução você precisa?</option>
                <option value="full-video">Videoclipe completo (música + vídeo)</option>
                <option value="music-ia">Somente geração de música IA</option>
                <option value="legal">Consultoria com Agente Legal</option>
                <option value="saas">Planos SaaS Titanio Studio</option>
                <option value="other">Outro projeto personalizado</option>
              </select>
              {contactErrors.solution && (
                <p id="contact-solution-error" className="text-xs text-rose-400">
                  {contactErrors.solution}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <textarea
                placeholder="Conte-nos sobre seu projeto"
                rows="4"
                value={contactForm.details}
                onChange={handleContactChange('details')}
                aria-invalid={Boolean(contactErrors.details)}
                aria-describedby={contactErrors.details ? 'contact-details-error' : undefined}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              ></textarea>
              {contactErrors.details && (
                <p id="contact-details-error" className="text-xs text-rose-400">
                  {contactErrors.details}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
              disabled={isSubmittingContact}
            >
              {isSubmittingContact ? 'Enviando...' : 'Falar com o Titanio Studio'}
              <Mail className="ml-2" size={20} />
            </Button>
            {contactStatus !== 'idle' && contactFeedback && (
              <p
                className={`text-sm text-center rounded-lg px-4 py-3 border ${
                  contactStatus === 'success'
                    ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/40'
                    : 'text-rose-300 bg-rose-500/10 border-rose-400/40'
                }`}
                role="status"
                aria-live="polite"
              >
                {contactFeedback}
              </p>
            )}
          </form>
          <p className="text-sm text-gray-400 text-center mt-6">
            Precisa de uma resposta jurídica imediata? Use o Agente Legal diretamente no dashboard após criar sua conta.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-extrabold text-white mb-4">
                TITANIO<span className="text-purple-500">.</span>
              </div>
              <p className="text-gray-400 text-sm">
                Amplificando a criatividade através da inteligência artificial.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contato</h3>
              <p className="text-gray-400 text-sm mb-2">contato@titaniostudio.com</p>
              <p className="text-gray-400 text-sm">+55 (11) 9999-9999</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <Instagram className="text-gray-400 hover:text-purple-500 cursor-pointer transition-colors" size={24} />
                <Youtube className="text-gray-400 hover:text-purple-500 cursor-pointer transition-colors" size={24} />
                <Linkedin className="text-gray-400 hover:text-purple-500 cursor-pointer transition-colors" size={24} />
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 Titanio Studio. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Service Card Component
function ServiceCard({ icon, title, description, color }) {
  const colorClasses = {
    purple: 'border-purple-500/30 hover:border-purple-500 bg-purple-900/10',
    cyan: 'border-cyan-400/30 hover:border-cyan-400 bg-cyan-900/10',
    green: 'border-green-400/30 hover:border-green-400 bg-green-900/10'
  }

  const iconColorClasses = {
    purple: 'text-purple-500',
    cyan: 'text-cyan-400',
    green: 'text-green-400'
  }

  return (
    <div className={`p-8 rounded-lg border-2 ${colorClasses[color]} transition-all duration-300 hover:scale-105`}>
      <div className={`${iconColorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

// Music Provider Card
function MusicProviderCard({ provider }) {
  const Icon = provider.icon

  return (
    <div className="bg-black/60 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">{provider.role}</span>
          <h3 className="text-2xl font-bold text-white mt-1">{provider.name}</h3>
        </div>
        <Icon size={36} className="text-purple-400" />
      </div>
      <p className="text-gray-300 mt-4">{provider.highlight}</p>
      <p className="text-sm text-gray-400 italic mt-4">Exemplo de prompt: {provider.promptExample}</p>
      <ul className="mt-4 space-y-2 text-sm text-gray-300">
        {provider.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Sparkles size={14} className="mt-1 text-purple-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm text-gray-300">
        <p className="font-semibold text-white">Pricing</p>
        <p>{provider.pricing}</p>
      </div>
      <div className="mt-2 text-sm text-gray-400">
        <p className="font-semibold text-white/80">Tecnologia</p>
        <p>{provider.technology}</p>
      </div>
    </div>
  )
}

// Legal Capability Card
function LegalCapabilityCard({ capability }) {
  const Icon = capability.icon

  return (
    <div className="bg-black/60 border border-pink-500/30 rounded-xl p-6 hover:border-pink-400 transition-all duration-300">
      <Icon size={36} className="text-pink-400" />
      <h3 className="text-xl font-bold text-white mt-4">{capability.title}</h3>
      <p className="text-gray-300 mt-3 leading-relaxed">{capability.description}</p>
    </div>
  )
}

// Architecture Card
function ArchitectureCard({ layer }) {
  const Icon = layer.icon

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all duration-300">
      <Icon size={36} className="text-cyan-400" />
      <h3 className="text-xl font-bold text-white mt-4">{layer.title}</h3>
      <ul className="mt-4 space-y-2 text-gray-300">
        {layer.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Pricing Table
function PricingTable({ title, plans, icon, type = 'service' }) {
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-8">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="mt-6 space-y-6">
        {plans.map((plan) => (
          <div key={plan.name} className="border border-white/10 rounded-lg p-6">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-semibold text-white">{plan.name}</h4>
              <span className="text-lg font-bold text-purple-400">{plan.price}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {(type === 'service' ? plan.includes : [plan.credits, plan.music, plan.legal]).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-1 text-purple-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {type === 'service' && plan.addons.length > 0 && (
              <div className="mt-4 text-sm text-gray-400">
                <p className="font-semibold text-white/80">Add-ons</p>
                <ul className="mt-1 space-y-1">
                  {plan.addons.map((addon) => (
                    <li key={addon} className="flex items-start gap-2">
                      <Sparkles size={12} className="mt-1 text-yellow-400" />
                      <span>{addon}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Roadmap Phase
function RoadmapPhase({ phase }) {
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-8 hover:border-purple-400/60 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
          <p className="text-sm text-gray-400">{phase.timeline}</p>
        </div>
        <span className="text-sm font-semibold text-purple-400">{phase.status}</span>
      </div>
      <ul className="mt-6 space-y-3 text-gray-300 text-sm">
        {phase.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Sparkles size={14} className="mt-1 text-purple-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
