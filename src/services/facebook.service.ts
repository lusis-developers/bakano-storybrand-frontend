import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IFacebookConnectResponse, IIntegrationRecord } from '@/types/integration.types'

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

  /**
   * Finaliza la integración seleccionando una página específica y guardando su token.
   * Backend: POST /integrations/facebook/connect-page
   */
  async facebookConnectPage(
    businessId: string,
    pageId: string,
    pageName: string,
    pageAccessToken: string,
  ): Promise<{ message: string; integration: IIntegrationRecord }> {
    try {
      const response: AxiosResponse<{ message: string; integration: IIntegrationRecord }> = await this.post(
        `${this.endpoint}/facebook/connect-page`,
        {
          business: businessId,
          pageId,
          pageName,
          pageAccessToken,
        },
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al guardar la página de Facebook'
      throw new Error(message)
    }
  }
}

const facebookService = new FacebookService()
export default facebookService