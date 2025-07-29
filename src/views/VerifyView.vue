<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Estado local
const isVerifying = ref(false)
const verificationStatus = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('')
const successMessage = ref('')

// Función para verificar el token
const verifyToken = async (token: string) => {
  isVerifying.value = true
  verificationStatus.value = 'pending'
  
  try {
    const response = await authStore.verifyUser(token)
    verificationStatus.value = 'success'
    successMessage.value = response.message || 'Tu cuenta ha sido verificada exitosamente'
    
    // Redirigir después de 3 segundos
    setTimeout(() => {
      if (authStore.isAuthenticated) {
        router.push('/')
      } else {
        router.push('/login')
      }
    }, 3000)
    
  } catch (error: any) {
    verificationStatus.value = 'error'
    errorMessage.value = error.message || 'Error al verificar la cuenta. El token puede haber expirado.'
  } finally {
    isVerifying.value = false
  }
}

// Función para reenviar verificación
const resendVerification = async () => {
  if (!authStore.userEmail) {
    toast.triggerToast('No se pudo obtener el email del usuario', 'error')
    return
  }
  
  try {
    await authStore.resendVerification(authStore.userEmail)
    toast.triggerToast('Email de verificación reenviado', 'success')
  } catch (error: any) {
    toast.triggerToast(error.message || 'Error al reenviar verificación', 'error')
  }
}

// Verificar token al montar el componente
onMounted(() => {
  const token = route.params.token as string
  
  if (!token) {
    verificationStatus.value = 'error'
    errorMessage.value = 'Token de verificación no encontrado'
    return
  }
  
  verifyToken(token)
})
</script>

<template>
  <div class="verify-container">
    <div class="verify-card">
      <!-- Header -->
      <div class="verify-header">
        <div class="logo">
          <h1>Bakano StoryBrand</h1>
        </div>
      </div>

      <!-- Content -->
      <div class="verify-content">
        <!-- Loading State -->
        <div v-if="isVerifying" class="verify-state loading">
          <div class="spinner"></div>
          <h2>Verificando tu cuenta...</h2>
          <p>Por favor espera mientras procesamos tu verificación.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verificationStatus === 'success'" class="verify-state success">
          <div class="icon success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>¡Cuenta verificada!</h2>
          <p>{{ successMessage }}</p>
          <p class="redirect-message">Serás redirigido automáticamente en unos segundos...</p>
          
          <div class="action-buttons">
            <button 
              @click="router.push(authStore.isAuthenticated ? '/' : '/login')"
              class="btn btn-primary"
            >
              {{ authStore.isAuthenticated ? 'Ir al Dashboard' : 'Ir al Login' }}
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="verificationStatus === 'error'" class="verify-state error">
          <div class="icon error-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <h2>Error de verificación</h2>
          <p>{{ errorMessage }}</p>
          
          <div class="action-buttons">
            <button 
              v-if="authStore.isAuthenticated"
              @click="resendVerification"
              class="btn btn-secondary"
            >
              Reenviar verificación
            </button>
            <button 
              @click="router.push('/login')"
              class="btn btn-primary"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="verify-footer">
        <p>¿Necesitas ayuda? <a href="https://wa.me/17633524852" target="_blank">Contacta soporte por WhatsApp</a></p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.verify-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 28rem;
  overflow: hidden;
}

.verify-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  
  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.verify-content {
  padding: 2rem;
}

.verify-state {
  text-align: center;
  
  h2 {
    margin: 1rem 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  p {
    margin: 0.5rem 0;
    color: #6b7280;
    line-height: 1.5;
  }
  
  .redirect-message {
    font-size: 0.875rem;
    font-style: italic;
    margin-top: 1rem;
  }
}

.icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 4rem;
  }
  
  &.success-icon {
    color: #10b981;
  }
  
  &.error-icon {
    color: #ef4444;
  }
}

.spinner {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  }
}

.verify-footer {
  background: #f9fafb;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  a {
    color: #667eea;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// Mobile responsiveness
@media (max-width: 640px) {
  .verify-container {
    padding: 0.5rem;
  }
  
  .verify-header {
    padding: 1.5rem;
    
    .logo h1 {
      font-size: 1.25rem;
    }
  }
  
  .verify-content {
    padding: 1.5rem;
  }
  
  .verify-state h2 {
    font-size: 1.25rem;
  }
  
  .icon {
    width: 3rem;
    height: 3rem;
    
    i {
      font-size: 3rem;
    }
  }
  
  .spinner {
    width: 3rem;
    height: 3rem;
  }
}
</style>