import { createServer } from 'node:http'
import { createVideoCampaign, isGoogleAdsConfigured } from './googleAdsClient.js'

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10)

function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(body)
}

function sendText(res, status, message) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(message)
}

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1e6) {
        reject(new Error('Payload muito grande.'))
        req.connection.destroy()
      }
    })
    req.on('end', () => {
      if (!data) {
        resolve(null)
        return
      }
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(new Error('Não foi possível interpretar o JSON enviado.'))
      }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  const { method, url } = req

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN ?? '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  if (method === 'GET' && url === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      googleAdsConfigured: isGoogleAdsConfigured()
    })
    return
  }

  if (method === 'POST' && url === '/api/google-ads/campaigns') {
    try {
      const body = await parseRequestBody(req)
      if (!body) {
        sendJson(res, 400, { error: 'Envie os dados da campanha no corpo da requisição.' })
        return
      }

      const { name, objective, dailyBudget, startDate, endDate, targetUrl, cpaGoal } = body
      const result = await createVideoCampaign({
        name,
        objective,
        dailyBudget,
        startDate,
        endDate,
        targetUrl,
        cpaGoal
      })

      sendJson(res, 201, {
        message: 'Campanha criada com sucesso no Google Ads.',
        campaign: result
      })
    } catch (error) {
      console.error('[google-ads] Erro ao criar campanha:', error)
      sendJson(res, 500, { error: error.message })
    }
    return
  }

  sendText(res, 404, 'Rota não encontrada.')
})

server.listen(PORT, () => {
  console.log(`Servidor Titanio Studio API executando na porta ${PORT}`)
})
