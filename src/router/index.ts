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
  ],
})

// Navigation Guards
router.beforeEach((to, from, next) => {
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

  next()
})

export default router
