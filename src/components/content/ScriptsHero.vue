<script setup lang="ts">
const props = defineProps({
  contentId: {
    type: String,
    required: true
  },
  hasSoundbites: {
    type: Boolean,
    required: true
  },
  hasTaglines: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  scrollToScripts: []
  navigateToScripts: []
}>()

const handleScrollToScripts = () => {
  emit('scrollToScripts')
}

const handleNavigateToScripts = () => {
  emit('navigateToScripts')
}
</script>

<template>
  <section id="scripts-section" class="scripts-hero">
    <div class="scripts-hero-content">
      <div class="scripts-hero-header">
        <h2><i class="fas fa-video"></i> ¡Gestiona tus Scripts de Contenido!</h2>
        <p>Crea, edita y organiza scripts de video, anuncios y contenido usando tus soundbites y taglines para diferentes plataformas</p>
      </div>
      
      <div class="scripts-features">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fab fa-youtube"></i>
            </div>
            <h3>Videos de YouTube</h3>
            <p>Scripts optimizados para engagement y retención</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fab fa-instagram"></i>
            </div>
            <h3>Contenido de Instagram</h3>
            <p>Posts y stories que conectan con tu audiencia</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-bullhorn"></i>
            </div>
            <h3>Anuncios Publicitarios</h3>
            <p>Copy persuasivo que convierte visitantes en clientes</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <h3>Email Marketing</h3>
            <p>Campañas que generan apertura y acción</p>
          </div>
        </div>
      </div>
      
      <div class="scripts-actions">
        <button 
          @click="handleNavigateToScripts"
          class="btn btn-primary btn-large"
          :disabled="!hasSoundbites || !hasTaglines"
        >
          <i class="fas fa-cogs"></i>
          Ir a Gestión de Scripts
        </button>
        
        <p v-if="!hasSoundbites || !hasTaglines" class="requirement-note">
          <i class="fas fa-info-circle"></i>
          Necesitas generar soundbites y taglines primero
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.scripts-hero {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(135deg, $BAKANO-PURPLE 0%, darken($BAKANO-PURPLE, 15%) 100%);
  color: $white;
  padding: 2rem 1rem;
  margin: 2rem 0;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 3rem 1.5rem;
    margin: 3rem 0;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    pointer-events: none;
  }
}

.scripts-hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.scripts-hero-header {
  margin-bottom: 3rem;

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
      font-size: 2rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    i {
      color: $BAKANO-PINK;
    }
  }

  p {
    font-size: 1.25rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }
}

.scripts-features {
  margin-bottom: 3rem;
}

.feature-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    flex: 1 1 240px;
    padding: 2rem 1.5rem;
  }

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: $BAKANO-PINK;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
}

.feature-card p {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
}

.scripts-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.btn-large {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: $BAKANO-PINK;
  color: $white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba($BAKANO-PINK, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($BAKANO-PINK, 0.4);
    background: darken($BAKANO-PINK, 10%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (min-width: 768px) {
    padding: 1rem 2.5rem;
    font-size: 1.125rem;
  }
}

.requirement-note {
  font-size: 0.875rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  i {
    color: $BAKANO-PINK;
  }
}
</style>
