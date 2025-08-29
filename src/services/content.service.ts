import APIBase from './httpBase'
import type {
  IContent,
  ICreateContentRequest,
  IContentResponse,
  IContentListResponse,
  IUpdateQuestionsRequest,
  IGenerateSoundbitesTaglinesRequest,
  IGenerateScriptRequest,
  IGenerateScriptResponse,
  IScriptFilters,
  IScriptsResponse,
  IToggleScriptCompletionRequest,
} from '../types/content.types'

/**
 * Content Service - Maneja todas las operaciones relacionadas con proyectos de contenido
 */
export class ContentService extends APIBase {
  private static readonly BASE_URL = 'content'

  /**
   * Crear un nuevo proyecto de contenido para un negocio
   */
  static async createContentProject(
    businessId: string,
    data: ICreateContentRequest,
  ): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.post<IContentResponse>(
      `${this.BASE_URL}/business/${businessId}`,
      data,
    )
    return response.data
  }

  /**
   * Obtener proyecto de contenido por ID de negocio
   */
  static async getContentByBusiness(businessId: string): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.get<IContentResponse>(`${this.BASE_URL}/business/${businessId}`)
    return response.data
  }

  /**
   * Obtener todos los proyectos de contenido del usuario
   */
  static async getUserContentProjects(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<IContentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (status) {
      params.append('status', status)
    }

    const instance = new ContentService()
    const response = await instance.get<IContentListResponse>(
      `${this.BASE_URL}/projects?${params.toString()}`,
    )
    return response.data
  }

  /**
   * Actualizar preguntas de negocio
   */
  static async updateQuestions(
    contentId: string,
    data: IUpdateQuestionsRequest,
  ): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.put<IContentResponse>(
      `${this.BASE_URL}/${contentId}/questions`,
      data,
    )
    return response.data
  }

  /**
   * Generar soundbites y taglines
   */
  static async generateSoundbitesAndTaglines(
    contentId: string,
    data: IGenerateSoundbitesTaglinesRequest = {},
  ): Promise<{
    message: string
    soundbites: IContent['soundbites']
    taglines: IContent['taglines']
  }> {
    const instance = new ContentService()
    const response = await instance.post<{
      message: string
      soundbites: IContent['soundbites']
      taglines: IContent['taglines']
    }>(`${this.BASE_URL}/${contentId}/generate-soundbites-taglines`, data)
    return response.data
  }

  /**
   * Generar script para un proyecto de contenido
   * Usa un timeout extendido de 120 segundos para permitir la generación con IA
   */
  static async generateScript(
    contentId: string,
    data: IGenerateScriptRequest,
  ): Promise<IGenerateScriptResponse> {
    console.log('🚀 ContentService.generateScript - Iniciando llamada al servicio')
    console.log('📝 ContentService.generateScript - Datos enviados:', data)
    
    const instance = new ContentService()
    console.log('🔧 ContentService.generateScript - Instancia creada')
    
    try {
      // Configuración con timeout extendido para generación de scripts con IA
      const config = {
        timeout: 120000, // 120 segundos (2 minutos)
      }
      
      console.log('⏱️ ContentService.generateScript - Usando timeout de 120 segundos')
      
      const response = await instance.post<IGenerateScriptResponse>(
        `${this.BASE_URL}/${contentId}/generate-script`,
        data,
        undefined, // headers
        config, // configuración personalizada
      )
      console.log('✅ ContentService.generateScript - Respuesta recibida:', response)
      console.log('📊 ContentService.generateScript - Status:', response.status)
      console.log('📄 ContentService.generateScript - Data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ ContentService.generateScript - Error capturado:', error)
      throw error
    }
  }

  /**
   * Obtener scripts de un proyecto de contenido
   */
  static async getScripts(contentId: string, filters?: IScriptFilters): Promise<IScriptsResponse> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.type) params.append('type', filters.type)
      if (filters.platform) params.append('platform', filters.platform)
      if (filters.completed !== undefined) params.append('completed', filters.completed.toString())
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
    }

    const queryString = params.toString()
    const url = queryString
      ? `${this.BASE_URL}/${contentId}/scripts?${queryString}`
      : `${this.BASE_URL}/${contentId}/scripts`

    const instance = new ContentService()
    const response = await instance.get<IScriptsResponse>(url)
    return response.data
  }

  /**
   * Eliminar un script específico
   */
  static async deleteScript(
    contentId: string,
    scriptIndex: number,
  ): Promise<{ message: string; remainingScripts: number }> {
    const instance = new ContentService()
    const response = await instance.delete<{ message: string; remainingScripts: number }>(
      `${this.BASE_URL}/${contentId}/scripts/${scriptIndex}`,
    )
    return response.data
  }

  /**
   * Marcar/desmarcar script como completado
   */
  static async toggleScriptCompletion(
    contentId: string,
    scriptIndex: number,
    data: IToggleScriptCompletionRequest,
  ): Promise<{ message: string }> {
    const instance = new ContentService()
    const response = await instance.patch<{ message: string }>(
      `${this.BASE_URL}/${contentId}/scripts/${scriptIndex}/completion`,
      data,
    )
    return response.data
  }

  /**
   * Eliminar proyecto de contenido
   */
  static async deleteContentProject(contentId: string): Promise<{ message: string }> {
    const instance = new ContentService()
    const response = await instance.delete<{ message: string }>(`${this.BASE_URL}/${contentId}`)
    return response.data
  }

  /**
   * Obtener estadísticas de scripts del usuario
   */
  static async getUserScriptStatistics(): Promise<{
    message: string
    statistics: {
      totalBusinesses: number
      totalScripts: number
      scriptsByType: {
        content: number
        ad: number
      }
      scriptsByPlatform: Record<string, number>
      businesses: Array<{
        businessId: string
        businessName: string
        totalScripts: number
        contentScripts: number
        adScripts: number
      }>
    }
  }> {
    const instance = new ContentService()
    const response = await instance.get<{
      message: string
      statistics: {
        totalBusinesses: number
        totalScripts: number
        scriptsByType: {
          content: number
          ad: number
        }
        scriptsByPlatform: Record<string, number>
        businesses: Array<{
          businessId: string
          businessName: string
          totalScripts: number
          contentScripts: number
          adScripts: number
        }>
      }
    }>(`${this.BASE_URL}/user/statistics`)
    return response.data
  }
}

export default ContentService
