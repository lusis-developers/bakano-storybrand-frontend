export interface CreatePostPayload {
  message: string
  link?: string
  published?: boolean
  scheduled_publish_time?: number
}

export interface CreatePostResponse {
  id: string
}

export interface PublishTextPostResponse {
  message: string
  data: CreatePostResponse
}

// Respuesta genérica para publicación de foto(s) o carrusel
// El backend devuelve:
// { message: "Facebook <photo|carousel> post created successfully", data: { id: string, ... } }
export interface PublishPhotoPostResponse {
  message: string
  // Puede variar según sea foto única o carrusel; al menos contiene un id
  // Usamos any para no forzar una forma específica aquí
  data: any
}

// Payload y respuesta para publicación de video
export interface CreateVideoPostPayload {
  message?: string
  description?: string
  title?: string
  published?: boolean
  scheduled_publish_time?: number
}

export interface PublishVideoPostResponse {
  message: string
  data: {
    video_id?: string
    id?: string
    [key: string]: any
  }
}

// Posts programados (scheduled)
export interface ScheduledPagePost {
  id: string
  scheduled_publish_time: number // unix seconds
  message?: string
  status_type?: string
  is_published?: boolean
  created_time?: string
  permalink_url?: string
  full_picture?: string
  attachments?: ScheduledAttachments
}

export type SortOrder = 'asc' | 'desc'

export interface ScheduledPostsQuery {
  limit?: number
  from?: number | string
  to?: number | string
  q?: string
  sort?: SortOrder
}

export interface ScheduledPostsResponse {
  message: string
  page: { id: string; name?: string }
  count: number
  filters: { limit: number; from?: number; to?: number; q?: string; sort: SortOrder }
  stats: { range: { from: number | null; to: number | null }; byDay: Record<string, number> }
  posts: ScheduledPagePost[]
}

// Tipos extendidos para adjuntos/attachments en posts programados
export interface ScheduledMediaImage {
  height: number
  src: string
  width: number
}

export interface ScheduledMedia {
  image?: ScheduledMediaImage
  source?: string
  // Otros posibles campos del Graph API se dejan como opcionales
  [key: string]: any
}

export interface ScheduledAttachment {
  media?: ScheduledMedia
  type?: string
  url?: string
  [key: string]: any
}

export interface ScheduledAttachments {
  data: ScheduledAttachment[]
}