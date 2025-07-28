import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'

// Interfaces para tipado fuerte
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
  token: string
  refreshToken?: string
}

export interface VerifyResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
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
        userData
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
        credentials
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
        `auth/verify/${token}`
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
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
  }

  /**
   * Guarda los datos de autenticación en localStorage
   */
  saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.token)
    if (authResponse.refreshToken) {
      localStorage.setItem('refresh_token', authResponse.refreshToken)
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