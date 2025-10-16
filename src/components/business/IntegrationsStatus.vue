<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useFacebookSDK } from '@/composables/useFacebookSDK' // <-- 1. Importamos nuestro composable

const businessStore = useBusinessStore()
// 2. Usamos el composable. Renombramos 'error' para evitar conflictos.
const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()

const isConnecting = ref(false)
const connectionError = ref<string | null>(null)

const facebookConnected = computed(() => {
  const list = businessStore.currentBusiness?.integrations ?? []
  return Array.isArray(list) && list.includes('facebook')
})

const emit = defineEmits<{
  (e: 'connect-facebook', token: string): void
}>()

const handleConnectFacebook = async () => {
  if (isConnecting.value) return

  isConnecting.value = true
  connectionError.value = null

  try {
    // 3. Llamamos a nuestro método `login` con los permisos profesionales solicitados.
    // La lógica de obtener el token ya está encapsulada. ¡Mucho más limpio!
    const token = await login(['business_management', 'pages_show_list'])

    console.log('Facebook token obtenido:', token)
    emit('connect-facebook', token)

  } catch (err) {
    // El error ya es manejado y formateado por nuestro composable.
    // Podemos usar el error del SDK o el que viene del catch.
    connectionError.value = sdkError.value || (err instanceof Error ? err.message : 'Error al conectar con Facebook')
    console.error('Error al conectar con Facebook:', err)
  } finally {
    isConnecting.value = false
  }
}
</script>

<template>
  <div class="integrations-status">
    <h4 class="title">Integraciones conectadas</h4>

    <div class="integration-row">
      <i class="fa-brands fa-facebook-f icon" aria-hidden="true"></i>
      <div class="details">
        <strong>Facebook</strong>
        <span
          :class="['status', facebookConnected ? 'connected' : 'disconnected']"
        >
          {{ facebookConnected ? 'Conectado' : 'No conectado' }}
        </span>
        <span v-if="connectionError" class="error-message">{{ connectionError }}</span>
      </div>
      <button
        v-if="!facebookConnected"
        type="button"
        class="btn btn-primary"
        @click="handleConnectFacebook"
        :disabled="isSDKLoading || isConnecting"
      >
        <span v-if="isConnecting || isSDKLoading">Conectando...</span>
        <span v-else>Conectar</span>
      </button>
    </div>
  </div>
</template>


<style scoped>
.integrations-status {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1rem;
}

.title {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
}

.integration-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  font-size: 1rem;
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status {
  font-size: 0.75rem;
  font-weight: 600;
}

.status.connected {
  color: #166534;
}

.status.disconnected {
  color: #92400e;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>