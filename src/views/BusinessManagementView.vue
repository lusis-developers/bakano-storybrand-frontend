<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBusiness } from '@/composables/useBusiness'
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'
import { useToast } from '@/composables/useToast'
import BusinessCard from '@/components/business/BusinessCard.vue'
import BusinessForm from '@/components/business/BusinessForm.vue'
import { useIntegrationStore } from '@/stores/integration.store'

import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import BusinessLimitAlert from '@/components/BusinessLimitAlert.vue'
import type { IBusiness, ICreateBusinessRequest, IUpdateBusinessRequest } from '@/types/business.types'

// Composables
const router = useRouter()
const {
  businesses,
  currentBusiness,
  loading,
  errors,
  isLoading,
  hasBusinesses,
  activeBusinesses,
  inactiveBusinesses,
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  setCurrentBusiness,
  clearErrors
} = useBusiness()

const { reveal: showConfirmation } = useConfirmationDialog()
const { triggerToast: showToast } = useToast()
const integrationStore = useIntegrationStore()

// Estado local
const showCreateForm = ref(false)
const showEditForm = ref(false)

const showBusinessLimitAlert = ref(false)
const selectedBusiness = ref<IBusiness | null>(null)
const searchTerm = ref('')
const selectedBusinessId = ref<string | number | null>(null)
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const viewMode = ref<'grid' | 'list'>('grid')

// Nota: los estados de conexión se muestran directamente en cada tarjeta de negocio.
// Se mantiene el store para cargas y compatibilidad general, pero no se muestran en el header.

const resolveBusinessId = (): string | undefined => {
  const id = selectedBusinessId.value ?? currentBusiness.value?.id ?? businesses.value[0]?.id
  return typeof id === 'number' ? String(id) : (id as string | undefined)
}

// Computed
const filteredBusinesses = computed(() => {
  let filtered = businesses.value

  // Filtrar por estado
  if (filterStatus.value === 'active') {
    filtered = activeBusinesses.value
  } else if (filterStatus.value === 'inactive') {
    filtered = inactiveBusinesses.value
  }

  // Filtrar por término de búsqueda
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(business =>
      business.name.toLowerCase().includes(term) ||
      business.industry?.toLowerCase().includes(term) ||
      business.description?.toLowerCase().includes(term)
    )
  }

  // Filtrar por negocio seleccionado en el SearchableSelect
  if (selectedBusinessId.value) {
    filtered = filtered.filter(business => business.id === selectedBusinessId.value)
  }

  return filtered
})

const hasFilteredResults = computed(() => filteredBusinesses.value.length > 0)

// Métodos
const handleCreateBusiness = () => {
  // Check if user already has a business
  if (businesses.value.length > 0) {
    showBusinessLimitAlert.value = true
    return
  }
  
  clearErrors()
  selectedBusiness.value = null
  showCreateForm.value = true
}

const handleEditBusiness = (business: IBusiness) => {
  clearErrors()
  selectedBusiness.value = business
  setCurrentBusiness(business)
  showEditForm.value = true
}

const handleDeleteBusiness = async (business: IBusiness) => {
  const confirmed = await showConfirmation({
    title: 'Eliminar Negocio',
    message: `¿Estás seguro de que deseas eliminar "${business.name}"? Esta acción no se puede deshacer.`,
    confirmationText: 'eliminar'
  })

  if (confirmed) {
    try {
      await deleteBusiness(business.id)
      showToast(`Negocio "${business.name}" eliminado exitosamente`, 'success')
    } catch (error) {
      showToast('Error al eliminar el negocio', 'error')
    }
  }
}

const handleSubmitCreate = async (businessData: ICreateBusinessRequest) => {
  try {
    const newBusiness = await createBusiness(businessData)
    if (newBusiness) {
      showCreateForm.value = false
      showToast(`Negocio "${newBusiness.name}" creado exitosamente`, 'success')
    }
  } catch (error) {
    showToast('Error al crear el negocio', 'error')
  }
}

