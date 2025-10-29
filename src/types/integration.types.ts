// Tipos para integraciones (Facebook/Meta y otras)

export interface IIntegrationPage {
  id: string
  name: string
  category?: string
  accessToken: string
  pictureUrl?: string
}

export interface IFacebookConnectResponse {
  message: string
  pages: IIntegrationPage[]
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