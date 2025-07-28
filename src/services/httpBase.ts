import axios from 'axios'
import type { AxiosResponse } from 'axios'

class APIBase {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_BAKANO_API || 'http://localhost:8100/api'
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`
  }

  protected getHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    }

    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      // TODO: create authorization token
      // headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  protected async get<T>(
    endpoint: string,
    headers?: { [key: string]: string },
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    try {
      return await axios.get<T>(url, {
        headers: headers ? headers : this.getHeaders(),
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorDetails = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
        throw errorDetails
      }

      throw { status: 500, message: 'Unknown error' }
    }
  }

  protected async post<T>(
    endpoint: string,
    data: unknown,
    headers?: { [key: string]: string },
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    const isFormData = data instanceof FormData

    const finalHeaders = headers
      ? headers
      : isFormData
        ? { ...this.getHeaders() /* omit 'Content-Type' */ }
        : this.getHeaders()

    if (isFormData) {
      delete finalHeaders['Content-Type'] // ❗️ remove it if using FormData
    }

    try {
      return await axios.post<T>(url, data, {
        headers: finalHeaders,
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
      }
      throw { status: 500, message: 'Unknown error' }
    }
  }

  protected async uploadFile<T>(endpoint: string, file: File): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    const formData = new FormData()

    if (!file) {
      throw new Error('No file provided')
    }

    formData.append('file', file)

    try {
      return await axios.post<T>(url, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorDetails = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
        throw errorDetails
      }

      throw { status: 500, message: 'Unknown error' }
    }
  }

  protected async put<T>(endpoint: string, data: unknown): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    try {
      return await axios.put<T>(url, data, {
        headers: this.getHeaders(),
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorDetails = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
        throw errorDetails
      }

      throw { status: 500, message: 'Unknown error' }
    }
  }

  protected async patch<T>(endpoint: string, data: unknown): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    try {
      return await axios.patch<T>(url, data, {
        headers: this.getHeaders(),
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorDetails = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
        throw errorDetails
      }

      throw { status: 500, message: 'Unknown error' }
    }
  }

  protected async delete<T>(endpoint: string): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint)
    try {
      return await axios.delete<T>(url, {
        headers: this.getHeaders(),
      })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorDetails = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
        }
        throw errorDetails
      }

      throw { status: 500, message: 'Unknown error' }
    }
  }
}

export default APIBase
