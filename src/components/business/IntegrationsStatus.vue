<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ConnectionStatusColumn from './integrations/ConnectionStatusColumn.vue'
import FacebookStep from './integrations/FacebookStep.vue'
import InstagramStep from './integrations/InstagramStep.vue'
import { useBusinessStore } from '@/stores/business.store'
import { useFacebookSDK } from '@/composables/useFacebookSDK'
import useIntegrationStore from '@/stores/integration.store'
import facebookService from '@/services/facebook.service'
import type { IBusiness } from '@/types/business.types'
import type {
  IIntegrationPage,
  IIntegrationRecord,
  IFacebookPageInfo,
  IInstagramLinkedAccount,
  IInstagramProfile,
} from '@/types/integration.types'

// Estado base
const businessStore = useBusinessStore()
const { isLoading: isSDKLoading, error: sdkError, login } = useFacebookSDK()

const isWizardOpen = ref(false)
const isConnecting = ref(false)
const connectionError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const userPages = ref<IIntegrationPage[]>([])
const savingPageId = ref<string | null>(null)
const facebookConnectedIntegration = ref<IIntegrationRecord | null>(null)
const connectedFacebookPage = ref<IFacebookPageInfo | null>(null)
const isConnectingInstagram = ref(false)
const instagramSuccessMessage = ref<string | null>(null)
const instagramErrorMessage = ref<string | null>(null)
const instagramAccounts = ref<IInstagramLinkedAccount[]>([])
const savingInstagramId = ref<string | null>(null)
const connectedInstagram = ref<IInstagramProfile | null>(null)
const isRelinkingInstagram = ref(false)
// Estado para permitir revincular página de Facebook cuando ya existe una conexión
const isRelinkingFacebook = ref(false)

// Estado derivado: ¿todo conectado? (Facebook + Instagram)
const allConnected = computed<boolean>(() => {
  return Boolean(facebookConnectedIntegration.value && connectedInstagram.value)
})

// Derivados: sugeridos vs otros (según la página de Facebook vinculada)
const suggestedInstagramAccounts = computed<IInstagramLinkedAccount[]>(() => {
  const connectedPageId = facebookConnectedIntegration.value?.metadata?.pageId
  if (!connectedPageId) return []
  return instagramAccounts.value.filter((a) => a.pageId === connectedPageId)
})

const otherInstagramAccounts = computed<IInstagramLinkedAccount[]>(() => {
  const suggestedIds = new Set(suggestedInstagramAccounts.value.map((a) => a.instagramAccountId))
  return instagramAccounts.value.filter((a) => !suggestedIds.has(a.instagramAccountId))
})

// Store de integraciones
const integrationStore = useIntegrationStore()

// Estados derivados desde el store para reflejar UI según backend
const fbRecord = computed(() => integrationStore.getIntegrationByType('facebook'))
const fbConnectionStatus = computed(() => integrationStore.connectionStatusByType('facebook'))
const hasFacebookIntegrationRecord = computed(() => !!fbRecord.value)
const isFacebookPending = computed(() =>
  fbConnectionStatus.value === 'pending' || (fbRecord.value?.metadata?.status === 'pending_page_selection'),
)
const igIsConnectedFromStore = computed(() => integrationStore.isInstagramConnected)

// Cargar integraciones existentes al montar y cuando se abra el modal
const refreshIntegrations = async () => {
  try {
    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) return

    await integrationStore.loadIntegrations(businessId)

    // Reflejar Facebook conectado (si existe en el store)
    const fb = integrationStore.facebookIntegration as IIntegrationRecord | null
    if (fb && fb.isConnected) {
      facebookConnectedIntegration.value = fb
      const md = (fb.metadata || {}) as any
      const picUrl = sanitizeUrl(
        md?.picture?.size150 || md?.picture?.normal || md?.picture?.url || md?.pagePictureUrl,
      )
      connectedFacebookPage.value = {
        id: md?.pageId || md?.page_id || '',
        name: md?.pageName || md?.name || fb.name,
        picture: picUrl
          ? {
            url: picUrl,
            normal: sanitizeUrl(md?.picture?.normal),
            size150: sanitizeUrl(md?.picture?.size150),
          }
          : undefined,
      }
    }

    // Reflejar Instagram conectado (si existe en el store)
    const ig = integrationStore.instagramIntegration as IIntegrationRecord | null
    if (ig && ig.isConnected) {
      const md = (ig.metadata || {}) as any
      connectedInstagram.value = {
        id: md?.instagramAccountId || md?.instagramId || ig._id,
        username: md?.instagramUsername || md?.username || '',
        profilePictureUrl: sanitizeUrl(
          md?.instagramProfilePictureUrl || md?.profilePictureUrl || md?.picture?.url,
        ),
        followersCount: typeof md?.followersCount === 'number' ? md.followersCount : undefined,
      }
    }
  } catch (e) {
    console.error('[IntegrationsStatus] Error al cargar integraciones existentes:', e)
  }
}

