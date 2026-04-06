'use client'

import { useState } from 'react'
import CampaignCard from '@/components/CampaignCard'
import { Plus, Filter, Search } from 'lucide-react'
import { Campaign } from '@/lib/supabase'

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Promoção Cinema H2O',
    description: 'Campanha de divulgação dos filmes do fim de semana com desconto especial para clientes cadastrados',
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
    description: 'Estreia exclusiva com pré-venda de ingressos e brindes para os primeiros compradores',
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
    description: 'Campanha para clientes que visitaram o site mas não compraram ingresso nos últimos 7 dias',
    platform: 'google',
    status: 'active',
    budget: 300,
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    created_at: '2026-04-01',
    user_id: '1'
  },
  {
    id: '4',
    title: 'Festival de Cinema',
    description: 'Divulgação do festival anual com programação especial e preços promocionais',
    platform: 'instagram',
    status: 'draft',
    budget: 2000,
    start_date: '2026-05-01',
    end_date: '2026-05-15',
    created_at: '2026-04-06',
    user_id: '1'
  }
]

export default function CampanhasPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)

  const filteredCampaigns = campaigns.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter || c.platform === filter
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas campanhas de marketing</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Campanha
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total de Campanhas</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Campanhas Ativas</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Orçamento Total</p>
          <p className="text-2xl font-bold text-purple-600">R$ {stats.totalBudget.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="scheduled">Agendadas</option>
            <option value="draft">Rascunhos</option>
            <option value="completed">Finalizadas</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma campanha encontrada</p>
        </div>
      )}

      {/* New Campaign Modal (simplified) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Nova Campanha</h2>
            <p className="text-gray-500 mb-4">
              Funcionalidade em desenvolvimento. 
              Por enquanto, as campanhas são criadas via N8n.
            </p>
            <button
              onClick={() => setShowNewModal(false)}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
