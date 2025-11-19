// Tipos para integraciones (Facebook/Meta y otras)

export interface IIntegrationPage {
  id: string
  name: string
  category?: string
  accessToken: string
  pictureUrl?: string
  // Nuevo: estructura completa de imagen (cuando esté disponible)
  picture?: IFacebookPagePicture
}

export interface IFacebookConnectResponse {
  message: string
  pages: IIntegrationPage[]
}

// ---- Nuevos tipos para respuesta de página seleccionada (connect-page)
export interface IFacebookPagePicture {
  url?: string
  small?: string
  normal?: string
  large?: string
  size150?: string
}

export interface IFacebookPageInfo {
  id: string
  name: string
  picture?: IFacebookPagePicture
}

export interface IIntegrationError {
  status?: number
  message: string
}

export interface IInstagramConnectResponse {
  message: string
  // Nuevo: el backend devuelve las cuentas de Instagram Business vinculadas a las páginas
  accounts?: IInstagramLinkedAccount[]
  count?: number
  token?: IInstagramTokenInfo
}

// ----- Nuevos tipos para listado de integraciones -----
export type IntegrationType =
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'mailchimp'
  | 'stripe'
  | 'zapier'
  | 'hubspot'
  | 'salesforce'
  | 'other'

export interface IIntegrationRecord {
  _id: string
  name: string
  type: IntegrationType
  description?: string
  business: string
  isActive: boolean
  isConnected: boolean
  lastSyncAt?: string | Date
  metadata?: Record<string, any>
  createdAt: string | Date
  updatedAt: string | Date
  // Virtual recibido desde backend
  connectionStatus?: 'inactive' | 'disconnected' | 'error' | 'connected' | 'pending'
  // Nuevo: algunos backends envían config y followers en el nivel raíz
  config?: IIntegrationConfig
  followers?: number
  // El backend puede enviar picture a nivel raíz; el servicio lo normaliza a metadata.picture,
  // pero mantenemos el tipo para compatibilidad cuando se lea crudo.
  picture?: IFacebookPagePicture
}

export interface IGetIntegrationsResponse {
  count: number
  data: IIntegrationRecord[]
}

// ===== Nuevos tipos para Instagram (Business Accounts vinculadas) =====
export interface IInstagramLinkedAccount {
  pageId: string
  pageName: string
  pageAccessToken: string
  instagramAccountId: string
  instagramUsername: string
  instagramProfilePictureUrl?: string
  followersCount?: number
}

export interface IInstagramTokenInfo {
  type: 'user_long_lived' | 'page' | string
  accessToken: string
  expiresIn?: number
  expiresAt?: string
}

export interface IInstagramProfile {
  id: string
  username: string
  profilePictureUrl?: string
  followersCount?: number
}

export interface IInstagramFinalizeResponse {
  message: string
  integration: IIntegrationRecord
  instagram?: IInstagramProfile
}

// ===== Configuración extendida de integraciones =====
export interface IIntegrationConfig {
  customFields?: Record<string, any>
  tokenExpiresAt?: string | Date | null
}

// ===== Posts e Insights de Instagram =====
export interface IInstagramPostInsights {
  engagement: number
  impressions: number
  reach: number
  saved: number
}

export interface IInstagramMediaChild {
  id: string
  media_type: string
  media_url: string
}

export interface IInstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string
  media_url?: string
  permalink: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  insights?: IInstagramPostInsights
  children?: { data: IInstagramMediaChild[] }
}

export interface IInstagramPostsResponse {
  message: string
  businessId: string
  count: number
  limit: number
  posts: IInstagramPost[]
  // Cliente: bandera opcional para indicar que falta integración (cuando el backend responde 404)
  missingIntegration?: boolean
}

// ===== Instagram Viral (Hashtags) =====
export interface IInstagramViralItem {
  caption: string
  ownerFullName?: string
  ownerUsername?: string
  url?: string
  commentsCount?: number
  firstComment?: string
  likesCount?: number
  timestamp?: string
  hashtags: string[]
}

export interface IInstagramViralPostsResponse {
  message: string
  filters: { hashtags: string[]; resultsType: 'posts' | 'stories'; resultsLimit: number }
  items: IInstagramViralItem[]
  count: number
}