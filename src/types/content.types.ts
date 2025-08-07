/**
 * Tipos TypeScript para el manejo de contenido
 * Basado en el modelo del backend y las necesidades del frontend
 */

// Interfaz para preguntas de negocio
export interface IBusinessQuestions {
  companyName: string
  productsServices: string
  targetAudience: string
  mainProblem: string
  solution: string
  uniqueCharacteristics: string
  authority: string
  steps: string
}

// Interfaz para soundbites generados
export interface ISoundbite {
  text: string
  category: 'primary' | 'secondary' | 'supporting'
  generatedAt: Date
}

// Interfaz para taglines generados
export interface ITagline {
  text: string
  style: 'professional' | 'casual' | 'creative' | 'direct'
  generatedAt: Date
}

// Interfaz para scripts generados
export interface IScript {
  type: 'content' | 'ad'
  title: string
  content: string
  duration?: string
  platform?: 'youtube' | 'social' | 'email' | 'website'
  selectedSoundbite?: string
  selectedTagline?: string
  generatedAt: Date
}

// Interfaz principal de contenido
export interface IContent {
  _id: string
  business: string
  questions: IBusinessQuestions
  soundbites: ISoundbite[]
  taglines: ITagline[]
  scripts: IScript[]
  aiProvider: 'openai' | 'gemini'
  tone: string
  status: 'draft' | 'questions_completed' | 'content_generated' | 'completed'
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Tipos para requests
export interface ICreateContentRequest {
  questions: IBusinessQuestions
  tone?: string
  aiProvider?: 'openai' | 'gemini'
}

export interface IUpdateQuestionsRequest {
  questions: Partial<IBusinessQuestions>
}

export interface IGenerateSoundbitesTaglinesRequest {
  regenerate?: boolean
}

export interface IGenerateScriptRequest {
  scriptType: 'content' | 'ad'
  platform?: 'youtube' | 'social' | 'email' | 'website'
  selectedSoundbite?: string
  selectedTagline?: string
}

// Tipos para responses
export interface IContentResponse {
  message: string
  content: IContent
}

export interface IContentListData {
  contentProjects: IContent[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface IContentListResponse {
  message: string
  contentProjects: IContent[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface IGenerateScriptResponse {
  message: string
  script: IScript
}

// Tipos para formularios
export interface IBusinessQuestionsForm extends IBusinessQuestions {
  // Campos adicionales para validación del formulario si es necesario
}

// Tipos para estados de carga
export interface IContentLoadingStates {
  isLoading: boolean
  isGeneratingContent: boolean
  isGeneratingScript: boolean
}

// Tipos para errores
export interface IContentError {
  message: string
  field?: string
  code?: string
}

// Tipos para filtros
export interface IContentFilters {
  status?: IContent['status']
  aiProvider?: IContent['aiProvider']
  dateFrom?: Date
  dateTo?: Date
}

// Tipos para paginación
export interface IContentPagination {
  page: number
  limit: number
  total: number
  pages: number
}

// Tipos para estadísticas (si se necesitan en el futuro)
export interface IContentStats {
  totalProjects: number
  completedProjects: number
  draftProjects: number
  totalSoundbites: number
  totalTaglines: number
  totalScripts: number
}

// Los tipos se exportan individualmente usando export interface