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