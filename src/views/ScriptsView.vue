<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScripts } from '../composables/useScripts'
import { useContent } from '../composables/useContent'
import { useBusiness } from '../composables/useBusiness'
import { useToast } from '../composables/useToast'
import { useConfirmationDialog } from '../composables/useConfirmationDialog'
import CustomSelect from '../components/shared/CustomSelect.vue'
import GenerationProgress from '../components/shared/GenerationProgress.vue'
import type {
  IScript,
  IScriptFilters,
  IGenerateScriptRequest
} from '../types/content.types'

// Composables
const route = useRoute()
const router = useRouter()
const {
  scripts,
  filteredScripts,
  isLoading,
  isGenerating,
  error,
  scriptStats,
  hasScripts,
  loadScripts,
  generateScript,
  toggleScriptCompletion,
  deleteScript,
  setFilters,
  clearFilters,
  clearError
} = useScripts()

const { currentContent, fetchContentByBusiness, setCurrentContent } = useContent()
const { fetchBusinessByContentId } = useBusiness()
const { triggerToast } = useToast()
const { reveal } = useConfirmationDialog()

// Estado local
const contentId = ref<string>('')
const showGenerateModal = ref(false)
const showFiltersPanel = ref(false)
const selectedScript = ref<IScript | null>(null)
const showScriptModal = ref(false)
const isInitializing = ref(true)

// Filtros
const activeFilters = ref<IScriptFilters>({})
const filterType = ref<'all' | 'content' | 'ad'>('all')
const filterPlatform = ref<'all' | 'youtube' | 'instagram' | 'tiktok' | 'social' | 'email' | 'website'>('all')
const filterCompleted = ref<'all' | 'completed' | 'pending'>('all')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Datos para generar script
const newScript = ref<IGenerateScriptRequest>({
  scriptType: 'content',
  platform: undefined,
  selectedSoundbite: undefined,
  selectedTagline: undefined,
  customText: undefined
})

// Computadas
const pageTitle = computed(() => {
  if (currentContent.value && currentContent.value.questions) {
    return `Scripts - ${currentContent.value.questions.companyName}`
  }
  return 'Scripts'
})

const hasActiveFilters = computed(() => {
  return filterType.value !== 'all' ||
    filterPlatform.value !== 'all' ||
    filterCompleted.value !== 'all' ||
    filterDateFrom.value !== '' ||
    filterDateTo.value !== ''
})

const canGenerateNewScript = computed(() => {
  return currentContent.value &&
    currentContent.value.soundbites &&
    currentContent.value.soundbites.length > 0 &&
    currentContent.value.taglines &&
    currentContent.value.taglines.length > 0 &&
    !isGenerating.value
})

const canSubmitScript = computed(() => {
  return newScript.value.scriptType &&
    newScript.value.platform !== undefined &&
    newScript.value.selectedSoundbite &&
    newScript.value.selectedTagline
})

const getValidationMessage = () => {
  if (!newScript.value.scriptType) {
    return 'Por favor selecciona el tipo de script'
  }
  if (newScript.value.platform === undefined) {
    return 'Por favor selecciona una plataforma'
  }
  if (!newScript.value.selectedSoundbite) {
    return 'Por favor selecciona un soundbite'
  }
  if (!newScript.value.selectedTagline) {
    return 'Por favor selecciona un tagline'
  }
  return ''
}

const soundbiteOptions = computed(() => {
  return currentContent.value?.soundbites?.map(sb => ({
    value: sb.text,
    label: `${sb.text} (${sb.category})`
  })) || []
})

const taglineOptions = computed(() => {
  return currentContent.value?.taglines?.map(tl => ({
    value: tl.text,
    label: `${tl.text} (${tl.style})`
  })) || []
})

// Options for CustomSelect components
const scriptTypeOptions = [
  { value: 'content', label: 'Contenido' },
  { value: 'ad', label: 'Anuncio' }
]

const platformOptions = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Sitio Web' },
  { value: '', label: 'General' }
]

const filterTypeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'content', label: 'Contenido' },
  { value: 'ad', label: 'Anuncio' }
]

const filterPlatformOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Sitio Web' }
]

const filterCompletedOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Completados' },
  { value: 'pending', label: 'Pendientes' }
]

