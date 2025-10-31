import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  IFacebookConnectResponse,
  IIntegrationRecord,
  IFacebookPageInfo,
} from '@/types/integration.types'
import type {
  CreatePostPayload,
  PublishTextPostResponse,
} from '@/types/facebook.types'

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
  ): Promise<{ message: string; integration: IIntegrationRecord; page?: IFacebookPageInfo }> {
    try {
      const response: AxiosResponse<{
        message: string
        integration: IIntegrationRecord
        page?: IFacebookPageInfo
      }> = await this.post(
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

  /**
   * Publica un post de texto/enlace en la página de Facebook del negocio.
   * Backend: POST /post/publish/text/:businessId
   *
   * Este endpoint requiere que el backend ya tenga la integración activa y
   * resuelve el pageAccessToken y pageId internamente.
   */
  async publishTextPost(
    businessId: string,
    payload: CreatePostPayload,
  ): Promise<PublishTextPostResponse> {
    try {
      const response: AxiosResponse<PublishTextPostResponse> = await this.post(
        `post/publish/text/${businessId}`,
        payload,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar el post de texto en Facebook'
      throw new Error(message)
    }
  }
}

const facebookService = new FacebookService()
export default facebookService