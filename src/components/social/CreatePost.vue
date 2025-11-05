<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useIntegrationStore } from '@/stores/integration.store'
import { useBusinessStore } from '@/stores/business.store'
import CalendarSelect from '@/components/shared/CalendarSelect.vue'
import { useFacebookPublishStore } from '@/stores/social/facebookPublish.store'
import { useToast } from '@/composables/useToast'

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
const facebookPublishStore = useFacebookPublishStore()
const { triggerToast } = useToast()
const publishing = computed(() => facebookPublishStore.publishing)

// Estado UI
const fileInput = ref<HTMLInputElement | null>(null)
const videoFileInput = ref<HTMLInputElement | null>(null)
const textAreaRef = ref<HTMLTextAreaElement | null>(null)
const showEmojiPicker = ref(false)
const showLocationPicker = ref(false)
const postLocation = ref('')
const menuOpen = ref(false)

// Helpers
function close() { emit('update:modelValue', false) }
function onAddImage() { fileInput.value?.click() }
function onAddVideo() { videoFileInput.value?.click() }
function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (files.length) uploadedMedia.value = [...uploadedMedia.value, ...files]
  input.value = ''
}
function onVideosSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  const videos = files.filter((f) => (f.type || '').startsWith('video/'))
  if (videos.length) uploadedMedia.value = [...uploadedMedia.value, ...videos]
  input.value = ''
}

function toggleEmojiPicker() { showEmojiPicker.value = !showEmojiPicker.value }
function toggleLocationPicker() { showLocationPicker.value = !showLocationPicker.value }
function applyLocation() { showLocationPicker.value = false }
function insertEmoji(emoji: string) {
  const el = textAreaRef.value
  if (!el) {
    postText.value += emoji
    return
  }
  const start = el.selectionStart ?? postText.value.length
  const end = el.selectionEnd ?? start
  const before = postText.value.slice(0, start)
  const after = postText.value.slice(end)
  postText.value = before + emoji + after
  requestAnimationFrame(() => {
    el.focus()
    const pos = start + emoji.length
    el.setSelectionRange(pos, pos)
  })
}
// Programación interna: usa el mismo store de Facebook y envía scheduled_publish_time
const isScheduling = ref(false)

function toUnixSeconds(iso: string): number {
  const dt = new Date(iso)
  return Math.floor(dt.getTime() / 1000)
}

async function scheduleNow() {
  isScheduling.value = true
  const businessId = getBusinessId()
  if (!businessId) {
    triggerToast('No hay negocio seleccionado. Selecciona un negocio para programar.', 'error')
    isScheduling.value = false
    return
  }
  const message = (postText.value || '').trim()
  if (!message) {
    triggerToast('Agrega un mensaje antes de programar.', 'info')
    isScheduling.value = false
    return
  }
  if (!scheduleTime.value) {
    triggerToast('Selecciona fecha y hora para programar.', 'info')
    isScheduling.value = false
    return
  }
  const when = new Date(scheduleTime.value)
  const now = new Date()
  if (isNaN(when.getTime())) {
    triggerToast('La fecha/hora seleccionada no es válida.', 'error')
    isScheduling.value = false
    return
  }
  if (when.getTime() <= now.getTime()) {
    triggerToast('No puedes programar en el pasado. Selecciona una fecha y hora futura.', 'error')
    isScheduling.value = false
    return
  }
  const scheduled_publish_time = toUnixSeconds(scheduleTime.value)
  const link = extractFirstUrl(postText.value)
  try {
    const res = await facebookPublishStore.publishTextPost(businessId, {
      message,
      link,
      published: false,
      scheduled_publish_time,
    })
    const okMsg = res?.message || 'Publicación programada correctamente en Facebook'
    const postId = res?.data?.id
    triggerToast(postId ? `${okMsg} · ID: ${postId}` : okMsg, 'success')
    close()
  } catch (e: any) {
    const msg = e?.message || 'Error al programar el post'
    triggerToast(msg, 'error')
  } finally {
    isScheduling.value = false
  }
}

function getBusinessId(): string | null {
  const cb = businessStore.currentBusiness as any
  return cb?.id || cb?._id || null
}

function extractFirstUrl(text?: string): string | undefined {
  if (!text) return undefined
  const match = text.match(/\bhttps?:\/\/\S+/i)
  return sanitizeUrl(match ? match[0] : undefined)
}