// Métodos
const initializeView = async () => {
  console.log('Inicializando vista de scripts con ID:', route.params.contentId)

  const routeContentId = route.params.contentId as string
  if (!routeContentId) {
    router.push('/dashboard')
    return
  }

  contentId.value = routeContentId

  try {
    // Obtener el business usando el contentId
    const business = await fetchBusinessByContentId(routeContentId)
    console.log('Business obtenido:', business)

    if (!business) {
      triggerToast('Business not found', 'error')
      return
    }

    console.log('BusinessId:', business._id)

    // Cargar contenido y scripts usando el businessId correcto
    const content = await fetchContentByBusiness(business._id)
    if (content) {
      setCurrentContent(content)
    }
    await loadScripts(routeContentId)
  } catch (err) {
    triggerToast('Error al cargar los datos', 'error')
    console.error('Error initializing scripts view:', err)
  } finally {
    isInitializing.value = false
  }
}

const applyFilters = async () => {
  const filters: IScriptFilters = {}

  if (filterType.value !== 'all') {
    filters.type = filterType.value as 'content' | 'ad'
  }

  if (filterPlatform.value !== 'all') {
    filters.platform = filterPlatform.value as 'youtube' | 'instagram' | 'tiktok' | 'social' | 'email' | 'website'
  }

  if (filterCompleted.value !== 'all') {
    filters.completed = filterCompleted.value === 'completed'
  }

  if (filterDateFrom.value) {
    filters.startDate = filterDateFrom.value
  }

  if (filterDateTo.value) {
    filters.endDate = filterDateTo.value
  }

  activeFilters.value = filters
  setFilters(filters)
  await loadScripts(contentId.value, filters)
}

const clearAllFilters = async () => {
  filterType.value = 'all'
  filterPlatform.value = 'all'
  filterCompleted.value = 'all'
  filterDateFrom.value = ''
  filterDateTo.value = ''
  activeFilters.value = {}
  clearFilters()
  await loadScripts(contentId.value)
}

const openGenerateModal = () => {
  if (!canGenerateNewScript.value) {
    triggerToast('Necesitas generar soundbites y taglines primero', 'info')
    return
  }

  // Resetear formulario
  newScript.value = {
    scriptType: 'content',
    platform: undefined,
    selectedSoundbite: undefined,
    selectedTagline: undefined,
    customText: undefined
  }

  showGenerateModal.value = true
}

const handleGenerateScript = async () => {
  if (!contentId.value || !canSubmitScript.value) {
    const validationMessage = getValidationMessage()
    triggerToast(validationMessage || 'Por favor completa todos los campos requeridos', 'error')
    return
  }

  try {
    const generatedScript = await generateScript(contentId.value, newScript.value)

    if (generatedScript) {
      triggerToast('Script generado exitosamente', 'success')
      showGenerateModal.value = false
    }
  } catch (err) {
    triggerToast('Error al generar script', 'error')
  }
}

const handleToggleCompletion = async (script: IScript, index: number) => {
  const newStatus = !script.completed
  const success = await toggleScriptCompletion(contentId.value, index, newStatus)

  if (success) {
    const statusText = newStatus ? 'completado' : 'pendiente'
    triggerToast(`Script marcado como ${statusText}`, 'success')
  }
}

const handleDeleteScript = async (script: IScript, index: number) => {
  const confirmed = await reveal({
    title: '¿Eliminar Script?',
    message: `¿Estás seguro de que quieres eliminar el script "${script.title}"? Esta acción no se puede deshacer.`
  })

  if (confirmed) {
    const success = await deleteScript(contentId.value, index)

    if (success) {
      triggerToast('Script eliminado exitosamente', 'success')
    }
  }
}

const viewScript = (script: IScript) => {
  selectedScript.value = script
  showScriptModal.value = true
}

const copyScriptContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    triggerToast('Contenido copiado al portapapeles', 'success')
  } catch (err) {
    triggerToast('Error al copiar contenido', 'error')
  }
}

const getScriptTypeLabel = (type: string) => {
  return type === 'content' ? 'Contenido' : 'Anuncio'
}

const getPlatformLabel = (platform?: string) => {
  const labels: Record<string, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    social: 'Redes Sociales',
    email: 'Email',
    website: 'Sitio Web'
  }
  return platform ? labels[platform] || platform : 'General'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatScriptContent = (content: string) => {
  try {
    const parsed = JSON.parse(content)

    // Si es un objeto con estructura de script de video
    if (parsed.visual && parsed.caption && parsed.text) {
      return {
        visual: parsed.visual,
        caption: parsed.caption,
        text: parsed.text,
        isStructured: true
      }
    }

    // Si es otro tipo de objeto JSON
    if (typeof parsed === 'object') {
      return {
        content: JSON.stringify(parsed, null, 2),
        isStructured: false
      }
    }

    return {
      content: content,
      isStructured: false
    }
  } catch {
    // Si no es JSON válido, procesar como markdown
    return {
      content: content,
      isStructured: false,
      isMarkdown: true
    }
  }
}

