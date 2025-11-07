import { defineStore } from 'pinia'
import instagramService from '@/services/instagram.service'

interface InstagramPublishState {
  publishing: boolean
  error: string | null
  lastContainerId: string | null
  lastResponse: { message: string; data: any } | null
}

// Store específico para publicación en Instagram (foto/carrusel)
// Ruta: stores/social/instagramPublish.store.ts
export const useInstagramPublishStore = defineStore('instagramPublishStore', {
  state: (): InstagramPublishState => ({
    publishing: false,
    error: null,
    lastContainerId: null,
    lastResponse: null,
  }),

  actions: {
    /**
     * Publica una foto o carrusel en Instagram.
     * - payload: { caption?, published?, scheduled_publish_time? }
     * - images: archivos a subir en el campo 'images'
     */
    async publishPhotoOrCarousel(
      businessId: string,
      payload: { caption?: string; published?: boolean; scheduled_publish_time?: number | string },
      images: File[],
    ): Promise<{ message: string; data: any }> {
      this.publishing = true
      this.error = null
      this.lastResponse = null
      this.lastContainerId = null
      try {
        const response = await instagramService.publishPhotoOrCarouselPost(businessId, payload, images)
        this.lastResponse = response
        // El backend incluye container_id e is_scheduled dentro de data
        this.lastContainerId = (response as any)?.data?.container_id || null
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar en Instagram'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    /**
     * Publica un Reel (video) en Instagram.
     * - payload: { caption?, share_to_feed?, published?, scheduled_publish_time? }
     * - video: archivo a subir en el campo 'video'
     */
    async publishReel(
      businessId: string,
      payload: { caption?: string; share_to_feed?: boolean; published?: boolean; scheduled_publish_time?: number | string },
      video: File,
    ): Promise<{ message: string; data: any }> {
      this.publishing = true
      this.error = null
      this.lastResponse = null
      this.lastContainerId = null
      try {
        const response = await instagramService.publishReelPost(businessId, payload, video)
        this.lastResponse = response
        // El backend incluye container_id e is_scheduled dentro de data
        this.lastContainerId = (response as any)?.data?.container_id || null
        return response
      } catch (error: any) {
        const message = error?.message || 'Error al publicar Reel en Instagram'
        this.error = message
        throw new Error(message)
      } finally {
        this.publishing = false
      }
    },

    reset() {
      this.publishing = false
      this.error = null
      this.lastContainerId = null
      this.lastResponse = null
    },
  },
})