async function publishNow() {
  const businessId = getBusinessId()
  if (!businessId) {
    triggerToast('No hay negocio seleccionado. Selecciona un negocio para publicar.', 'error')
    return
  }
  const message = (postText.value || '').trim()
  const link = extractFirstUrl(postText.value)
  if (!message) {
    triggerToast('Agrega un mensaje antes de publicar.', 'info')
    return
  }
  try {
    const res = await facebookPublishStore.publishTextPost(businessId, {
      message,
      link,
      published: true,
    })
    const okMsg = res?.message || 'Publicado correctamente en Facebook'
    const postId = res?.data?.id
    triggerToast(postId ? `${okMsg} · ID: ${postId}` : okMsg, 'success')
    close()
  } catch (e: any) {
    const msg = e?.message || 'Error al publicar el post'
    triggerToast(msg, 'error')
  }
}

function openCalendarSelect() {
  console.log('[CreatePost] 📅 Abrir selector de fecha/hora. scheduleTime actual:', scheduleTime.value)
  // Si no hay horario aún, intentar derivarlo del slot clicado
  if (!scheduleTime.value) {
    const derived = deriveScheduleTimeFromSelection(props.selection)
    if (derived) {
      console.log('[CreatePost] ⏱️ Derivado al abrir selector:', derived)
      scheduleTime.value = derived
    }
  }
  showCalendarSelect.value = true
}

function onCalendarConfirm(val: string) {
  console.log('[CreatePost] ✅ Fecha/Hora confirmada desde CalendarSelect:', val)
  scheduleTime.value = val
}

// ====== Formato amigable para mostrar la fecha/hora programada ======
function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }
const daysEs = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const monthsShortEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function formatScheduleTime(iso?: string): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) - 1
  const d = parseInt(m[3], 10)
  const hh = parseInt(m[4], 10)
  const mm = parseInt(m[5], 10)
  const dt = new Date(y, mo, d, hh, mm)
  const weekday = capitalize(daysEs[dt.getDay()])
  const monShort = monthsShortEs[mo]
  const dd = String(d)
  const hhStr = String(hh).padStart(2, '0')
  const mmStr = String(mm).padStart(2, '0')
  return `${weekday} ${dd} ${monShort} ${y} · ${hhStr}:${mmStr}`
}
const formattedSchedule = computed(() => formatScheduleTime(scheduleTime.value))

// ====== Helpers para autoselección desde el calendario (día/hora) ======
// Soporta formatos en español como "31 oct 2025" y horas como "14:30" o "2 pm"
const monthIndexMap: Record<string, number> = {
  'ene': 0, 'enero': 0,
  'feb': 1, 'febrero': 1,
  'mar': 2, 'marzo': 2,
  'abr': 3, 'abril': 3,
  'may': 4, 'mayo': 4,
  'jun': 5, 'junio': 5,
  'jul': 6, 'julio': 6,
  'ago': 7, 'agosto': 7,
  'sep': 8, 'sept': 8, 'septiembre': 8,
  'oct': 9, 'octubre': 9,
  'nov': 10, 'noviembre': 10,
  'dic': 11, 'diciembre': 11,
}

