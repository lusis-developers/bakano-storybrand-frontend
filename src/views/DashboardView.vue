<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useBusinessStore } from '@/stores/business.store'
import { useContentStore } from '@/stores/content.store'
import { useScriptsStore } from '@/stores/scripts.store'
import { useIntegrationStore } from '@/stores/integration.store'
import { useToast } from '@/composables/useToast'
import ContentService from '@/services/content.service'

// Composables
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const businessStore = useBusinessStore()
const contentStore = useContentStore()
const scriptsStore = useScriptsStore()
const integrationStore = useIntegrationStore()
const { triggerToast } = useToast()
const router = useRouter()

// Estado local
const isLoading = ref(true)
const hasExistingContent = ref(false)
const existingContentId = ref<string | null>(null)
const userStatistics = ref<{
  totalBusinesses: number
  totalScripts: number
  scriptsByType: {
    content: number
    ad: number
  }
  scriptsByPlatform: Record<string, number>
  businesses: Array<{
    businessId: string
    businessName: string
    totalScripts: number
    contentScripts: number
    adScripts: number
  }>
} | null>(null)

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

  await initializeDashboard()
})

const initializeDashboard = async () => {
  try {
    isLoading.value = true

    // Cargar datos necesarios
    await Promise.all([
      businessStore.fetchBusinesses(),
      loadUserStatistics()
    ])

    // Verificar si ya existe contenido generado
    if (businessStore.businesses && businessStore.businesses.length > 0) {
      const businessId = businessStore.businesses[0].id
      await contentStore.fetchContentByBusiness(businessId)

      // Cargar actividad de Instagram (últimos 10 posts + insights)
      try {
        await integrationStore.loadInstagramPosts(businessId, 10)
        // Si falta la integración, notificar y redirigir a la página de negocios
        if (integrationStore.igIntegrationMissing) {
          triggerToast('Para una mejor experiencia, integra tus redes sociales (Facebook e Instagram). Te llevamos a la página de negocios para conectar.', 'info')
          router.push('/business')
        }
      } catch (e) {
        console.warn('No se pudo cargar actividad de Instagram:', e)
      }

      if (contentStore.currentContent && contentStore.currentContent._id) {
        hasExistingContent.value = true
        existingContentId.value = contentStore.currentContent._id
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    triggerToast('Error al cargar el dashboard', 'error')
  } finally {
    isLoading.value = false
  }
}

// Totales derivados de Instagram para el Resumen de Actividad
const igTotalPosts = computed(() => integrationStore.instagramTotalPosts)
const igTotalReach = computed(() => integrationStore.instagramTotalReach)
const igTotalEngagement = computed(() => integrationStore.instagramTotalEngagement)

// Funciones
const loadUserStatistics = async () => {
  try {
    const response = await ContentService.getUserScriptStatistics()
    userStatistics.value = response.statistics
  } catch (error) {
    console.error('Error loading user statistics:', error)
    userStatistics.value = {
      totalBusinesses: 0,
      totalScripts: 0,
      scriptsByType: { content: 0, ad: 0 },
      scriptsByPlatform: {},
      businesses: []
    }
  }
}

/**
 * Maneja la navegación al wizard de creación de soundbites o a los resultados existentes
 */
function handleCreateContent() {
  try {
    // Verificar que el usuario tenga al menos un negocio
    if (!businessStore.businesses || businessStore.businesses.length === 0) {
      triggerToast('Primero debes crear un negocio antes de generar soundbites', 'error')
      router.push('/business')
      return
    }

    const selectedBusiness = businessStore.businesses[0]

    // Si ya existe contenido, redirigir a los resultados
    if (hasExistingContent.value && existingContentId.value) {
      router.push(`/content/results/${existingContentId.value}`)
    } else {
      // Si no existe contenido, ir al wizard
      router.push(`/content/wizard/${selectedBusiness.id}`)
    }

  } catch (error: any) {
    console.error('Error al navegar:', error)
    triggerToast('Error al acceder a los soundbites', 'error')
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

// Limpieza: se elimina la simulación del Asesor IA dentro del dashboard.
// El acceso ahora se realiza mediante un RouterLink hacia la ruta /advisor.
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
              <p>Tu configuración inicial ha sido completada exitosamente. Ahora puedes comenzar a crear soundbites increíbles para tu marca.</p>
              
              <div class="quick-actions">
                <button 
                  @click="handleCreateContent" 
                  class="action-btn primary"
                >
                  <div class="action-icon">
                    <i :class="hasExistingContent ? 'fas fa-eye' : 'fas fa-edit'"></i>
                  </div>
                  <div class="action-content">
                    <h3>{{ hasExistingContent ? 'Ver Soundbites' : 'Crear Soundbites' }}</h3>
                    <p>{{ hasExistingContent ? 'Revisa tus soundbites generados' : 'Genera soundbites para tu marca' }}</p>
                  </div>
                </button>
                
                <button @click="router.push('/business')" class="action-btn">
                  <div class="action-icon"><i class="fas fa-building"></i></div>
                  <div class="action-content">
                    <h3>Gestionar Negocios</h3>
                    <p>Administra tus negocios</p>
                  </div>
                </button>
                
                <button class="action-btn" @click="router.push('/social/manager')" title="Gestionar Redes Sociales">
                  <div class="action-icon"><i class="fas fa-share-nodes"></i></div>
                  <div class="action-content">
                    <h3>Gestionar Redes Sociales</h3>
                    <p>Programa y publica en Facebook e Instagram</p>
                  </div>
                </button>
                
                <!-- Nueva acción rápida: Asesor IA 24/7 -->
                <RouterLink class="action-btn" to="/advisor" title="Asesor IA 24/7">
                  <div class="action-icon"><i class="fas fa-comments"></i></div>
                  <div class="action-content">
                    <h3>Asesor IA 24/7</h3>
                    <p>Chatea y consulta métricas</p>
                  </div>
                </RouterLink>
              </div>
            </div>
          </section>

          <!-- Stats Section -->
          <section class="stats-section">
            <h2>Resumen de Actividad</h2>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                <div class="stat-content">
                  <h3>{{ userStatistics?.totalScripts || 0 }}</h3>
                  <p>Scripts Creados</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-building"></i></div>
                <div class="stat-content">
                  <h3>{{ userStatistics?.totalBusinesses || 0 }}</h3>
                  <p>Negocios Registrados</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                <div class="stat-content">
                  <h3>{{ userStatistics?.scriptsByType.content || 0 }}</h3>
                  <p>Scripts de Contenido</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-bullhorn"></i></div>
                <div class="stat-content">
                  <h3>{{ userStatistics?.scriptsByType.ad || 0 }}</h3>
                  <p>Scripts de Anuncios</p>
                </div>
              </div>

              <!-- Métricas de Instagram (últimos 10 posts) -->
              <div class="stat-card">
                <div class="stat-icon"><i class="fab fa-instagram"></i></div>
                <div class="stat-content">
                  <h3>{{ igTotalPosts || 0 }}</h3>
                  <p>Posts de Instagram</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-content">
                  <h3>{{ igTotalReach || 0 }}</h3>
                  <p>Alcance (últimos 10)</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-heart"></i></div>
                <div class="stat-content">
                  <h3>{{ igTotalEngagement || 0 }}</h3>
                  <p>Engagement (últimos 10)</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity -->
          <section class="activity-section">
            <h2>Actividad Reciente</h2>
            
            <div class="activity-card">
              <div v-if="!hasExistingContent" class="empty-state">
                <div class="empty-icon"><i class="fas fa-rocket"></i></div>
                <h3>¡Todo listo para comenzar!</h3>
                <p>Has completado tu configuración inicial. Comienza creando tus primeros soundbites.</p>
                <button 
                  @click="handleCreateContent" 
                  class="btn btn-primary"
                >
                  Crear Primeros Soundbites
                </button>
              </div>
              
              <div v-else class="existing-content-state">
                <div class="content-icon"><i class="fas fa-check-circle"></i></div>
                <h3>¡Soundbites generados!</h3>
                <p>Ya tienes soundbites creados para tu marca. Puedes revisarlos o generar nuevos soundbites.</p>
                <div class="content-actions">
                  <button 
                    @click="handleCreateContent" 
                    class="btn btn-primary"
                  >
                    Ver Soundbites Actuales
                  </button>
                  <button 
                     @click="router.push(`/content/wizard/${businessStore.businesses[0]?.id}`)"
                     class="btn btn-outline"
                   >
                     Generar Nuevos Soundbites
                   </button>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Se elimina el bloque del Asesor IA 24/7 del dashboard.
               Ahora se ofrece como una vista dedicada accesible desde las acciones rápidas. -->
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
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: $BAKANO-DARK;
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
  color: $BAKANO-DARK;
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
  border-top: 4px solid $BAKANO-PINK;
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
    background: white;
    color: $BAKANO-DARK;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e2e8f0;

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
      color: #64748b;
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
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: $BAKANO-DARK;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:link,
  &:visited,
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    outline: none;
  }

  &:hover:not(:disabled) {
    background: #f8fafc;
    transform: translateY(-2px);
  }

  &.primary {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
}

.action-icon {
  font-size: 1.5rem;
  color: $BAKANO-PINK;

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
    color: #64748b;
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
    color: $BAKANO-DARK;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

// Aviso de integración faltante
// (El aviso de integración faltante fue removido; solo se muestra un toast y se redirige a /business)

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
    color: $BAKANO-DARK;
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
    color: $BAKANO-DARK;
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
    color: $BAKANO-DARK;
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

.existing-content-state {
  text-align: center;

  .content-icon {
    font-size: 3rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $BAKANO-DARK;
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

  .content-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;

    @media (max-width: 480px) {
      flex-direction: column;
      align-items: center;
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
  background: $BAKANO-PINK;
  color: white;

  &:hover {
    transform: translateY(-1px);
    background: darken($BAKANO-PINK, 6%);
    box-shadow: 0 6px 14px rgba(230, 40, 92, 0.18);
  }
}

.btn-outline {
  background: transparent;
  color: $BAKANO-PINK;
  border: 1px solid $BAKANO-PINK;

  &:hover {
    background: $BAKANO-PINK;
    color: white;
  }
}

// Limpieza: se removieron estilos de la sección del Asesor IA ya que ahora es una vista independiente.
</style>