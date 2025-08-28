<template>
  <div v-if="visible" class="alert-overlay" @click="handleOverlayClick">
    <div class="alert-container" @click.stop>
      <div class="alert-header">
        <div class="alert-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="alert-content">
        <h3 class="alert-title">Límite de Negocios Alcanzado</h3>
        <p class="alert-message">
          Actualmente tienes un negocio activo. Pronto podrás crear múltiples negocios, 
          pero por ahora tienes un negocio habilitado.
        </p>
      </div>
      
      <div class="alert-actions">
        <button class="btn-primary" @click="$emit('close')">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();

const handleOverlayClick = () => {
  // Cerrar al hacer clic fuera de la alerta
};
</script>

<style scoped lang="scss">
@use 'sass:color';
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.alert-container {
  background: $white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
}

.alert-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: $alert-warning-bg;
  color: $alert-warning;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 24px;
  }
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 16px;
  }

  &:hover {
    background-color: #f3f4f6;
    color: #6b7280;
  }
}

.alert-content {
  padding: 20px 24px;
}

.alert-title {
  font-size: 20px;
  font-weight: 600;
  color: $BAKANO-DARK;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.alert-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.alert-actions {
  padding: 0 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: color.adjust($BAKANO-PINK, $lightness: -10%);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .alert-container {
    margin: 20px;
    max-width: none;
  }

  .alert-header,
  .alert-content,
  .alert-actions {
    padding-left: 20px;
    padding-right: 20px;
  }

  .alert-title {
    font-size: 18px;
  }

  .alert-message {
    font-size: 14px;
  }
}
</style>