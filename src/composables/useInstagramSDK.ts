// FILE: src/composables/useInstagramSDK.ts
import { ref, readonly } from 'vue'
import { useFacebookSDK } from '@/composables/useFacebookSDK'

// Meta Graph version (Facebook Graph API para IG profesional vinculado a página)
const FB_GRAPH_VERSION = 'v24.0'
const FB_GRAPH = `https://graph.facebook.com/${FB_GRAPH_VERSION}`

// Instagram OAuth + Instagram API (Instagram Login para cuentas profesionales)
const IG_OAUTH_AUTHORIZE = 'https://www.instagram.com/oauth/authorize' // Business Login for Instagram
const IG_OAUTH_ACCESS_TOKEN = 'https://api.instagram.com/oauth/access_token' // Intercambio code → short-lived token (SERVER-SIDE RECOMMENDED)
const IG_GRAPH_ACCESS_TOKEN = 'https://graph.instagram.com/access_token' // Exchange short-lived → long-lived (SERVER-SIDE ONLY)
const IG_GRAPH_REFRESH_TOKEN = 'https://graph.instagram.com/refresh_access_token' // Refresh long-lived (SERVER-SIDE ONLY)
const IG_GRAPH = 'https://graph.instagram.com' // Endpoints de Instagram API (me, media) con Instagram Login

// Variables de entorno (NO expongas secretos en frontend)
const IG_CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID
const IG_REDIRECT_URI = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI
// Scopes nuevos para Business Login (reemplazan business_*)
const IG_BUSINESS_SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
] as const

type InstagramBusinessScope = (typeof IG_BUSINESS_SCOPES)[number]

function buildInstagramAuthorizeURL(
  state: string,
  scopes: InstagramBusinessScope[] = [...IG_BUSINESS_SCOPES],
): string {
  const params = new URLSearchParams({
    client_id: String(IG_CLIENT_ID ?? ''),
    redirect_uri: String(IG_REDIRECT_URI ?? ''),
    response_type: 'code',
    scope: scopes.join(','), // Instagram acepta coma-separado
    state,
    // force_reauth: 'true' // opcional si quieres forzar credenciales IG
  })
  return `${IG_OAUTH_AUTHORIZE}?${params.toString()}`
}

