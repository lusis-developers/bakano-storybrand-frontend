<script setup lang="ts">
import type { ITagline } from '@/types/content.types'

const props = defineProps({
  taglines: {
    type: Array as () => ITagline[],
    default: () => []
  },
  hasTaglines: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  copyToClipboard: [text: string]
}>()

const handleCopy = (text: string) => {
  emit('copyToClipboard', text)
}
</script>

<template>
  <section class="content-section">
    <div class="section-header">
      <h2><i class="fas fa-tag"></i> Taglines</h2>
      <p>Frases memorables que definen tu propuesta de valor</p>
    </div>
    
    <div v-if="hasTaglines" class="taglines-grid">
      <div 
        v-for="(tagline, index) in taglines" 
        :key="index"
        class="tagline-card"
        :class="`style-${tagline.style}`"
      >
        <div class="tagline-style">{{ tagline.style }}</div>
        <div class="tagline-text">{{ tagline.text }}</div>
        <div class="tagline-actions">
          <button class="copy-btn" @click="handleCopy(tagline.text)">
            <i class="fas fa-copy"></i> Copiar
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-content">
      <p>No hay taglines generados aún</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.content-section {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 3rem;
  }
}

.section-header {
  width: 100%;
  text-align: center;
  margin-bottom: 1.25rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }

    i {
      color: $BAKANO-PURPLE;
    }
  }

  p {
    color: darken($BAKANO-DARK, 20%);
    font-size: 1rem;

    @media (min-width: 768px) {
      font-size: 1.125rem;
    }
  }
}

.taglines-grid {
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

.tagline-card {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: $white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  box-shadow: 0 2px 4px rgba($BAKANO-DARK, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($BAKANO-PURPLE, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
}

.tagline-style {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $BAKANO-PURPLE;
  background: $BAKANO-LIGHT;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 1rem;
}

.tagline-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  line-height: 1.4;
  margin-bottom: 1rem;
  text-align: center;
  font-style: italic;
  word-break: break-word;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
}

.tagline-actions {
  display: flex;
  justify-content: flex-end;
}

.copy-btn {
  background: $BAKANO-LIGHT;
  border: 1px solid rgba($BAKANO-PURPLE, 0.2);
  color: darken($BAKANO-DARK, 20%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: $BAKANO-PURPLE;
    color: $white;
    border-color: $BAKANO-PURPLE;
  }
}

.empty-content {
  width: 100%;
  max-width: 100%;
  text-align: center;
  padding: 2rem;
  background: $white;
  border-radius: 12px;
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);

  p {
    color: darken($BAKANO-DARK, 20%);
    font-size: 1rem;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 1.125rem;
    }
  }
}

// Style-specific styles
.style-professional {
  border-left: 4px solid $BAKANO-PURPLE;
}

.style-casual {
  border-left: 4px solid $BAKANO-GREEN;
}

.style-creative {
  border-left: 4px solid $alert-warning;
}

.style-direct {
  border-left: 4px solid $alert-error;
}
</style>
