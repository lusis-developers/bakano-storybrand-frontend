<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useFacebookSDK } from '@/composables/useFacebookSDK' // <-- 1. Importamos nuestro composable
import integrationService from '@/services/integration.service'
import type { IBusiness } from '@/types/business.types'
import type { IIntegrationPage } from '@/types/integration.types'
import FacebookPageSelector from './FacebookPageSelector.vue'
import { useInstagramAPI } from '@/composables/useInstagramSDK'
// ... existing code ...

const businessStore = useBusinessStore()
// 2. Usamos el composable. Renombramos 'error' para evitar conflictos.
const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()
const { isSDKLoading: isIGLoading, error: igError, loginForInstagram } = useInstagramAPI()

const isConnecting = ref(false)
const connectionError = ref<string | null>(null)
const userPages = ref<IIntegrationPage[] | null>(null)
const isPageModalOpen = ref(false)
const selectedPageId = ref<string | null>(null)

const isConnectingInstagram = ref(false)
const instagramError = ref<string | null>(null)

// Recibimos el negocio de la tarjeta como prop (opcional para mantener compatibilidad)
const props = defineProps<{ business?: IBusiness }>()


const facebookConnected = computed(() => {
  const list = props.business?.integrations ?? businessStore.currentBusiness?.integrations ?? []
  return Array.isArray(list) && list.includes('facebook')
})

const instagramConnected = computed(() => {
  const list = props.business?.integrations ?? businessStore.currentBusiness?.integrations ?? []
  return Array.isArray(list) && list.includes('instagram')
})

const facebookPending = computed(() => {
  return !!userPages.value && !facebookConnected.value && !selectedPageId.value
})

const emit = defineEmits<{
  (e: 'connect-facebook', token: string): void
  (e: 'connect-instagram', code: string): void
}>()

const handleConnectFacebook = async () => {
  if (isConnecting.value) return

  isConnecting.value = true
  connectionError.value = null

  try {
    // 3. Llamamos a nuestro método `login` con los permisos profesionales solicitados.
    // La lógica de obtener el token ya está encapsulada. ¡Mucho más limpio!
    const token = await login(['business_management', 'pages_show_list', 'pages_read_engagement', 'read_insights', 'pages_manage_posts'])

    emit('connect-facebook', token)

    // 4. Conectar con el backend inmediatamente después de obtener el token del SDK
    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) {
      throw new Error('No hay negocio seleccionado para conectar Facebook')
    }

    const response = await integrationService.facebookConnect(businessId, token)
    userPages.value = response.pages || []
    // Abrimos el modal para que el usuario seleccione una página
    isPageModalOpen.value = true

  } catch (err) {
    // El error ya es manejado y formateado por nuestro composable.
    // Podemos usar el error del SDK o el que viene del catch.
    connectionError.value = sdkError.value || (err instanceof Error ? err.message : 'Error al conectar con Facebook')
  } finally {
    isConnecting.value = false
  }
}

const handleConnectInstagram = async () => {
  if (isConnectingInstagram.value) return

  isConnectingInstagram.value = true
  instagramError.value = null

  try {
    const token = await loginForInstagram()

    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) {
      throw new Error('No hay negocio seleccionado para conectar Instagram')
    }

    await integrationService.instagramConnect(businessId, token)
    emit('connect-instagram', token)
  } catch (err) {
    instagramError.value = igError.value || (err instanceof Error ? err.message : 'Error al conectar con Instagram')
  } finally {
    isConnectingInstagram.value = false
  }
}

const openPageModal = () => {
  if (userPages.value && userPages.value.length > 0) {
    isPageModalOpen.value = true
  }
}

const closePageModal = () => {
  isPageModalOpen.value = false
}

const selectPage = (pageId: string) => {
  selectedPageId.value = pageId
}

const confirmSelection = async () => {
  if (!selectedPageId.value) return
  const page = userPages.value?.find(p => p.id === selectedPageId.value) || null
  // Aquí podríamos llamar a un servicio para guardar la página seleccionada en backend.
  // Por ahora, cerramos el modal y mantenemos el estado como pendiente hasta implementar el flujo completo.
  isPageModalOpen.value = false
}
</script>

