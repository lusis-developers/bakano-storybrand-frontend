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
  IBusinessQuestions
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
    data: ICreateContentRequest
  ): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.post<IContentResponse>(
      `${this.BASE_URL}/business/${businessId}`,
      data
    )
    return response.data
  }

  /**
   * Obtener proyecto de contenido por ID de negocio
   */
  static async getContentByBusiness(businessId: string): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.get<IContentResponse>(
      `${this.BASE_URL}/business/${businessId}`
    )
    return response.data
  }

  /**
   * Obtener todos los proyectos de contenido del usuario
   */
  static async getUserContentProjects(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<IContentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) {
      params.append('status', status)
    }

    const instance = new ContentService()
    const response = await instance.get<IContentListResponse>(
      `${this.BASE_URL}/projects?${params.toString()}`
    )
    return response.data
  }

  /**
   * Actualizar preguntas de negocio
   */
  static async updateQuestions(
    contentId: string,
    data: IUpdateQuestionsRequest
  ): Promise<IContentResponse> {
    const instance = new ContentService()
    const response = await instance.put<IContentResponse>(
      `${this.BASE_URL}/${contentId}/questions`,
      data
    )
    return response.data
  }

  /**
   * Generar soundbites y taglines
   */
  static async generateSoundbitesAndTaglines(
    contentId: string,
    data: IGenerateSoundbitesTaglinesRequest = {}
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
    }>(
      `${this.BASE_URL}/${contentId}/generate-soundbites-taglines`,
      data
    )
    return response.data
  }

  /**
   * Generar script de contenido o anuncio
   */
  static async generateScript(
    contentId: string,
    data: IGenerateScriptRequest
  ): Promise<IGenerateScriptResponse> {
    const instance = new ContentService()
    const response = await instance.post<IGenerateScriptResponse>(
      `${this.BASE_URL}/${contentId}/generate-script`,
      data
    )
    return response.data
  }

  /**
   * Eliminar proyecto de contenido
   */
  static async deleteContentProject(contentId: string): Promise<{ message: string }> {
    const instance = new ContentService()
    const response = await instance.delete<{ message: string }>(
      `${this.BASE_URL}/${contentId}`
    )
    return response.data
  }
}

export default ContentService