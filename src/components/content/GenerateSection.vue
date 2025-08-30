<script setup lang="ts">
const props = defineProps({
  isGenerating: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits<{
  generate: []
}>()

const handleGenerate = () => {
  emit('generate')
}
</script>

<template>
  <div class="generate-section">
    <div class="generate-card">
      <div class="generate-header">
        <h2><i class="fas fa-bullseye"></i> Generar Soundbites y Taglines StoryBrand</h2>
        <p>Basado en las respuestas de tu negocio, nuestra IA creará:</p>
      </div>
      
      <div class="generate-features">
        <div class="feature-item">
          <span class="feature-icon"><i class="fas fa-comments"></i></span>
          <span class="feature-text">Soundbites únicos para tu marca</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon"><i class="fas fa-tags"></i></span>
          <span class="feature-text">Taglines memorables y efectivos</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon"><i class="fas fa-bolt"></i></span>
          <span class="feature-text">Soundbites y taglines optimizados para conversión</span>
        </div>
      </div>
      
      <button 
        @click="handleGenerate" 
        :disabled="isGenerating"
        class="btn btn-generate"
      >
        <span v-if="isGenerating">
          <i class="fas fa-spinner fa-spin"></i>
          Generando soundbites y taglines...
        </span>
        <span v-else>
          <i class="fas fa-magic"></i>
          Generar Soundbites y Taglines Ahora
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.generate-section {
  margin-bottom: 2rem;
}

.generate-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

.generate-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
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

.generate-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .feature-icon {
    width: 3rem;
    height: 3rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .feature-text {
    font-weight: 600;
    color: #1e293b;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-generate {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}
</style>