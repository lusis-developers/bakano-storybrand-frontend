import { ref, readonly } from 'vue'
import { useToast } from '@/composables/useToast'

const isSDKLoaded = ref(false)
const isLoadingSDK = ref(false)

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID

/**
 * Carga e inicializa el SDK de Facebook de forma asíncrona.
 * Es idempotente, lo que significa que solo se ejecutará una vez.
 * @returns {Promise<void>}
 */
const loadAndInitSDK = (): Promise<void> => {
  const { triggerToast } = useToast()
  // Si ya se está cargando o ya se cargó, no hacemos nada.
  if (isSDKLoaded.value || isLoadingSDK.value) {
    return isSDKLoaded.value
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          // Si está cargando, esperamos a que termine, pero con timeout de seguridad.
          const start = Date.now()
          const maxWaitMs = 15000 // 15s para considerar bloqueo por navegador/adblock
          const interval = setInterval(() => {
            if (isSDKLoaded.value) {
              clearInterval(interval)
              resolve()
            } else if (Date.now() - start > maxWaitMs) {
              clearInterval(interval)
              isLoadingSDK.value = false
              triggerToast(
                'No se pudo inicializar el SDK de Facebook en el tiempo esperado. Puede ser un bloqueo del navegador o de un content blocker. Desactívalo para este sitio o intenta desde otro navegador.',
                'error',
                6000,
              )
              reject(
                new Error(
                  'No se pudo inicializar el SDK de Facebook en el tiempo esperado. Posible bloqueo del navegador o de un "content blocker". Desactiva bloqueadores para este sitio o intenta desde otro navegador.',
                ),
              )
            }
          }, 100)
        })
  }

  isLoadingSDK.value = true

  return new Promise((resolve, reject) => {
    // Definimos la función global que el SDK llamará cuando esté listo.
    let finished = false
    const timeoutMs = 15000
    const timeoutId = window.setTimeout(() => {
      if (finished) return
      finished = true
      isLoadingSDK.value = false
      const msg =
        'El SDK de Facebook demora más de lo habitual o fue bloqueado por el navegador. Desactiva bloqueadores de contenido para este sitio o usa otro navegador e inténtalo nuevamente.'
      useToast().triggerToast(msg, 'error', 6000)
      reject(
        new Error(
          'El SDK de Facebook demora más de lo habitual o fue bloqueado por el navegador. Por favor desactiva bloqueadores de contenido para este sitio o usa otro navegador e inténtalo nuevamente.',
        ),
      )
    }, timeoutMs)

    ;(window as any).fbAsyncInit = function () {
      ;(window as any).FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true, // Habilita las cookies para permitir al servidor acceder a la sesión
        xfbml: true, // Parsea plugins sociales en esta página
        version: 'v24.0', // Es crucial especificar una versión del API
      })

      isSDKLoaded.value = true
      isLoadingSDK.value = false
      finished = true
      window.clearTimeout(timeoutId)
      resolve()
    }

    // Inyectamos el script del SDK en el DOM
    ;(function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s) as HTMLScriptElement
      js.id = id
      js.src = 'https://connect.facebook.net/es_LA/sdk.js' // Usamos español latinoamericano
      js.onerror = () => {
        isLoadingSDK.value = false
        useToast().triggerToast(
          'No se pudo cargar el SDK de Facebook. Tu navegador o un content blocker podría estar impidiendo la carga. Desactiva bloqueadores para este sitio o intenta desde otro navegador.',
          'error',
          6000,
        )
        reject(
          new Error(
            'No se pudo cargar el SDK de Facebook. Es posible que tu navegador o un "content blocker" esté impidiendo la carga. Desactiva bloqueadores para este sitio o intenta desde otro navegador.',
          ),
        )
      }
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs)
      } else {
        d.body.appendChild(js)
      }
    })(document, 'script', 'facebook-jssdk')
  })
}

export function useFacebookSDK() {
  const error = ref<string | null>(null)

  /**
   * Solicita al usuario iniciar sesión y otorgar permisos.
   * @param {string[]} permissions - Un array de permisos a solicitar.
   * @returns {Promise<string>} - Una promesa que resuelve con el token de acceso.
   */
  const login = async (permissions: string[]): Promise<string> => {
    error.value = null
    try {
      await loadAndInitSDK()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de inicialización del SDK.'
      // Mostrar toast para informar al usuario
      useToast().triggerToast(String(error.value), 'error', 6000)
      throw error.value
    }

    return new Promise<string>((resolve, reject) => {
      console.log(
        `%c[FACEBOOK SDK] Solicitando login con permisos:`,
        'color: #3b5998; font-weight: bold;',
        permissions.join(', '),
      )
      // Fallback por si el diálogo de login no se abre (bloqueadores de contenido, restricciones del navegador)
      let done = false
      const loginTimeoutMs = 20000 // 20s
      const loginTimeoutId = window.setTimeout(() => {
        if (done) return
        done = true
        const errorMessage =
          'No se abrió el diálogo de Facebook Login en el tiempo esperado. Es posible que tu navegador o un bloqueador de contenido esté impidiendo la ventana de autorización. Desactiva bloqueadores para este sitio o prueba en otro navegador.'
        error.value = errorMessage
        useToast().triggerToast(errorMessage, 'error', 6000)
        reject(new Error(errorMessage))
      }, loginTimeoutMs)
      ;(window as any).FB.login(
        (response: any) => {
          if (done) return
          done = true
          window.clearTimeout(loginTimeoutId)
          console.log(
            '%c[FACEBOOK SDK] Respuesta completa de FB.login:',
            'color: #3b5998; font-weight: bold;',
            response,
          )

          if (response.status === 'connected' && response.authResponse) {
            console.log('%c[FACEBOOK SDK] ✅ Conexión exitosa.', 'color: green; font-weight: bold;')
            console.log('[FACEBOOK SDK] Token de Acceso:', response.authResponse.accessToken)
            console.log('[FACEBOOK SDK] ID de Usuario:', response.authResponse.userID)
            resolve(response.authResponse.accessToken)
          } else {
            console.error(
              '%c[FACEBOOK SDK] ❌ La conexión no fue exitosa.',
              'color: red; font-weight: bold;',
            )
            console.error('[FACEBOOK SDK] Estado recibido:', response.status)
            const errorMessage =
              'El usuario canceló el login o no autorizó completamente. Si no viste el diálogo de autorización, desactiva bloqueadores de contenido para este sitio o prueba en otro navegador.'
            error.value = errorMessage
            useToast().triggerToast(errorMessage, 'error', 6000)
            reject(new Error(errorMessage))
          }
        },
        { scope: permissions.join(',') },
      )
    })
  }

  return {
    isLoading: readonly(isLoadingSDK),
    error: readonly(error),
    login,
  }
}
