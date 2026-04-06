'use client'

import { Campaign } from '@/lib/supabase'
import { Calendar, DollarSign, TrendingUp } from 'lucide-react'

interface CampaignCardProps {
  campaign: Campaign
  onClick?: () => void
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
}

const statusLabels = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  active: 'Ativa',
  completed: 'Finalizada',
}

const platformIcons = {
  instagram: '📸',
  facebook: '👥',
  google: '🔍',
}

export default function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{platformIcons[campaign.platform]}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
            <p className="text-sm text-gray-500 capitalize">{campaign.platform}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
          {statusLabels[campaign.status]}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span>R$ {campaign.budget.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(campaign.start_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  )
}
