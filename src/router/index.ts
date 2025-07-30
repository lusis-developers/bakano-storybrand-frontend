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

  next()
})

export default router
