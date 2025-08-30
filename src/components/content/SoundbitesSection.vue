<script setup lang="ts">
import type { ISoundbite } from '@/types/content.types'

const props = defineProps({
  soundbites: {
    type: Array as () => ISoundbite[],
    default: () => []
  },
  hasSoundbites: {
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
      <h2><i class="fas fa-bullseye"></i> Soundbites</h2>
      <p>Frases clave que capturan la esencia de tu marca</p>
    </div>
    
    <div v-if="hasSoundbites" class="soundbites-grid">
      <div 
        v-for="(soundbite, index) in soundbites" 
        :key="index"
        class="soundbite-card"
        :class="`category-${soundbite.category}`"
      >
        <div class="soundbite-category">{{ soundbite.category }}</div>
        <div class="soundbite-text">{{ soundbite.text }}</div>
        <div class="soundbite-actions">
          <button class="copy-btn" @click="handleCopy(soundbite.text)">
            <i class="fas fa-copy"></i> Copiar
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-content">
      <p>No hay soundbites generados aún</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.content-section {
  margin-bottom: 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }

    i {
      color: #667eea;
    }
  }

  p {
    color: #64748b;
    font-size: 1.125rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.soundbites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.soundbite-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
}

.soundbite-category {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #667eea;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 1rem;
}

.soundbite-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.soundbite-actions {
  display: flex;
  justify-content: flex-end;
}

.copy-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
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
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
}

.empty-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  p {
    color: #64748b;
    font-size: 1.125rem;
    margin: 0;
  }
}

// Category-specific styles
.category-hero {
  border-left: 4px solid #10b981;
}

.category-problem {
  border-left: 4px solid #f59e0b;
}

.category-solution {
  border-left: 4px solid #3b82f6;
}

.category-authority {
  border-left: 4px solid #8b5cf6;
}

.category-plan {
  border-left: 4px solid #06b6d4;
}

.category-cta {
  border-left: 4px solid #ef4444;
}
</style>