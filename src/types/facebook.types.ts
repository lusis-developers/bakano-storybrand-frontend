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