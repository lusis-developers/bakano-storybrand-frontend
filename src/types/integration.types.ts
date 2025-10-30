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
  instagramUser?: {
    id: string
    username?: string
  }
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
}

export interface IGetIntegrationsResponse {
  count: number
  data: IIntegrationRecord[]
}