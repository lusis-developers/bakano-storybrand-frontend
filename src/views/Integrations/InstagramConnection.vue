<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import integrationService from '@/services/integration.service'
import instagramService from '@/services/instagram.service'
import { useBusinessStore } from '@/stores/business.store'
import { useInstagramSDK } from '@/composables/useInstagramSDK'

const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()
const { loginForInstagram, isSDKLoading } = useInstagramSDK()

const connecting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const businessId = computed(() => {
  const fromQuery = (route.query.businessId as string | undefined) || undefined
  const fromStore = businessStore.currentBusiness?.id
  return fromQuery ?? fromStore ?? ''
})

const goBack = () => {
  router.replace({ name: 'business-management' })
}

const connectInstagram = async () => {
  error.value = null
  success.value = false

  if (!businessId.value) {
    error.value = 'No se encontró el negocio actual. Abre la gestión de negocio y vuelve a intentar.'
    return
  }

  try {
    connecting.value = true
    // 1) Obtener User Access Token usando Facebook Login for Business
    const userAccessToken = await loginForInstagram()

    // 2) Registrar conexión en backend
    await instagramService.instagramConnect(businessId.value, userAccessToken)

    success.value = true
    // 3) Redirigir suavemente de vuelta a la gestión de negocio
    setTimeout(() => {
      goBack()
    }, 1200)
  } catch (e: any) {
    error.value = e?.message || 'Error al conectar con Instagram'
  } finally {
    connecting.value = false
  }
}
// Nota: se desactiva el inicio automático de conexión.
// El usuario puede iniciar el proceso manualmente con el botón "Reintentar".
</script>

<template>
  <div class="ig-connect">
    <div class="card">
      <h2 class="title">Conectar Instagram</h2>
      <p class="subtitle">Estamos preparando todo para vincular tu cuenta profesional de Instagram.</p>

      <div class="status-area">
        <div v-if="connecting || isSDKLoading" class="loading">
          <span class="spinner" aria-hidden="true" />
          <span>Conectando…</span>
        </div>

        <div v-else-if="success" class="success">
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          <span>¡Listo! Instagram ha sido conectado correctamente.</span>
        </div>

        <div v-else-if="error" class="error">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <span>{{ error }}</span>
        </div>
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="connecting || isSDKLoading"
          @click="connectInstagram"
        >
          Reintentar
        </button>
        <button type="button" class="btn btn-outline" @click="goBack">Volver</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

.ig-connect {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.card {
  width: min(680px, 100%);
  background: colors.$white;
  border: 1px solid lighten(colors.$BAKANO-DARK, 80%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 1.25rem 1.25rem 1rem;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: colors.$BAKANO-DARK;
}
.subtitle {
  margin: 0.5rem 0 1rem;
  color: lighten(colors.$BAKANO-DARK, 12%);
}

.status-area {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 1.25rem;
}

.loading, .error, .success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.success {
  color: colors.$alert-success;
}
.error {
  color: colors.$alert-error;
}

.spinner {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid colors.$overlay-purple;
  border-top-color: colors.$BAKANO-PURPLE;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(1turn); }
}

.actions {
  display: flex;
  gap: 0.5rem;
}

// Botones base
.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

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

.btn-outline {
  background: transparent;
  color: colors.$BAKANO-PURPLE;
  border-color: colors.$BAKANO-PURPLE;

  &:hover:not(:disabled) {
    background: colors.$overlay-purple;
    border-color: lighten(colors.$BAKANO-PURPLE, 12%);
  }
}
</style>