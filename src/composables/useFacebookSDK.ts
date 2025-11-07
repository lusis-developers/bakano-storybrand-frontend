import { ref, readonly } from 'vue'

const isSDKLoaded = ref(false)
const isLoadingSDK = ref(false)

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID

/**
 * Carga e inicializa el SDK de Facebook de forma asíncrona.
 * Es idempotente, lo que significa que solo se ejecutará una vez.
 * @returns {Promise<void>}
 */
const loadAndInitSDK = (): Promise<void> => {
  // Si ya se está cargando o ya se cargó, no hacemos nada.
  if (isSDKLoaded.value || isLoadingSDK.value) {
    return isSDKLoaded.value
      ? Promise.resolve()
      : new Promise((resolve) => {
          // Si está cargando, esperamos a que termine.
          const interval = setInterval(() => {
            if (isSDKLoaded.value) {
              clearInterval(interval)
              resolve()
            }
          }, 100)
        })
  }

  isLoadingSDK.value = true

  return new Promise((resolve, reject) => {
    // Definimos la función global que el SDK llamará cuando esté listo.
    ;(window as any).fbAsyncInit = function () {
      ;(window as any).FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true, // Habilita las cookies para permitir al servidor acceder a la sesión
        xfbml: true, // Parsea plugins sociales en esta página
        version: 'v24.0', // Es crucial especificar una versión del API
      })

      isSDKLoaded.value = true
      isLoadingSDK.value = false
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
        reject(new Error('No se pudo cargar el SDK de Facebook.'))
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
      throw error.value
    }

    return new Promise<string>((resolve, reject) => {
      console.log(
        `%c[FACEBOOK SDK] Solicitando login con permisos:`,
        'color: #3b5998; font-weight: bold;',
        permissions.join(', '),
      )
      ;(window as any).FB.login(
        (response: any) => {
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
            const errorMessage = 'El usuario canceló el login o no autorizó completamente.'
            error.value = errorMessage
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
