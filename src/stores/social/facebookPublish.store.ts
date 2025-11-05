import { defineStore } from 'pinia'
import facebookService from '@/services/facebook.service'
import type { CreatePostPayload, PublishTextPostResponse, PublishPhotoPostResponse, PublishVideoPostResponse, CreateVideoPostPayload } from '@/types/facebook.types'

interface FacebookPublishState {
  publishing: boolean
  error: string | null
  lastPostId: string | null
  lastResponse: PublishTextPostResponse | PublishPhotoPostResponse | PublishVideoPostResponse | null
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
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar el video en Facebook'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    reset() {
      this.publishing = false
      this.error = null
      this.lastPostId = null
      this.lastResponse = null
    },
  },
})