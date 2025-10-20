import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IFacebookConnectResponse, IInstagramConnectResponse } from '@/types/integration.types'

class IntegrationService extends APIBase {
  private readonly endpoint = 'integrations'

  /**
   * Paso 1: Conecta el usuario con Facebook (Meta) usando el token del SDK.
   * - Intercambia el token corto por uno de larga duración en el backend
   * - Crea/actualiza la integración en estado "pending_page_selection"
   * - Devuelve las páginas manejadas por el usuario
   */
  async facebookConnect(
    businessId: string,
    userAccessToken: string,
  ): Promise<IFacebookConnectResponse> {
    try {
      const response: AxiosResponse<IFacebookConnectResponse> = await this.post(
        `${this.endpoint}/facebook/connect`,
        {
          business: businessId,
          accessToken: userAccessToken,
        },
      )
      return response.data
    } catch (error: any) {
      // Estandarizar mensaje de error
      const message = error?.message || 'Error al conectar con Facebook'
      throw new Error(message)
    }
  }

  /**
   * Paso 2: Conecta el negocio con Instagram usando el authorization code del Basic Display OAuth.
   * - El backend intercambia el code por access_token y guarda la integración
   */
  async instagramConnect(
    businessId: string,
    userAccessToken: string,
  ): Promise<IInstagramConnectResponse> {
    try {
      const response: AxiosResponse<IInstagramConnectResponse> = await this.post(
        `${this.endpoint}/instagram/connect`,
        {
          business: businessId,
          accessToken: userAccessToken,
        },
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al conectar con Instagram'
      throw new Error(message)
    }
  }
}

const integrationService = new IntegrationService()
export default integrationService