const parseMarkdownContent = (content: string) => {
  // Dividir el contenido en secciones por títulos principales
  const sections = content.split(/(?=^# )/gm).filter(section => section.trim())

  return sections.map(section => {
    const lines = section.split('\n')
    const title = lines[0]?.replace(/^# /, '') || ''
    const body = lines.slice(1).join('\n')

    return {
      title: title.trim(),
      content: body.trim()
    }
  })
}

const formatMarkdownLine = (line: string) => {
  // Procesar diferentes tipos de líneas markdown
  if (line.startsWith('## ')) {
    return { type: 'subtitle', content: line.replace(/^## /, '') }
  }
  if (line.startsWith('# ')) {
    return { type: 'title', content: line.replace(/^# /, '') }
  }
  if (line.match(/^\[\d+:\d+-\d+:\d+\]/)) {
    return { type: 'timestamp', content: line }
  }
  if (line.startsWith('**') && line.endsWith('**')) {
    return { type: 'instruction', content: line.replace(/\*\*/g, '') }
  }
  if (line.includes('#')) {
    return { type: 'hashtag', content: line }
  }
  return { type: 'text', content: line }
}

const getScriptPreview = (content: string) => {
  const formatted = formatScriptContent(content)

  if (formatted.isStructured && 'text' in formatted) {
    return formatted.text.substring(0, 150) + '...'
  }

  if (formatted.isMarkdown) {
    // Para contenido markdown, extraer el primer texto significativo
    const sections = parseMarkdownContent(content)
    if (sections.length > 0) {
      const firstSection = sections[0]
      const lines = firstSection.content.split('\n').filter(l => l.trim())

      // Buscar la primera línea de texto real (no timestamps, no instrucciones)
      for (const line of lines) {
        const lineType = formatMarkdownLine(line)
        if (lineType.type === 'text' || lineType.type === 'subtitle') {
          const cleanText = lineType.content.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').trim()
          if (cleanText.length > 20) {
            return cleanText.substring(0, 150) + '...'
          }
        }
      }

      // Si no encontramos texto, usar el título de la sección
      if (firstSection.title) {
        return firstSection.title.substring(0, 150) + '...'
      }
    }
  }

  return (formatted.content || content).substring(0, 150) + '...'
}

// Watchers
watch(error, (newError) => {
  if (newError) {
    triggerToast(newError, 'error')
    clearError()
  }
})

// Lifecycle
onMounted(() => {
  initializeView()
})
</script>

<template>
  <div class="scripts-view">
    <div class="scripts-container">
    <!-- Header -->
    <div class="scripts-header">
      <div class="header-content">
        <div class="header-info">
          <button 
            @click="router.back()" 
            class="back-button"
            aria-label="Volver"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="title-section">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p class="page-subtitle" v-if="currentContent">
              Gestiona todos los scripts generados para tu proyecto
            </p>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="showFiltersPanel = !showFiltersPanel"
            class="filter-button"
            :class="{ active: hasActiveFilters }"
          >
            <i class="fas fa-filter"></i>
            Filtros
            <span v-if="hasActiveFilters" class="filter-count">{{ Object.keys(activeFilters).length }}</span>
          </button>
          
          <button 
            @click="openGenerateModal"
            class="generate-button"
            :disabled="!canGenerateNewScript"
          >
            <i class="fas fa-plus"></i>
            Generar Script
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section" v-if="hasScripts">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scriptStats.total }}</div>
            <div class="stat-label">Total Scripts</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scriptStats.completed }}</div>
            <div class="stat-label">Completados</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scriptStats.pending }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon content">
            <i class="fas fa-video"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scriptStats.byType.content }}</div>
            <div class="stat-label">Contenido</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="filters-panel" v-if="showFiltersPanel">
      <div class="filters-content">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Tipo</label>
            <CustomSelect
              v-model="filterType"
              :options="filterTypeOptions"
              placeholder="Seleccionar tipo"
              class="custom-select"
            />
          </div>
          
          <div class="filter-group">
            <label>Plataforma</label>
            <CustomSelect
              v-model="filterPlatform"
              :options="filterPlatformOptions"
              placeholder="Seleccionar plataforma"
              class="custom-select"
            />
          </div>
          
          <div class="filter-group">
            <label>Estado</label>
            <CustomSelect
              v-model="filterCompleted"
              :options="filterCompletedOptions"
              placeholder="Seleccionar estado"
              class="custom-select"
            />
          </div>
          
          <div class="filter-group">
            <label>Desde</label>
            <input 
              type="date" 
              v-model="filterDateFrom"
              class="date-input"
            >
          </div>
          
          <div class="filter-group">
            <label>Hasta</label>
            <input 
              type="date" 
              v-model="filterDateTo"
              class="date-input"
            >
          </div>
        </div>
        
        <div class="filters-actions">
          <button @click="applyFilters" class="apply-filters-button">
            <i class="fas fa-search"></i>
            Aplicar Filtros
          </button>
          
          <button 
            @click="clearAllFilters" 
            class="clear-filters-button"
            v-if="hasActiveFilters"
          >
            <i class="fas fa-times"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-section" v-if="isLoading || isInitializing">
      <div class="loading-spinner"></div>
      <p>Cargando scripts...</p>
    </div>

    <!-- Scripts List -->
    <div class="scripts-section" v-else-if="hasScripts">
      <div class="scripts-grid">
        <div 
          v-for="(script, index) in filteredScripts" 
          :key="index"
          class="script-card"
          :class="{ completed: script.completed }"
        >
          <div class="script-header">
            <div class="script-meta">
              <span class="script-type" :class="script.type">
                {{ getScriptTypeLabel(script.type) }}
              </span>
              <span class="script-platform" v-if="script.platform">
                {{ getPlatformLabel(script.platform) }}
              </span>
            </div>
            
            <div class="script-actions">
              <button 
                @click="handleToggleCompletion(script, index)"
                class="completion-button"
                :class="{ completed: script.completed }"
                :title="script.completed ? 'Marcar como pendiente' : 'Marcar como completado'"
              >
                <i :class="script.completed ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              </button>
              
              <button 
                @click="viewScript(script)"
                class="view-button"
                title="Ver script completo"
              >
                <i class="fas fa-eye"></i>
              </button>
              
              <button 
                @click="copyScriptContent(script.content)"
                class="copy-button"
                title="Copiar contenido"
              >
                <i class="fas fa-copy"></i>
              </button>
              
              <button 
                @click="handleDeleteScript(script, index)"
                class="delete-button"
                title="Eliminar script"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="script-content">
            <h3 class="script-title">{{ script.title }}</h3>
            <p class="script-preview">{{ getScriptPreview(script.content) }}</p>
            
            <div class="script-details">
              <span class="script-duration" v-if="script.duration">
                <i class="fas fa-clock"></i>
                {{ script.duration }}
              </span>
              <span class="script-date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(script.generatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else-if="!isInitializing">
      <div class="empty-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <h3>No hay scripts generados</h3>
      <p>Comienza generando tu primer script para este proyecto.</p>
      <button 
        @click="openGenerateModal"
        class="generate-first-button"
        :disabled="!canGenerateNewScript"
      >
        <i class="fas fa-plus"></i>
        Generar Primer Script
      </button>
      <p class="empty-note" v-if="!canGenerateNewScript">
        Necesitas generar soundbites y taglines primero
      </p>
    </div>

    <!-- Generate Script Modal -->
    <div class="modal-overlay" v-if="showGenerateModal" @click="showGenerateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Generar Nuevo Script</h3>
          <button @click="showGenerateModal = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field">Tipo de Script *</label>
            <CustomSelect
              v-model="newScript.scriptType"
              :options="scriptTypeOptions"
              placeholder="Seleccionar tipo de script"
            />
          </div>
          
          <div class="form-group">
            <label class="required-field">Plataforma *</label>
            <CustomSelect
              v-model="newScript.platform"
              :options="platformOptions"
              placeholder="Seleccionar plataforma de destino"
            />
          </div>
          
          <div class="form-group">
              <label class="required-field">Soundbite *</label>
              <CustomSelect
                v-model="newScript.selectedSoundbite"
                :options="soundbiteOptions"
                placeholder="Seleccionar soundbite para el script"
                class="custom-select"
              />
            </div>
            
            <div class="form-group">
              <label class="required-field">Tagline *</label>
              <CustomSelect
                v-model="newScript.selectedTagline"
                :options="taglineOptions"
                placeholder="Seleccionar tagline para el script"
                class="custom-select"
              />
            </div>
          
          <div class="form-group">
            <label>Tema Personalizado (Opcional)</label>
            <textarea 
              v-model="newScript.customText"
              class="form-textarea"
              placeholder="Describe el tema específico del que quieres hablar en este script..."
              rows="3"
            ></textarea>
            <small class="form-help">Especifica un tema o mensaje particular que quieras incluir en el script</small>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showGenerateModal = false" class="cancel-button">
            Cancelar
          </button>
          <button 
              @click="handleGenerateScript"
              class="generate-script-button"
              :disabled="isGenerating || !canSubmitScript"
            >
              <i v-if="isGenerating" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-magic"></i>
              {{ isGenerating ? 'Generando...' : 'Generar Script' }}
            </button>
        </div>
      </div>
    </div>

    <!-- Script View Modal -->
    <div class="modal-overlay" v-if="showScriptModal" @click="showScriptModal = false">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedScript?.title }}</h3>
          <button @click="showScriptModal = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedScript">
          <div class="script-meta-info">
            <div class="meta-item">
              <span class="meta-label">Tipo:</span>
              <span class="meta-value">{{ getScriptTypeLabel(selectedScript.type) }}</span>
            </div>
            <div class="meta-item" v-if="selectedScript.platform">
              <span class="meta-label">Plataforma:</span>
              <span class="meta-value">{{ getPlatformLabel(selectedScript.platform) }}</span>
            </div>
            <div class="meta-item" v-if="selectedScript.duration">
              <span class="meta-label">Duración:</span>
              <span class="meta-value">{{ selectedScript.duration }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Generado:</span>
              <span class="meta-value">{{ formatDate(selectedScript.generatedAt) }}</span>
            </div>
          </div>
          
          <div class="script-full-content">
            <!-- Contenido estructurado JSON -->
            <div v-if="selectedScript && formatScriptContent(selectedScript.content).isStructured" class="formatted-script">
              <div class="script-section">
                <h4 class="section-title">
                  <i class="fas fa-video"></i>
                  Visual
                </h4>
                <p class="section-content">{{ formatScriptContent(selectedScript.content).visual }}</p>
              </div>
              
              <div class="script-section">
                <h4 class="section-title">
                  <i class="fas fa-comment"></i>
                  Caption
                </h4>
                <p class="section-content">{{ formatScriptContent(selectedScript.content).caption }}</p>
              </div>
              
              <div class="script-section">
                <h4 class="section-title">
                  <i class="fas fa-align-left"></i>
                  Texto Principal
                </h4>
                <p class="section-content">{{ formatScriptContent(selectedScript.content).text }}</p>
              </div>
            </div>
            
            <!-- Contenido Markdown -->
            <div v-else-if="selectedScript && formatScriptContent(selectedScript.content).isMarkdown" class="markdown-content">
              <div 
                v-for="(section, index) in parseMarkdownContent(selectedScript.content)" 
                :key="index"
                class="markdown-section"
              >
                <h3 class="markdown-title" v-if="section.title">
                  <i class="fas fa-play-circle"></i>
                  {{ section.title }}
                </h3>
                <div class="markdown-body">
                  <div 
                    v-for="(line, lineIndex) in section.content.split('\n').filter(l => l.trim())" 
                    :key="lineIndex"
                    class="markdown-line"
                    :class="formatMarkdownLine(line).type"
                  >
                    <span v-if="formatMarkdownLine(line).type === 'timestamp'" class="timestamp-badge">
                      <i class="fas fa-clock"></i>
                      {{ formatMarkdownLine(line).content }}
                    </span>
                    <span v-else-if="formatMarkdownLine(line).type === 'subtitle'" class="subtitle-text">
                      {{ formatMarkdownLine(line).content }}
                    </span>
                    <span v-else-if="formatMarkdownLine(line).type === 'instruction'" class="instruction-text">
                      <i class="fas fa-camera"></i>
                      {{ formatMarkdownLine(line).content }}
                    </span>
                    <span v-else-if="formatMarkdownLine(line).type === 'hashtag'" class="hashtag-text">
                      {{ formatMarkdownLine(line).content }}
                    </span>
                    <span v-else class="regular-text">
                      {{ formatMarkdownLine(line).content }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contenido sin formato -->
            <div v-else-if="selectedScript" class="raw-content">
              <pre>{{ formatScriptContent(selectedScript.content).content }}</pre>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="copyScriptContent(selectedScript?.content || '')"
            class="copy-button"
          >
            <i class="fas fa-copy"></i>
            Copiar Contenido
          </button>
          <button @click="showScriptModal = false" class="close-modal-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- Generation Progress Overlay -->
    <GenerationProgress 
      :is-generating="isGenerating"
      message="Generando script personalizado para tu marca..."
    />
  </div>
</template>

<style lang="scss" scoped>
.scripts-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.scripts-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.scripts-header {
  margin-bottom: 2rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    .back-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateX(-2px);
      }
    }

    .title-section {
      .page-title {
        color: white;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

        @media (max-width: 768px) {
          font-size: 2rem;
        }
      }

      .page-subtitle {
        color: rgba(255, 255, 255, 0.9);
        margin: 0.5rem 0 0 0;
        font-size: 1.1rem;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: stretch;
    }

    .filter-button,
    .generate-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
      }
    }

    .filter-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      position: relative;

      &.active {
        background: rgba(255, 255, 255, 0.3);
      }

      .filter-count {
        background: #ff6b6b;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .generate-button {
      background: #4ecdc4;
      color: white;

      &:hover:not(:disabled) {
        background: #45b7aa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
      }

      &:disabled {
        background: rgba(255, 255, 255, 0.3);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}

.stats-section {
  margin-bottom: 2rem;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        background: #667eea;
        color: white;

        &.completed {
          background: #4ecdc4;
        }

        &.pending {
          background: #ffa726;
        }

        &.content {
          background: #ab47bc;
        }
      }

      .stat-content {
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .stat-label {
          color: #718096;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
      }
    }
  }
}

