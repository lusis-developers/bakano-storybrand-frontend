<script setup lang="ts">
import { ref } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useFacebookSDK } from '@/composables/useFacebookSDK'
import useIntegrationStore from '@/stores/integration.store'
import facebookService from '@/services/facebook.service'
import type { IBusiness } from '@/types/business.types'
import type { IIntegrationPage } from '@/types/integration.types'

// Estado base
const businessStore = useBusinessStore()
const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()

const isWizardOpen = ref(false)
const isConnecting = ref(false)
const connectionError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const userPages = ref<IIntegrationPage[]>([])
const savingPageId = ref<string | null>(null)

// Store de integraciones
const integrationStore = useIntegrationStore()

// Emitir eventos al padre (mantener compatibilidad con BusinessCard.vue)
const emit = defineEmits<{
  (e: 'connect-facebook', page?: IIntegrationPage): void
}>()

// Recibimos el negocio de la tarjeta como prop (opcional para mantener compatibilidad)
const props = defineProps<{ business?: IBusiness }>()

const openWizard = () => {
  isWizardOpen.value = true
  connectionError.value = null
  successMessage.value = null
  userPages.value = []
}

const closeWizard = () => {
  isWizardOpen.value = false
}

const connectFacebook = async () => {
  if (isConnecting.value) return
  isConnecting.value = true
  connectionError.value = null
  successMessage.value = null

  try {
    // Permisos profesionales para obtener páginas y métricas
    const token = await login([
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
      'read_insights',
      'pages_manage_posts',
    ])

    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) throw new Error('No hay negocio seleccionado para conectar Facebook')

    const response = await facebookService.facebookConnect(businessId, token)
    userPages.value = response.pages || []
    successMessage.value =
      userPages.value.length > 0
        ? `¡Listo! Encontramos ${userPages.value.length} página(s) asociadas a tu cuenta.`
        : '¡Listo! Conexión realizada. No encontramos páginas asociadas.'
  } catch (err: any) {
    connectionError.value = sdkError.value || err?.message || 'Error al conectar Facebook'
  } finally {
    isConnecting.value = false
  }
}

