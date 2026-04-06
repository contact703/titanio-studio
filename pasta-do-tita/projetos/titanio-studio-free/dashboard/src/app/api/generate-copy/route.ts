import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'casual' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
      // Fallback sem API key - gera copy básica
      return NextResponse.json({ 
        copy: `🎬 ${prompt}\n\n✨ Não perca essa oportunidade!\n\n👉 Link na bio`,
        source: 'fallback'
      })
    }

    const styleGuide: Record<string, string> = {
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
${styleGuide[style] || styleGuide.casual}
Sempre responda em português do Brasil.
Seja conciso - posts de Instagram têm limite de engajamento em ~150 caracteres para preview.
Use emojis estrategicamente.
Inclua call-to-action quando apropriado.
Responda APENAS com o texto do post, sem explicações.`
          },
          {
            role: 'user',
            content: `Crie um post para redes sociais sobre: ${prompt}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('Groq error:', data.error)
      return NextResponse.json({ 
        copy: `🎬 ${prompt}\n\n✨ Não perca essa oportunidade!\n\n👉 Link na bio`,
        source: 'fallback',
        error: data.error
      })
    }

    return NextResponse.json({ 
      copy: data.choices[0].message.content,
      source: 'groq'
    })

  } catch (error) {
    console.error('Error generating copy:', error)
    return NextResponse.json({ error: 'Erro ao gerar copy' }, { status: 500 })
  }
}
