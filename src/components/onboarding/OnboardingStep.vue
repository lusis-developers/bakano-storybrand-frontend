<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: '📝',
  isLoading: false
})
</script>

<template>
  <div class="onboarding-step">
    <!-- Step Header -->
    <div class="step-header">
      <div class="step-icon">
        {{ icon }}
      </div>
      
      <div class="step-info">
        <h2 class="step-title">{{ title }}</h2>
        <p v-if="subtitle" class="step-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    
    <!-- Step Content -->
    <div class="step-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Procesando información...</p>
      </div>
      
      <div v-else class="content-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.onboarding-step {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
}

// Step Header
.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
}

.step-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.step-info {
  flex: 1;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
}

.step-subtitle {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
}

// Step Content
.step-content {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  
  p {
    margin-top: 1rem;
    color: #64748b;
    font-size: 0.875rem;
  }
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-wrapper {
  // Estilos para el contenido del slot
  :deep(.form-group) {
    margin-bottom: 1.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(.form-label) {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  :deep(.form-input) {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    &::placeholder {
      color: #9ca3af;
    }
  }
  
  :deep(.form-textarea) {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    min-height: 100px;
    resize: vertical;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    &::placeholder {
      color: #9ca3af;
    }
  }
  
  :deep(.form-select) {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
  
  :deep(.form-error) {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  :deep(.form-help) {
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
}
</style>