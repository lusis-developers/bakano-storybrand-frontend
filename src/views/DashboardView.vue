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
import SocialMetricsPanel from '@/components/metrics/SocialMetricsPanel.vue'
import AdsMetricsPanel from '@/components/metrics/AdsMetricsPanel.vue'
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
const metricsPlatform = ref<'facebook' | 'instagram' | 'ads'>('facebook')
const panelLoading = ref(false)
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
        // Si falta la integración, mostrar un mensaje claro en el Dashboard.
        // No redirigimos automáticamente; el usuario decide cuándo ir a Gestión de Negocios.
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
              <p>Tu espacio ya está listo. Explora métricas, crea guiones y gestiona tus redes desde un solo lugar.</p>
              
              <div class="navigation-hint">
                <i class="fa-solid fa-compass"></i>
                <p>
                  <span class="hint-mobile">Para navegar usa el menú del header.</span>
                  <span class="hint-desktop">Para navegar usa el menú lateral.</span>
                </p>
              </div>
            </div>
          </section>

          <div class="metrics-toggle">
            <button
              class="toggle-btn"
              :class="{ active: metricsPlatform === 'facebook' }"
              @click="metricsPlatform = 'facebook'"
              :disabled="panelLoading"
              aria-label="Ver métricas de Facebook"
            >
              <i class="fab fa-facebook"></i>
              <span>Facebook</span>
            </button>
            <button
              class="toggle-btn"
              :class="{ active: metricsPlatform === 'instagram' }"
              @click="metricsPlatform = 'instagram'"
              :disabled="panelLoading"
              aria-label="Ver métricas de Instagram"
            >
              <i class="fab fa-instagram"></i>
              <span>Instagram</span>
            </button>
            <button
              class="toggle-btn"
              :class="{ active: metricsPlatform === 'ads' }"
              @click="metricsPlatform = 'ads'"
              :disabled="panelLoading"
              aria-label="Ver métricas de Anuncios"
            >
              <i class="fas fa-bullhorn"></i>
              <span>Anuncios</span>
            </button>
          </div>

          <SocialMetricsPanel v-if="metricsPlatform !== 'ads'" :platform="metricsPlatform" @loading-start="panelLoading = true" @loading-end="panelLoading = false" />
          <AdsMetricsPanel v-else @loading-start="panelLoading = true" @loading-end="panelLoading = false" />

          <div v-if="panelLoading" class="global-loading-overlay" aria-live="polite" aria-busy="true">
            <div class="overlay-spinner"></div>
            <p>Cargando métricas...</p>
          </div>
          
          
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
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

.metrics-toggle {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.toggle-btn.active {
  background: $BAKANO-PINK;
  border-color: $BAKANO-PINK;
  color: white;
}

.toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
      font-size: clamp(1.4rem, 4vw, 2rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: clamp(0.95rem, 2.5vw, 1.125rem);
      color: #64748b;
      margin-bottom: 2rem;
    }

    .navigation-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid rgba($BAKANO-DARK, 0.12);
      border-radius: 12px;
      background: #fff;
      color: $BAKANO-DARK;

      i {
        font-size: clamp(1rem, 3vw, 1.25rem);
      }

      p {
        margin: 0;
        font-size: clamp(0.85rem, 2.2vw, 1rem);
        font-weight: 700;
      }

      .hint-mobile {
        display: inline;
      }

      .hint-desktop {
        display: none;
      }

      @media (min-width: 768px) {
        .hint-mobile {
          display: none;
        }

        .hint-desktop {
          display: inline;
        }
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

// Aviso de integración faltante (inline, sin modal)
.integration-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff7f9;
  border: 1px solid #ffe0e9;
  color: $BAKANO-DARK;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;

  .alert-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #9a3e51;
  }

  i {
    color: $BAKANO-PINK;
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
.global-loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.overlay-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid $BAKANO-PINK;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.global-loading-overlay p {
  margin: 0;
  color: #475569;
  font-weight: 600;
}
</style>
