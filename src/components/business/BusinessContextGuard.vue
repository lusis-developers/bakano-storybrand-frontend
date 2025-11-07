<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'

interface Props {
  autoSelectFirst?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSelectFirst: true,
})

const businessStore = useBusinessStore()
const isInitializing = ref(false)
const selectedBusinessId = ref<string | number | null>(null)

const businesses = computed(() => businessStore.businesses)
const currentBusiness = computed(() => businessStore.currentBusiness)
const hasBusinesses = computed(() => businesses.value.length > 0)
const isReady = computed(() => !!currentBusiness.value)

async function initializeBusinessContext() {
  try {
    isInitializing.value = true

    // Cargar lista de negocios si no está disponible
    if (businesses.value.length === 0) {
      await businessStore.fetchBusinesses()
    }

    // Si no hay negocios, mostramos el overlay para que el usuario cree uno en otra vista
    if (businesses.value.length === 0) {
      console.warn('[BusinessContextGuard] ⚠️ No hay negocios disponibles. El usuario debe crear uno.')
      return
    }

    // Si ya existe currentBusiness no hacemos nada
    if (currentBusiness.value) {
      console.log('[BusinessContextGuard] ✔️ currentBusiness ya está definido:', {
        id: (currentBusiness.value as any).id || (currentBusiness.value as any)._id,
        name: currentBusiness.value.name,
      })
      return
    }

    // Auto-seleccionar el primero si está habilitado
    if (props.autoSelectFirst) {
      const first = businesses.value[0]
      if (first) {
        businessStore.setCurrentBusiness(first)
        selectedBusinessId.value = (first as any).id || (first as any)._id
      }
    }
  } catch (err) {
    console.error('[BusinessContextGuard] ❌ Error inicializando negocio:', err)
  } finally {
    isInitializing.value = false
  }
}

function applySelection() {
  const chosen = businesses.value.find(b => ((b as any).id || (b as any)._id) === selectedBusinessId.value)
  if (chosen) {
    businessStore.setCurrentBusiness(chosen)
    console.log('[BusinessContextGuard] ✅ currentBusiness establecido manualmente:', {
      id: selectedBusinessId.value,
      name: chosen.name,
    })
  }
}

onMounted(() => {
  initializeBusinessContext()
})

// Si la lista de negocios cambia y aún no hay currentBusiness, intenta autoseleccionar
watch(businesses, (list) => {
  if (!currentBusiness.value && props.autoSelectFirst && list.length > 0) {
    const first = list[0]
    businessStore.setCurrentBusiness(first)
    selectedBusinessId.value = (first as any).id || (first as any)._id
    console.log('[BusinessContextGuard] 🔁 Autoselección tras actualización de lista:', {
      id: selectedBusinessId.value,
      name: first.name,
    })
  }
})
</script>

<template>
  <!-- Overlay que bloquea la vista si no hay currentBusiness definido -->
  <div v-if="!isReady" class="business-guard-overlay">
    <div class="business-guard-panel">
      <h3>Selecciona tu negocio</h3>
      <p class="subtitle">Necesitamos tu negocio activo para cargar tus integraciones y mostrar tus avatares correctamente.</p>

      <div v-if="hasBusinesses" class="selector-row">
        <SearchableSelect
          :items="businesses"
          v-model="selectedBusinessId"
          label-field="name"
          value-field="id"
          placeholder="Selecciona tu negocio"
        />
        <button class="btn btn-primary" :disabled="!selectedBusinessId" @click="applySelection">
          Usar este negocio
        </button>
      </div>

      <div v-else class="empty-row">
        <i class="fas fa-building"></i>
        <p>No tienes negocios creados todavía. Ve a Gestión de Negocios para crear uno.</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.business-guard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 10, 40, 0.35);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* por encima de todo en SocialManagerView */
}

.business-guard-panel {
  width: 90%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 20px;
  text-align: center;
}

.business-guard-panel h3 {
  margin: 0;
  color: $BAKANO-DARK;
}

.subtitle {
  margin: 8px 0 16px;
  color: $BAKANO-PURPLE;
}

.selector-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.empty-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: $BAKANO-PURPLE;
}

.btn.btn-primary {
  background: $BAKANO-DARK;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}
</style>