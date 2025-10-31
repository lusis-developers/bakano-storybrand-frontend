<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useIntegrationStore } from '@/stores/integration.store'
import { useBusinessStore } from '@/stores/business.store'
import CalendarSelect from '@/components/shared/CalendarSelect.vue'

// Props y eventos del modal
const props = defineProps<{
  modelValue: boolean
  selection?: { day?: string; hour?: string }
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'schedule-post', payload: { text: string; media: File[]; time: string; selection?: { day?: string; hour?: string } }): void
}>()

// Estado principal
const postText = ref('')
const uploadedMedia = ref<File[]>([])
const scheduleTime = ref('')
const showCalendarSelect = ref(false)

// Estado UI
const fileInput = ref<HTMLInputElement | null>(null)
const menuOpen = ref(false)

// Helpers
function close() { emit('update:modelValue', false) }
function onAddImage() { fileInput.value?.click() }
function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (files.length) uploadedMedia.value = [...uploadedMedia.value, ...files]
  input.value = ''
}
function handleSchedule() {
  emit('schedule-post', {
    text: postText.value,
    media: uploadedMedia.value,
    time: scheduleTime.value,
    selection: props.selection,
  })
  close()
}

function openCalendarSelect() {
  console.log('[CreatePost] 📅 Abrir selector de fecha/hora. scheduleTime actual:', scheduleTime.value)
  showCalendarSelect.value = true
}

function onCalendarConfirm(val: string) {
  console.log('[CreatePost] ✅ Fecha/Hora confirmada desde CalendarSelect:', val)
  scheduleTime.value = val
}

// Preview helpers
function makeObjectURL(file: File) {
  // Usa la API del navegador de forma explícita para evitar errores de tipado en TS
  return window.URL.createObjectURL(file)
}
const firstImageUrl = computed(() => uploadedMedia.value.length ? makeObjectURL(uploadedMedia.value[0]) : '')

// Avatar de la integración (Facebook/Instagram)
const integrations = useIntegrationStore()
const businessStore = useBusinessStore()

// Preferencia de plataforma para el avatar/preview (por defecto Facebook)
const preferPlatform = ref<'facebook' | 'instagram'>('facebook')

// Asegurar que las integraciones estén cargadas cuando se abre el modal
async function ensureIntegrationsReady() {
  try {
    const hasAny = !!integrations.facebookIntegration || !!integrations.instagramIntegration
    const businessId =
      (businessStore.currentBusiness as any)?.id ||
      (businessStore.currentBusiness as any)?._id
    console.log('[CreatePost] ensureIntegrationsReady -> hasAny:', hasAny, 'businessId:', businessId)
    // Cargamos siempre al abrir el modal para evitar datos stale
    if (businessId) {
      console.log('[CreatePost] 🔄 Cargando integraciones desde store...', {
        businessId,
        prevCount: integrations.integrationsCount,
        prevListTypes: (integrations.integrations || []).map((i: any) => i.type),
      })
      const res = await integrations.loadIntegrations(businessId)
      console.log('[CreatePost] ✅ Integraciones cargadas', {
        count: res?.count,
        types: (res?.data || []).map((i: any) => i.type),
        pictures: (res?.data || []).map((i: any) => ({
          type: i.type,
          rootPicture: i?.picture,
          mdPicture: i?.metadata?.picture,
          pagePictureUrl: i?.metadata?.pagePictureUrl,
          profilePictureUrl: i?.metadata?.profilePictureUrl,
          instagramProfilePictureUrl: i?.metadata?.instagramProfilePictureUrl,
        })),
      })
    } else {
      console.warn('[CreatePost] ⚠️ No hay businessId disponible aún. Se intentará nuevamente cuando el negocio esté listo.')
    }
  } catch (e) {
    console.warn('[CreatePost] No fue posible cargar integraciones:', e)
  }
}

