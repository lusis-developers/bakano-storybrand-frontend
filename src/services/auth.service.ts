import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { User } from '@/types/user.types'

// Interfaces para tipado fuerte
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword?: string
  birthDate?: string
  role?: 'admin' | 'client'
  cedula?: string
  address?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

// Nota: El tipo User se centraliza en src/types/user.types.ts para escalabilidad
export type { User } from '@/types/user.types'

export interface AuthResponse {
  user: User
  token?: string
  refreshToken?: string
  expiresIn?: number
}

export interface VerifyResponse {
  message: string
  user: User
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ApiError {
  status: number
  message: string
}

class AuthService extends APIBase {
  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.post<AuthResponse>(
        'auth/register',
        userData,
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.post<AuthResponse>(
        'auth/login',
        credentials,
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Verifica el token de usuario
   */
  async verifyUser(token: string): Promise<VerifyResponse> {
    try {
      const response: AxiosResponse<VerifyResponse> = await this.get<VerifyResponse>(
        `auth/verify/${token}`,
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Solicita recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.post<{ message: string }>(
        'auth/forgot-password',
        { email },
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Restablece la contraseña
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.post<{ message: string }>(
        'auth/set-password',
        resetData,
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.post<{ message: string }>(
        'auth/change-password',
        passwordData,
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.post<AuthResponse>(
        'auth/refresh-token',
        { refreshToken },
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.post<{ message: string }>(
        'auth/resend-verification',
        { email },
      )
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * Cierra sesión del usuario (limpia tokens locales)
   */
  logout(): void {
    console.log('🔍 DEBUG - Clearing localStorage tokens')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
  }

  /**
   * Limpia tokens corruptos del localStorage
   */
  clearCorruptedTokens(): void {
    const token = localStorage.getItem('access_token')

    if (token && (token.includes('undefined') || token.includes('null') || token.length < 10)) {
      console.log('❌ DEBUG - Found corrupted token, clearing localStorage')
      this.logout()
    }
  }

  /**
   * Guarda los datos de autenticación en localStorage
   */
  saveAuthData(authResponse: AuthResponse): void {
    // Verificar si existe el token antes de procesarlo
    if (authResponse.token) {
      // El backend devuelve el token con 'Bearer ' incluido, necesitamos extraer solo el token
      const cleanToken = authResponse.token.startsWith('Bearer ')
        ? authResponse.token.substring(7)
        : authResponse.token

      console.log('🔍 DEBUG - Token received from backend:', authResponse.token)
      console.log('🔍 DEBUG - Clean token to save:', cleanToken)

      localStorage.setItem('access_token', cleanToken)
      if (authResponse.refreshToken) {
        localStorage.setItem('refresh_token', authResponse.refreshToken)
      }
    }

    localStorage.setItem('user_data', JSON.stringify(authResponse.user))
  }

  /**
   * Obtiene los datos del usuario desde localStorage
   */
  getUserData(): AuthResponse['user'] | null {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    const userData = this.getUserData()
    return !!(token && userData)
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }
}

// Exportamos una instancia singleton del servicio
export const authService = new AuthService()
export default authService
