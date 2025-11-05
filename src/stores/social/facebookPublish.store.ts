import { defineStore } from 'pinia'
import facebookService from '@/services/facebook.service'
import type { CreatePostPayload, PublishTextPostResponse, PublishPhotoPostResponse, PublishVideoPostResponse, CreateVideoPostPayload, ScheduledPostsResponse, ScheduledPostsQuery } from '@/types/facebook.types'

interface FacebookPublishState {
  publishing: boolean
  error: string | null
  lastPostId: string | null
  lastResponse: PublishTextPostResponse | PublishPhotoPostResponse | PublishVideoPostResponse | null
  scheduledLoading?: boolean
  scheduledError?: string | null
  scheduled?: ScheduledPostsResponse | null
  lastScheduledBusinessId?: string | null
  lastScheduledQuery?: ScheduledPostsQuery | null
}

// Store específico para publicación de posts en Facebook
// Nombre y ruta claros para escalabilidad: stores/social/facebookPublish.store
// Sufijo "Store" en el ID para mayor claridad y evitar colisiones
export const useFacebookPublishStore = defineStore('facebookPublishStore', {
  state: (): FacebookPublishState => ({
    publishing: false,
    error: null,
    lastPostId: null,
    lastResponse: null,
    scheduledLoading: false,
    scheduledError: null,
    scheduled: null,
    lastScheduledBusinessId: null,
    lastScheduledQuery: null,
  }),

  actions: {
    async publishTextPost(
      businessId: string,
      payload: CreatePostPayload,
    ): Promise<PublishTextPostResponse> {
      this.publishing = true
      this.error = null
      this.lastResponse = null
      this.lastPostId = null
      try {
        const response = await facebookService.publishTextPost(businessId, payload)
        this.lastResponse = response
        this.lastPostId = response?.data?.id || null

        // Si es una publicación PROGRAMADA, refrescar listado de programados
        const isScheduled = payload?.published === false || typeof payload?.scheduled_publish_time === 'number'
        if (isScheduled) {
          try {
            if (this.lastScheduledBusinessId) {
              await this.refreshScheduledPosts()
            } else {
              await this.fetchScheduledPosts(businessId, this.lastScheduledQuery || undefined)
            }
          } catch (e) {
            // No bloquear el flujo por errores de refresco
            console.warn('[FacebookPublishStore] Error refrescando posts programados después de agendar:', e)
          }
        }
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar el post'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    async publishPhotoPost(
      businessId: string,
      payload: Pick<CreatePostPayload, 'message' | 'published' | 'scheduled_publish_time'>,
      images: File[],
    ): Promise<PublishPhotoPostResponse> {
      this.publishing = true
      this.error = null
      this.lastResponse = null
      this.lastPostId = null
      try {
        const response = await facebookService.publishPhotoPost(businessId, payload, images)
        // data puede ser id del post o estructura del carrusel; si tiene id, lo guardamos
        this.lastResponse = response as any
        this.lastPostId = (response as any)?.data?.id || null

        // Si es una publicación PROGRAMADA, refrescar listado de programados
        const isScheduled = payload?.published === false || typeof payload?.scheduled_publish_time === 'number'
        if (isScheduled) {
          try {
            if (this.lastScheduledBusinessId) {
              await this.refreshScheduledPosts()
            } else {
              await this.fetchScheduledPosts(businessId, this.lastScheduledQuery || undefined)
            }
          } catch (e) {
            console.warn('[FacebookPublishStore] Error refrescando posts programados después de agendar (foto):', e)
          }
        }
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar la(s) foto(s)'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    async publishVideoPost(
      businessId: string,
      payload: CreateVideoPostPayload,
      videoFile: File,
    ): Promise<PublishVideoPostResponse> {
      this.publishing = true
      this.error = null
      this.lastResponse = null
      this.lastPostId = null
      try {
        const response = await facebookService.publishVideoPost(businessId, payload, videoFile)
        this.lastResponse = response as any
        // El backend devuelve { data: { video_id: "..." } }
        this.lastPostId = (response as any)?.data?.video_id || (response as any)?.data?.id || null

        // Si es una publicación PROGRAMADA, refrescar listado de programados
        const isScheduled = payload?.published === false || typeof payload?.scheduled_publish_time === 'number'
        if (isScheduled) {
          try {
            if (this.lastScheduledBusinessId) {
              await this.refreshScheduledPosts()
            } else {
              await this.fetchScheduledPosts(businessId, this.lastScheduledQuery || undefined)
            }
          } catch (e) {
            console.warn('[FacebookPublishStore] Error refrescando posts programados después de agendar (video):', e)
          }
        }
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar el video en Facebook'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    async fetchScheduledPosts(
      businessId: string,
      query?: ScheduledPostsQuery,
    ): Promise<ScheduledPostsResponse> {
      this.scheduledLoading = true
      this.scheduledError = null
      this.scheduled = null
      try {
        const response = await facebookService.getScheduledPosts(businessId, query)
        this.scheduled = response
        // Guardar contexto para refrescos posteriores
        this.lastScheduledBusinessId = businessId
        if (query) this.lastScheduledQuery = query
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al obtener posts programados'
        this.scheduledError = message
        throw new Error(message)
      } finally {
        this.scheduledLoading = false
      }
    },

    async refreshScheduledPosts(): Promise<ScheduledPostsResponse | null> {
      if (!this.lastScheduledBusinessId) return null
      this.scheduledLoading = true
      this.scheduledError = null
      try {
        const response = await facebookService.getScheduledPosts(
          this.lastScheduledBusinessId,
          this.lastScheduledQuery || undefined,
        )
        this.scheduled = response
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al refrescar posts programados'
        this.scheduledError = message
        console.error('[FacebookPublishStore] refreshScheduledPosts error:', error)
        return null
      } finally {
        this.scheduledLoading = false
      }
    },

    reset() {
      this.publishing = false
      this.error = null
      this.lastPostId = null
      this.lastResponse = null
      this.scheduledLoading = false
      this.scheduledError = null
      this.scheduled = null
       this.lastScheduledBusinessId = null
       this.lastScheduledQuery = null
    },
  },
})