function toYmdFromDate(dt: Date): string {
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseDayToYmd(dayStr?: string | null): string {
  if (!dayStr) return ''
  const sRaw = dayStr.trim()
  const s = sRaw.toLowerCase()
  // ISO directo
  const mIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`

  // Aceptar rangos: "27 oct 2025 - 2 nov 2025" -> tomar el primer segmento
  const leftPart = s.split(/\s*[-–]\s*/)[0] || s

  // Normalizar y quitar acentos/puntuación sobrante
  const normalized = leftPart
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[,.;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Soportar frases como "lunes 31 de octubre de 2025", "31 oct", "31 de oct 2025"
  const mEs = /(\d{1,2})\s*(?:de\s*)?([a-z]+)(?:\s*(?:de\s*)?(\d{4}))?/i.exec(normalized)
  if (mEs) {
    const day = parseInt(mEs[1], 10)
    const monKey = mEs[2].toLowerCase()
    const year = mEs[3] ? parseInt(mEs[3], 10) : new Date().getFullYear()
    const monIdx = monthIndexMap[monKey] ?? monthIndexMap[monKey.slice(0, 3)]
    if (typeof monIdx === 'number' && !isNaN(day)) {
      const dt = new Date(year, monIdx, day)
      return toYmdFromDate(dt)
    }
  }

  // Intentar parseo libre del navegador
  const dt = new Date(sRaw)
  if (!isNaN(dt.getTime())) return toYmdFromDate(dt)
  return ''
}

function parseHourToHm(hourStr?: string | null): string {
  if (!hourStr) return ''
  const s = hourStr.trim().toLowerCase()
  const m = /^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?$/.exec(s)
  if (m) {
    let hh = parseInt(m[1], 10)
    let mm = m[2] ? parseInt(m[2], 10) : 0
    const ap = m[3]
    if (ap) {
      if (ap === 'pm' && hh < 12) hh += 12
      if (ap === 'am' && hh === 12) hh = 0
    }
    hh = Math.max(0, Math.min(23, hh))
    // Redondeo a cuartos de hora
    const rounded = Math.round(mm / 15) * 15
    const addHour = Math.floor(rounded / 60)
    hh = (hh + addHour) % 24
    const mmStr = String(rounded % 60).padStart(2, '0')
    return `${String(hh).padStart(2, '0')}:${mmStr}`
  }
  // Intentar HH:MM limpio
  const mIso = /^(\d{2}):(\d{2})$/.exec(s)
  if (mIso) {
    const hh = Math.max(0, Math.min(23, parseInt(mIso[1], 10)))
    const mm = Math.max(0, Math.min(59, parseInt(mIso[2], 10)))
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
  return ''
}

function deriveScheduleTimeFromSelection(sel?: { day?: string; hour?: string } | null): string {
  if (!sel) return ''
  const ymd = parseDayToYmd(sel.day)
  const hm = parseHourToHm(sel.hour)
  if (ymd && hm) return `${ymd}T${hm}`
  if (ymd) {
    // Hora aproximada siguiente media hora
    const now = new Date()
    const minutes = now.getMinutes()
    const rounded = minutes <= 30 ? 30 : 0
    const addHour = minutes > 30 ? 1 : 0
    now.setHours(now.getHours() + addHour)
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(rounded).padStart(2, '0')
    return `${ymd}T${hh}:${min}`
  }
  if (hm) {
    const now = new Date()
    const ymdNow = toYmdFromDate(now)
    return `${ymdNow}T${hm}`
  }
  return ''
}

// Preview helpers
function makeObjectURL(file: File) {
  // Usa la API del navegador de forma explícita para evitar errores de tipado en TS
  return window.URL.createObjectURL(file)
}
const firstImageUrl = computed(() => {
  const img = uploadedMedia.value.find((f) => (f.type || '').startsWith('image/'))
  return img ? makeObjectURL(img) : ''
})
const firstVideoUrl = computed(() => {
  const vid = uploadedMedia.value.find((f) => (f.type || '').startsWith('video/'))
  return vid ? makeObjectURL(vid) : ''
})

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
    // Cargamos siempre al abrir el modal para evitar datos stale
    if (businessId) {
      await integrations.loadIntegrations(businessId)
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
    if (open) {
      ensureIntegrationsReady()
      const derived = deriveScheduleTimeFromSelection(props.selection)
      if (derived) {
        scheduleTime.value = derived
        // Abrir el selector para confirmación inmediata
        showCalendarSelect.value = true
      }
    }
  },
)
// Volver a intentar cargar cuando el negocio cambie o se inicialice
watch(
  () => (businessStore.currentBusiness as any)?.id || (businessStore.currentBusiness as any)?._id,
  (businessId) => {
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

// React a cambios del slot seleccionado para autocompletar fecha/hora
watch(
  () => props.selection,
  (sel) => {
    console.log('[CreatePost] 🔁 props.selection changed:', sel)
    const derived = deriveScheduleTimeFromSelection(sel)
    if (derived) {
      scheduleTime.value = derived
    }
  },
  { deep: true }
)
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
            <span v-if="postLocation" class="chip"><i class="fa-solid fa-location-dot"></i> {{ postLocation }}</span>
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
            <textarea ref="textAreaRef" v-model="postText" class="textarea"></textarea>
            <div class="char-counter">{{ (postText?.length ?? 0) }} / 16192</div>
          </div>

          <!-- Media uploader -->
          <div class="media-uploader">
            <div class="toolbar">
              <button class="toolbar-btn" @click="menuOpen = !menuOpen">Imagen/Video</button>
              <button class="toolbar-btn" @click="toggleEmojiPicker">Emoji</button>
              <button class="toolbar-btn" @click="toggleLocationPicker">Ubicación</button>
            </div>
            <div v-if="menuOpen" class="dropdown">
              <button class="dropdown-item" @click="onAddImage">Añadir imagen</button>
              <button class="dropdown-item" @click="onAddVideo">Añadir video</button>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="onFilesSelected" />
            <input ref="videoFileInput" type="file" accept="video/*" class="sr-only" @change="onVideosSelected" />

            <!-- Panels debajo del toolbar -->
            <div class="toolbar-panels">
              <!-- Emoji picker simple -->
              <div v-if="showEmojiPicker" class="emoji-panel">
                <div class="emoji-grid">
                  <button
                    v-for="e in ['😀', '😂', '😍', '🔥', '🎉', '👍', '🙏', '💡', '📍', '📷', '🎬', '🏷️', '🌟', '💼']"
                    :key="e"
                    class="emoji-btn"
                    @click="insertEmoji(e)"
                    :aria-label="`Insertar ${e}`"
                  >{{ e }}</button>
                </div>
              </div>

              <!-- Location picker simple -->
              <div v-if="showLocationPicker" class="location-panel">
                <label class="field-label" for="post-location">Ubicación</label>
                <input id="post-location" v-model="postLocation" class="input" placeholder="Ej: Bogotá, Colombia" />
                <div class="panel-actions">
                  <button class="btn" @click="applyLocation">Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="uploadedMedia.length" class="thumb-grid">
            <div v-for="(file, idx) in uploadedMedia" :key="idx" class="thumb">
              <template v-if="(file.type || '').startsWith('image/')">
                <img :src="makeObjectURL(file)" class="thumb-img" :alt="`media-${idx}`" />
              </template>
              <template v-else-if="(file.type || '').startsWith('video/')">
                <video :src="makeObjectURL(file)" class="thumb-video" muted controls></video>
              </template>
              <div class="thumb-badge">
                <template v-if="(file.type || '').startsWith('video/')"><i class="fa-solid fa-video"></i></template>
                <template v-else>#{{ idx + 1 }}</template>
              </div>
            </div>
          </div>

          <!-- Scheduler -->
          <div class="scheduler">
            <button class="btn" :disabled="publishing" @click="close">Cancelar</button>
            <div class="scheduler-actions">
              <button class="btn" :disabled="publishing" @click="openCalendarSelect">Seleccionar fecha y hora</button>
              <span v-if="scheduleTime" class="schedule-info"><i class="fa-solid fa-calendar-days"></i> {{ formattedSchedule }}</span>
              <button class="btn btn-primary" :disabled="publishing" @click="publishNow" :aria-busy="publishing ? 'true' : 'false'">
                <span v-if="publishing" class="spinner" aria-hidden="true"></span>
                <span>{{ publishing ? 'Publicando…' : 'Publicar ahora' }}</span>
              </button>
              <button class="btn btn-primary" :disabled="publishing" @click="scheduleNow">Programar</button>
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
            <video v-if="firstVideoUrl" :src="firstVideoUrl" class="preview-video" controls></video>
            <img v-else-if="firstImageUrl" :src="firstImageUrl" class="preview-img" alt="preview" />
            <div class="preview-actions">
              <button class="action"><i class="fa-regular fa-thumbs-up"></i> Like</button>
              <button class="action"><i class="fa-regular fa-comment"></i> Comment</button>
              <button class="action"><i class="fa-solid fa-share"></i> Share</button>
            </div>
            <p class="preview-note">Las previsualizaciones son una aproximación...</p>
            <div v-if="postLocation" class="preview-location"><i class="fa-solid fa-location-dot"></i> {{ postLocation }}</div>
          </div>
        </div>
      </div>
      <!-- Overlay de publicación en progreso -->
      <div v-if="publishing" class="publishing-overlay" aria-busy="true" role="alert" aria-live="assertive">
        <div class="publishing-overlay-content">
          <span class="spinner lg" aria-hidden="true"></span>
          <div class="publishing-text">{{ isScheduling ? 'Programando…' : 'Publicando…' }}</div>
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

.thumb-video {
  width: 100%;
  height: 96px;
  object-fit: cover;
  background: #000;
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

.btn:disabled,
.btn[disabled],
.btn-primary:disabled,
.btn-primary[disabled] {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Inline spinner for loading state */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Overlay explícito de publicación */
.publishing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.publishing-overlay-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid $text-light;
  background: $white;
  color: $BAKANO-DARK;
  box-shadow: 0 8px 20px $overlay-purple;
}

.spinner.lg {
  width: 24px;
  height: 24px;
  border-width: 3px;
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: $BAKANO-PURPLE;
}

.publishing-text {
  font-weight: 600;
}

.schedule-info {
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

.preview-video {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  background: #000;
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

.preview-location {
  margin: 0 12px 12px;
  font-size: 13px;
  color: $BAKANO-DARK;
}

.toolbar-panels {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emoji-panel {
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  padding: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.emoji-btn {
  border: 1px solid $text-light;
  border-radius: 8px;
  background: $white;
  cursor: pointer;
  padding: 6px 0;
  font-size: 18px;
}

.emoji-btn:hover {
  background: $BAKANO-LIGHT;
}

.location-panel {
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  padding: 8px;
}

.panel-actions {
  margin-top: 8px;
}
</style>