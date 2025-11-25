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

// Métricas de página (insights)
export interface FacebookInsightPoint {
  date: string
  time: string
  value: number
}

export interface FacebookMetric {
  total: number
  averagePerDay: number
  series: FacebookInsightPoint[]
}

export interface FacebookInsightsBlock {
  period: string
  date_preset?: string
  range?: { since?: string; until?: string }
  timezone: string
  metrics: Record<string, FacebookMetric>
}

export interface FacebookPageMetricsData {
  page: { id: string; name?: string }
  followers: any
  insights: FacebookInsightsBlock
}

export interface FacebookPageMetricsFilters {
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  maxMonthsByPlan: number
  maxDaysByPlan: number
  view: 'week' | 'month' | 'custom' | string
  monthsApplied?: number
  adjusted?: boolean
  metricsRequested?: string[]
}

export interface FacebookPageMetricsResponse {
  message: string
  data: FacebookPageMetricsData
  filters: FacebookPageMetricsFilters
}

// ===== Meta Ads (Estadísticas de anuncios) =====
export interface FacebookAdActionMetric {
  action_type: string
  value: string | number
}

export interface FacebookAdStatisticsItem {
  impressions: string | number
  reach: string | number
  spend: string | number
  clicks: string | number
  cpm: string | number
  ctr: string | number
  actions: FacebookAdActionMetric[]
  cost_per_action_type: FacebookAdActionMetric[]
  date_start: string
  date_stop: string
}

export interface FacebookAdStatisticsResponse {
  message: string
  statistics: FacebookAdStatisticsItem[]
}

// ===== Meta Ads (Top Ads con links y preview) =====
export interface FacebookAdLinks {
  permalinkUrl: string
}

export interface FacebookAdPreview {
  thumbnailUrl: string
}

export interface FacebookAdMetrics extends FacebookAdStatisticsItem {
  ad_id: string
  ad_name: string
}

export interface FacebookAdItem {
  id: string
  name: string
  links: FacebookAdLinks
  preview: FacebookAdPreview
  metrics: FacebookAdMetrics
  adsetId: string
  campaignId: string
}

export interface FacebookTopAdsResponse {
  message: string
  ads: FacebookAdItem[]
}
