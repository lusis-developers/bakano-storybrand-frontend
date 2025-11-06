import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chatService from '../services/chat.service'
import type {
  ChatListItem,
  ChatListQuery,
  ChatListResponse,
  GetChatByIdResponse,
  CreateChatRequest,
  CreateChatResponse,
  AssistantReplyOptions,
  ChatMessage,
  Attachment,
  IChatLoadingState,
  IChatErrorState,
  AddMessageResponse,
  AssistantReplyResponse,
} from '../types/chat.types'
import { useToast } from '@/composables/useToast'

export const chatStore = defineStore('chat', () => {
  // Estado
  const chats = ref<ChatListItem[]>([])
  const currentChat = ref<GetChatByIdResponse['data'] | null>(null)
  const pagination = ref<ChatListResponse['pagination'] | null>(null)
  const activeFilters = ref<Partial<ChatListQuery>>({})

  const loading = ref<IChatLoadingState>({
    listing: false,
    getting: false,
    creating: false,
    sending: false,
    replying: false,
  })

  const errors = ref<IChatErrorState>({
    list: null,
    get: null,
    create: null,
    send: null,
    reply: null,
  })

  // Composables
  const toast = useToast()

  // Getters
  const hasChats = computed(() => chats.value.length > 0)
  const isLoading = computed(() => Object.values(loading.value).some(Boolean))
  const hasErrors = computed(() => Object.values(errors.value).some((e) => e !== null))
  const messages = computed<ChatMessage[]>(() => currentChat.value?.messages || [])
  const currentChatId = computed(() => currentChat.value?.id || null)
  const lastMessageAt = computed(() => currentChat.value?.lastMessageAt || null)

  function clearErrors() {
    errors.value = { list: null, get: null, create: null, send: null, reply: null }
  }

  function clearCurrentChat() {
    currentChat.value = null
  }

  function setFilters(filters: Partial<ChatListQuery>) {
    activeFilters.value = { ...activeFilters.value, ...filters }
  }

  // Acciones
  async function listUserChats(query?: ChatListQuery): Promise<ChatListItem[]> {
    loading.value.listing = true
    errors.value.list = null
    try {
      const response = await chatService.listChats(query)
      chats.value.splice(0, chats.value.length, ...response.data)
      pagination.value = response.pagination
      activeFilters.value = { ...query }
      return response.data
    } catch (err: any) {
      errors.value.list = err?.message || 'Error al listar conversaciones'
      console.error('ChatStore:listUserChats error', err)
      toast.triggerToast(errors.value.list!, 'error')
      return []
    } finally {
      loading.value.listing = false
    }
  }

  async function fetchChatById(
    chatId: string,
    params?: { limit?: number },
  ): Promise<GetChatByIdResponse['data'] | null> {
    loading.value.getting = true
    errors.value.get = null
    try {
      const response = await chatService.getChatById(chatId, params)
      currentChat.value = response.data
      // Si la lista ya contiene el chat, actualizamos metadatos rápidos
      const idx = chats.value.findIndex((c: ChatListItem) => c.id === response.data.id)
      if (idx !== -1) {
        chats.value[idx].lastMessageAt = response.data.lastMessageAt
        chats.value[idx].lastMessage = response.data.messages?.length
          ? {
              role: response.data.messages[response.data.messages.length - 1].role,
              content: response.data.messages[response.data.messages.length - 1].content,
              createdAt: response.data.messages[response.data.messages.length - 1].createdAt,
            }
          : null
      }
      return response.data
    } catch (err: any) {
      errors.value.get = err?.message || 'Error al obtener la conversación'
      console.error('ChatStore:fetchChatById error', err)
      toast.triggerToast(errors.value.get!, 'error')
      return null
    } finally {
      loading.value.getting = false
    }
  }

  async function createChat(payload: CreateChatRequest): Promise<CreateChatResponse['data'] | null> {
    loading.value.creating = true
    errors.value.create = null
    try {
      const response = await chatService.createChat(payload)
      // Insertar al inicio para visibilidad inmediata
      const newItem: ChatListItem = {
        id: response.data.id,
        business: response.data.business,
        participants: response.data.participants,
        source: response.data.source,
        purpose: response.data.purpose,
        status: response.data.status,
        aiProvider: response.data.aiProvider,
        aiModel: response.data.aiModel,
        integration: null,
        lastMessageAt: undefined,
        lastMessage: null,
        createdAt: response.data.createdAt,
        updatedAt: response.data.createdAt,
      }
      chats.value.unshift(newItem)

      // Cargar el chat completo para tener mensajes y metadatos
      await fetchChatById(response.data.id)
      toast.triggerToast('Conversación creada correctamente', 'success')
      return response.data
    } catch (err: any) {
      errors.value.create = err?.message || 'Error al crear la conversación'
      console.error('ChatStore:createChat error', err)
      toast.triggerToast(errors.value.create!, 'error')
      return null
    } finally {
      loading.value.creating = false
    }
  }

  async function addUserMessage(
    content: string,
    attachments?: Attachment[],
  ): Promise<AddMessageResponse | null> {
    if (!currentChat.value?.id) {
      toast.triggerToast('No hay conversación seleccionada', 'info')
      return null
    }
    loading.value.sending = true
    errors.value.send = null
    try {
      const chatId = currentChat.value.id
      const response = await chatService.addUserMessage(chatId, content, attachments)
      // Agregar el mensaje del usuario localmente para respuesta rápida de UI
      const userMsg: ChatMessage = {
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      currentChat.value.messages.push(userMsg)
      currentChat.value.lastMessageAt = response.lastMessageAt || new Date().toISOString()

      // Sincronizar en la lista
      const idx = chats.value.findIndex((c: ChatListItem) => c.id === chatId)
      if (idx !== -1) {
        chats.value[idx].lastMessageAt = currentChat.value.lastMessageAt
        chats.value[idx].lastMessage = { role: 'user', content: userMsg.content, createdAt: userMsg.createdAt }
      }
      return response
    } catch (err: any) {
      errors.value.send = err?.message || 'Error al enviar el mensaje'
      console.error('ChatStore:addUserMessage error', err)
      toast.triggerToast(errors.value.send!, 'error')
      return null
    } finally {
      loading.value.sending = false
    }
  }

  async function generateAssistantReply(
    options?: AssistantReplyOptions,
  ): Promise<AssistantReplyResponse | null> {
    if (!currentChat.value?.id) {
      toast.triggerToast('No hay conversación seleccionada', 'info')
      return null
    }
    loading.value.replying = true
    errors.value.reply = null
    try {
      const chatId = currentChat.value.id
      const response = await chatService.generateAssistantReply(chatId, options)

      // Insertar respuesta del asistente localmente
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toISOString(),
        ai: response.usage
          ? {
              provider: currentChat.value.aiProvider,
              model: currentChat.value.aiModel,
              promptTokens: response.usage.promptTokens,
              completionTokens: response.usage.completionTokens,
              totalTokens: response.usage.totalTokens,
            }
          : undefined,
      }
      currentChat.value.messages.push(assistantMsg)
      currentChat.value.lastMessageAt = response.lastMessageAt || new Date().toISOString()

      // Sincronizar en la lista
      const idx = chats.value.findIndex((c: ChatListItem) => c.id === chatId)
      if (idx !== -1) {
        chats.value[idx].lastMessageAt = currentChat.value.lastMessageAt
        chats.value[idx].lastMessage = {
          role: 'assistant',
          content: assistantMsg.content,
          createdAt: assistantMsg.createdAt,
        }
      }

      return response
    } catch (err: any) {
      errors.value.reply = err?.message || 'Error al generar respuesta del asistente'
      console.error('ChatStore:generateAssistantReply error', err)
      toast.triggerToast(errors.value.reply!, 'error')
      return null
    } finally {
      loading.value.replying = false
    }
  }

  return {
    // Estado
    chats,
    currentChat,
    pagination,
    activeFilters,
    loading,
    errors,

    // Getters
    hasChats,
    isLoading,
    hasErrors,
    messages,
    currentChatId,
    lastMessageAt,

    // Acciones
    listUserChats,
    fetchChatById,
    createChat,
    addUserMessage,
    generateAssistantReply,
    clearErrors,
    clearCurrentChat,
    setFilters,
  }
})

export default chatStore