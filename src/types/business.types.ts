export interface IBusinessAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

// Interface principal del negocio (frontend)
export interface IBusiness {
  _id: string
  id: string
  name: string
  description?: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: IBusinessAddress
  owner: string
  employees?: string[]
  integrations?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Interface para crear un nuevo negocio
export interface ICreateBusinessRequest {
  name: string
  description?: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: IBusinessAddress
}

// Interface para actualizar un negocio
export interface IUpdateBusinessRequest {
  name?: string
  description?: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: IBusinessAddress
  isActive?: boolean
}

// Interface para la respuesta de la API
export interface IBusinessResponse {
  success: boolean
  message: string
  data?: IBusiness
}

// Interface para la respuesta específica de getBusinessByContentId
export interface IBusinessByContentIdResponse {
  message: string
  business: IBusiness
}

// Interface para los datos de la respuesta de lista de negocios
export interface IBusinessListData {
  businesses: IBusiness[]
  pagination: {
    currentPage: number
    totalPages: number
    totalBusinesses: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Interface para la respuesta de lista de negocios
export interface IBusinessListResponse {
  success: boolean
  message: string
  data?: IBusinessListData
}

// Interface para el estado de loading específico por operación
export interface IBusinessLoadingState {
  fetching: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
}

// Interface para errores específicos por operación
export interface IBusinessErrorState {
  fetch: string | null
  create: string | null
  update: string | null
  delete: string | null
}

// Enum para las industrias más comunes (opcional)
export enum BusinessIndustry {
  TECHNOLOGY = 'Technology',
  HEALTHCARE = 'Healthcare',
  FINANCE = 'Finance',
  EDUCATION = 'Education',
  RETAIL = 'Retail',
  MANUFACTURING = 'Manufacturing',
  CONSULTING = 'Consulting',
  REAL_ESTATE = 'Real Estate',
  FOOD_BEVERAGE = 'Food & Beverage',
  ENTERTAINMENT = 'Entertainment',
  TRANSPORTATION = 'Transportation',
  CONSTRUCTION = 'Construction',
  AGRICULTURE = 'Agriculture',
  ENERGY = 'Energy',
  TELECOMMUNICATIONS = 'Telecommunications',
  OTHER = 'Other',
}

// Tipo para los filtros de búsqueda
export interface IBusinessFilters {
  industry?: string
  isActive?: boolean
  searchTerm?: string
}

// Tipo para la paginación
export interface IBusinessPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Interface para la respuesta paginada
export interface IBusinessPaginatedResponse {
  success: boolean
  message: string
  data?: IBusiness[]
  pagination?: IBusinessPagination
}