// Helper para limpiar URLs que puedan venir con backticks o espacios
const sanitizeUrl = (url?: string): string => {
  if (!url) return ''
  return url.replace(/`/g, '').trim()
}

// Acción al seleccionar una página específica para vincular
const selectPage = async (page: IIntegrationPage) => {
  try {
    connectionError.value = null
    successMessage.value = null
    savingPageId.value = page.id

    // Emitimos al padre por compatibilidad (si quiere observar el evento)
    emit('connect-facebook', page)

    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) throw new Error('No hay negocio seleccionado para finalizar la integración')

    const { message } = await integrationStore.finalizeFacebookPage(businessId, page)
    successMessage.value = message || `Integración finalizada para la página "${page.name}".`
  } catch (err: any) {
    connectionError.value = err?.message || 'Error al finalizar la integración con la página'
  } finally {
    savingPageId.value = null
  }
}
</script>

<template>
  <div class="integrations-status">
    <div class="header">
      <h4 class="title"><i class="fa-solid fa-plug"></i> Integraciones</h4>
      <button type="button" class="btn btn-primary" @click="openWizard">
        <i class="fa-solid fa-share-nodes"></i>
        <span>Conectar redes</span>
      </button>
    </div>

    <!-- Modal mágico de conexión (teleportado al body para que sobresalga de la tarjeta) -->
    <Teleport to="body">
      <div v-if="isWizardOpen" class="modal" role="dialog" aria-modal="true" aria-labelledby="connect-title">
        <div class="modal-backdrop" @click="closeWizard" aria-hidden="true"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="connect-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Conecta tus redes sociales</h5>
            <button class="close" type="button" @click="closeWizard" aria-label="Cerrar">×</button>
          </div>

          <div class="modal-body">
            <!-- Paso 1: Conectar Facebook (solo mientras aún no hay páginas) -->
            <div class="step" v-if="!userPages.length">
              <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 1</span>
              <h4><i class="fab fa-facebook"></i> Conectar Facebook</h4>
              <p class="helper">
                Usaremos permisos profesionales para obtener tus páginas de Facebook y prepararte para publicar
                de forma segura.
              </p>

              <div class="feedback" v-if="connectionError || successMessage">
                <p v-if="connectionError" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ connectionError }}</p>
                <p v-else-if="successMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ successMessage }}</p>
              </div>

              <button
                type="button"
                class="btn btn-primary"
                :disabled="isSDKLoading || isConnecting"
                @click="connectFacebook"
              >
                <span v-if="isConnecting || isSDKLoading"><i class="fa-solid fa-spinner fa-spin"></i> Conectando...</span>
                <span v-else><i class="fab fa-facebook"></i> Conectar</span>
              </button>
            </div>

            <!-- Paso 1 (post conexión): Seleccionar una página -->
            <div class="step" v-else>
              <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 1</span>
              <h4><i class="fab fa-facebook"></i> Selecciona una página de Facebook</h4>
              <p class="helper">Elige la página que deseas vincular a tu negocio.</p>

              <div class="feedback" v-if="connectionError || successMessage">
                <p v-if="connectionError" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ connectionError }}</p>
                <p v-else-if="successMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ successMessage }}</p>
              </div>

              <div class="pages-box">
                <strong><i class="fa-solid fa-list"></i> Páginas encontradas</strong>
                <ul>
                  <li v-for="p in userPages" :key="p.id" class="page-item">
                    <div class="left">
                      <img v-if="p.pictureUrl" :src="sanitizeUrl(p.pictureUrl)" alt="Logo de la página" class="avatar" />
                      <i v-else class="fa-solid fa-flag placeholder"></i>
                      <div class="info">
                        <span class="page-name">{{ p.name }}</span>
                        <span v-if="p.category" class="category">{{ p.category }}</span>
                        <span class="page-id">ID: {{ p.id }}</span>
                      </div>
                    </div>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn btn-primary btn-connect"
                        :disabled="savingPageId === p.id"
                        @click="selectPage(p)"
                      >
                        <template v-if="savingPageId === p.id">
                          <i class="fa-solid fa-spinner fa-spin"></i>
                          <span>Conectando...</span>
                        </template>
                        <template v-else>
                          <i class="fa-solid fa-link"></i>
                          <span>Conectar</span>
                        </template>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeWizard">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.integrations-status {
  background: $white;
  border-radius: 18px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 10px 30px rgba($BAKANO-DARK, 0.08);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: $BAKANO-DARK;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 140px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba($BAKANO-PINK, 0.2);
    outline-offset: 2px;
  }
}

.btn-outline {
  background: transparent;
  color: $BAKANO-PINK;
  border-color: $BAKANO-PINK;

  &:hover:not(:disabled) {
    background: rgba($BAKANO-PINK, 0.1);
    border-color: lighten($BAKANO-PINK, 10%);
  }
}

.btn-primary {
  background: $BAKANO-PINK;
  color: $white;
  border-color: $BAKANO-PINK;

  &:hover:not(:disabled) {
    background: darken($BAKANO-PINK, 8%);
    border-color: darken($BAKANO-PINK, 8%);
    box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.12);
  }
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 1000;
  animation: fadeIn 180ms ease-out;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba($BAKANO-DARK, 0.3);
}

.modal-content {
  position: relative;
  width: min(720px, 92vw);
  background: $white;
  border-radius: 20px;
  border: 1px solid lighten($BAKANO-DARK, 82%);
  box-shadow: 0 10px 30px rgba($BAKANO-DARK, 0.12);
  overflow: hidden;
  transform: translateY(-6px);
  animation: popIn 220ms ease-out;
  // Mobile-safe: constrain height and enable internal scroll
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid lighten($BAKANO-DARK, 88%);

  h5 {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: $BAKANO-DARK;
    margin: 0;
  }

  h6 {
    font-size: 1.15rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.modal-body {
  padding: 1.25rem 1.25rem 1rem;
  // Allow vertical scrolling for long content (mobile-safe)
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; // smooth scrolling on iOS
}

/* Modal body heading (Paso 1: Conectar Facebook) */
.modal-body h4 {
  color: $BAKANO-DARK;
  border-bottom: 1px solid $BAKANO-DARK;
  margin-bottom: 1px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid lighten($BAKANO-DARK, 88%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.close {
  background: transparent;
  border: none;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  color: $BAKANO-DARK;
}

.step {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
  color: $BAKANO-DARK;
  background: rgba($BAKANO-DARK, 0.05);
  border: 1px solid lighten($BAKANO-DARK, 18%);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  width: fit-content;
  gap: 0.35rem;
}

.helper {
  font-size: 1rem;
  color: lighten($BAKANO-DARK, 20%);
}

.feedback {
  margin: 0.6rem 0 0.9rem;
}

.error {
  font-size: 0.95rem;
  color: $BAKANO-PINK;
  background: rgba($BAKANO-PINK, 0.1);
  border: 1px solid lighten($BAKANO-PINK, 24%);
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.success {
  font-size: 0.95rem;
  color: $alert-success;
  background: rgba($alert-success, 0.08);
  border: 1px solid lighten($alert-success, 24%);
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.pages-box {
  margin-top: 0.75rem;
  border: 1px solid lighten($BAKANO-DARK, 86%);
  border-radius: 14px;
  padding: 0.9rem;
  background: $BAKANO-LIGHT;
}

.pages-box ul {
  list-style: none;
  margin: 0.6rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.pages-box li.page-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
}

.pages-box .left {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.pages-box .avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid lighten($BAKANO-DARK, 82%);
}

.pages-box .placeholder {
  color: lighten($BAKANO-DARK, 24%);
}

.pages-box .info {
  display: flex;
  flex-direction: column;
}

.page-name {
  font-weight: 800;
  color: $BAKANO-DARK;
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.page-id {
  font-size: 0.85rem;
  color: lighten($BAKANO-DARK, 24%);
  margin-left: 0.25rem;
}

.pages-box .category {
  font-size: 0.85rem;
  color: lighten($BAKANO-DARK, 24%);
}

.pages-box .actions .btn-connect {
  min-width: 120px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Responsive tweaks for very small screens
@media (max-width: 480px) {
  .pages-box .avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }

  .pages-box li.page-item {
    gap: 0.5rem;
    padding: 0.4rem 0.2rem;
  }

  .pages-box .actions .btn-connect {
    min-width: 100px;
  }
}
</style>