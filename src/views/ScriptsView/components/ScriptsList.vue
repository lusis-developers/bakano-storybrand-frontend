<script setup lang="ts">
import { computed } from 'vue'

interface Script {
  id?: string
  title: string
  content: string
  type: 'content' | 'ad'
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'social' | 'email' | 'website'
  completed: boolean
  duration?: string
  generatedAt: string
}

interface Props {
  scripts: Script[]
  isLoading: boolean
  isInitializing: boolean
  canGenerateNewScript: boolean
}

interface Emits {
  (e: 'toggle-completion', script: Script, index: number): void
  (e: 'view-script', script: Script): void
  (e: 'copy-script', content: string): void
  (e: 'delete-script', script: Script, index: number): void
  (e: 'generate-script'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hasScripts = computed(() => props.scripts.length > 0)

// Utility functions
const getScriptTypeLabel = (type: string) => {
  const labels = {
    content: 'Contenido',
    ad: 'Anuncio'
  }
  return labels[type as keyof typeof labels] || type
}

const getPlatformLabel = (platform: string) => {
  const labels = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    social: 'Redes Sociales',
    email: 'Email',
    website: 'Sitio Web'
  }
  return labels[platform as keyof typeof labels] || platform
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatScriptContent = (content: string) => {
  try {
    const parsed = JSON.parse(content)
    return {
      content: parsed.text || parsed.content || content,
      isStructured: true,
      ...parsed
    }
  } catch {
    return {
      content: content,
      isStructured: false,
      isMarkdown: true
    }
  }
}

const parseMarkdownContent = (content: string) => {
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
    const sections = parseMarkdownContent(content)
    if (sections.length > 0) {
      const firstSection = sections[0]
      const lines = firstSection.content.split('\n').filter(l => l.trim())

      for (const line of lines) {
        const lineType = formatMarkdownLine(line)
        if (lineType.type === 'text' || lineType.type === 'subtitle') {
          const cleanText = lineType.content.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').trim()
          if (cleanText.length > 20) {
            return cleanText.substring(0, 150) + '...'
          }
        }
      }

      if (firstSection.title) {
        return firstSection.title.substring(0, 150) + '...'
      }
    }
  }

  return (formatted.content || content).substring(0, 150) + '...'
}

// Event handlers
const handleToggleCompletion = (script: Script, index: number) => {
  emit('toggle-completion', script, index)
}

const handleViewScript = (script: Script) => {
  emit('view-script', script)
}

const handleCopyScript = (content: string) => {
  emit('copy-script', content)
}

const handleDeleteScript = (script: Script, index: number) => {
  emit('delete-script', script, index)
}

const handleGenerateScript = () => {
  emit('generate-script')
}
</script>

<template>
  <!-- Loading State -->
  <div class="loading-section" v-if="isLoading || isInitializing">
    <div class="loading-spinner"></div>
    <p>Cargando scripts...</p>
  </div>

  <!-- Scripts List -->
  <div class="scripts-section" v-else-if="hasScripts">
    <div class="scripts-grid">
      <div 
        v-for="(script, index) in scripts" 
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
              @click="handleViewScript(script)"
              class="view-button"
              title="Ver script completo"
            >
              <i class="fas fa-eye"></i>
            </button>
            
            <button 
              @click="handleCopyScript(script.content)"
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
      @click="handleGenerateScript"
      class="generate-first-button"
      :disabled="!canGenerateNewScript"
    >
      <i class="fas fa-plus"></i>
      Generar Primer Script
    </button>
  </div>
</template>

<style lang="scss" scoped>
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.scripts-section {
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }

  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .script-card {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--color-primary-light);
      }

      &.completed {
        border-left: 4px solid var(--color-success);
        background: linear-gradient(135deg, var(--color-white) 0%, rgba(var(--color-success-rgb), 0.02) 100%);

        .script-header .completion-button.completed {
          color: var(--color-success);
        }
      }

      .script-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);

        .script-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);

          .script-type,
          .script-platform {
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-medium);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .script-type {
            &.content {
              background: rgba(var(--color-primary-rgb), 0.1);
              color: var(--color-primary);
            }

            &.ad {
              background: rgba(var(--color-warning-rgb), 0.1);
              color: var(--color-warning);
            }
          }

          .script-platform {
            background: var(--color-background-light);
            color: var(--color-text-secondary);
          }
        }

        .script-actions {
          display: flex;
          gap: var(--spacing-xs);

          button {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: var(--border-radius-sm);
            background: var(--color-background-light);
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              transform: scale(1.1);
            }

            &.completion-button {
              &:hover {
                background: rgba(var(--color-success-rgb), 0.1);
                color: var(--color-success);
              }

              &.completed {
                background: rgba(var(--color-success-rgb), 0.1);
                color: var(--color-success);
              }
            }

            &.view-button:hover {
              background: rgba(var(--color-info-rgb), 0.1);
              color: var(--color-info);
            }

            &.copy-button:hover {
              background: rgba(var(--color-primary-rgb), 0.1);
              color: var(--color-primary);
            }

            &.delete-button:hover {
              background: rgba(var(--color-danger-rgb), 0.1);
              color: var(--color-danger);
            }
          }
        }
      }

      .script-content {
        .script-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-sm);
          line-height: 1.4;
        }

        .script-preview {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          line-height: 1.6;
          margin-bottom: var(--spacing-md);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .script-details {
          display: flex;
          gap: var(--spacing-md);
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);

          @media (max-width: 480px) {
            flex-direction: column;
            gap: var(--spacing-xs);
          }

          span {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);

            i {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  min-height: 400px;

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--color-background-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-lg);

    i {
      font-size: 32px;
      color: var(--color-text-tertiary);
    }
  }

  h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-lg);
    max-width: 400px;
  }

  .generate-first-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    background: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
    }

    &:disabled {
      background: var(--color-border);
      color: var(--color-text-tertiary);
      cursor: not-allowed;
    }

    i {
      font-size: 16px;
    }
  }
}
</style>