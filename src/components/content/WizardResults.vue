<script setup lang="ts">
import type { IContent, ISoundbite, ITagline, IScript } from '@/types/content.types'

interface ContentResults {
  soundbites: string[]
  taglines: string[]
  scripts: string[]
}

interface Props {
  results: ContentResults | null
  isGenerating: boolean
  error: string | null
}

interface Emits {
  regenerate: []
  goToResults: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleRegenerate() {
  emit('regenerate')
}

function handleGoToResults() {
  emit('goToResults')
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Aquí podrías mostrar una notificación de éxito
    console.log('Texto copiado al portapapeles')
  })
}
</script>

<template>
  <div class="wizard-results">
    <!-- Estado de carga -->
    <div v-if="isGenerating" class="loading-state">
      <div class="loading-spinner"></div>
      <h3>Generando tu contenido...</h3>
      <p>Esto puede tomar unos momentos. Estamos creando contenido personalizado para tu negocio.</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al generar contenido</h3>
      <p>{{ error }}</p>
      <button @click="handleRegenerate" class="btn btn-primary">
        🔄 Intentar de nuevo
      </button>
    </div>

    <!-- Resultados exitosos -->
    <div v-else-if="results" class="results-content">
      <div class="results-header">
        <h2>¡Tu contenido está listo! 🎉</h2>
        <p>Hemos generado contenido personalizado basado en la información de tu negocio.</p>
      </div>

      <!-- Soundbites -->
      <div v-if="results.soundbites?.length" class="content-section">
        <h3>📢 Soundbites</h3>
        <p class="section-description">
          Frases cortas y memorables que capturan la esencia de tu propuesta de valor.
        </p>
        <div class="content-grid">
          <div 
            v-for="(soundbite, index) in results.soundbites" 
            :key="index"
            class="content-card"
          >
            <div class="content-text">{{ soundbite }}</div>
            <button 
              @click="copyToClipboard(soundbite)"
              class="copy-btn"
              title="Copiar al portapapeles"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <!-- Taglines -->
      <div v-if="results.taglines?.length" class="content-section">
        <h3>🎯 Taglines</h3>
        <p class="section-description">
          Eslóganes poderosos que comunican tu mensaje principal de forma clara y atractiva.
        </p>
        <div class="content-grid">
          <div 
            v-for="(tagline, index) in results.taglines" 
            :key="index"
            class="content-card"
          >
            <div class="content-text">{{ tagline }}</div>
            <button 
              @click="copyToClipboard(tagline)"
              class="copy-btn"
              title="Copiar al portapapeles"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <!-- Scripts -->
      <div v-if="results.scripts?.length" class="content-section">
        <h3>📝 Scripts</h3>
        <p class="section-description">
          Scripts completos para diferentes situaciones de comunicación.
        </p>
        <div class="scripts-container">
          <div 
            v-for="(script, index) in results.scripts" 
            :key="index"
            class="script-card"
          >
            <div class="script-header">
              <h4>Script {{ index + 1 }}</h4>
              <button 
                @click="copyToClipboard(script)"
                class="copy-btn"
                title="Copiar al portapapeles"
              >
                📋
              </button>
            </div>
            <div class="script-content">{{ script }}</div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="results-actions">
        <button @click="handleRegenerate" class="btn btn-secondary">
          🔄 Regenerar contenido
        </button>
        <button @click="handleGoToResults" class="btn btn-primary">
          📊 Ver resultados completos
        </button>
      </div>
    </div>

    <!-- Estado inicial -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>Completa el asistente para generar tu contenido</h3>
      <p>Responde todas las preguntas para que podamos crear contenido personalizado para tu negocio.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wizard-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: $white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba($BAKANO-DARK, 0.08);
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 1.5rem 0 1rem 0;
  }

  p {
    color: rgba($BAKANO-DARK, 0.7);
    margin: 0 0 2rem 0;
    font-size: 1.125rem;
    font-weight: 500;
  }
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba($BAKANO-PURPLE, 0.2);
  border-top: 4px solid $BAKANO-PURPLE;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.error-icon {
  color: $alert-error;
}

.empty-icon {
  color: rgba($BAKANO-PURPLE, 0.6);
}

.results-content {
  background: $white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba($BAKANO-DARK, 0.08);
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  overflow: hidden;
}

.results-header {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba($BAKANO-PINK, 0.05) 0%, rgba($BAKANO-PURPLE, 0.05) 100%);
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1rem 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    color: rgba($BAKANO-DARK, 0.7);
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }
}

.content-section {
  padding: 2.5rem;
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);

  &:last-of-type {
    border-bottom: none;
  }

  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;

    &::after {
      content: '';
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, rgba($BAKANO-PURPLE, 0.3) 0%, transparent 100%);
      margin-left: 1rem;
    }

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .section-description {
    color: rgba($BAKANO-DARK, 0.7);
    margin: 0 0 2rem 0;
    font-size: 1rem;
    font-weight: 500;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.content-card {
  position: relative;
  padding: 2rem;
  background: $white;
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba($BAKANO-DARK, 0.05);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
  }

  &:hover {
    box-shadow: 0 8px 32px rgba($BAKANO-PURPLE, 0.15);
    transform: translateY(-4px);
    border-color: rgba($BAKANO-PURPLE, 0.2);
  }
}

.content-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: $BAKANO-DARK;
  margin-right: 3rem;
  font-weight: 500;

  @media (max-width: 768px) {
    margin-right: 0;
    font-size: 1rem;
  }
}

.copy-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba($BAKANO-LIGHT, 0.8);
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: $BAKANO-DARK;

  &:hover {
    background: $BAKANO-PURPLE;
    color: $white;
    border-color: $BAKANO-PURPLE;
    transform: scale(1.05);
  }

  &.copied {
    background: $BAKANO-GREEN;
    color: $white;
    border-color: $BAKANO-GREEN;
  }

  @media (max-width: 768px) {
    position: static;
    margin-top: 1.5rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.scripts-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.script-card {
  background: $white;
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba($BAKANO-DARK, 0.05);

  &:hover {
    box-shadow: 0 8px 32px rgba($BAKANO-PURPLE, 0.15);
    transform: translateY(-4px);
    border-color: rgba($BAKANO-PURPLE, 0.2);
  }
}

.script-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba($BAKANO-PINK, 0.05) 0%, rgba($BAKANO-PURPLE, 0.05) 100%);
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0;
  }
}

.script-content {
  padding: 2rem;
  font-size: 1.125rem;
  line-height: 1.7;
  color: $BAKANO-DARK;
  white-space: pre-wrap;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba($BAKANO-PINK, 0.02) 0%, rgba($BAKANO-PURPLE, 0.02) 100%);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &.btn-primary {
    background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
    color: $white;
    box-shadow: 0 4px 16px rgba($BAKANO-PURPLE, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($BAKANO-PURPLE, 0.4);
    }

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

    &:hover::before {
      left: 100%;
    }
  }

  &.btn-secondary {
    background: rgba($BAKANO-LIGHT, 0.8);
    color: $BAKANO-DARK;
    border: 2px solid rgba($BAKANO-PURPLE, 0.2);

    &:hover:not(:disabled) {
      background: rgba($BAKANO-PURPLE, 0.1);
      border-color: $BAKANO-PURPLE;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba($BAKANO-PURPLE, 0.15);
    }
  }
}
</style>