onMounted(() => {
  ensureIntegrationsReady()
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) ensureIntegrationsReady()
  },
)
// Volver a intentar cargar cuando el negocio cambie o se inicialice
watch(
  () => (businessStore.currentBusiness as any)?.id || (businessStore.currentBusiness as any)?._id,
  (businessId) => {
    console.log('[CreatePost] businessId changed ->', businessId)
    if (props.modelValue && businessId) ensureIntegrationsReady()
  },
)
function sanitizeUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined
  const trimmed = url.trim().replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '')
  // Filtrar valores obvios inválidos
  const invalids = ['null', 'undefined', 'about:blank', 'data:', 'javascript:']
  if (!trimmed || invalids.some((inv) => trimmed.toLowerCase().startsWith(inv))) return undefined
  return trimmed || undefined
}

function pickFirstString(...candidates: Array<string | undefined | null>) {
  for (const c of candidates) {
    const s = sanitizeUrl(c)
    if (typeof s === 'string' && s.length > 0) return s
  }
  return ''
}
function buildPictureCandidates(md: any, root: any): Array<string | undefined> {
  return [
    md?.picture?.normal,
    md?.picture?.size150,
    md?.picture?.large,
    md?.picture?.small,
    md?.picture?.url,
    md?.picture?.data?.url, // algunos backends pueden incluir data.url
    md?.pagePictureUrl,
    md?.profilePictureUrl,
    md?.instagramProfilePictureUrl, // Instagram Business
    md?.instagram?.profilePictureUrl, // posible estructura anidada
    root?.picture?.normal,
    root?.picture?.size150,
    root?.picture?.large,
    root?.picture?.small,
    root?.picture?.url,
    md?.pictureUrl,
  ]
}

const activeIntegration = computed(() => {
  const fb = integrations.facebookIntegration as any
  const ig = integrations.instagramIntegration as any
  const preferred = preferPlatform.value === 'facebook' ? fb : ig
  const secondary = preferPlatform.value === 'facebook' ? ig : fb

  // Preferimos la plataforma seleccionada si está conectada
  if (preferred?.isConnected) return preferred
  // Si no, usamos la otra si está conectada
  if (secondary?.isConnected) return secondary

  // Si ninguna está conectada, elegimos la que tenga foto disponible
  const preferredHasPic = !!pickFirstString(...buildPictureCandidates(preferred?.metadata || {}, preferred))
  const secondaryHasPic = !!pickFirstString(...buildPictureCandidates(secondary?.metadata || {}, secondary))
  if (preferred && preferredHasPic) return preferred
  if (secondary && secondaryHasPic) return secondary

  // Finalmente devolvemos alguna si existe
  return preferred || secondary || null
})

const avatarUrl = computed(() => {
  const ai = activeIntegration.value as any
  const md = ai?.metadata || {}
  const candidates = buildPictureCandidates(md, ai)
  const selected = pickFirstString(...candidates)
  console.log('[CreatePost] avatar candidates:', candidates, '\nselected:', selected, '\nplatform:', ai?.type, 'connected:', ai?.isConnected)
  return selected
})

// Log cuando la integración activa cambie
watch(
  activeIntegration,
  (ai) => {
    console.log('[CreatePost] activeIntegration changed ->', {
      type: (ai as any)?.type,
      isConnected: (ai as any)?.isConnected,
      metadata: (ai as any)?.metadata,
    })
  },
  { deep: true }
)

console.log('[CreatePost] avatarUrl initial:', avatarUrl.value)

// Nombre visible (página de Facebook o username de Instagram)
const displayName = computed(() => {
  const fb = integrations.facebookIntegration as any
  const ig = integrations.instagramIntegration as any
  if (fb?.isConnected) {
    const md = fb?.metadata || {}
    return md?.pageName || md?.name || fb?.name || 'Facebook Page'
  }
  if (ig?.isConnected) {
    const md = ig?.metadata || {}
    return md?.instagramUsername || md?.username || ig?.name || 'Instagram Account'
  }
  return 'Bakano'
})

// Imagen de página como fallback de preview si no hay medio subido
const pageImageUrl = computed(() => {
  const ai = activeIntegration.value as any
  const md = ai?.metadata || {}
  const selected = pickFirstString(...buildPictureCandidates(md, ai))
  console.log('[CreatePost] pageImageUrl candidates:', buildPictureCandidates(md, ai), '\nselected:', selected)
  return selected
})

