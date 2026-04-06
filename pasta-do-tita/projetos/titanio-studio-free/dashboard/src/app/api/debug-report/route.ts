import { NextRequest, NextResponse } from 'next/server'

interface CheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  value?: string | number
}

async function checkEndpoint(url: string, label: string): Promise<CheckResult> {
  try {
    const start = Date.now()
    const res = await fetch(url, { 
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    })
    const ms = Date.now() - start
    return {
      name: label,
      status: res.ok ? 'ok' : 'warning',
      message: res.ok ? `Respondendo em ${ms}ms` : `HTTP ${res.status}`,
      value: ms
    }
  } catch (e: any) {
    return {
      name: label,
      status: 'error',
      message: e.message || 'Timeout / Sem resposta'
    }
  }
}

async function checkInstagram(): Promise<CheckResult> {
  const token = process.env.IG_ACCESS_TOKEN
  if (!token) {
    return { name: 'Instagram API', status: 'warning', message: 'Token não configurado (usar instagrapi local)' }
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/me?access_token=${token}`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (data.id) {
      return { name: 'Instagram API', status: 'ok', message: `Conectado: ${data.name || data.id}` }
    }
    return { name: 'Instagram API', status: 'error', message: data.error?.message || 'Erro desconhecido' }
  } catch (e: any) {
    return { name: 'Instagram API', status: 'error', message: e.message }
  }
}

async function checkGroq(): Promise<CheckResult> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { name: 'Groq IA', status: 'warning', message: 'API Key não configurada' }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000)
    })
    const data = await res.json()
    const modelCount = data.data?.length || 0
    return { name: 'Groq IA', status: 'ok', message: `${modelCount} modelos disponíveis`, value: modelCount }
  } catch (e: any) {
    return { name: 'Groq IA', status: 'error', message: e.message }
  }
}

async function checkSupabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('your-project')) {
    return { name: 'Supabase', status: 'warning', message: 'Não configurado (usando dados mock)' }
  }
  try {
    const res = await fetch(`${url}/rest/v1/`, { signal: AbortSignal.timeout(5000) })
    return {
      name: 'Supabase',
      status: res.status < 500 ? 'ok' : 'error',
      message: res.status < 500 ? 'Conectado' : `HTTP ${res.status}`
    }
  } catch (e: any) {
    return { name: 'Supabase', status: 'error', message: e.message }
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Rodar todos os checks em paralelo
  const [
    groq,
    instagram,
    supabase,
    vercel,
    metaGraph,
  ] = await Promise.all([
    checkGroq(),
    checkInstagram(),
    checkSupabase(),
    checkEndpoint('https://dashboard-roan-seven-18.vercel.app', 'Vercel (Site Online)'),
    checkEndpoint('https://graph.facebook.com/v20.0/me', 'Meta Graph API'),
  ])

  const checks: CheckResult[] = [groq, instagram, supabase, vercel, metaGraph]

  const summary = {
    total: checks.length,
    ok: checks.filter(c => c.status === 'ok').length,
    warning: checks.filter(c => c.status === 'warning').length,
    error: checks.filter(c => c.status === 'error').length,
  }

  const score = Math.round((summary.ok / summary.total) * 100)
  const elapsed = Date.now() - startTime

  const report = {
    timestamp: new Date().toISOString(),
    score,
    status: score >= 80 ? '✅ SAUDÁVEL' : score >= 50 ? '⚠️ ATENÇÃO' : '❌ CRÍTICO',
    elapsed_ms: elapsed,
    summary,
    checks,
    recommendations: [] as string[]
  }

  // Recomendações automáticas
  if (!process.env.IG_ACCESS_TOKEN) {
    report.recommendations.push('Configure IG_ACCESS_TOKEN na Vercel para posts automáticos no Instagram')
  }
  if (!process.env.GROQ_API_KEY) {
    report.recommendations.push('Configure GROQ_API_KEY na Vercel para IA funcionar na nuvem')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
    report.recommendations.push('Configure Supabase para persistir dados de campanhas e posts')
  }
  if (summary.error > 0) {
    report.recommendations.push(`${summary.error} serviço(s) com erro — verificar configurações na Vercel`)
  }

  return NextResponse.json(report)
}
