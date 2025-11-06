import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  IInstagramConnectResponse,
  IInstagramFinalizeResponse,
  IInstagramLinkedAccount,
} from '@/types/integration.types'

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

  /**
   * Finaliza la conexión seleccionando una cuenta de Instagram Business específica
   * asociada a la página de Facebook conectada.
   * Backend esperado: POST /integrations/instagram/connect-account
   */
  async instagramFinalizeAccount(
    businessId: string,
    account: IInstagramLinkedAccount,
  ): Promise<IInstagramFinalizeResponse> {
    try {
      const payload = {
        business: businessId,
        pageId: account.pageId,
        pageName: account.pageName,
        pageAccessToken: account.pageAccessToken,
        instagramAccountId: account.instagramAccountId,
        instagramUsername: account.instagramUsername,
        instagramProfilePictureUrl: account.instagramProfilePictureUrl,
        followersCount: account.followersCount,
      }
      const response: AxiosResponse<IInstagramFinalizeResponse> = await this.post(
        `${this.endpoint}/instagram/connect-page`,
        payload,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al vincular la cuenta de Instagram'
      throw new Error(message)
    }
  }

  /**
   * Publica una foto o carrusel en la cuenta de Instagram del negocio.
   * Backend: POST /integrations/instagram/post/publish/photo/:businessId
   * - Campo de archivos: 'images' (hasta 10)
   * - Campos extra en form-data: caption, published, scheduled_publish_time
   */
  async publishPhotoOrCarouselPost(
    businessId: string,
    payload: { caption?: string; published?: boolean; scheduled_publish_time?: number | string },
    images: File[],
  ): Promise<{ message: string; data: any }> {
    try {
      const form = new FormData()
      // Campos de texto
      if (payload?.caption) form.append('caption', payload.caption)
      if (typeof payload?.published !== 'undefined') form.append('published', String(!!payload.published))
      if (typeof payload?.scheduled_publish_time !== 'undefined') {
        form.append('scheduled_publish_time', String(payload.scheduled_publish_time))
      }

      // Archivos (campo 'images')
      for (const file of images || []) {
        if (file) {
          form.append('images', file, (file as any)?.name || 'image.jpg')
        }
      }

      const response: AxiosResponse<{ message: string; data: any }> = await this.post(
        `${this.endpoint}/instagram/post/publish/photo/${businessId}`,
        form,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar la(s) foto(s) en Instagram'
      throw new Error(message)
    }
  }

  /**
   * Publica un Reel (video) en la cuenta de Instagram del negocio.
   * Backend: POST /integrations/instagram/post/publish/reel/:businessId
   * - Campo de archivo: 'video'
   * - Campos extra en form-data: caption, share_to_feed, published, scheduled_publish_time
   */
  async publishReelPost(
    businessId: string,
    payload: { caption?: string; share_to_feed?: boolean; published?: boolean; scheduled_publish_time?: number | string },
    video: File,
  ): Promise<{ message: string; data: any }> {
    try {
      const form = new FormData()
      // Campos de texto
      if (payload?.caption) form.append('caption', payload.caption)
      if (typeof payload?.share_to_feed !== 'undefined') form.append('share_to_feed', String(!!payload.share_to_feed))
      if (typeof payload?.published !== 'undefined') form.append('published', String(!!payload.published))
      if (typeof payload?.scheduled_publish_time !== 'undefined') {
        form.append('scheduled_publish_time', String(payload.scheduled_publish_time))
      }

      // Archivo de video
      if (video) {
        form.append('video', video, (video as any)?.name || 'reel.mp4')
      }

      const response: AxiosResponse<{ message: string; data: any }> = await this.post(
        `${this.endpoint}/instagram/post/publish/reel/${businessId}`,
        form,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar el Reel en Instagram'
      throw new Error(message)
    }
  }
}

const instagramService = new InstagramService()
export default instagramService
