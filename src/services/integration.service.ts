import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IGetIntegrationsResponse } from '@/types/integration.types'

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
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al obtener integraciones'
      throw new Error(message)
    }
  }
}

const integrationService = new IntegrationService()
export default integrationService
