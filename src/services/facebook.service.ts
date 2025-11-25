import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  IFacebookConnectResponse,
  IIntegrationRecord,
  IFacebookPageInfo,
} from '@/types/integration.types'
import type { CreatePostPayload, PublishTextPostResponse, PublishPhotoPostResponse, PublishVideoPostResponse, CreateVideoPostPayload, ScheduledPostsResponse, ScheduledPostsQuery, FacebookPageMetricsResponse } from '@/types/facebook.types'
import type { FacebookAdStatisticsResponse } from '@/types/facebook.types'

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
      }> = await this.post(`${this.endpoint}/facebook/connect-page`, {
        business: businessId,
        pageId,
        pageName,
        pageAccessToken,
      })
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al guardar la página de Facebook'
      throw new Error(message)
    }
  }

  /**
   * Publica un post de texto/enlace en la página de Facebook del negocio.
   * Backend: POST /integrations/facebook/post/publish/text/:businessId
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
        `${this.endpoint}/facebook/post/publish/text/${businessId}`,
        payload,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar el post de texto en Facebook'
      throw new Error(message)
    }
  }

  /**
   * Publica una o varias fotos en la página de Facebook del negocio.
   * Backend: POST /integrations/facebook/post/publish/photo/:businessId
   * - Campo de archivos: 'images' (hasta 10)
   * - Campos extra en form-data: message, published, scheduled_publish_time
   */
  async publishPhotoPost(
    businessId: string,
    payload: Pick<CreatePostPayload, 'message' | 'published' | 'scheduled_publish_time'>,
    images: File[],
  ): Promise<PublishPhotoPostResponse> {
    try {
      const form = new FormData()
      // Campos de texto requeridos/opcionales
      if (payload?.message) form.append('message', payload.message)
      if (typeof payload?.published !== 'undefined') form.append('published', String(!!payload.published))
      if (typeof payload?.scheduled_publish_time === 'number') form.append('scheduled_publish_time', String(payload.scheduled_publish_time))

      // Archivos (nombre de campo: 'images')
      for (const file of images || []) {
        if (file) {
          form.append('images', file, (file as any)?.name || 'image.jpg')
        }
      }

      const response: AxiosResponse<PublishPhotoPostResponse> = await this.post(
        `${this.endpoint}/facebook/post/publish/photo/${businessId}`,
        form,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar la(s) foto(s) en Facebook'
      throw new Error(message)
    }
  }

  /**
   * Publica un video en la página de Facebook del negocio.
   * Backend: POST /integrations/facebook/post/publish/video/:businessId
   * - Campo de archivo: 'video' (single)
   * - Campos extra en form-data: message, description, title, published, scheduled_publish_time
   */
  async publishVideoPost(
    businessId: string,
    payload: CreateVideoPostPayload,
    videoFile: File,
  ): Promise<PublishVideoPostResponse> {
    try {
      const form = new FormData()
      // Campos de texto
      if (payload?.message) form.append('message', payload.message)
      if (payload?.description) form.append('description', payload.description)
      if (payload?.title) form.append('title', payload.title)
      if (typeof payload?.published !== 'undefined') form.append('published', String(!!payload.published))
      if (typeof payload?.scheduled_publish_time === 'number') form.append('scheduled_publish_time', String(payload.scheduled_publish_time))

      // Archivo de video
      if (videoFile) {
        form.append('video', videoFile, (videoFile as any)?.name || 'video.mp4')
      }

      const response: AxiosResponse<PublishVideoPostResponse> = await this.post(
        `${this.endpoint}/facebook/post/publish/video/${businessId}`,
        form,
      )
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al publicar el video en Facebook'
      throw new Error(message)
    }
  }

  /**
   * Obtiene los posts programados para la página de Facebook del negocio.
   * Backend: GET /integrations/facebook/posts/scheduled/:businessId
   * Permite filtros profesionales: limit, from, to, q, sort
   */
  async getScheduledPosts(
    businessId: string,
    query?: ScheduledPostsQuery,
  ): Promise<ScheduledPostsResponse> {
    try {
      const params = new URLSearchParams()
      if (query?.limit) params.append('limit', String(query.limit))
      if (typeof query?.from !== 'undefined') params.append('from', String(query.from))
      if (typeof query?.to !== 'undefined') params.append('to', String(query.to))
      if (query?.q) params.append('q', query.q)
      if (query?.sort) params.append('sort', query.sort)

      const endpoint = `${this.endpoint}/facebook/posts/scheduled/${businessId}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await this.get<ScheduledPostsResponse>(endpoint)
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al obtener los posts programados de Facebook'
      throw new Error(message)
    }
  }

  /**
   * Métricas de la página de Facebook para un negocio.
   * Backend: GET /integrations/facebook/metrics/:businessId
   * Filtros opcionales: period, since, until, date_preset, view, months, tz, offsetMinutes
   */
  async getPageMetrics(
    businessId: string,
    query?: Partial<{
      period: string
      since: string
      until: string
      date_preset: string
      view: string
      months: string | number
      tz: string
      offsetMinutes: string | number
    }>,
  ): Promise<FacebookPageMetricsResponse> {
    try {
      const params = new URLSearchParams()
      if (query?.period) params.append('period', String(query.period))
      if (query?.since) params.append('since', String(query.since))
      if (query?.until) params.append('until', String(query.until))
      if (query?.date_preset) params.append('date_preset', String(query.date_preset))
      if (query?.view) params.append('view', String(query.view))
      if (typeof query?.months !== 'undefined') params.append('months', String(query.months))
      if (query?.tz) params.append('tz', String(query.tz))
      if (typeof query?.offsetMinutes !== 'undefined') params.append('offsetMinutes', String(query.offsetMinutes))

      const endpoint = `${this.endpoint}/facebook/metrics/${businessId}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await this.get<FacebookPageMetricsResponse>(endpoint)
      return response.data
    } catch (error: any) {
      const message = error?.message || 'Error al obtener métricas de la página de Facebook'
      throw new Error(message)
    }
  }

  /**
   * Lista cuentas publicitarias del usuario para el negocio.
   * Backend: GET /integrations/facebook-marketing/adaccounts/:businessId
   */
  async listAdAccounts(businessId: string): Promise<{ message: string; accounts: Array<{ id: string; account_id: string; name?: string; currency?: string; business?: { id: string; name: string } }> }> {
    const endpoint = `${this.endpoint}/facebook-marketing/adaccounts/${businessId}`
    const response = await this.get<{ message: string; accounts: Array<{ id: string; account_id: string; name?: string; currency?: string; business?: { id: string; name: string } }> }>(endpoint)
    return response.data
  }

  /**
   * Guarda la cuenta publicitaria seleccionada para el negocio.
   * Backend: POST /integrations/facebook-marketing/adaccounts/:businessId/select
   */
  async saveAdAccount(businessId: string, adAccountId: string): Promise<{ message: string; adAccountId: string }> {
    const endpoint = `${this.endpoint}/facebook-marketing/adaccounts/${businessId}/select`
    const response = await this.post<{ message: string; adAccountId: string }>(endpoint, { adAccountId })
    return response.data
  }

  /**
   * Estadísticas de anuncios de Meta Ads.
   * Backend: GET /integrations/facebook-marketing/adstats/:businessId
   * Filtros opcionales: since, until, preset
   */
  async getAdStatistics(
    businessId: string,
    query?: Partial<{ since: string; until: string; preset: string }>,
  ): Promise<FacebookAdStatisticsResponse> {
    const params = new URLSearchParams()
    if (query?.since) params.append('since', query.since)
    if (query?.until) params.append('until', query.until)
    if (query?.preset) params.append('preset', query.preset)
    const endpoint = `${this.endpoint}/facebook-marketing/insights/${businessId}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await this.get<FacebookAdStatisticsResponse>(endpoint)
    return response.data
  }

  /**
   * Ads con links y métricas.
   * Backend: GET /integrations/facebook-marketing/ads/:businessId
   */
  async getAdsWithLinksAndMetrics(
    businessId: string,
  ): Promise<{ message: string; ads: any[] }> {
    const endpoint = `${this.endpoint}/facebook-marketing/ads/${businessId}`
    const response = await this.get<{ message: string; ads: any[] }>(endpoint)
    return response.data
  }

  /**
   * Top Ad.
   * Backend: GET /integrations/facebook-marketing/ads/top/:businessId
   */
  async getTopAd(
    businessId: string,
  ): Promise<{ message: string; ad: any }> {
    const endpoint = `${this.endpoint}/facebook-marketing/ads/top/${businessId}`
    const response = await this.get<{ message: string; ad: any }>(endpoint)
    return response.data
  }
}

const facebookService = new FacebookService()
export default facebookService
