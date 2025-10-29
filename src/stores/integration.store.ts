import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import integrationService from '@/services/integration.service'
import facebookService from '@/services/facebook.service'
import instagramService from '@/services/instagram.service'
import { useFacebookSDK } from '@/composables/useFacebookSDK'
import { useInstagramSDK } from '@/composables/useInstagramSDK'
import type {
  IIntegrationPage,
  IFacebookConnectResponse,
  IInstagramConnectResponse,
  IIntegrationRecord,
  IGetIntegrationsResponse,
} from '@/types/integration.types'
import type { IntegrationType } from '@/types/integration.types'

/**
 * Store para manejar el flujo de integraciones (inicialmente Facebook/Meta)
 * No modifica componentes. Expone acciones para orquestar el SDK + backend.
 */
export const useIntegrationStore = defineStore('integrations', () => {
  // Estado
  const isConnecting = ref(false)
  const error = ref<string | null>(null)
  const pages = ref<IIntegrationPage[]>([])
  const instagramError = ref<string | null>(null)
  const integrations = ref<IIntegrationRecord[]>([])
  const integrationsCount = ref<number>(0)

  // Composable del SDK de Facebook
  const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()
  const { loading: isIGLoading, error: igSdkError, loginForInstagram } = useInstagramSDK()

  // Getters
  const hasPages = computed(() => pages.value.length > 0)
  const isBusy = computed(() => isConnecting.value || isSDKLoading.value || isIGLoading.value)
  const hasIntegrations = computed(() => integrations.value.length > 0)

  // Integraciones por tipo
  const facebookIntegration = computed<IIntegrationRecord | null>(() => {
    return integrations.value.find((i) => i.type === 'facebook') || null
  })

  const instagramIntegration = computed<IIntegrationRecord | null>(() => {
    return integrations.value.find((i) => i.type === 'instagram') || null
  })

  const isFacebookConnected = computed<boolean>(() => !!facebookIntegration.value?.isConnected)
  const isInstagramConnected = computed<boolean>(() => !!instagramIntegration.value?.isConnected)

  const getIntegrationByType = (type: IntegrationType): IIntegrationRecord | undefined => {
    return integrations.value.find((i) => i.type === type)
  }

  const connectionStatusByType = (type: IntegrationType): string => {
    return getIntegrationByType(type)?.connectionStatus || 'disconnected'
  }

  const clearError = () => {
    error.value = null
  }

  const clearPages = () => {
    pages.value = []
  }

  const clearInstagramError = () => {
    instagramError.value = null
  }

  const clearIntegrations = () => {
    integrations.value = []
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
      const response = await facebookService.facebookConnect(businessId, token)
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

  /**
   * Orquesta el flujo de conexión de Instagram:
   * 1) Solicita permisos y obtiene el token via SDK
   * 2) Envía el token al backend para registrar la integración
   */
  const connectInstagram = async (businessId: string): Promise<IInstagramConnectResponse> => {
    if (!businessId) {
      throw new Error('Se requiere el ID del negocio para conectar Instagram')
    }

    if (isConnecting.value) {
      console.log('[IntegrationStore] Ya hay una conexión en proceso. Ignorando nueva solicitud (Instagram).')
      return { message: 'Connection in progress' }
    }

    isConnecting.value = true
    clearInstagramError()

    try {
      // 1) Login via SDK para obtener token del usuario
      const token = await loginForInstagram()

      // 2) Registrar en backend
      const response = await instagramService.instagramConnect(businessId, token)
      return response
    } catch (err: any) {
      const message = igSdkError.value || err?.message || 'Error al conectar Instagram'
      instagramError.value = message
      console.error('[IntegrationStore] ❌ Error en connectInstagram:', err)
      throw new Error(message)
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Obtiene el listado de integraciones del negocio desde el backend
   */
  const loadIntegrations = async (businessId: string): Promise<IGetIntegrationsResponse> => {
    if (!businessId) {
      throw new Error('Se requiere el ID del negocio para listar integraciones')
    }

    try {
      const response = await integrationService.getIntegrations(businessId)
      integrations.value = response.data || []
      integrationsCount.value = typeof response.count === 'number' ? response.count : integrations.value.length
      return response
    } catch (err: any) {
      const message = err?.message || 'Error al obtener integraciones'
      error.value = message
      console.error('[IntegrationStore] ❌ Error en loadIntegrations:', err)
      throw new Error(message)
    }
  }

  return {
    // Estado
    isConnecting,
    error,
    pages,
    // SDK
    isSDKLoading,
    isIGLoading,
    // Getters
    hasPages,
    isBusy,
    hasIntegrations,
    integrationsCount,
    facebookIntegration,
    instagramIntegration,
    isFacebookConnected,
    isInstagramConnected,
    connectionStatusByType,
    getIntegrationByType,
    // Acciones
    connectFacebook,
    connectInstagram,
    loadIntegrations,
    clearError,
    clearPages,
    clearInstagramError,
    clearIntegrations,
    // Estado Instagram
    instagramError,
    integrations,
  }
})

export default useIntegrationStore