onMounted(() => {
  // Al cargar el componente, intentamos traer el estado actual del backend
  refreshIntegrations()
})

// Emitir eventos al padre (mantener compatibilidad con BusinessCard.vue)
const emit = defineEmits<{
  (e: 'connect-facebook', page?: IIntegrationPage): void
}>()

// Recibimos el negocio de la tarjeta como prop (opcional para mantener compatibilidad)
const props = defineProps<{ business?: IBusiness }>()

const openWizard = async () => {
  isWizardOpen.value = true
  connectionError.value = null
  successMessage.value = null
  // Limpiar listados transitorios, pero conservar el estado conectado si ya existe
  userPages.value = []
  instagramSuccessMessage.value = null
  instagramErrorMessage.value = null
  isRelinkingFacebook.value = false
  isRelinkingInstagram.value = false

  // Sincronizar por si hubo cambios antes de abrir el modal
  await refreshIntegrations()
}

const closeWizard = () => {
  isWizardOpen.value = false
  isRelinkingFacebook.value = false
  isRelinkingInstagram.value = false
}

// Iniciar flujos de revinculación desde componentes hijos
const startRelinkingFacebook = () => {
  if (isSDKLoading.value || isConnecting.value) return
  isRelinkingFacebook.value = true
  connectFacebook()
}

const startRelinkingInstagram = () => {
  if (isConnectingInstagram.value) return
  isRelinkingInstagram.value = true
  connectInstagramFlow()
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

    // Evitar vinculación automática cuando el usuario desea elegir manualmente (p. ej. al revincular)
    // Solo auto-seleccionar si el backend indica un estado pendiente explícito y NO estamos revinculando.
    const pendingPageId = fbRecord.value?.metadata?.pageId || fbRecord.value?.metadata?.page_id
    if (!isRelinkingFacebook.value && isFacebookPending.value && pendingPageId && userPages.value.length) {
      const match = userPages.value.find((p) => String(p.id) === String(pendingPageId))
      if (match) {
        await selectPage(match)
        successMessage.value = `¡Listo! Detectamos tu página pendiente y la vinculamos automáticamente.`
        return
      }
    }

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

    const { message, integration, page: selectedPage } = await integrationStore.finalizeFacebookPage(businessId, page)
    successMessage.value = message || `Integración finalizada para la página "${page.name}".`
    facebookConnectedIntegration.value = integration || null
    connectedFacebookPage.value = selectedPage || null
    isRelinkingFacebook.value = false
  } catch (err: any) {
    connectionError.value = err?.message || 'Error al finalizar la integración con la página'
  } finally {
    savingPageId.value = null
  }
}

// Paso 2: conectar Instagram
const connectInstagramFlow = async () => {
  if (isConnectingInstagram.value) return
  isConnectingInstagram.value = true
  instagramErrorMessage.value = null
  instagramSuccessMessage.value = null

  try {
    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) throw new Error('No hay negocio seleccionado para conectar Instagram')

    const { message, accounts } = await integrationStore.connectInstagram(businessId)
    // Mostramos todas las cuentas devueltas; en la UI se seccionan en "Sugerido" y "Otras"
    instagramAccounts.value = accounts || []

    instagramSuccessMessage.value = message || '¡Listo! Selecciona tu cuenta de Instagram a vincular.'
  } catch (err: any) {
    instagramErrorMessage.value = err?.message || 'Error al conectar Instagram'
  } finally {
    isConnectingInstagram.value = false
  }
}

