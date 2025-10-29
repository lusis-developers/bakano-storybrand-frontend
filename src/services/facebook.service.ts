import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IFacebookConnectResponse } from '@/types/integration.types'

class FacebookService extends APIBase {
  private readonly endpoint = 'integrations'

  /**
   * Conecta el usuario con Facebook (Meta) usando el token del SDK.
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
      const message = error?.message || 'Error al conectar con Facebook'
      throw new Error(message)
    }
  }
}

const facebookService = new FacebookService()
export default facebookService