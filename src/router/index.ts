import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { showSlowWarning, hideSlowConnectionWarning } from '@/services/httpBase'
import { ref } from 'vue'

// Estado para tracking de navegación
let navigationStartTime = 0
let navigationTimer: number | null = null
const isNavigating = ref(false)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (navegación con botones del navegador), usarla
    if (savedPosition) {
      return savedPosition
    }
    // Para todas las demás navegaciones, ir al top
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/pay-response',
      name: 'pay-response',
      component: () => import('../views/PayResponseView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/PricingView.vue'),
      meta: { public: true },
    },
    {
      path: '/pricing/:slug',
      name: 'plan',
      component: () => import('../views/PlanView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/verify/:token',
      name: 'verify',
      component: () => import('../views/VerifyView.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/business',
      name: 'business-management',
      component: () => import('../views/BusinessManagementView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/content/wizard/:businessId?',
      name: 'content-wizard',
      component: () => import('../views/ContentWizardView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/content/results/:contentId',
      name: 'content-results',
      component: () => import('../views/ContentResultsView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/content/scripts/:contentId',
      name: 'content-scripts',
      component: () => import('../views/ScriptsView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/instagram-connect',
      name: 'instagram-connect',
      component: () => import('../views/Integrations/InstagramConnection.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/social/manager',
      name: 'social-manager',
      component: () => import('../views/SocialManagerView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/advisor',
      name: 'advisor',
      component: () => import('../views/AdvisorView/index.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
    {
      path: '/create-password/:token',
      name: 'create-password',
      component: () => import('../views/CreatePasswordView.vue'),
      meta: { public: true },
    },
    {
      path: '/accept-invite/:businessId',
      name: 'accept-invite',
      component: () => import('../views/AcceptInviteView.vue'),
      meta: { public: true },
    },
    {
      path: '/team/invitations',
      name: 'pending-invitations',
      component: () => import('../views/PendingInvitationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inspiration/instagram-viral',
      name: 'instagram-viral',
      component: () => import('../views/InstagramViralInspirationView.vue'),
      meta: { requiresAuth: true, requiresVerified: true },
    },
  ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  // Iniciar tracking de navegación lenta
  navigationStartTime = Date.now()
  isNavigating.value = true

  // Configurar timer para detectar navegación lenta (3 segundos)
  if (navigationTimer) {
    clearTimeout(navigationTimer)
  }

  navigationTimer = setTimeout(() => {
    if (isNavigating.value && !showSlowWarning.value) {
      // Mostrar aviso de conexión lenta si la navegación toma más de 3 segundos
      const duration = Date.now() - navigationStartTime
      if (duration >= 3000) {
        showSlowWarning.value = true
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
          showSlowWarning.value = false
        }, 5000)
      }
    }
  }, 3000)
  const authStore = useAuthStore()

  // Rutas que requieren estar deslogueado (guest)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Rutas que requieren verificación
  if (to.meta.requiresVerified && authStore.isAuthenticated && !authStore.isVerified) {
    // Si el usuario está intentando acceder al onboarding o dashboard sin verificar,
    // redirigir al login solo si no está en una ruta de verificación
    if (to.name !== 'verify') {
      next('/login')
      return
    }
  }

  // Verificar onboarding completado para rutas específicas
  if (authStore.isAuthenticated && authStore.isVerified) {
    try {
      const { onboardingService } = await import('@/services/onboarding.service')
      const onboardingResponse = await onboardingService.getOnboarding()
      const isOnboardingCompleted = onboardingResponse.onboarding.preferences?.onboardingCompleted

      // Si el usuario intenta acceder al onboarding pero ya lo completó, redirigir al dashboard
      if (to.name === 'onboarding' && isOnboardingCompleted) {
        next('/dashboard')
        return
      }

      // Si el usuario intenta acceder al dashboard pero no ha completado el onboarding, redirigir al onboarding
      if (to.name === 'dashboard' && !isOnboardingCompleted) {
        next('/onboarding')
        return
      }
    } catch (onboardingError: any) {
      // Si no existe onboarding (404) y está intentando acceder al dashboard, redirigir al onboarding
      if (onboardingError.status === 404 && to.name === 'dashboard') {
        next('/onboarding')
        return
      }
      // Para otros errores o si está accediendo al onboarding, continuar normalmente
    }
  }

  next()
})

// Interceptor después de cada navegación exitosa
router.afterEach((to, from) => {
  // Limpiar estado de navegación
  isNavigating.value = false

  // Limpiar timer si existe
  if (navigationTimer) {
    clearTimeout(navigationTimer)
    navigationTimer = null
  }

  // Calcular duración total de navegación
  const navigationDuration = Date.now() - navigationStartTime

  // Si la navegación tomó más de 3 segundos, mostrar aviso brevemente
  if (navigationDuration >= 3000 && !showSlowWarning.value) {
    showSlowWarning.value = true
    // Auto-ocultar después de 3 segundos para navegaciones completadas
    setTimeout(() => {
      showSlowWarning.value = false
    }, 3000)
  }
})

// Interceptor para errores de navegación
router.onError((error) => {
  // Limpiar estado de navegación en caso de error
  isNavigating.value = false

  if (navigationTimer) {
    clearTimeout(navigationTimer)
    navigationTimer = null
  }

  console.error('Error de navegación:', error)
})

export default router
