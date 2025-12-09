import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  Attachment,
  AssistantReplyOptions,
  AssistantReplyResponse,
  ChatListQuery,
  ChatListResponse,
  GetChatByIdResponse,
  CreateChatRequest,
  CreateChatResponse,
  AddMessageResponse,
} from '@/types/chat.types'

class ChatService extends APIBase {
  private readonly endpoint = 'chats'
  private buildQuery(params: Record<string, string | number | undefined>): string {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (typeof v !== 'undefined' && v !== null && String(v).length > 0) qs.append(k, String(v))
    }
    const s = qs.toString()
    return s ? `?${s}` : ''
  }

  /**
   * Lista conversaciones del usuario autenticado.
   * Backend: GET /api/chats
   */
  async listChats(query?: ChatListQuery): Promise<ChatListResponse> {
    const qs = this.buildQuery({
      businessId: query?.businessId,
      status: query?.status,
      source: query?.source,
      purpose: query?.purpose,
      q: query?.q,
      page: typeof query?.page !== 'undefined' ? String(query.page) : undefined,
      limit: typeof query?.limit !== 'undefined' ? String(query.limit) : undefined,
      sort: query?.sort,
    })
    const url = `${this.endpoint}${qs}`
    const response: AxiosResponse<ChatListResponse> = await this.get<ChatListResponse>(url)
    return response.data
  }

  /**
   * Obtiene una conversación por ID, incluyendo sus mensajes.
   * Backend: GET /api/chats/:id
   */
  async getChatById(chatId: string, params?: { limit?: number }): Promise<GetChatByIdResponse> {
    if (!chatId) throw new Error('chatId es requerido')
    const qs = this.buildQuery({ limit: typeof params?.limit !== 'undefined' ? String(params.limit) : undefined })
    const response: AxiosResponse<GetChatByIdResponse> = await this.get<GetChatByIdResponse>(
      `${this.endpoint}/${chatId}${qs}`,
    )
    return response.data
  }

  /**
   * Crea una nueva conversación.
   * Backend: POST /api/chats
   */
  async createChat(payload: CreateChatRequest): Promise<CreateChatResponse> {
    if (!payload?.businessId) throw new Error('businessId es requerido para crear el chat')
    // Sanitizar valores potencialmente inválidos para evitar errores del backend
    const safe: CreateChatRequest = { ...payload }
    const allowedSources = ['internal', 'facebook', 'instagram'] as const
    const allowedPurposes = ['analytics', 'content', 'support', 'general'] as const
    if (safe.source && !allowedSources.includes(safe.source)) delete safe.source
    if (safe.purpose && !allowedPurposes.includes(safe.purpose)) delete safe.purpose
    const response: AxiosResponse<CreateChatResponse> = await this.post<CreateChatResponse>(
      this.endpoint,
      safe,
    )
    return response.data
  }

  /**
   * Agrega un mensaje del usuario a la conversación.
   * Backend: POST /api/chats/:id/messages
   */
  async addUserMessage(
    chatId: string,
    content: string,
    attachments?: Attachment[],
  ): Promise<AddMessageResponse> {
    if (!chatId) throw new Error('chatId es requerido')
    if (!content || typeof content !== 'string') throw new Error('content debe ser un string')
    const response: AxiosResponse<AddMessageResponse> = await this.post<AddMessageResponse>(
      `${this.endpoint}/${chatId}/messages`,
      { content: content.trim(), attachments },
    )
    return response.data
  }

  /**
   * Genera una respuesta del asistente de IA y la guarda en el chat.
   * Backend: POST /api/chats/:id/reply
   */
  async generateAssistantReply(
    chatId: string,
    options?: AssistantReplyOptions,
  ): Promise<AssistantReplyResponse> {
    if (!chatId) throw new Error('chatId es requerido')
    const body: AssistantReplyOptions = {}
    if (typeof options?.temperature !== 'undefined') body.temperature = options.temperature
    if (typeof options?.maxTokens !== 'undefined') body.maxTokens = options.maxTokens
    if (typeof options?.model !== 'undefined') body.model = options.model

    const response: AxiosResponse<AssistantReplyResponse> = await this.post<AssistantReplyResponse>(
      `${this.endpoint}/${chatId}/reply`,
      body,
    )
    return response.data
  }
}

// Instancia singleton del servicio
const chatService = new ChatService()

export default chatService
