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

  /**
   * Lista conversaciones del usuario autenticado.
   * Backend: GET /api/chats
   */
  async listChats(query?: ChatListQuery): Promise<ChatListResponse> {
    const params = new URLSearchParams()
    if (query?.businessId) params.append('businessId', query.businessId)
    if (query?.status) params.append('status', query.status)
    if (query?.source) params.append('source', query.source)
    if (query?.purpose) params.append('purpose', query.purpose)
    if (query?.q) params.append('q', query.q)
    if (typeof query?.page !== 'undefined') params.append('page', String(query.page))
    if (typeof query?.limit !== 'undefined') params.append('limit', String(query.limit))
    if (query?.sort) params.append('sort', query.sort)

    const qs = params.toString()
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint

    const response: AxiosResponse<ChatListResponse> = await this.get<ChatListResponse>(url)
    return response.data
  }

  /**
   * Obtiene una conversación por ID, incluyendo sus mensajes.
   * Backend: GET /api/chats/:id
   */
  async getChatById(chatId: string, params?: { limit?: number }): Promise<GetChatByIdResponse> {
    if (!chatId) throw new Error('chatId es requerido')
    const qs = params?.limit ? `?limit=${params.limit}` : ''
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
    const response: AxiosResponse<CreateChatResponse> = await this.post<CreateChatResponse>(
      this.endpoint,
      payload,
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