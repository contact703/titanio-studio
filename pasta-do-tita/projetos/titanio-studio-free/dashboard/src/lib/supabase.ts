import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Database types
export interface Campaign {
  id: string
  title: string
  description: string
  platform: 'instagram' | 'facebook' | 'google'
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  budget: number
  start_date: string
  end_date: string
  created_at: string
  user_id: string
}

export interface Post {
  id: string
  content: string
  media_url?: string
  platform: 'instagram' | 'facebook' | 'twitter'
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for?: string
  published_at?: string
  created_at: string
  user_id: string
  campaign_id?: string
}

export interface Analytics {
  id: string
  campaign_id: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  date: string
}