// Logs reactivos para ayudar a depurar en tiempo real
watch(
  () => integrations.integrations,
  (list) => {
    console.log('[CreatePost] Integrations list updated:', list)
  },
  { deep: true }
)

watch(avatarUrl, (val) => {
  console.log('[CreatePost] avatarUrl changed ->', val)
  if (!val) {
    const ai = activeIntegration.value as any
    console.warn('[CreatePost] ⚠️ avatarUrl está vacío. Revisar metadata:', {
      type: ai?.type,
      isConnected: ai?.isConnected,
      metadata: ai?.metadata,
    })
  }
})

watch(pageImageUrl, (val) => {
  console.log('[CreatePost] pageImageUrl changed ->', val)
})
</script>

<template>
  <div v-if="props.modelValue" class="post-modal-root">
    <!-- Overlay -->
    <div class="post-modal-backdrop" @click="close"></div>

    <!-- Modal container -->
    <div class="post-modal-container">
      <!-- Header -->
      <div class="post-modal-header">
        <div class="post-modal-header-left">
          <h3>Crear publicación</h3>
          <div v-if="props.selection?.day || props.selection?.hour" class="post-modal-chips">
            <span v-if="props.selection?.day" class="chip">{{ props.selection?.day }}</span>
            <span v-if="props.selection?.hour" class="chip">{{ props.selection?.hour }}</span>
          </div>
        </div>
        <button class="icon-btn" @click="close">✕</button>
      </div>

      <!-- Body: dos columnas -->
      <div class="post-modal-body">
        <!-- Columna izquierda (Editor) -->
        <div class="post-modal-col">
          <!-- Social tabs -->
          <div class="social-tabs">
            <div class="social-tabs-left">
              <span class="platform-pill">
                <span class="platform-icon">f</span>
                <span class="platform-label">POST</span>
              </span>
            </div>
            <button class="icon-btn small">+</button>
          </div>

          <!-- Text area -->
          <div class="field">
            <label class="field-label">Contenido</label>
            <textarea v-model="postText" class="textarea"></textarea>
            <div class="char-counter">{{ (postText?.length ?? 0) }} / 16192</div>
          </div>

          <!-- Media uploader -->
          <div class="media-uploader">
            <div class="toolbar">
              <button class="toolbar-btn" @click="menuOpen = !menuOpen">Imagen/Video</button>
              <button class="toolbar-btn">Emoji</button>
              <button class="toolbar-btn">Ubicación</button>
              <button class="toolbar-btn">Más</button>
            </div>
            <div v-if="menuOpen" class="dropdown">
              <button class="dropdown-item" @click="onAddImage">Añadir imagen</button>
              <button class="dropdown-item">Añadir video</button>
              <button class="dropdown-item">Google Drive</button>
              <button class="dropdown-item">Canva</button>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="onFilesSelected" />
          </div>

          <!-- Thumbnails -->
          <div v-if="uploadedMedia.length" class="thumb-grid">
            <div v-for="(file, idx) in uploadedMedia" :key="idx" class="thumb">
              <img :src="makeObjectURL(file)" class="thumb-img" :alt="`media-${idx}`" />
              <div class="thumb-badge">#{{ idx + 1 }}</div>
            </div>
          </div>

          <!-- Scheduler -->
          <div class="scheduler">
            <button class="btn" @click="close">Cancelar</button>
            <div class="scheduler-actions">
              <button class="btn" @click="openCalendarSelect">Seleccionar fecha y hora</button>
              <span v-if="scheduleTime" class="schedule-info">{{ scheduleTime }}</span>
              <button class="btn btn-primary" @click="handleSchedule">Programar</button>
            </div>
          </div>
        </div>

        <!-- Columna derecha (Vista previa) -->
        <div class="post-modal-col">
          <div class="preview-card">
            <div class="preview-header">
              <div class="avatar">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Foto de perfil" class="avatar-img" />
              </div>
              <div class="preview-title">
                <span class="name">{{ displayName }}</span>
                <span class="time">Just now</span>
              </div>
            </div>
            <div class="preview-body">{{ postText || 'Tu texto aparecerá aquí...' }}</div>
            <img v-if="firstImageUrl" :src="firstImageUrl" class="preview-img" alt="preview" />
            <div class="preview-actions">
              <button class="action"><i class="fa-regular fa-thumbs-up"></i> Like</button>
              <button class="action"><i class="fa-regular fa-comment"></i> Comment</button>
              <button class="action"><i class="fa-solid fa-share"></i> Share</button>
            </div>
            <p class="preview-note">Las previsualizaciones son una aproximación...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <CalendarSelect v-model="showCalendarSelect" :value="scheduleTime" @confirm="onCalendarConfirm" />