export function useInstagramSDK() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // SDK de Facebook se mantiene para flujos con Graph API (páginas vinculadas)
  const { login, isLoading: isSDKLoading, error: fbError } = useFacebookSDK()

  // Facebook Login for Business → User Access Token con permisos IG (para endpoints via Facebook Graph)
  const loginForInstagram = async (permissions?: string[]): Promise<string> => {
    error.value = null
    // Nota: Estos permisos son de Facebook Graph para IG profesional vinculado a Pages
    const perms = permissions?.length
      ? permissions
      : [
          'instagram_basic', // permiso base en Facebook Graph (no confundir con instagram_business_basic del Instagram Login)
          'pages_show_list',
          // Agrega según necesidades y revisión de app:
          // 'pages_read_engagement',
          // 'read_insights',
          // 'business_management',
        ]
    try {
      const token = await login(perms)
      return token
    } catch (e) {
      error.value = fbError.value || (e instanceof Error ? e.message : 'Error en Facebook Login')
      throw new Error(error.value)
    }
  }

  // Business Login for Instagram (Instagram Login) → inicia OAuth con scopes nuevos
  const startInstagramLogin = (scopes: InstagramBusinessScope[] = [...IG_BUSINESS_SCOPES]): void => {
    error.value = null
    if (!IG_CLIENT_ID || !IG_REDIRECT_URI) {
      error.value = 'Faltan variables: VITE_INSTAGRAM_CLIENT_ID y VITE_INSTAGRAM_REDIRECT_URI'
      return
    }
    const state = Math.random().toString(36).slice(2, 10)
    sessionStorage.setItem('ig_oauth_state', state)
    const url = buildInstagramAuthorizeURL(state, scopes)
    window.location.assign(url)
  }

  // Lee parámetros de redirect del OAuth (code + valida state)
  const readInstagramRedirect = (): { code: string | null; stateOk: boolean } => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const expected = sessionStorage.getItem('ig_oauth_state')
    // Importante: algunos redirects agregan "#_" al final, no afecta al code
    return { code, stateOk: !!code && !!expected && state === expected }
  }

  /**
   * Intercambiar code → short-lived access token (DEBE ser hecho en servidor, incluye client_secret).
   * Aquí el frontend llama a tu backend seguro, por ejemplo: POST /api/instagram/oauth/access_token
   * No expongas el client_secret en el frontend.
   */
  const exchangeCodeForShortLivedToken = async (
    code: string,
  ): Promise<{ access_token: string; user_id: string; permissions: string[] }> => {
    loading.value = true
    error.value = null
    try {
      // Endpoint interno de tu backend que hace la llamada a https://api.instagram.com/oauth/access_token
      const res = await fetch('/api/instagram/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: IG_REDIRECT_URI }),
      })
      if (!res.ok) {
        const msg = `Error al intercambiar code: ${res.status}`
        error.value = msg
        throw new Error(msg)
      }
      const json = (await res.json()) as {
        access_token: string
        user_id: string
        permissions: string
      }
      return {
        access_token: json.access_token,
        user_id: json.user_id,
        permissions: json.permissions?.split(',') ?? [],
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al obtener short-lived token'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Intercambiar short-lived → long-lived (SERVER-SIDE ONLY)
   * El frontend solicita a tu backend que llame a https://graph.instagram.com/access_token
   */
  const getLongLivedToken = async (
    shortLivedToken: string,
  ): Promise<{ access_token: string; token_type: string; expires_in: number }> => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/instagram/token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: shortLivedToken }),
      })
      if (!res.ok) {
        const msg = `Error al obtener long-lived token: ${res.status}`
        error.value = msg
        throw new Error(msg)
      }
      return (await res.json()) as { access_token: string; token_type: string; expires_in: number }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al intercambiar long-lived token'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Refrescar long-lived token (SERVER-SIDE ONLY)
   * El frontend solicita a tu backend que llame a https://graph.instagram.com/refresh_access_token
   */
  const refreshLongLivedToken = async (
    longLivedToken: string,
  ): Promise<{ access_token: string; token_type: string; expires_in: number }> => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/instagram/token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: longLivedToken }),
      })
      if (!res.ok) {
        const msg = `Error al refrescar long-lived token: ${res.status}`
        error.value = msg
        throw new Error(msg)
      }
      return (await res.json()) as { access_token: string; token_type: string; expires_in: number }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al refrescar token'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Instagram API (graph.instagram.com) → perfil del usuario (Instagram Login token)
  const getMeInstagram = async (accessToken: string): Promise<{ id: string; username: string }> => {
    loading.value = true
    error.value = null
    try {
      const url = `${IG_GRAPH}/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`IG API error: ${res.status}`)
      return (await res.json()) as { id: string; username: string }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al consultar IG me'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Instagram API (graph.instagram.com) → media del usuario (Instagram Login token)
  const getMeMediaInstagram = async (
    accessToken: string,
    fields: string = 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
  ): Promise<Array<Record<string, any>>> => {
    loading.value = true
    error.value = null
    try {
      const url = `${IG_GRAPH}/me/media?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(
        accessToken,
      )}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`IG API media error: ${res.status}`)
      const json = (await res.json()) as { data?: Array<Record<string, any>> }
      return json.data ?? []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al listar media (Instagram API)'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Graph API (graph.facebook.com) → páginas del usuario (Facebook Login token)
  const getUserPages = async (
    accessToken: string,
  ): Promise<Array<{ id: string; name: string; access_token?: string }>> => {
    loading.value = true
    error.value = null
    try {
      const url = `${FB_GRAPH}/me/accounts?access_token=${encodeURIComponent(accessToken)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al obtener páginas: ${res.status}`)
      const json = (await res.json()) as { data?: Array<any> }
      return (json.data ?? []).map((p) => ({
        id: String(p.id),
        name: String(p.name),
        access_token: p.access_token ? String(p.access_token) : undefined, // Page Access Token si está presente
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al listar páginas del usuario'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Graph API (graph.facebook.com) → Page → IG Business Account (requiere página vinculada)
  const getInstagramUserFromPage = async (
    pageId: string,
    accessToken: string,
  ): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      const url = `${FB_GRAPH}/${encodeURIComponent(
        pageId,
      )}?fields=instagram_business_account&access_token=${encodeURIComponent(accessToken)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al obtener IG User de la página: ${res.status}`)
      const json = (await res.json()) as { instagram_business_account?: { id: string } | null }
      return json.instagram_business_account?.id ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al consultar instagram_business_account'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Graph API (graph.facebook.com) → media de IG User (requiere IG User ID y token adecuado)
  const getInstagramMedia = async (
    igUserId: string,
    accessToken: string,
    fields: string = 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
  ): Promise<Array<Record<string, any>>> => {
    loading.value = true
    error.value = null
    try {
      const url = `${FB_GRAPH}/${encodeURIComponent(igUserId)}/media?fields=${encodeURIComponent(
        fields,
      )}&access_token=${encodeURIComponent(accessToken)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al obtener media de Instagram: ${res.status}`)
      const json = (await res.json()) as { data?: Array<Record<string, any>> }
      return json.data ?? []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al listar media del IG User'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  return {
    // estados
    loading: readonly(loading),
    error: readonly(error),
    isSDKLoading,

    // Instagram Login (Business Login for Instagram)
    startInstagramLogin,
    readInstagramRedirect,
    exchangeCodeForShortLivedToken, // FRONTEND → llama a tu backend
    getLongLivedToken, // FRONTEND → llama a tu backend
    refreshLongLivedToken, // FRONTEND → llama a tu backend

    // Instagram API (graph.instagram.com) con token de Instagram Login
    getMeInstagram,
    getMeMediaInstagram,

    // Facebook Login for Business (graph.facebook.com) para IG profesional vinculado a Page
    loginForInstagram,
    getUserPages,
    getInstagramUserFromPage,
    getInstagramMedia,
  }
}

// Compat: mismo composable bajo el nombre anterior
export function useInstagramAPI() {
  return useInstagramSDK()
}