// Vincular una cuenta específica de Instagram (business)
const selectInstagramAccount = async (account: IInstagramLinkedAccount) => {
  try {
    instagramErrorMessage.value = null
    instagramSuccessMessage.value = null
    savingInstagramId.value = account.instagramAccountId

    const businessId =
      props.business?._id ||
      props.business?.id ||
      businessStore.currentBusiness?._id ||
      businessStore.currentBusiness?.id
    if (!businessId) throw new Error('No hay negocio seleccionado para finalizar la integración de Instagram')

    const { message, integration, instagram } = await integrationStore.finalizeInstagramAccount(
      businessId,
      account,
    )
    instagramSuccessMessage.value =
      message || `Instagram conectado correctamente: @${account.instagramUsername}`
    // Opcional: podríamos reflejar integración de Instagram si se necesita en la UI
    if (integration) {
      // Nada extra por ahora; el store ya se actualiza internamente
    }
    // Guardar el perfil de Instagram conectado y ocultar el listado
    connectedInstagram.value =
      instagram || {
        id: account.instagramAccountId,
        username: account.instagramUsername,
        profilePictureUrl: account.instagramProfilePictureUrl,
        followersCount: account.followersCount,
      }
    instagramAccounts.value = []
    isRelinkingInstagram.value = false
  } catch (err: any) {
    instagramErrorMessage.value = err?.message || 'Error al vincular la cuenta de Instagram'
  } finally {
    savingInstagramId.value = null
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
            <div class="wizard-layout">
              <!-- Columna de estado de conexión -->
              <ConnectionStatusColumn
                :hasFacebookIntegrationRecord="hasFacebookIntegrationRecord"
                :facebookConnectedIntegration="facebookConnectedIntegration"
                :isFacebookPending="isFacebookPending"
                :igConnected="Boolean(igIsConnectedFromStore || connectedInstagram)"
              />

              <!-- Columna de acciones del Wizard -->
              <div class="wizard-column">
                <FacebookStep
                  :hasFacebookIntegrationRecord="hasFacebookIntegrationRecord"
                  :facebookConnectedIntegration="facebookConnectedIntegration"
                  :userPages="userPages"
                  :isSDKLoading="isSDKLoading"
                  :isConnecting="isConnecting"
                  :connectionError="connectionError"
                  :successMessage="successMessage"
                  :savingPageId="savingPageId"
                  :isRelinkingFacebook="isRelinkingFacebook"
                  :connectedFacebookPage="connectedFacebookPage"
                  :isFacebookPending="isFacebookPending"
                  :sanitizeUrl="sanitizeUrl"
                  :onConnectFacebook="connectFacebook"
                  :onSelectPage="selectPage"
                  :onStartRelinkingFacebook="startRelinkingFacebook"
                />

                <InstagramStep
                  :facebookConnectedIntegration="facebookConnectedIntegration"
                  :igIsConnectedFromStore="igIsConnectedFromStore"
                  :connectedInstagram="connectedInstagram"
                  :isRelinkingInstagram="isRelinkingInstagram"
                  :isConnectingInstagram="isConnectingInstagram"
                  :instagramErrorMessage="instagramErrorMessage"
                  :instagramSuccessMessage="instagramSuccessMessage"
                  :instagramAccounts="instagramAccounts"
                  :suggestedInstagramAccounts="suggestedInstagramAccounts"
                  :otherInstagramAccounts="otherInstagramAccounts"
                  :savingInstagramId="savingInstagramId"
                  :sanitizeUrl="sanitizeUrl"
                  :onConnectInstagramFlow="connectInstagramFlow"
                  :onSelectInstagramAccount="selectInstagramAccount"
                  :onStartRelinkingInstagram="startRelinkingInstagram"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              v-if="allConnected"
              type="button"
              class="btn btn-primary"
              @click="closeWizard"
            >
              <i class="fa-solid fa-circle-check"></i>
              <span>Cerrar — todo fue un éxito</span>
            </button>
            <button
              v-else
              type="button"
              class="btn btn-outline"
              @click="closeWizard"
            >
              Cerrar
            </button>
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

/* Utilidades compartidas dentro del componente (refactor para evitar duplicados) */
.left {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid lighten($BAKANO-DARK, 82%);
}

.placeholder {
  color: lighten($BAKANO-DARK, 24%);
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

/* Accesibilidad: reducir motion si el usuario lo prefiere */
@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
  }

  .modal-content {
    animation: none;
    transform: none;
  }
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
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Modal body heading (Paso 1: Conectar Facebook) */
.modal-body h4 {
  color: $BAKANO-DARK;
  margin: 0.25rem 0 0.5rem;
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

  &-ig {
    margin-top: 20px;
    border-top: 1px solid #eee9e9;
    padding-top: 20px;
  }
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
  .avatar {
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

/* Resumen conectado */
.connected-summary .summary-box {
  margin-top: 0.5rem;
  border: 1px solid lighten($BAKANO-DARK, 86%);
  border-radius: 14px;
  padding: 0.75rem;
  background: $BAKANO-LIGHT;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

/* Banner de estado de integraciones */
/* Nuevo layout en columnas para el wizard */
.wizard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1rem;
  align-items: start;
}

.status-column {
  border: 1px solid lighten($BAKANO-DARK, 88%);
  border-radius: 16px;
  background: $BAKANO-LIGHT;
  padding: 0.75rem 0.9rem;
}

.status-column h6 {
  margin: 0 0 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.status-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.status-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 10px;
  padding: 0.5rem 0.6rem;
  border: 1px solid transparent;
}

.status-list li i {
  font-size: 1rem;
}

.status-list li div {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.status-list li div span {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.status-list li div small {
  color: lighten($BAKANO-DARK, 25%);
}

.status-list li.connected {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.status-list li.pending {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.status-list li.disconnected {
  background: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.wizard-column {
  display: grid;
  gap: 1rem;
}

.pages-box .empty-state {
  padding: 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pages-box .empty-state p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
}

/* Responsive: apilar columnas en pantallas pequeñas */
@media (max-width: 720px) {
  .wizard-layout {
    grid-template-columns: 1fr;
  }

  .status-column {
    order: 0;
  }

  .wizard-column {
    order: 1;
  }
}
</style>