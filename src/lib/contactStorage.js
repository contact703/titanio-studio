const STORAGE_KEY = 'titanio.contact.profile'
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY
const SUPABASE_TABLE = import.meta.env?.VITE_SUPABASE_CONTACT_TABLE || 'contact_profiles'

const BASE_HEADERS = SUPABASE_ANON_KEY
  ? {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  : null

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadLocalContact() {
  if (!isBrowser()) return null
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) return null
    return JSON.parse(storedValue)
  } catch (error) {
    console.warn('[contactStorage] Falha ao ler dados locais:', error)
    return null
  }
}

export function saveLocalContact(profile) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.warn('[contactStorage] Falha ao salvar dados locais:', error)
  }
}

async function fetchRemoteContact(email) {
  if (!SUPABASE_URL || !BASE_HEADERS || !email) {
    return { data: null, error: null }
  }

  try {
    const query = new URL(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${SUPABASE_TABLE}`)
    query.searchParams.set('email', `eq.${email}`)
    query.searchParams.set('select', 'name,email,solution,details,updated_at')

    const response = await fetch(query, {
      headers: BASE_HEADERS
    })

    if (!response.ok) {
      const message = `Erro ao buscar dados no Supabase: ${response.statusText}`
      return { data: null, error: new Error(message) }
    }

    const results = await response.json()
    return { data: Array.isArray(results) ? results[0] ?? null : null, error: null }
  } catch (error) {
    console.warn('[contactStorage] Falha ao consultar Supabase:', error)
    return { data: null, error }
  }
}

async function upsertRemoteContact(profile) {
  if (!SUPABASE_URL || !BASE_HEADERS || !profile?.email) {
    return { error: null, storedInSupabase: false }
  }

  try {
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${SUPABASE_TABLE}`, {
      method: 'POST',
      headers: { ...BASE_HEADERS, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify([{ ...profile, updated_at: new Date().toISOString() }])
    })

    if (!response.ok) {
      const message = `Erro ao salvar dados no Supabase: ${response.statusText}`
      return { error: new Error(message), storedInSupabase: false }
    }

    return { error: null, storedInSupabase: true }
  } catch (error) {
    console.warn('[contactStorage] Falha ao salvar no Supabase:', error)
    return { error, storedInSupabase: false }
  }
}

export async function loadContactData() {
  const localData = loadLocalContact()

  if (localData?.email) {
    const remoteResult = await fetchRemoteContact(localData.email)
    if (remoteResult.data) {
      const merged = {
        name: remoteResult.data.name ?? localData.name ?? '',
        email: remoteResult.data.email ?? localData.email ?? '',
        solution: remoteResult.data.solution ?? localData.solution ?? '',
        details: remoteResult.data.details ?? localData.details ?? ''
      }
      saveLocalContact(merged)
      return { data: merged, source: 'supabase', error: remoteResult.error }
    }
    if (remoteResult.error) {
      return { data: localData, source: 'local', error: remoteResult.error }
    }
  }

  if (localData) {
    return { data: localData, source: 'local', error: null }
  }

  return { data: null, source: null, error: null }
}

export async function persistContactData(profile) {
  saveLocalContact(profile)
  const result = await upsertRemoteContact(profile)
  return result
}

export const saveContactDraft = saveLocalContact
