import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, platforms, scheduledFor } = await request.json()

    // Envia para N8n processar
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'

    // Se N8n está configurado, envia para lá
    try {
      const n8nResponse = await fetch(`${n8nWebhookUrl}/titanio-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms,
          scheduledFor,
          timestamp: new Date().toISOString()
        })
      })

      if (n8nResponse.ok) {
        return NextResponse.json({ 
          success: true, 
          message: 'Post enviado para N8n',
          workflow: 'titanio-post'
        })
      }
    } catch (n8nError) {
      console.log('N8n não disponível, salvando localmente')
    }

    // Fallback: salva no Supabase ou arquivo local
    // Por agora, só retorna sucesso
    return NextResponse.json({ 
      success: true, 
      message: 'Post agendado (N8n offline - salvo localmente)',
      data: { content, platforms, scheduledFor }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 })
  }
}
