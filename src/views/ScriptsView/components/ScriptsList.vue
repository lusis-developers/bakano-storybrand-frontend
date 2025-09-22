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
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.1) 0%, rgba($white, 0.8) 100%);

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba($BAKANO-PURPLE, 0.1);
    border-top: 3px solid $BAKANO-PURPLE;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }

  p {
    color: rgba($BAKANO-DARK, 0.6);
    font-size: 1rem;
    font-family: $font-secondary;
    font-weight: 500;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.scripts-section {
  padding: 2rem;
  background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.05) 0%, rgba($white, 0.9) 100%);
  min-height: 60vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .script-card {
      background: $white;
      border: 1px solid rgba($BAKANO-PURPLE, 0.08);
      border-radius: 20px;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba($BAKANO-PURPLE, 0.08);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, $BAKANO-PURPLE, $BAKANO-PINK);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba($BAKANO-PURPLE, 0.15);
        border-color: rgba($BAKANO-PURPLE, 0.2);

        &::before {
          transform: scaleX(1);
        }

        .script-actions button {
          opacity: 1;
          transform: scale(1);
        }
      }

      &.completed {
        border-left: 4px solid $BAKANO-GREEN;
        background: linear-gradient(135deg, $white 0%, rgba($BAKANO-GREEN, 0.02) 100%);

        &::before {
          background: linear-gradient(90deg, $BAKANO-GREEN, $BAKANO-PURPLE);
        }

        .script-header .completion-button.completed {
          color: $BAKANO-GREEN;
          background: rgba($BAKANO-GREEN, 0.1);
        }

        .script-title {
          color: rgba($BAKANO-DARK, 0.8);
        }
      }

      .script-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;

        .script-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;

          .script-type,
          .script-platform {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: $font-principal;
          }

          .script-type {
            &.content {
              background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.1), rgba($BAKANO-PURPLE, 0.05));
              color: $BAKANO-PURPLE;
              border: 1px solid rgba($BAKANO-PURPLE, 0.2);
            }

            &.ad {
              background: linear-gradient(135deg, rgba($alert-warning, 0.1), rgba($alert-warning, 0.05));
              color: $alert-warning;
              border: 1px solid rgba($alert-warning, 0.2);
            }
          }

          .script-platform {
            background: rgba($BAKANO-LIGHT, 0.3);
            color: rgba($BAKANO-DARK, 0.7);
            border: 1px solid rgba($BAKANO-PURPLE, 0.1);
          }
        }

        .script-actions {
          display: flex;
          gap: 0.5rem;

          button {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 12px;
            background: rgba($BAKANO-PURPLE, 0.05);
            color: rgba($BAKANO-PURPLE, 0.6);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transform: scale(0.9);
            position: relative;
            overflow: hidden;

            &::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.1), rgba($BAKANO-PINK, 0.1));
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            &:hover::before {
              opacity: 1;
            }

            i {
              position: relative;
              z-index: 2;
              font-size: 16px;
            }

            &:hover {
              transform: scale(1.1);
              opacity: 1;
            }

            &.completion-button {
              &:hover {
                background: rgba($BAKANO-GREEN, 0.1);
                color: $BAKANO-GREEN;
              }

              &.completed {
                background: rgba($BAKANO-GREEN, 0.1);
                color: $BAKANO-GREEN;
                opacity: 1;
                transform: scale(1);
              }
            }

            &.view-button:hover {
              background: rgba($BAKANO-PURPLE, 0.1);
              color: $BAKANO-PURPLE;
            }

            &.copy-button:hover {
              background: rgba($BAKANO-PINK, 0.1);
              color: $BAKANO-PINK;
            }

            &.delete-button:hover {
              background: rgba($alert-error, 0.1);
              color: $alert-error;
            }
          }
        }
      }

      .script-content {
        .script-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: $BAKANO-DARK;
          margin-bottom: 1rem;
          line-height: 1.3;
          font-family: $font-principal;
          transition: color 0.3s ease;
        }

        .script-preview {
          color: rgba($BAKANO-DARK, 0.6);
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: $font-secondary;
        }

        .script-details {
          display: flex;
          gap: 1.5rem;
          font-size: 0.75rem;
          color: rgba($BAKANO-DARK, 0.5);
          font-family: $font-secondary;
          font-weight: 600;

          @media (max-width: 480px) {
            flex-direction: column;
            gap: 0.5rem;
          }

          span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba($BAKANO-LIGHT, 0.2);
            border-radius: 20px;
            border: 1px solid rgba($BAKANO-PURPLE, 0.08);

            i {
              font-size: 12px;
              color: $BAKANO-PURPLE;
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
  padding: 4rem 2rem;
  text-align: center;
  min-height: 500px;
  background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.1) 0%, rgba($white, 0.8) 100%);

  .empty-icon {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.1), rgba($BAKANO-PINK, 0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    border: 1px solid rgba($BAKANO-PURPLE, 0.1);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      background: linear-gradient(135deg, $BAKANO-PURPLE, $BAKANO-PINK);
      z-index: -1;
      opacity: 0.1;
    }

    i {
      font-size: 48px;
      color: $BAKANO-PURPLE;
    }
  }

  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin-bottom: 1rem;
    font-family: $font-principal;
  }

  p {
    color: rgba($BAKANO-DARK, 0.6);
    font-size: 1rem;
    margin-bottom: 2rem;
    max-width: 400px;
    line-height: 1.6;
    font-family: $font-secondary;
  }

  .generate-first-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 2.5rem;
    background: linear-gradient(135deg, $BAKANO-PURPLE 0%, $BAKANO-PINK 100%);
    color: $white;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: $font-principal;
    box-shadow: 0 4px 20px rgba($BAKANO-PURPLE, 0.3);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba($white, 0.2), transparent);
      transition: left 0.5s;
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba($BAKANO-PURPLE, 0.4);

      &::before {
        left: 100%;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      background: rgba($BAKANO-PURPLE, 0.2);
      color: rgba($BAKANO-DARK, 0.4);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;

      &::before {
        display: none;
      }
    }

    i {
      font-size: 18px;
    }
  }
}
</style>