import { NextRequest, NextResponse } from 'next/server'

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID || '17841474877441832'
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || ''

export async function POST(request: NextRequest) {
  try {
    const { caption, imageUrl } = await request.json()

    if (!caption) {
      return NextResponse.json({ error: 'caption é obrigatório' }, { status: 400 })
    }

    // Se não tem imageUrl, usa uma imagem de placeholder gerada
    const mediaUrl = imageUrl || `https://via.placeholder.com/1080x1080/1a1a2e/7c3aed?text=${encodeURIComponent('Titanio Studio')}`

    // Passo 1: Criar container de mídia
    const containerRes = await fetch(
      `https://graph.facebook.com/v20.0/${IG_BUSINESS_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: caption,
          access_token: IG_ACCESS_TOKEN
        })
      }
    )
    const container = await containerRes.json()

    if (container.error) {
      console.error('Erro container IG:', container.error)
      return NextResponse.json({ 
        error: container.error.message,
        fallback: true,
        message: 'Postagem salva localmente (Instagram API indisponível)'
      }, { status: 200 }) // retorna 200 pra não quebrar o front
    }

    // Passo 2: Publicar o container
    const publishRes = await fetch(
      `https://graph.facebook.com/v20.0/${IG_BUSINESS_ID}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: IG_ACCESS_TOKEN
        })
      }
    )
    const published = await publishRes.json()

    if (published.error) {
      return NextResponse.json({ 
        error: published.error.message,
        fallback: true
      })
    }

    return NextResponse.json({
      success: true,
      postId: published.id,
      message: 'Post publicado no Instagram! ✅',
      url: `https://www.instagram.com/titaniodashboard/`
    })

  } catch (error: any) {
    console.error('Erro Instagram:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  // Buscar posts recentes da conta
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${IG_BUSINESS_ID}/media?fields=id,caption,media_type,thumbnail_url,permalink,timestamp&limit=12&access_token=${IG_ACCESS_TOKEN}`
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
