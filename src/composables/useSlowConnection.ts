import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface NetworkInformation extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

export function useSlowConnection() {
  const isSlowConnection = ref(false)
  const showSlowWarning = ref(false)
  const router = useRouter()
  
  let navigationStartTime = 0
  let navigationTimeout: number | null = null
  
  // Detectar conexión lenta basada en Network Information API
  const checkNetworkSpeed = (): boolean => {
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    
    if (connection) {
      // Considerar conexión lenta si es 2g, 3g lento o downlink muy bajo
      const slowTypes = ['slow-2g', '2g']
      const is3gSlow = connection.effectiveType === '3g' && (connection.downlink || 0) < 1.5
      
      return slowTypes.includes(connection.effectiveType || '') || is3gSlow
    }
    
    return false
  }
  
  // Mostrar warning por tiempo de navegación excesivo
  const startNavigationTimer = () => {
    navigationStartTime = Date.now()
    
    // Si la navegación toma más de 3 segundos, mostrar warning
    navigationTimeout = setTimeout(() => {
      if (!showSlowWarning.value) {
        showSlowWarning.value = true
      }
    }, 3000)
  }
  
  // Limpiar timer cuando la navegación termine
  const clearNavigationTimer = () => {
    if (navigationTimeout) {
      clearTimeout(navigationTimeout)
      navigationTimeout = null
    }
    
    // Ocultar warning después de un tiempo si la navegación fue exitosa
    if (showSlowWarning.value) {
      setTimeout(() => {
        showSlowWarning.value = false
      }, 2000)
    }
  }
  
  // Ocultar warning manualmente
  const hideSlowWarning = () => {
    showSlowWarning.value = false
    clearNavigationTimer()
  }
  
  // Detectar cambios en la conexión
  const handleConnectionChange = () => {
    isSlowConnection.value = checkNetworkSpeed()
  }
  
  onMounted(() => {
    // Verificar conexión inicial
    isSlowConnection.value = checkNetworkSpeed()
    
    // Escuchar cambios en la conexión
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }
    
    // Escuchar cambios de ruta para detectar navegación lenta
    const unsubscribe = router.beforeEach((to, from, next) => {
      if (from.name && to.name !== from.name) {
        startNavigationTimer()
      }
      next()
    })
    
    router.afterEach(() => {
      clearNavigationTimer()
    })
    
    // Guardar función de limpieza
    ;(router as any)._slowConnectionUnsubscribe = unsubscribe
  })
  
  onUnmounted(() => {
    // Limpiar listeners
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange)
    }
    
    clearNavigationTimer()
    
    // Limpiar router guard si existe
    if ((router as any)._slowConnectionUnsubscribe) {
      (router as any)._slowConnectionUnsubscribe()
    }
  })
  
  return {
    isSlowConnection,
    showSlowWarning,
    hideSlowWarning,
    startNavigationTimer,
    clearNavigationTimer
  }
}