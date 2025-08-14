import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
      path: '/content/wizard/:businessId',
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
  ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Rutas que requieren estar deslogueado (guest)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
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
    // redirigir al home solo si no está en una ruta de verificación
    if (to.name !== 'verify') {
      next('/')
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

export default router
