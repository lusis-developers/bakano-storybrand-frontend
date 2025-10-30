import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IGetIntegrationsResponse, IIntegrationRecord } from '@/types/integration.types'

class IntegrationService extends APIBase {
  private readonly endpoint = 'integrations'

  // Nota: La lógica de Facebook se ha movido a src/services/facebook.service.ts
  // Nota: La lógica de Instagram se ha movido a src/services/instagram.service.ts

  /**
   * Obtiene el listado de integraciones para un negocio.
   * Backend: GET /integrations/:businessId (controlador getIntegrationsController)
   */
  async getIntegrations(businessId: string): Promise<IGetIntegrationsResponse> {
    if (!businessId) {
      throw new Error('Se requiere businessId para obtener las integraciones')
    }
    try {
      const response: AxiosResponse<IGetIntegrationsResponse> = await this.get(
        `${this.endpoint}/${businessId}`,
      )

      // Normalizamos la respuesta para garantizar estructura y campos útiles en el store y componentes
      const sanitizeUrl = (url?: string): string | undefined => {
        if (!url || typeof url !== 'string') return undefined
        // El backend puede enviar URLs envueltas en comillas o backticks: " `https://...` "
        const trimmed = url.trim().replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '')
        return trimmed || undefined
      }

      const normalizeRecord = (raw: any): IIntegrationRecord => {
        const base: IIntegrationRecord = {
          _id: raw?._id,
          name: raw?.name,
          type: raw?.type,
          description: raw?.description,
          business: raw?.business,
          isActive: !!raw?.isActive,
          isConnected: !!raw?.isConnected,
          lastSyncAt: raw?.lastSyncAt,
          metadata: raw?.metadata || {},
          createdAt: raw?.createdAt,
          updatedAt: raw?.updatedAt,
          connectionStatus: undefined,
          config: raw?.config,
          followers: typeof raw?.followers === 'number' ? raw.followers : undefined,
          picture: raw?.picture,
        }

        // Derivar y normalizar estado de conexión
        const statusFromMeta = (base.metadata as any)?.status as string | undefined
        const normalizedStatus = (() => {
          if (typeof statusFromMeta === 'string') {
            const s = statusFromMeta.toLowerCase()
            if (['connected', 'pending', 'disconnected', 'error', 'inactive'].includes(s)) return s as IIntegrationRecord['connectionStatus']
            // Estado especial del backend
            if (s === 'pending_page_selection') return 'pending'
          }
          return base.isConnected ? 'connected' : 'disconnected'
        })()
        base.connectionStatus = normalizedStatus

        // Unificar imagen dentro de metadata.picture para consumo en componentes
        const meta = { ...(base.metadata as any) }
        const picture = meta.picture || raw?.picture || {}
        const unifiedPicture = {
          url: sanitizeUrl(picture?.url),
          small: sanitizeUrl(picture?.small),
          normal: sanitizeUrl(picture?.normal),
          large: sanitizeUrl(picture?.large),
          size150: sanitizeUrl(picture?.size150),
        }
        // Si alguna propiedad de imagen existe, la guardamos unificada
        if (Object.values(unifiedPicture).some(Boolean)) {
          meta.picture = unifiedPicture
        }
        // Unificar seguidores
        if (typeof base.followers === 'number') {
          meta.followersCount = base.followers
        }
        base.metadata = meta

        return base
      }

      const normalized: IIntegrationRecord[] = Array.isArray(response.data?.data)
        ? response.data.data.map(normalizeRecord)
        : []

      return {
        count: typeof response.data?.count === 'number' ? response.data.count : normalized.length,
        data: normalized,
      }
    } catch (error: any) {
      const message = error?.message || 'Error al obtener integraciones'
      throw new Error(message)
    }
  }
}

const integrationService = new IntegrationService()
export default integrationService
