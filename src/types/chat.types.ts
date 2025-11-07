// Tipos de Chat para el frontend, alineados con el modelo del backend (model.ts)

export type ChatSource = 'internal' | 'facebook' | 'instagram'
export type ChatPurpose = 'analytics' | 'content' | 'support' | 'general'
export type ChatStatus = 'active' | 'archived' | 'closed'
export type MessageRole = 'user' | 'assistant' | 'system' | 'external'
export type AIProvider = 'openai' | 'gemini'

export interface Attachment {
  type: 'post' | 'image' | 'metric' | 'file'
  platform?: 'facebook' | 'instagram'
  externalId?: string
  contentId?: string
  url?: string
  title?: string
  previewText?: string
  metrics?: Record<string, number>
}

export interface ChatMessage {
  role: MessageRole
  content: string
  createdAt?: string
  attachments?: Attachment[]
  createdBy?: string
  ai?: {
    provider?: AIProvider
    model?: string
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
    reasoning?: string
  }
  error?: { message?: string; code?: string }
}

export interface ChatListItem {
  id: string
  business: string
  source: ChatSource
  purpose: ChatPurpose
  status: ChatStatus
  aiProvider: AIProvider
  aiModel?: string
  participants: string[]
  integration?: string | null
  lastMessageAt?: string
  lastMessage?: {
    role: ChatMessage['role']
    content: string
    createdAt?: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface ChatListQuery {
  businessId?: string
  status?: ChatStatus
  source?: ChatSource
  purpose?: ChatPurpose
  q?: string
  page?: number
  limit?: number
  sort?: 'lastMessageAt_desc' | 'lastMessageAt_asc' | 'createdAt_desc' | 'createdAt_asc'
}

export interface ChatListResponse {
  message: string
  pagination: { page: number; limit: number; total: number; hasMore: boolean }
  filters: Required<Pick<ChatListQuery, 'businessId' | 'status' | 'source' | 'purpose' | 'q' | 'sort'>>
  data: ChatListItem[]
}

export interface GetChatByIdResponse {
  message: string
  data: {
    id: string
    business: string
    participants: string[]
    integration?: string | null
    source: ChatSource
    purpose: ChatPurpose
    aiProvider: AIProvider
    aiModel?: string
    systemPrompt?: string
    aiSessionId?: string
    status: ChatStatus
    usage?: {
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }
    metadata?: Record<string, any>
    lastMessageAt?: string
    createdAt: string
    updatedAt: string
    messages: ChatMessage[]
    messagesMeta: { returned: number; total: number; showingLast: number }
  }
}

export interface CreateChatRequest {
  businessId: string
  purpose?: ChatPurpose
  source?: ChatSource
  aiProvider?: AIProvider
  aiModel?: string
  systemPrompt?: string
  participants?: string[]
  integrationId?: string
  aiSessionId?: string
}

export interface CreateChatResponse {
  message: string
  data: {
    id: string
    business: string
    participants: string[]
    source: ChatSource
    purpose: ChatPurpose
    aiProvider: AIProvider
    aiModel?: string
    status: ChatStatus
    createdAt: string
  }
}

export interface AddMessageResponse {
  message: string
  chatId: string
  lastMessageAt?: string
}

export interface AssistantReplyOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

export interface AssistantReplyResponse {
  message: string
  chatId: string
  reply: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  lastMessageAt?: string
}

// Tipados auxiliares para el Store de Chat
export interface IChatLoadingState {
  listing: boolean
  getting: boolean
  creating: boolean
  sending: boolean
  replying: boolean
}

export interface IChatErrorState {
  list: string | null
  get: string | null
  create: string | null
  send: string | null
  reply: string | null
}