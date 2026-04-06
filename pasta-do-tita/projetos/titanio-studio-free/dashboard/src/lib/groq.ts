const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function generateCopy(prompt: string, style: 'casual' | 'professional' | 'urgent' = 'casual'): Promise<string> {
  const styleGuide = {
    casual: 'Tom descontraído e amigável, como se estivesse conversando com um amigo',
    professional: 'Tom profissional e corporativo, mas ainda acessível',
    urgent: 'Tom urgente com call-to-action forte, criando senso de escassez'
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Você é um copywriter expert em social media brasileiro. 
${styleGuide[style]}
Sempre responda em português do Brasil.
Seja conciso - posts de Instagram têm limite de engajamento em ~150 caracteres para preview.
Use emojis estrategicamente.
Inclua call-to-action quando apropriado.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}

export async function generateCampaignIdeas(business: string, goal: string): Promise<string[]> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Você é um estrategista de marketing digital expert.
Gere ideias criativas e práticas para campanhas.
Responda em JSON array com 5 ideias, cada uma com: titulo, descricao, publico_alvo, orcamento_sugerido`
        },
        {
          role: 'user',
          content: `Negócio: ${business}\nObjetivo: ${goal}\n\nGere 5 ideias de campanha.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    })
  })

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0].message.content)
  } catch {
    return [data.choices[0].message.content]
  }
}

export async function analyzePerformance(metrics: { impressions: number, clicks: number, conversions: number, spend: number }): Promise<string> {
  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100).toFixed(2) : 0
  const cpc = metrics.clicks > 0 ? (metrics.spend / metrics.clicks).toFixed(2) : 0
  const cpa = metrics.conversions > 0 ? (metrics.spend / metrics.conversions).toFixed(2) : 0

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de performance de marketing digital. Dê insights acionáveis e diretos.'
        },
        {
          role: 'user',
          content: `Analise esta campanha:
- Impressões: ${metrics.impressions}
- Cliques: ${metrics.clicks}
- Conversões: ${metrics.conversions}
- Gasto: R$ ${metrics.spend}
- CTR: ${ctr}%
- CPC: R$ ${cpc}
- CPA: R$ ${cpa}

Dê 3 insights práticos para melhorar.`
        }
      ],
      max_tokens: 500,
      temperature: 0.5
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
