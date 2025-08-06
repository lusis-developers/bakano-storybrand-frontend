<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useRouter } from 'vue-router'

// Composables
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const router = useRouter()

// Estado local
const isLoading = ref(true)

// Verificar autenticación al montar
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!authStore.isVerified) {
    router.push('/')
    return
  }

  // Simular carga de datos del dashboard
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-container">

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="container">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando tu dashboard...</p>
        </div>
        
        <div v-else class="dashboard-content">
          <!-- Welcome Section -->
          <section class="welcome-section">
            <div class="welcome-card">
              <h2>¡Bienvenido, {{ authStore.userFirstName }}!</h2>
              <p>Tu configuración inicial ha sido completada exitosamente. Ahora puedes comenzar a crear contenido increíble para tu marca.</p>
              
              <div class="quick-actions">
                <button class="action-btn primary">
                  <div class="action-icon">📝</div>
                  <div class="action-content">
                    <h3>Crear Contenido</h3>
                    <p>Genera contenido para tu marca</p>
                  </div>
                </button>
                
                <button @click="router.push('/business')" class="action-btn">
                  <div class="action-icon">🏢</div>
                  <div class="action-content">
                    <h3>Gestionar Negocios</h3>
                    <p>Administra tus negocios</p>
                  </div>
                </button>
                
                <button class="action-btn">
                  <div class="action-icon">📊</div>
                  <div class="action-content">
                    <h3>Ver Análisis</h3>
                    <p>Revisa el rendimiento</p>
                  </div>
                </button>
                
                <button class="action-btn">
                  <div class="action-icon">⚙️</div>
                  <div class="action-content">
                    <h3>Configuración</h3>
                    <p>Ajusta tus preferencias</p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <!-- Stats Section -->
          <section class="stats-section">
            <h2>Resumen de Actividad</h2>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📄</div>
                <div class="stat-content">
                  <h3>0</h3>
                  <p>Contenidos Creados</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <h3>0</h3>
                  <p>Audiencia Alcanzada</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                  <h3>0%</h3>
                  <p>Tasa de Conversión</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">💡</div>
                <div class="stat-content">
                  <h3>0</h3>
                  <p>Ideas Generadas</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity -->
          <section class="activity-section">
            <h2>Actividad Reciente</h2>
            
            <div class="activity-card">
              <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <h3>¡Todo listo para comenzar!</h3>
                <p>Has completado tu configuración inicial. Comienza creando tu primer contenido.</p>
                <button class="btn btn-primary">
                  Crear Primer Contenido
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  background: $BAKANO-LIGHT;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

// Main Content
.dashboard-main {
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;

  p {
    margin-top: 1rem;
    color: #64748b;
    font-size: 1.125rem;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// Dashboard Content
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// Welcome Section
.welcome-section {
  .welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 16px;

    @media (max-width: 768px) {
      padding: 1.5rem;
      border-radius: 12px;
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;

      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
    }

    p {
      font-size: 1.125rem;
      opacity: 0.9;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &.primary {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
}

.action-icon {
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.action-content {
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }

  p {
    font-size: 0.875rem;
    opacity: 0.8;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 0.75rem;
    }
  }
}

// Stats Section
.stats-section {
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.stat-icon {
  font-size: 2rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.stat-content {
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }
}

// Activity Section
.activity-section {
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

.activity-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

.empty-state {
  text-align: center;

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }

  p {
    color: #64748b;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
}

// Buttons
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.75rem;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;

  &:hover {
    background: #667eea;
    color: white;
  }
}
</style>