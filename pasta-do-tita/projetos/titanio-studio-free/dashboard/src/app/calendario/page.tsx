'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/SocialIcons'

interface ScheduledPost {
  id: string
  content: string
  platform: 'instagram' | 'facebook' | 'twitter'
  date: string
  time: string
  status: 'scheduled' | 'published' | 'failed'
}

const mockPosts: ScheduledPost[] = [
  { id: '1', content: '🎬 Hoje tem cinema! Bacurau às 20h...', platform: 'instagram', date: '2026-04-06', time: '14:00', status: 'published' },
  { id: '2', content: '📢 Promoção relâmpago! Ingressos...', platform: 'facebook', date: '2026-04-07', time: '10:00', status: 'scheduled' },
  { id: '3', content: '🍿 Dica de filme para o fds...', platform: 'twitter', date: '2026-04-07', time: '18:00', status: 'scheduled' },
  { id: '4', content: '✨ Estreia exclusiva amanhã...', platform: 'instagram', date: '2026-04-08', time: '12:00', status: 'scheduled' },
  { id: '5', content: '🎭 Festival de cinema começa...', platform: 'instagram', date: '2026-04-10', time: '09:00', status: 'scheduled' },
]

const platformIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  twitter: XIcon,
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-600',
  facebook: 'bg-blue-100 text-blue-600',
  twitter: 'bg-sky-100 text-sky-600',
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [posts] = useState<ScheduledPost[]>(mockPosts)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter(p => p.date === dateStr)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário Editorial</h1>
          <p className="text-gray-500 mt-1">Visualize e gerencie seus posts agendados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Agendar Post
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty days */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg" />
          ))}
          
          {/* Days with posts */}
          {days.map(day => {
            const dayPosts = getPostsForDay(day)
            const isToday = day === 6 && currentDate.getMonth() === 3 // Mock: today is April 6
            
            return (
              <div 
                key={day} 
                className={`h-24 border rounded-lg p-2 overflow-hidden ${
                  isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-600'}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 2).map(post => {
                    const Icon = platformIcons[post.platform]
                    return (
                      <div 
                        key={post.id} 
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${platformColors[post.platform]}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{post.time}</span>
                      </div>
                    )
                  })}
                  {dayPosts.length > 2 && (
                    <span className="text-xs text-gray-400">+{dayPosts.length - 2} mais</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Posts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Próximos Posts</h3>
        <div className="space-y-3">
          {posts.filter(p => p.status === 'scheduled').map(post => {
            const Icon = platformIcons[post.platform]
            return (
              <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${platformColors[post.platform]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 truncate">{post.content}</p>
                  <p className="text-xs text-gray-500">{post.date} às {post.time}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  Agendado
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
