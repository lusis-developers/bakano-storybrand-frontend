import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  IBusiness,
  ICreateBusinessRequest,
  IUpdateBusinessRequest,
  IBusinessResponse,
  IBusinessListResponse,
  IBusinessByContentIdResponse,
  InviteTeamRequest,
  TeamMembersResponse,
  TeamActionResponse,
  TeamRole,
  TeamAuditResponse,
  CanCreateBusinessResponse,
  PendingInvitationsResponse
} from '@/types/business.types'

class BusinessService extends APIBase {
  private readonly endpoint = 'business'

  /**
   * Crea un nuevo negocio
   * @param businessData - Datos del negocio a crear
   * @returns Promise con la respuesta del servidor
   */
  async createBusiness(businessData: ICreateBusinessRequest): Promise<IBusinessResponse> {
    try {
      const response: AxiosResponse<IBusinessResponse> = await this.post<IBusinessResponse>(
        this.endpoint,
        businessData
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtiene todos los negocios del usuario autenticado
   * @returns Promise con la lista de negocios
   */
  async getBusinesses(): Promise<IBusinessListResponse> {
    try {
      const response: AxiosResponse<IBusinessListResponse> = await this.get<IBusinessListResponse>(
        this.endpoint
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtiene un negocio específico por su ID
   * @param businessId - ID del negocio
   * @returns Promise con los datos del negocio
   */
  async getBusinessById(businessId: string): Promise<IBusinessResponse> {
    try {
      const response: AxiosResponse<IBusinessResponse> = await this.get<IBusinessResponse>(
        `${this.endpoint}/${businessId}`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtiene un negocio por ID de contenido
   * @param contentId - ID del contenido
   * @returns Promise con los datos del negocio
   */
  async getBusinessByContentId(contentId: string): Promise<IBusinessByContentIdResponse> {
    try {
      const response: AxiosResponse<IBusinessByContentIdResponse> = await this.get<IBusinessByContentIdResponse>(
        `content/${contentId}/business`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Actualiza un negocio existente
   * @param businessId - ID del negocio a actualizar
   * @param updateData - Datos a actualizar
   * @returns Promise con la respuesta del servidor
   */
  async updateBusiness(
    businessId: string,
    updateData: IUpdateBusinessRequest
  ): Promise<IBusinessResponse> {
    try {
      const response: AxiosResponse<IBusinessResponse> = await this.put<IBusinessResponse>(
        `${this.endpoint}/${businessId}`,
        updateData
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Elimina un negocio
   * @param businessId - ID del negocio a eliminar
   * @returns Promise con la respuesta del servidor
   */
  async deleteBusiness(businessId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await this.delete<{
        success: boolean
        message: string
      }>(`${this.endpoint}/${businessId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Activa o desactiva un negocio
   * @param businessId - ID del negocio
   * @param isActive - Estado activo/inactivo
   * @returns Promise con la respuesta del servidor
   */
  async toggleBusinessStatus(businessId: string, isActive: boolean): Promise<IBusinessResponse> {
    try {
      const response: AxiosResponse<IBusinessResponse> = await this.patch<IBusinessResponse>(
        `${this.endpoint}/${businessId}`,
        { isActive }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async inviteTeamMember(businessId: string, payload: InviteTeamRequest): Promise<TeamActionResponse> {
    try {
      const response: AxiosResponse<TeamActionResponse> = await this.post<TeamActionResponse>(
        `${this.endpoint}/${businessId}/team/invite`,
        payload
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async acceptTeamInvite(businessId: string): Promise<TeamActionResponse> {
    try {
      const response: AxiosResponse<TeamActionResponse> = await this.post<TeamActionResponse>(
        `${this.endpoint}/${businessId}/team/accept`,
        {}
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async listTeamMembers(businessId: string): Promise<TeamMembersResponse> {
    try {
      const response: AxiosResponse<TeamMembersResponse> = await this.get<TeamMembersResponse>(
        `${this.endpoint}/${businessId}/team`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updateTeamMemberRole(businessId: string, userId: string, role: TeamRole): Promise<TeamActionResponse> {
    try {
      const response: AxiosResponse<TeamActionResponse> = await this.patch<TeamActionResponse>(
        `${this.endpoint}/${businessId}/team/${userId}/role`,
        { role }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async revokeTeamMember(businessId: string, userId: string): Promise<TeamActionResponse> {
    try {
      const response: AxiosResponse<TeamActionResponse> = await this.delete<TeamActionResponse>(
        `${this.endpoint}/${businessId}/team/${userId}/revoke`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async listTeamAudit(businessId: string, page = 1, limit = 10): Promise<TeamAuditResponse> {
    try {
      const response: AxiosResponse<TeamAuditResponse> = await this.get<TeamAuditResponse>(
        `${this.endpoint}/${businessId}/team/audit?page=${page}&limit=${limit}`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async canCreateBusiness(): Promise<CanCreateBusinessResponse> {
    try {
      const response: AxiosResponse<CanCreateBusinessResponse> = await this.get<CanCreateBusinessResponse>(
        `${this.endpoint}/quota/can-create`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async listPendingInvitationsForUser(): Promise<PendingInvitationsResponse> {
    try {
      const response: AxiosResponse<PendingInvitationsResponse> = await this.get<PendingInvitationsResponse>(
        `${this.endpoint}/team/invitations/pending`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Instancia singleton del servicio
const businessService = new BusinessService()

export default businessService