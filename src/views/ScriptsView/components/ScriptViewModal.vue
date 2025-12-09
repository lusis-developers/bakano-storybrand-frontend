<script setup lang="ts">
import { computed } from 'vue'

interface Script {
  id: string
  title: string
  type: 'content' | 'ad'
  platform?: string
  duration?: string
  content: string
  generatedAt: string
}

interface Props {
  showModal: boolean
  script: Script | null
}

interface Emits {
  (e: 'close'): void
  (e: 'copy', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Utility functions
const getScriptTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    content: 'Contenido',
    ad: 'Anuncio'
  }
  return labels[type] || type
}

const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    social: 'Redes Sociales',
    email: 'Email',
    website: 'Sitio Web'
  }
  return labels[platform] || platform
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatScriptContent = (content: string) => {
  try {
    const parsed = JSON.parse(content)
    const postsArray = Array.isArray((parsed as any).posts) ? (parsed as any).posts : null
    const postKeys = ['post1', 'post2', 'post3', 'post4', 'post_1', 'post_2', 'post_3']
    const postObjects = postsArray || postKeys.map(k => (parsed as any)[k]).filter(Boolean)
    if (postObjects && postObjects.length > 0) {
      const items = postObjects.map((p: any) => ({
        title: typeof p?.title === 'string' ? p.title : '',
        content: typeof p?.content === 'string' ? p.content : '',
        duration: typeof p?.duration === 'string' ? p.duration : ''
      }))
      return {
        isStructured: true,
        isMarkdown: false,
        isMultipost: true,
        items,
        content
      }
    }
    if ((parsed as any).visual && (parsed as any).caption && (parsed as any).text) {
      return {
        isStructured: true,
        isMarkdown: false,
        isMultipost: false,
        visual: (parsed as any).visual,
        caption: (parsed as any).caption,
        text: (parsed as any).text,
        content
      }
    }
  } catch (e) { }

  const isMarkdown = content.includes('##') || content.includes('**') || content.includes('[') || content.includes('(')
  return {
    isStructured: false,
    isMarkdown,
    content
  }
}

const parseMarkdownContent = (content: string) => {
  const sections = []
  const lines = content.split('\n')
  let currentSection = { title: '', content: '' }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection.title || currentSection.content) {
        sections.push({ ...currentSection })
      }
      currentSection = { title: line.replace('## ', ''), content: '' }
    } else if (line.trim()) {
      currentSection.content += (currentSection.content ? '\n' : '') + line
    }
  }

  if (currentSection.title || currentSection.content) {
    sections.push(currentSection)
  }

  return sections
}

const formatMarkdownLine = (line: string) => {
  const trimmed = line.trim()

  if (trimmed.match(/^\d{1,2}:\d{2}/)) {
    return { type: 'timestamp', content: trimmed }
  } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
    return { type: 'subtitle', content: trimmed.replace(/\*\*/g, '') }
  } else if (trimmed.startsWith('[') && trimmed.includes(']')) {
    return { type: 'instruction', content: trimmed.replace(/[\[\]]/g, '') }
  } else if (trimmed.includes('#')) {
    return { type: 'hashtag', content: trimmed }
  } else {
    return { type: 'regular', content: trimmed }
  }
}

