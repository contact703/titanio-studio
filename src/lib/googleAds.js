const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:4000'

export async function createGoogleAdsCampaign(payload) {
  const response = await fetch(`${API_BASE_URL}/api/google-ads/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    const message = errorPayload?.error || 'Falha inesperada ao criar a campanha no Google Ads.'
    throw new Error(message)
  }

  return response.json()
}

export async function getBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    return { ok: false }
  }
  const data = await response.json().catch(() => null)
  return { ok: true, data }
}
