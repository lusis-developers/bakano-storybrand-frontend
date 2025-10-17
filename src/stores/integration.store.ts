import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import integrationService from '@/services/integration.service'
import { useFacebookSDK } from '@/composables/useFacebookSDK'
import type { IIntegrationPage, IFacebookConnectResponse } from '@/types/integration.types'

/**
 * Store para manejar el flujo de integraciones (inicialmente Facebook/Meta)
 * No modifica componentes. Expone acciones para orquestar el SDK + backend.
 */
export const useIntegrationStore = defineStore('integrations', () => {
  // Estado
  const isConnecting = ref(false)
  const error = ref<string | null>(null)
  const pages = ref<IIntegrationPage[]>([])

  // Composable del SDK de Facebook
  const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()

  // Getters
  const hasPages = computed(() => pages.value.length > 0)
  const isBusy = computed(() => isConnecting.value || isSDKLoading.value)

  const clearError = () => {
    error.value = null
  }

  const clearPages = () => {
    pages.value = []
  }

  /**
   * Orquesta el flujo de conexión de Facebook:
   * 1) Solicita permisos y obtiene el token via SDK
   * 2) Envía el token al backend para obtener páginas
   * 3) Guarda y hace console.log de las páginas
   */
  const connectFacebook = async (businessId: string): Promise<IFacebookConnectResponse> => {
    if (!businessId) {
      throw new Error('Se requiere el ID del negocio para conectar Facebook')
    }

    if (isConnecting.value) {
      console.log('[IntegrationStore] Ya hay una conexión en proceso. Ignorando nueva solicitud.')
      return { message: 'Connection in progress', pages: pages.value }
    }

    isConnecting.value = true
    clearError()
    clearPages()

    try {
      // 1) Login via SDK para obtener token del usuario
      const token = await login(['business_management', 'pages_show_list'])

      // 2) Enviar al backend para intercambio y obtención de páginas
      const response = await integrationService.facebookConnect(businessId, token)
      pages.value = response.pages || []

      // 3) Consola de páginas del usuario (solicitado)
      console.log(
        '%c[IntegrationStore] ✅ Páginas del usuario (Meta):',
        'color: #10b981; font-weight: bold;',
        pages.value,
      )

      return response
    } catch (err: any) {
      const message = sdkError.value || err?.message || 'Error al conectar Facebook'
      error.value = message
      console.error('[IntegrationStore] ❌ Error en connectFacebook:', err)
      throw new Error(message)
    } finally {
      isConnecting.value = false
    }
  }

  return {
    // Estado
    isConnecting,
    error,
    pages,
    // SDK
    isSDKLoading,
    // Getters
    hasPages,
    isBusy,
    // Acciones
    connectFacebook,
    clearError,
    clearPages,
  }
})

export default useIntegrationStore