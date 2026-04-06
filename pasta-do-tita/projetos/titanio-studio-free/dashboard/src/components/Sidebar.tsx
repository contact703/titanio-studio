'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Megaphone, 
  BarChart3, 
  MessageSquare,
  Settings,
  Sparkles
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendário', href: '/calendario', icon: Calendar },
  { name: 'Campanhas', href: '/campanhas', icon: Megaphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'IA Copywriter', href: '/copywriter', icon: Sparkles },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Configurações', href: '/config', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Titanio Studio
        </h1>
        <p className="text-xs text-gray-400 mt-1">Automação Inteligente</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4">
          <p className="text-sm font-medium">🚀 Stack Gratuita</p>
          <p className="text-xs text-purple-200 mt-1">Supabase + Vercel + Groq</p>
        </div>
      </div>
    </aside>
  )
}