const handleSubmitEdit = async (businessData: IUpdateBusinessRequest) => {
  if (!selectedBusiness.value) return

  try {
    const updatedBusiness = await updateBusiness(selectedBusiness.value.id, businessData)
    if (updatedBusiness) {
      showEditForm.value = false
      selectedBusiness.value = null
      showToast(`Negocio "${updatedBusiness.name}" actualizado exitosamente`, 'success')
    }
  } catch (error) {
    showToast('Error al actualizar el negocio', 'error')
  }
}

const handleFormSubmit = async (data: ICreateBusinessRequest | IUpdateBusinessRequest) => {
  if (showCreateForm.value) {
    await handleSubmitCreate(data as ICreateBusinessRequest)
  } else if (showEditForm.value) {
    await handleSubmitEdit(data as IUpdateBusinessRequest)
  }
}

const handleCancelForm = () => {
  showCreateForm.value = false
  showEditForm.value = false
  selectedBusiness.value = null
  clearErrors()
}



const handleCloseBusinessLimitAlert = () => {
  showBusinessLimitAlert.value = false
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const clearBusinessSearch = () => {
  selectedBusinessId.value = null
}

// Lifecycle
onMounted(async () => {
  await fetchBusinesses()
})

// Cargar integraciones cuando haya un negocio seleccionado o disponible
watch([businesses, selectedBusinessId, currentBusiness], async () => {
  const id = resolveBusinessId()
  if (id) {
    try {
      await integrationStore.loadIntegrations(id)
    } catch (e) {
      // Silenciar error aquí; se mostraría en componentes específicos si es necesario
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="business-management">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goToDashboard" class="btn btn-ghost btn-sm">
            <i class="fas fa-arrow-left" aria-hidden="true"></i>
            Volver al Dashboard
          </button>
          <h1>Gestión de Negocios</h1>
          <p class="subtitle">Administra tus negocios y configuraciones</p>
        </div>
        
        <div class="header-actions">
          <button 
            @click="handleCreateBusiness" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <i class="fas fa-plus" aria-hidden="true"></i>
            Crear Negocio
          </button>
        </div>
      </div>
    </header>

    <!-- Filters and Search -->
    <section class="filters-section">
      <div class="filters-content">
        <div class="search-box">
          <div class="searchable-select-wrapper">
            <SearchableSelect
              :items="businesses"
              v-model="selectedBusinessId"
              label-field="name"
              value-field="id"
              placeholder="Buscar negocios..."
              @select="(business) => { if (!business) selectedBusinessId = null }"
            />
            <button 
              v-if="selectedBusinessId" 
              @click="clearBusinessSearch" 
              class="clear-search-btn"
              type="button"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="filter-controls">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Todos los negocios</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="['view-btn', { active: viewMode === 'grid' }]"
            >
              <i class="fas fa-th" aria-hidden="true"></i>
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="['view-btn', { active: viewMode === 'list' }]"
            >
              <i class="fas fa-list" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading.fetching" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando negocios...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errors.fetch" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <h3>Error al cargar negocios</h3>
      <p>{{ errors.fetch }}</p>
      <button @click="fetchBusinesses" class="btn btn-primary">
        Reintentar
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasBusinesses" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-building" aria-hidden="true"></i>
      </div>
      <h3>No tienes negocios registrados</h3>
      <p>Crea tu primer negocio para comenzar a gestionar tu marca</p>
      <button @click="handleCreateBusiness" class="btn btn-primary">
        Crear Primer Negocio
      </button>
    </div>

    <!-- No Results State -->
    <div v-else-if="!hasFilteredResults" class="no-results-state">
      <div class="no-results-icon">
        <i class="fas fa-search" aria-hidden="true"></i>
      </div>
      <h3>No se encontraron resultados</h3>
      <p>Intenta ajustar los filtros o el término de búsqueda</p>
      <button @click="searchTerm = ''; filterStatus = 'all'" class="btn btn-outline">
        Limpiar Filtros
      </button>
    </div>

    <!-- Business List -->
    <section v-else class="businesses-section">
      <div class="businesses-header">
        <h2>Mis Negocios ({{ filteredBusinesses.length }})</h2>
      </div>

      <div :class="['businesses-container', viewMode]">
        <BusinessCard
          v-for="business in filteredBusinesses"
          :key="business.id"
          :business="business"
          :view-mode="viewMode"
          @edit="handleEditBusiness"
          @delete="handleDeleteBusiness"

        />
      </div>
    </section>

    <!-- Create Form Modal -->
    <BusinessForm
      v-if="showCreateForm"
      mode="create"
      :loading="loading.creating"
      :error="errors.create"
      @submit="handleFormSubmit"
      @cancel="handleCancelForm"
    />

    <!-- Edit Form Modal -->
    <BusinessForm
      v-if="showEditForm"
      mode="edit"
      :business="selectedBusiness"
      :loading="loading.updating"
      :error="errors.update"
      @submit="handleFormSubmit"
      @cancel="handleCancelForm"
    />



    <!-- Business Limit Alert -->
    <BusinessLimitAlert
      :visible="showBusinessLimitAlert"
      @close="handleCloseBusinessLimitAlert"
    />
  </div>
</template>

<style lang="scss" scoped>
.business-management {
  min-height: 100vh;
  padding: 1rem;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
}

// Header
.page-header {
  background: $white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.header-left {
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0.5rem 0 0.25rem 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .subtitle {
    color: rgba($BAKANO-DARK, 0.6);
    margin: 0;
    font-size: 1rem;
  }
}

.header-actions {
  @media (max-width: 768px) {
    width: 100%;
  }
}

// Filters
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
}

.filters-content {
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
}

.searchable-select-wrapper {
  position: relative;
  width: 100%;
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: $BAKANO-LIGHT;
  color: rgba($BAKANO-DARK, 0.7);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba($BAKANO-DARK, 0.06);
    color: $BAKANO-DARK;
  }
  
  i {
    font-size: 0.75rem;
  }
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
  }
}

.view-toggle {
  display: flex;
  border: 1px solid rgba($BAKANO-DARK, 0.12);
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: $BAKANO-LIGHT;
  }

  &.active {
    background: $BAKANO-PINK;
    color: white;
  }

  &:not(:last-child) {
    border-right: 1px solid rgba($BAKANO-DARK, 0.12);
  }
  
  i {
    font-size: 1rem;
  }
}

// States
.loading-state,
.error-state,
.empty-state,
.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin: 1rem 0 0.5rem 0;
  }

  p {
    color: rgba($BAKANO-DARK, 0.6);
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba($BAKANO-DARK, 0.12);
  border-top: 4px solid $BAKANO-PINK;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon,
.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: rgba($BAKANO-DARK, 0.6);
  
  i {
    font-size: 3rem;
  }
}

// Businesses Section
.businesses-section {
  .businesses-header {
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
  }
}

.businesses-container {
  &.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  &.list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

// Buttons
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.75rem;
  }
}

.btn-primary {
  background: $BAKANO-PINK;
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.3);
  }
}

.btn-outline {
  background: transparent;
  color: $BAKANO-DARK;
  border: 1px solid rgba($BAKANO-DARK, 0.2);

  &:hover:not(:disabled) {
    background: rgba($BAKANO-DARK, 0.06);
    color: $BAKANO-DARK;
  }
}

.btn-ghost {
  background: transparent;
  color: rgba($BAKANO-DARK, 0.7);
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background: $BAKANO-LIGHT;
    color: $BAKANO-DARK;
  }
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.icon {
  font-size: 1rem;
  line-height: 1;
}

</style>