// Methods
const handleCopy = () => {
  if (props.script?.content) {
    emit('copy', props.script.content)
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" v-if="showModal" @click="handleClose">
    <div class="modal-content large" @click.stop>
      <div class="modal-header">
        <h3>{{ script?.title }}</h3>
        <button @click="handleClose" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="script">
        <div class="script-meta-info">
          <div class="meta-item">
            <span class="meta-label">Tipo:</span>
            <span class="meta-value">{{ getScriptTypeLabel(script.type) }}</span>
          </div>
          <div class="meta-item" v-if="script.platform">
            <span class="meta-label">Plataforma:</span>
            <span class="meta-value">{{ getPlatformLabel(script.platform) }}</span>
          </div>
          <div class="meta-item" v-if="script.duration">
            <span class="meta-label">Duración:</span>
            <span class="meta-value">{{ script.duration }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Generado:</span>
            <span class="meta-value">{{ formatDate(script.generatedAt) }}</span>
          </div>
        </div>
        
        <div class="script-full-content">
          <div v-if="script && formatScriptContent(script.content).isStructured">
            <template v-if="formatScriptContent(script.content).isMultipost">
              <div class="multipost-content">
                <div 
                  v-for="(item, idx) in formatScriptContent(script.content).items" 
                  :key="idx"
                  class="post-card"
                >
                  <h4 class="post-title">
                    <i class="fas fa-sticky-note"></i>
                    {{ item.title || `Post ${idx + 1}` }}
                    <span v-if="item.duration" class="post-duration">
                      <i class="fas fa-clock"></i>
                      {{ item.duration }}
                    </span>
                  </h4>
                  <div class="post-body">
                    <div 
                      v-for="(section, sidx) in parseMarkdownContent(item.content)" 
                      :key="sidx"
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
                </div>
              </div>
            </template>
            <template v-else>
              <div class="formatted-script">
                <div class="script-section">
                  <h4 class="section-title">
                    <i class="fas fa-video"></i>
                    Visual
                  </h4>
                  <p class="section-content">{{ formatScriptContent(script.content).visual }}</p>
                </div>
                <div class="script-section">
                  <h4 class="section-title">
                    <i class="fas fa-comment"></i>
                    Caption
                  </h4>
                  <p class="section-content">{{ formatScriptContent(script.content).caption }}</p>
                </div>
                <div class="script-section">
                  <h4 class="section-title">
                    <i class="fas fa-align-left"></i>
                    Texto Principal
                  </h4>
                  <p class="section-content">{{ formatScriptContent(script.content).text }}</p>
                </div>
              </div>
            </template>
          </div>
          <div v-else-if="script && formatScriptContent(script.content).isMarkdown" class="markdown-content">
            <div 
              v-for="(section, index) in parseMarkdownContent(script.content)" 
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
          <div v-else-if="script" class="raw-content">
            <pre>{{ formatScriptContent(script.content).content }}</pre>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="handleCopy" class="copy-button">
          <i class="fas fa-copy"></i>
          Copiar Contenido
        </button>
        <button @click="handleClose" class="close-modal-button">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: $white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.large {
    max-width: 900px;
  }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, $BAKANO-PURPLE, $BAKANO-PINK);

  h3 {
    color: $white;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .close-button {
    background: rgba($white, 0.2);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    color: $white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($white, 0.3);
      transform: scale(1.1);
    }
  }
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.script-meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: $BAKANO-LIGHT;
  border-radius: 12px;

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .meta-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba($BAKANO-DARK, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: $BAKANO-DARK;
    }
  }
}

.script-full-content {
  .multipost-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .post-card {
    padding: 1.25rem 1.5rem;
    background: $white;
    border: 1px solid $BAKANO-LIGHT;
    border-radius: 12px;
  }

  .post-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $BAKANO-PURPLE;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;

    i {
      color: $BAKANO-PINK;
    }

    .post-duration {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: $BAKANO-LIGHT;
      color: $BAKANO-DARK;
      padding: 0.25rem 0.6rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }

  .post-body {
    .markdown-section {
      margin-bottom: 1.25rem;
    }

    .markdown-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: $BAKANO-PURPLE;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.4rem;
      border-bottom: 2px solid $BAKANO-LIGHT;

      i {
        color: $BAKANO-PINK;
      }
    }

    .markdown-body {
      .markdown-line {
        margin-bottom: 0.6rem;
        line-height: 1.6;
      }
    }
  }

  .formatted-script {
    .script-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: $white;
      border: 1px solid $BAKANO-LIGHT;
      border-radius: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: $BAKANO-PURPLE;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 1rem 0;

        i {
          color: $BAKANO-PINK;
        }
      }

      .section-content {
        color: $BAKANO-DARK;
        line-height: 1.6;
        margin: 0;
        white-space: pre-wrap;
      }
    }
  }

  .markdown-content {
    .markdown-section {
      margin-bottom: 2rem;

      .markdown-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: $BAKANO-PURPLE;
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid $BAKANO-LIGHT;

        i {
          color: $BAKANO-PINK;
        }
      }

      .markdown-body {
        .markdown-line {
          margin-bottom: 0.75rem;
          line-height: 1.6;

          &.timestamp {
            .timestamp-badge {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              background: $BAKANO-PURPLE;
              color: $white;
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 600;
            }
          }

          &.subtitle {
            .subtitle-text {
              font-weight: 600;
              color: $BAKANO-DARK;
              font-size: 1.05rem;
            }
          }

          &.instruction {
            .instruction-text {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              background: rgba($BAKANO-PINK, 0.1);
              color: $BAKANO-PINK;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              font-style: italic;
              border-left: 3px solid $BAKANO-PINK;
            }
          }

          &.hashtag {
            .hashtag-text {
              color: $BAKANO-PURPLE;
              font-weight: 500;
            }
          }

          &.regular {
            .regular-text {
              color: $BAKANO-DARK;
            }
          }
        }
      }
    }
  }

  .raw-content {
    background: $BAKANO-LIGHT;
    border-radius: 12px;
    padding: 1.5rem;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: $BAKANO-DARK;
      line-height: 1.6;
      font-family: 'Courier New', monospace;
    }
  }
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid $BAKANO-LIGHT;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }

  .copy-button,
  .close-modal-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .copy-button {
    background: $BAKANO-PURPLE;
    color: $white;

    &:hover {
      background: darken($BAKANO-PURPLE, 10%);
      transform: translateY(-2px);
    }
  }

  .close-modal-button {
    background: $BAKANO-LIGHT;
    color: $BAKANO-DARK;

    &:hover {
      background: darken($BAKANO-LIGHT, 5%);
    }
  }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .script-meta-info {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
