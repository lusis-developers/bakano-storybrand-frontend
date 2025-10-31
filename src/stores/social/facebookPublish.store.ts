import { defineStore } from 'pinia'
import facebookService from '@/services/facebook.service'
import type { CreatePostPayload, PublishTextPostResponse } from '@/types/facebook.types'

interface FacebookPublishState {
  publishing: boolean
  error: string | null
  lastPostId: string | null
  lastResponse: PublishTextPostResponse | null
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

    reset() {
      this.publishing = false
      this.error = null
      this.lastPostId = null
      this.lastResponse = null
    },
  },
})