import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService, type AuthResponse, type LoginRequest, type RegisterRequest, type User } from '@/services/auth.service'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Composables
  const toast = useToast()
  const router = useRouter()

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isVerified = computed(() => user.value?.isVerified ?? false)
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
  })
  const userEmail = computed(() => user.value?.email ?? '')
  const userFirstName = computed(() => user.value?.firstName ?? '')
  const userLastName = computed(() => user.value?.lastName ?? '')

  // Inicializar estado desde localStorage
  function initializeFromStorage() {
    const storedToken = authService.getAccessToken()
    const storedUser = authService.getUserData()
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = storedUser
    }
  }

  // Actions
  async function register(userData: RegisterRequest) {
    loading.value = true
    error.value = null
    
    try {
      // Validar que las contraseñas coincidan
      if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
        throw { message: 'Las contraseñas no coinciden' }
      }
      
      const response = await authService.register(userData)
      
      // Guardar datos de autenticación
      token.value = response.token
      user.value = response.user
      authService.saveAuthData(response)
      
      toast.triggerToast('Registro exitoso. Por favor verifica tu correo electrónico.', 'success')
      router.push('/login')
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al registrar usuario'
      toast.triggerToast(error.value ?? 'Error desconocido', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      
      // Guardar datos de autenticación
      token.value = response.token
      user.value = response.user
      authService.saveAuthData(response)
      
      toast.triggerToast(`Bienvenido, ${response.user.firstName} ${response.user.lastName}`, 'success')
      
      // Lógica de redirección inteligente
      if (response.user.isVerified) {
        // TODO: Verificar si el usuario ya completó el onboarding
        // Por ahora, redirigir a onboarding para nuevos usuarios
        // En el futuro, verificar onboarding_completed y redirigir a dashboard si ya está completo
        router.push('/onboarding')
      } else {
        toast.triggerToast('Por favor verifica tu cuenta para acceder a todas las funcionalidades', 'info')
        router.push('/')
      }
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión'
      toast.triggerToast(error.value ?? 'Error desconocido', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyUser(verificationToken: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.verifyUser(verificationToken)
      
      // Si el usuario actual es el mismo que se está verificando, actualizar su estado
      if (user.value && user.value._id === response.user._id) {
        user.value = response.user
        // Actualizar en localStorage
        localStorage.setItem('user_data', JSON.stringify(response.user))
      }
      
      toast.triggerToast('Cuenta verificada correctamente', 'success')
      
      // Redirigir al onboarding después de la verificación exitosa
      router.push('/onboarding')
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al verificar usuario'
      toast.triggerToast(error.value ?? 'Error desconocido', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resendVerification(email: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.resendVerification(email)
      toast.triggerToast(response.message || 'Email de verificación reenviado', 'success')
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al reenviar verificación'
      toast.triggerToast(error.value ?? 'Error desconocido', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    // Limpiar estado
    user.value = null
    token.value = null
    
    // Limpiar localStorage
    authService.logout()
    
    toast.triggerToast('Has cerrado sesión', 'info')
    router.push('/login')
  }

  // Listener para manejar token expirado
  function setupTokenExpirationListener() {
    window.addEventListener('auth:token-expired', () => {
      // Limpiar estado sin mostrar toast (ya que es automático)
      user.value = null
      token.value = null
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      
      // Redirigir al login
      router.push('/login')
    })
  }

  // Inicializar al crear el store
  initializeFromStorage()
  setupTokenExpirationListener()

  return {
    // Estado
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isVerified,
    userName,
    userEmail,
    userFirstName,
    userLastName,
    
    // Actions
    register,
    login,
    logout,
    verifyUser,
    resendVerification,
    initializeFromStorage
  }
})