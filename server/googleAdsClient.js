const REQUIRED_ENV_VARS = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID'
]

function resolveConfig() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`)
  }

  return {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || null
  }
}

const config = (() => {
  try {
    return resolveConfig()
  } catch (error) {
    console.error('[google-ads] Configuração inválida:', error.message)
    return null
  }
})()

function ensureConfig() {
  if (!config) {
    throw new Error(
      'Configuração do Google Ads indisponível. Configure as variáveis de ambiente obrigatórias para utilizar o serviço.'
    )
  }
  return config
}

async function fetchAccessToken() {
  const { clientId, clientSecret, refreshToken } = ensureConfig()

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Falha ao obter access token: ${response.status} ${response.statusText} - ${text}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error('Resposta inesperada ao obter access token.')
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in
  }
}

async function mutate(resource, operations) {
  const { customerId, developerToken, loginCustomerId } = ensureConfig()
  const { accessToken } = await fetchAccessToken()

  const url = new URL(`https://googleads.googleapis.com/v16/customers/${customerId}/${resource}:mutate`)

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json'
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ operations })
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Falha ao chamar Google Ads (${resource}): ${response.status} ${response.statusText} - ${text}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Não foi possível interpretar resposta do Google Ads (${resource}).`)
  }
}

function toMicros(amount) {
  const value = Number.parseFloat(amount)
  if (Number.isNaN(value) || value <= 0) {
    throw new Error('Valor de orçamento inválido. Informe um número positivo.')
  }
  return Math.round(value * 1_000_000)
}

function formatDate(input, fieldName) {
  if (!input) {
    return undefined
  }
  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida para o campo ${fieldName}.`)
  }
  return parsed.toISOString().slice(0, 10)
}

export async function createVideoCampaign({
  name,
  objective,
  dailyBudget,
  startDate,
  endDate,
  targetUrl,
  cpaGoal
}) {
  if (!name || name.trim().length < 3) {
    throw new Error('Informe um nome de campanha com pelo menos 3 caracteres.')
  }
  if (!startDate) {
    throw new Error('Informe a data de início da campanha.')
  }

  const budgetAmountMicros = toMicros(dailyBudget)

  const budgetResponse = await mutate('campaignBudgets', [
    {
      create: {
        name: `Titanio Budget ${name.trim()} ${Date.now()}`,
        deliveryMethod: 'STANDARD',
        amountMicros: budgetAmountMicros
      }
    }
  ])

  const budgetResourceName = budgetResponse?.results?.[0]?.resourceName
  if (!budgetResourceName) {
    throw new Error('Não foi possível criar o orçamento da campanha.')
  }

  const campaignCreate = {
    name: name.trim(),
    status: 'PAUSED',
    advertisingChannelType: 'VIDEO',
    advertisingChannelSubType: 'VIDEO_ACTION',
    campaignBudget: budgetResourceName,
    videoBrandSafetySuitability: 'EXPANDED_INVENTORY',
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false
    },
    startDate: formatDate(startDate, 'startDate')
  }

  const customParameters = []
  if (targetUrl) {
    customParameters.push({ key: 'landing_page', value: targetUrl })
  }
  if (objective) {
    customParameters.push({ key: 'objective', value: objective })
  }
  if (customParameters.length > 0) {
    campaignCreate.urlCustomParameters = customParameters
  }

  if (cpaGoal) {
    campaignCreate.maximizeConversions = { targetCpaMicros: toMicros(cpaGoal) }
  } else {
    campaignCreate.maximizeConversions = {}
  }

  const normalizedEndDate = formatDate(endDate, 'endDate')
  if (normalizedEndDate) {
    campaignCreate.endDate = normalizedEndDate
  }

  const campaignResponse = await mutate('campaigns', [
    {
      create: campaignCreate
    }
  ])

  const campaignResourceName = campaignResponse?.results?.[0]?.resourceName
  if (!campaignResourceName) {
    throw new Error('Campanha criada, mas não recebemos referência do recurso.')
  }

  return {
    campaignResourceName,
    budgetResourceName
  }
}

export function isGoogleAdsConfigured() {
  return Boolean(config)
}
