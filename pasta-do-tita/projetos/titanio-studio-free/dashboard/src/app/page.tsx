'use client'

import { useState, useEffect } from 'react'
import StatsCard from '@/components/StatsCard'
import CampaignCard from '@/components/CampaignCard'
import PostComposer from '@/components/PostComposer'
import { 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  TrendingUp,
  Plus
} from 'lucide-react'
import { Campaign } from '@/lib/supabase'

// Mock data - será substituído por Supabase
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Promoção Cinema H2O',
    description: 'Campanha de divulgação dos filmes do fim de semana com desconto especial',
    platform: 'instagram',
    status: 'active',
    budget: 500,
    start_date: '2026-04-06',
    end_date: '2026-04-12',
    created_at: '2026-04-05',
    user_id: '1'
  },
  {
    id: '2',
    title: 'Lançamento Filme Novo',
    description: 'Estreia exclusiva com pré-venda de ingressos',
    platform: 'facebook',
    status: 'scheduled',
    budget: 1000,
    start_date: '2026-04-10',
    end_date: '2026-04-20',
    created_at: '2026-04-05',
    user_id: '1'
  },
  {
    id: '3',
    title: 'Remarketing Clientes',
    description: 'Campanha para clientes que visitaram o site mas não compraram',
    platform: 'google',
    status: 'active',
    budget: 300,
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    created_at: '2026-04-01',
    user_id: '1'
  }
]

const mockStats = {
  impressions: 45230,
  clicks: 2341,
  spend: 1247.50,
  conversions: 89
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [stats, setStats] = useState(mockStats)

  const handleNewPost = async (post: { content: string; platforms: string[]; scheduledFor?: string }) => {
    // Aqui vai integrar com N8n para postar automaticamente
    console.log('Novo post:', post)
    
    // Chama webhook do N8n
    try {
      await fetch('/api/webhook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      })
      alert('Post enviado para processamento! ✅')
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao Titanio Studio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Impressões"
          value={stats.impressions.toLocaleString('pt-BR')}
          change="+12% vs semana passada"
          changeType="positive"
          icon={Eye}
          color="purple"
        />
        <StatsCard
          title="Cliques"
          value={stats.clicks.toLocaleString('pt-BR')}
          change="+8% vs semana passada"
          changeType="positive"
          icon={MousePointerClick}
          color="blue"
        />
        <StatsCard
          title="Gasto"
          value={`R$ ${stats.spend.toLocaleString('pt-BR')}`}
          change="Dentro do orçamento"
          changeType="neutral"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Conversões"
          value={stats.conversions}
          change="+23% vs semana passada"
          changeType="positive"
          icon={TrendingUp}
          color="pink"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Campanhas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>

        {/* Post Composer */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Post Rápido</h2>
          <PostComposer onSubmit={handleNewPost} />
        </div>
      </div>
    </div>
  )
}