.filters-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .filters-content {
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;

      .filter-group {
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;

          &.required-field {
            position: relative;
            
            &::after {
              content: ' *';
              color: #e53e3e;
              margin-left: 2px;
            }
          }
        }

        .date-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;

          &:focus {
            outline: none;
            border-color: #667eea;
          }
        }
      }
    }

    .filters-actions {
      display: flex;
      gap: 1rem;

      .apply-filters-button,
      .clear-filters-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .apply-filters-button {
        background: #667eea;
        color: white;

        &:hover {
          background: #5a67d8;
        }
      }

      .clear-filters-button {
        background: #e2e8f0;
        color: #4a5568;

        &:hover {
          background: #cbd5e0;
        }
      }
    }
  }
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: white;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.scripts-section {
  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .script-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border-left: 4px solid #667eea;

      &.completed {
        border-left-color: #4ecdc4;
        background: #f0fdfa;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .script-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;

        .script-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .script-type {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;

            &.content {
              background: #e3f2fd;
              color: #1976d2;
            }

            &.ad {
              background: #fce4ec;
              color: #c2185b;
            }
          }

          .script-platform {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            background: #f5f5f5;
            color: #666;
          }
        }

        .script-actions {
          display: flex;
          gap: 0.5rem;

          button {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;

            &.completion-button {
              background: #f7fafc;
              color: #a0aec0;

              &.completed {
                background: #4ecdc4;
                color: white;
              }

              &:hover {
                background: #4ecdc4;
                color: white;
              }
            }

            &.view-button {
              background: #667eea;
              color: white;

              &:hover {
                background: #5a67d8;
              }
            }

            &.copy-button {
              background: #4ecdc4;
              color: white;

              &:hover {
                background: #45b7aa;
              }
            }

            &.delete-button {
              background: #fed7d7;
              color: #e53e3e;

              &:hover {
                background: #e53e3e;
                color: white;
              }
            }
          }
        }
      }

      .script-content {
        .script-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .script-preview {
          color: #4a5568;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .script-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #718096;

          span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: white;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.7;
  }

  h3 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }

  p {
    font-size: 1.1rem;
    margin: 0 0 2rem 0;
    opacity: 0.9;
  }

  .generate-first-button {
    background: #4ecdc4;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      background: #45b7aa;
      transform: translateY(-2px);
    }

    &:disabled {
      background: rgba(255, 255, 255, 0.3);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .empty-note {
    margin-top: 1rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;

    @media (max-width: 768px) {
      margin: 0.5rem;
      max-height: 95vh;
      border-radius: 8px;
    }

    &.large {
      max-width: 800px;

      @media (max-width: 768px) {
        max-width: calc(100vw - 1rem);
      }
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #2d3748;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #a0aec0;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
          color: #4a5568;
        }
      }
    }

    .modal-body {
      padding: 1.5rem;

      .form-group {
          margin-bottom: 1.5rem;

          @media (max-width: 768px) {
            margin-bottom: 1.25rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2d3748;

            @media (max-width: 768px) {
              font-size: 0.9rem;
            }

            &.required-field::after {
              @media (max-width: 768px) {
                font-size: 0.875rem;
              }
            }
          }

          .form-textarea {
            width: 90%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            resize: vertical;
            min-height: 80px;
            font-family: inherit;

            @media (max-width: 768px) {
              width: 100%;
              padding: 0.625rem;
              font-size: 0.9rem;
              min-height: 70px;
            }

            &:focus {
              outline: none;
              border-color: #667eea;
            }

            &::placeholder {
              color: #9ca3af;
            }
          }

          .validation-message {
            margin-top: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #dc2626;
            font-size: 0.875rem;
            line-height: 1.4;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            
            @media (max-width: 768px) {
              margin-top: 6px;
              padding: 10px 14px;
              font-size: 0.8125rem;
              line-height: 1.3;
              gap: 6px;
            }
            
            i {
              margin-top: 2px;
              flex-shrink: 0;

              @media (max-width: 768px) {
                margin-top: 1px;
              }
            }
          }

          .form-help {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.4;

            @media (max-width: 768px) {
              font-size: 0.8125rem;
              margin-top: 0.375rem;
            }
          }
        }

      .script-meta-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .meta-label {
            font-size: 0.875rem;
            color: #718096;
            font-weight: 600;
          }

          .meta-value {
            color: #2d3748;
            font-weight: 500;
          }
        }
      }

      .script-full-content {
        background: #f7fafc;
        border-radius: 8px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;

        .formatted-script {
          .script-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 4px solid #667eea;

            .section-title {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 1.1rem;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 1rem;

              i {
                color: #667eea;
                font-size: 1rem;
              }
            }

            .section-content {
              font-size: 1rem;
              line-height: 1.6;
              color: #4a5568;
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          }

          .raw-content {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
            margin: 0;
          }
        }

        .markdown-content {
          .markdown-section {
            margin-bottom: 2.5rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            border: 1px solid #dee2e6;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

            .markdown-title {
              font-size: 1.3rem;
              font-weight: 700;
              color: #2c3e50;
              margin-bottom: 1.5rem;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding-bottom: 0.75rem;
              border-bottom: 2px solid #667eea;

              i {
                color: #667eea;
                font-size: 1.1rem;
              }
            }

            .markdown-body {
              .markdown-line {
                margin-bottom: 0.75rem;
                line-height: 1.6;

                &.timestamp {
                  margin: 1rem 0;

                  .timestamp-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #667eea;
                    color: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;

                    i {
                      font-size: 0.8rem;
                    }
                  }
                }

                &.subtitle {
                  .subtitle-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #495057;
                    display: block;
                    margin: 1rem 0 0.5rem 0;
                    padding-left: 1rem;
                    border-left: 3px solid #4ecdc4;
                  }
                }

                &.instruction {
                  margin: 1rem 0;

                  .instruction-text {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #fff3cd;
                    color: #856404;
                    padding: 0.6rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #ffeaa7;
                    font-style: italic;

                    i {
                      color: #f39c12;
                    }
                  }
                }

                &.hashtag {
                  .hashtag-text {
                    color: #667eea;
                    font-weight: 500;

                    &::before {
                      content: "🏷️ ";
                      margin-right: 0.25rem;
                    }
                  }
                }

                &.text {
                  .regular-text {
                    color: #495057;
                    line-height: 1.7;
                  }
                }
              }
            }
          }
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
          color: #2d3748;
        }
      }
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &.cancel-button,
        &.close-modal-button {
          background: #e2e8f0;
          color: #4a5568;

          &:hover {
            background: #cbd5e0;
          }
        }

        &.generate-button {
          background: #667eea;
          color: white;

          &:hover:not(:disabled) {
            background: #5a67d8;
          }

          &:disabled {
            background: #a0aec0;
            cursor: not-allowed;
          }
        }

        &.copy-button {
          background: #4ecdc4;
          color: white;

          &:hover {
            background: #45b7aa;
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>