<template>
  <div class="integrations-status">
    <h4 class="title">Integraciones</h4>

    <div class="integration-row facebook">
      <span class="icon-wrap">
        <i class="fa-brands fa-facebook-f icon" aria-hidden="true"></i>
      </span>
      <div class="details">
        <strong>Facebook</strong>
        <div class="status-line">
          <span
            :class="[
              'status-badge',
              facebookConnected ? 'connected' : facebookPending ? 'pending' : 'disconnected'
            ]"
          >
            {{ facebookConnected ? 'Conectado' : facebookPending ? 'Pendiente de agendar' : 'No conectado' }}
          </span>
          <span v-if="connectionError" class="error-message">{{ connectionError }}</span>
        </div>
      </div>
      <template v-if="!facebookConnected">
        <button
          v-if="!facebookPending"
          type="button"
          class="btn btn-primary"
          @click="handleConnectFacebook"
          :disabled="isSDKLoading || isConnecting"
        >
          <span v-if="isConnecting || isSDKLoading">Conectando...</span>
          <span v-else>Conectar</span>
        </button>
        <button
          v-else
          type="button"
          class="btn btn-outline"
          @click="openPageModal"
        >
          Seleccionar página
        </button>
      </template>
    </div>

    <div class="integration-row instagram">
      <span class="icon-wrap">
        <i class="fa-brands fa-instagram icon" aria-hidden="true"></i>
      </span>
      <div class="details">
        <strong>Instagram</strong>
        <div class="status-line">
          <span
            :class="[
              'status-badge',
              instagramConnected ? 'connected' : 'disconnected'
            ]"
          >
            {{ instagramConnected ? 'Conectado' : 'No conectado' }}
          </span>
          <span v-if="instagramError" class="error-message">{{ instagramError }}</span>
        </div>
      </div>
      <template v-if="!instagramConnected">
        <button
          type="button"
          class="btn btn-primary"
          @click="handleConnectInstagram"
          :disabled="isIGLoading || isConnectingInstagram"
        >
          <span v-if="isConnectingInstagram || isIGLoading">Conectando...</span>
          <span v-else>Conectar</span>
        </button>
      </template>
    </div>

    <FacebookPageSelector
      :open="isPageModalOpen"
      :pages="userPages || []"
      v-model:selectedPageId="selectedPageId"
      @cancel="closePageModal"
      @confirm="confirmSelection"
    />
  </div>
</template>


<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

.integrations-status {
  background: colors.$white;
  border-radius: 16px;
  border: 1px solid lighten(colors.$BAKANO-DARK, 80%);
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: colors.$BAKANO-DARK;
}

.integration-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid lighten(colors.$BAKANO-DARK, 82%);
  border-radius: 12px;
  background: colors.$white;
  transition: all 0.2s ease;
  position: relative;
}

.integration-row+.integration-row {
  margin-top: 0.75rem;
}

.integration-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.integration-row.facebook {
  background: linear-gradient(180deg, rgba(colors.$BAKANO-PURPLE, 0.06), rgba(colors.$BAKANO-PURPLE, 0.02));
}

.integration-row.instagram {
  background: linear-gradient(180deg, rgba(colors.$BAKANO-PINK, 0.06), rgba(colors.$BAKANO-PINK, 0.02));
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: colors.$BAKANO-LIGHT;
  box-shadow: inset 0 0 0 1px lighten(colors.$BAKANO-DARK, 84%);
}

.integration-row.facebook .icon-wrap {
  background: lighten(colors.$BAKANO-PURPLE, 42%);
  color: colors.$BAKANO-PURPLE;
}

.integration-row.instagram .icon-wrap {
  background: lighten(colors.$BAKANO-PINK, 42%);
  color: colors.$BAKANO-PINK;
}

.icon {
  font-size: 1rem;
}

.details {
  display: flex;
  flex-direction: column;
  min-width: 0; // permite que el contenido envuelva y no empuje el botón
}

.status-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap; // permite que el mensaje de error baje a la siguiente línea
  min-width: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap; // evita que el badge se parta en dos líneas
}

.status-badge.connected {
  color: colors.$alert-success;
  background: colors.$alert-success-bg;
  border-color: lighten(colors.$alert-success, 24%);
}

.status-badge.pending {
  color: colors.$alert-info;
  background: colors.$alert-info-bg;
  border-color: lighten(colors.$alert-info, 24%);
}

.status-badge.disconnected {
  color: colors.$alert-error;
  background: colors.$alert-error-bg;
  border-color: lighten(colors.$alert-error, 24%);
}

.error-message {
  font-size: 0.75rem;
  color: colors.$alert-error;
}

// El mensaje de error ocupa toda la fila debajo del badge
.status-line .error-message {
  flex-basis: 100%;
  margin-top: 0.25rem;
  white-space: normal;
}

// Botones (base)
.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid colors.$overlay-purple;
    outline-offset: 2px;
  }
}

// Outline (para acciones secundarias)
.btn-outline {
  background: transparent;
  color: colors.$BAKANO-PURPLE;
  border-color: colors.$BAKANO-PURPLE;

  &:hover:not(:disabled) {
    background: colors.$overlay-purple;
    border-color: lighten(colors.$BAKANO-PURPLE, 10%);
  }
}

// Primary (acción principal)
.btn-primary {
  background: colors.$BAKANO-GREEN;
  color: colors.$white;
  border-color: colors.$BAKANO-GREEN;

  &:hover:not(:disabled) {
    background: darken(colors.$BAKANO-GREEN, 8%);
    border-color: darken(colors.$BAKANO-GREEN, 8%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}
</style>