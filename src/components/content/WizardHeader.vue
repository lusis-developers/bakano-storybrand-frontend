<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <header class="wizard-header">
    <button @click="goBack" class="back-btn">
      ← Volver al Dashboard
    </button>
    
    <div class="wizard-title">
      <h1>Crear Contenido</h1>
      <p>Completa la información paso a paso para generar contenido personalizado</p>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba($BAKANO-DARK, 0.08);
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  position: relative;
  overflow: hidden;

  // Decoración de fondo
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
    background: linear-gradient(135deg, rgba($BAKANO-PINK, 0.05) 0%, rgba($BAKANO-PURPLE, 0.05) 100%);
    z-index: 0;
  }

  >* {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 12px;
  color: $BAKANO-PURPLE;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: $BAKANO-PURPLE;
    color: $white;
    border-color: $BAKANO-PURPLE;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.wizard-title {
  text-align: center;
  flex: 1;

  @media (max-width: 768px) {
    text-align: left;
    width: 100%;
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.75rem 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  p {
    color: rgba($BAKANO-DARK, 0.7);
    font-size: 1.1rem;
    margin: 0;
    font-weight: 400;
    line-height: 1.5;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}
</style>