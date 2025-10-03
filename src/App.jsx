import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Menu, X, Sparkles, Palette, TrendingUp, Music, Film, Users, Brush, ArrowRight, Mail, Instagram, Youtube, Linkedin } from 'lucide-react'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'services', 'audience', 'gallery', 'process', 'insights', 'about', 'contact']
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const navItems = [
    { id: 'services', label: 'Serviços', color: 'border-purple-500' },
    { id: 'audience', label: 'Para Quem', color: 'border-cyan-400' },
    { id: 'gallery', label: 'Galeria', color: 'border-pink-500' },
    { id: 'insights', label: 'Insights', color: 'border-green-400' },
    { id: 'about', label: 'Sobre', color: 'border-orange-400' },
    { id: 'contact', label: 'Contato', color: 'border-yellow-400' }
  ]

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
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium text-white/80 hover:text-white transition-colors border-b-2 ${item.color} pb-1`}
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
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left text-sm font-medium text-white/80 hover:text-white transition-colors border-l-2 ${item.color} pl-4 py-2`}
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
            Sua Criatividade,<br />
            <span className="text-purple-500">Amplificada por IA.</span>
          </h1>
          <p className="hero-subtitle">
            Transformamos suas ideias em conteúdo impactante. Criação de imagens, vídeos, campanhas e insights de mercado para músicos, cineastas, influencers e artistas.
          </p>
          <div className="hero-ctas">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg"
              onClick={() => scrollToSection('contact')}
            >
              Comece a Criar
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-semibold px-8 py-6 text-lg"
              onClick={() => scrollToSection('services')}
            >
              Explore as Possibilidades
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">O Que Fazemos</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <ServiceCard
              icon={<Palette size={40} />}
              title="Criação de Conteúdo Visual"
              description="Utilizamos as mais avançadas ferramentas de inteligência artificial para transformar suas ideias em imagens e vídeos de alta qualidade. Seja para capas de álbuns, posters de filmes, conteúdo para redes sociais ou campanhas publicitárias, nossa tecnologia permite que você visualize seus conceitos de forma rápida e profissional."
              color="purple"
            />
            <ServiceCard
              icon={<Sparkles size={40} />}
              title="Estratégia e Campanhas Digitais"
              description="Criar conteúdo é apenas o começo. Ajudamos você a impulsionar seu trabalho com estratégias de marketing digital personalizadas. Desenvolvemos campanhas para redes sociais, analisamos tendências do seu nicho e criamos narrativas que ressoam com seu público."
              color="cyan"
            />
            <ServiceCard
              icon={<TrendingUp size={40} />}
              title="Insights de Mercado e Tendências"
              description="Fornecemos relatórios e análises sobre tendências da indústria criativa, comportamento de audiência e oportunidades emergentes. Nossos insights baseados em IA mantêm você à frente da curva, seja você músico, cineasta ou influencer."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section id="audience" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Para Quem Criamos</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <AudienceCard
              icon={<Music size={32} />}
              title="Músicos"
              description="Crie capas de álbuns impactantes, visualizadores de áudio para suas músicas, conteúdo promocional para redes sociais e campanhas de lançamento que fazem sua música ser ouvida. Entenda as tendências de streaming e descubra novos públicos para sua arte."
              gradient="from-purple-600 to-pink-600"
            />
            <AudienceCard
              icon={<Film size={32} />}
              title="Cineastas"
              description="Desenvolva posters cinematográficos, trailers visuais, storyboards e conteúdo de divulgação para seus projetos. Lance campanhas que geram buzz e conecte-se com distribuidores e festivais através de materiais de marketing profissionais."
              gradient="from-cyan-500 to-blue-600"
            />
            <AudienceCard
              icon={<Users size={32} />}
              title="Influencers"
              description="Produza conteúdo visual consistente e de alta qualidade para suas plataformas, crie campanhas de marca pessoal que se destacam e use insights de dados para entender e crescer sua audiência. Transforme sua presença digital em um negócio sustentável."
              gradient="from-green-500 to-emerald-600"
            />
            <AudienceCard
              icon={<Brush size={32} />}
              title="Artistas Visuais"
              description="Explore novas formas de expressão através de ferramentas de IA generativa, crie séries de obras em diferentes estilos, desenvolva conteúdo para exposições e galerias virtuais, e promova seu trabalho com campanhas digitais direcionadas."
              gradient="from-orange-500 to-red-600"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Galeria de Trabalhos</h2>
          <p className="text-center text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            Exemplos de projetos criados com as ferramentas do Titanio Studio
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="gallery-item aspect-square bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <div className="w-full h-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={40} className="text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <ProcessStep
              number="01"
              title="Você Compartilha Sua Visão"
              description="Tudo começa com uma conversa. Você nos conta sobre seu projeto, seus objetivos, seu público e sua visão criativa. Não precisa ser técnico - apenas descreva o que você imagina."
            />
            <ProcessStep
              number="02"
              title="Nós Criamos e Refinamos"
              description="Nossa equipe e nossas ferramentas de IA trabalham juntas para transformar sua visão em realidade. Criamos opções, experimentamos estilos e refinamos até que o resultado seja exatamente o que você precisa."
            />
            <ProcessStep
              number="03"
              title="Você Recebe e Impulsiona"
              description="Entregamos os arquivos finais em alta qualidade, prontos para uso. Se o projeto inclui uma campanha digital, também fornecemos estratégias e insights para maximizar o impacto do seu conteúdo."
            />
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="section-container bg-zinc-950">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Insights & Blog</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <InsightCard
              title="O Futuro da Distribuição Musical: Como IA Está Mudando o Jogo"
              category="Música"
              color="purple"
            />
            <InsightCard
              title="5 Tendências Visuais para Cineastas Independentes em 2025"
              category="Cinema"
              color="cyan"
            />
            <InsightCard
              title="Como Influencers Estão Usando IA para Criar Conteúdo Mais Rápido"
              category="Marketing"
              color="green"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-container bg-black">
        <div className="container mx-auto px-6 py-20">
          <h2 className="section-title">Sobre o Titanio Studio</h2>
          <div className="max-w-4xl mx-auto mt-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              O Titanio Studio nasceu da crença de que a inteligência artificial não deve substituir a criatividade humana, mas amplificá-la. Somos uma equipe de estrategistas criativos, designers, desenvolvedores e especialistas em IA apaixonados por ajudar artistas e criadores a alcançar seu potencial máximo.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Entendemos os desafios do mundo criativo: prazos apertados, orçamentos limitados, a pressão constante de produzir conteúdo novo e relevante. Nossa missão é fornecer ferramentas e serviços que tornem o processo criativo mais eficiente, acessível e poderoso, permitindo que você foque no que faz de melhor - criar.
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
          <div className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Seu Nome"
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="email"
              placeholder="Seu Email"
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <select className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500">
              <option value="">Tipo de Projeto</option>
              <option value="music">Música</option>
              <option value="film">Cinema</option>
              <option value="influencer">Influencer</option>
              <option value="art">Arte Visual</option>
              <option value="other">Outro</option>
            </select>
            <textarea
              placeholder="Conte-nos sobre seu projeto"
              rows="4"
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            ></textarea>
            <Button
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
            >
              Enviar Mensagem
              <Mail className="ml-2" size={20} />
            </Button>
          </div>
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
                {navItems.map((item) => (
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

// Audience Card Component
function AudienceCard({ icon, title, description, gradient }) {
  return (
    <div className={`p-8 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105`}>
      <div className="text-white mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

// Process Step Component
function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="text-6xl font-extrabold text-purple-500/30 mb-4">{number}</div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

// Insight Card Component
function InsightCard({ title, category, color }) {
  const colorClasses = {
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-400',
    green: 'bg-green-400'
  }

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
        <Sparkles size={48} className="text-purple-400" />
      </div>
      <div className="p-6">
        <span className={`inline-block px-3 py-1 ${colorClasses[color]} text-black text-xs font-semibold rounded-full mb-3`}>
          {category}
        </span>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2 mt-4">
          Ler Mais <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default App
