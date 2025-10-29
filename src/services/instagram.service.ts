import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { IInstagramConnectResponse } from '@/types/integration.types'

class InstagramService extends APIBase {
  private readonly endpoint = 'integrations'

  /**
   * Conecta el negocio con Instagram usando el authorization code del Basic Display OAuth.
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

const instagramService = new InstagramService()
export default instagramService