</template>

<style scoped lang="scss">
// Fallback de estilos para que el modal sea visible sin Tailwind
.post-modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.post-modal-container {
  position: relative;
  width: 95%;
  max-width: 1200px;
  background: $white;
  border-radius: 16px;
  border: 1px solid $text-light;
  box-shadow: 0 12px 32px $overlay-purple;
}

.post-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $text-light;
}

.post-modal-header h3 {
  margin: 0;
  color: $BAKANO-DARK;
}

.post-modal-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-modal-chips {
  display: flex;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $BAKANO-LIGHT;
  color: $BAKANO-DARK;
  border: 1px solid $text-light;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
}

.icon-btn {
  border: none;
  background: none;
  color: $BAKANO-PURPLE;
  cursor: pointer;
  font-size: 18px;
}

.post-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

.post-modal-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .post-modal-body {
    flex-direction: row;
  }

  .post-modal-col {
    flex: 1;
  }
}

// Editor styles
.social-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.social-tabs-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $BAKANO-PURPLE;
  color: $white;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
}

.platform-icon {
  font-weight: 700;
}

.platform-label {
  font-weight: 600;
}

.icon-btn.small {
  border: 1px solid $text-light;
  border-radius: 8px;
  padding: 6px 10px;
  color: $BAKANO-PURPLE;
  background: $white;
  cursor: pointer;
}

.icon-btn.small:hover {
  background: $BAKANO-LIGHT;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: $BAKANO-DARK;
}

.textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 10px 12px;
  color: $BAKANO-DARK;
  outline: none;
  background: $white;
}

.textarea:focus {
  border-color: $BAKANO-PURPLE;
}

.char-counter {
  font-size: 12px;
  color: $text-light;
  text-align: right;
}

.media-uploader {
  margin-top: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  padding: 8px 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: $BAKANO-LIGHT;
}

.dropdown {
  margin-top: 8px;
  width: 220px;
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  box-shadow: 0 8px 20px $overlay-purple;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: $white;
  color: $BAKANO-DARK;
  border: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background: $BAKANO-LIGHT;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.thumb {
  position: relative;
  border: 1px solid $text-light;
  border-radius: 10px;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 96px;
  object-fit: cover;
}

.thumb-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: $white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
}

.scheduler {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scheduler-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input {
  padding: 8px 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid $text-light;
  background: $white;
  color: $BAKANO-PURPLE;
}

.btn-primary {
  background: $BAKANO-DARK;
  color: $white;
  border-color: $BAKANO-DARK;
}

.preview-card {
  width: 100%;
  border: 1px solid $text-light;
  border-radius: 12px;
  background: $white;
  box-shadow: 0 8px 20px $overlay-purple;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $BAKANO-LIGHT;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-title {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: $BAKANO-DARK;
}

.time {
  font-size: 12px;
  color: $BAKANO-DARK;
}

.preview-body {
  padding: 0 12px 12px;
  color: $BAKANO-DARK;
  white-space: pre-wrap;
}

.preview-img {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
}

.preview-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 12px;
  border-top: 1px solid $text-light;
  color: $BAKANO-DARK;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
}

.action:hover {
  color: $BAKANO-PURPLE;
}

.preview-note {
  margin: 6px 12px 10px;
  font-size: 12px;
  color: $BAKANO-DARK;
}
</style>