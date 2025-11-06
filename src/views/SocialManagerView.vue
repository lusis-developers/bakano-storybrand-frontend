<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import CalendarView from '@/components/social/CalendarView.vue'
import CreatePost from '@/components/social/CreatePost.vue'
import BusinessContextGuard from '@/components/business/BusinessContextGuard.vue'

// Estado UI a nivel de vista
const searchQuery = ref('')
const showMejoresHoras = ref(true)

// --- Fecha y rango de semana en tiempo real ---
const monthShort: string[] = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function startOfWeekMonday(d: Date) {
  const base = new Date(d)
  const dow = base.getDay() // 0..6, Domingo=0
  const diffToMonday = (dow + 6) % 7
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() - diffToMonday)
  return base
}
function formatRange(start: Date): string {
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const sDay = String(start.getDate())
  const sMon = monthShort[start.getMonth()]
  const sYear = String(start.getFullYear())
  const eDay = String(end.getDate())
  const eMon = monthShort[end.getMonth()]
  const eYear = String(end.getFullYear())
  return `${sDay} ${sMon} ${sYear} - ${eDay} ${eMon} ${eYear}`
}

// Offset de semanas (0=semana actual). Navegación anterior/siguiente
const weekOffset = ref(0)
const currentDateRange = computed(() => {
  const base = startOfWeekMonday(now.value)
  const start = new Date(base)
  start.setDate(base.getDate() + weekOffset.value * 7)
  return formatRange(start)
})

function goToPreviousWeek() {
  weekOffset.value -= 1
}
function goToNextWeek() {
  weekOffset.value += 1
}

// Reloj y zona horaria
const now = ref(new Date())
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const formattedTime = computed(() =>
  now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
)
let clockInterval: number | undefined
onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 30000)
})
onUnmounted(() => { if (clockInterval) clearInterval(clockInterval) })

// Modal crear publicación
const showCreateModal = ref(false)
const selectedSlot = ref<{ day?: string; hour?: string }>({})
function openCreatePublication(slot?: { day?: string; hour?: string }) {
  selectedSlot.value = slot ?? {}
  showCreateModal.value = true
}
function handleSubmit(payload: { day?: string; hour?: string; text: string }) {
  console.log('Publicación enviada:', payload)
}

// Store de negocio para pasar el businessId al calendario
const businessStore = useBusinessStore()
const currentBusiness = computed(() => businessStore.currentBusiness)
</script>

<template>
  <div class="social-manager">
    <!-- Guard para asegurar que exista un negocio seleccionado (sobre todo) -->
    <BusinessContextGuard />
    <header class="view-header">
      <nav class="tabs">
        <button class="tab-item active">Calendario</button>
      </nav>
      <div class="header-info">
        <i class="fas fa-clock"></i>
        <span>{{ formattedTime }} - {{ timezone }}</span>
      </div>
    </header>

    <section class="view-controls">
      <div class="controls-left">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar" />
        </div>
        <div class="date-navigator">
          <button class="nav-arrow" @click="goToPreviousWeek">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="date-display">
            <i class="fas fa-calendar"></i>
            <span>Esta semana</span>
            <span class="date-range">{{ currentDateRange }}</span>
          </div>
          <button class="nav-arrow" @click="goToNextWeek">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <button class="btn-icon">
          <i class="fas fa-filter"></i>
        </button>
      </div>

      <div class="controls-right">
        <div
          class="toggle-switch"
          :class="{ active: showMejoresHoras }"
          @click="showMejoresHoras = !showMejoresHoras"
        >
          <div class="toggle-knob"></div>
          <span>Mejores horas</span>
        </div>
        <button class="btn btn-primary" @click="openCreatePublication()">
          <i class="fas fa-plus"></i>
          Crear publicación
        </button>
      </div>
    </section>

    <CalendarView
      :current-date-range="currentDateRange"
      :business-id="currentBusiness?.id || currentBusiness?._id"
      @hour-cell-click="openCreatePublication"
    />

    <CreatePost
      v-model="showCreateModal"
      :selection="selectedSlot"
      @schedule-post="handleSubmit"
    />
  </div>
  
</template>

<style scoped lang="scss">
.social-manager {
  padding: 16px;
  background-color: $BAKANO-LIGHT;
  min-height: 100vh;
  box-sizing: border-box;
}

.view-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $text-light;

  .tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tab-item {
    padding: 8px 12px;
    border: none;
    background: none;
    color: $BAKANO-PURPLE;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: $overlay-purple;
    }

    &.active {
      color: $white;
      background-color: $BAKANO-PURPLE;
    }
  }

  .header-info {
    display: none;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: $BAKANO-PURPLE;
  }
}

.view-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
}

.controls-left,
.controls-right {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: $white;
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 8px 12px;
  flex-grow: 1;
  box-shadow: 0 1px 2px $overlay-purple;
}

.search-bar input {
  border: none;
  outline: none;
  width: 100%;
  color: $BAKANO-DARK;

  &::placeholder {
    color: $BAKANO-PURPLE;
  }
}

.date-navigator {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: $white;
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 4px;
  box-shadow: 0 1px 2px $overlay-purple;
}

.date-navigator .nav-arrow {
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  color: $BAKANO-PURPLE;

  &:hover {
    background-color: $BAKANO-LIGHT;
  }
}

.date-navigator .date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: $BAKANO-DARK;
}

.date-navigator .date-display .date-range {
  display: none;
  color: $BAKANO-PURPLE;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border: 1px solid $text-light;
  background-color: $white;
  border-radius: 10px;
  cursor: pointer;
  color: $BAKANO-PURPLE;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: $overlay-purple;
  border-radius: 99px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: $BAKANO-PURPLE;
}

.toggle-switch .toggle-knob {
  width: 22px;
  height: 22px;
  background-color: $white;
  border-radius: 50%;
  box-shadow: 0 1px 2px $overlay-purple;
  transition: transform 0.2s ease;
}

.toggle-switch.active {
  background-color: $BAKANO-PURPLE;
  color: $white;
}

.toggle-switch.active .toggle-knob {
  transform: translateX(100%);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn.btn-primary {
  background: $BAKANO-DARK;
  color: $white;
}

@media (min-width: 1024px) {
  .social-manager {
    padding: 24px 32px;
  }

  .view-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .view-header .tabs {
    overflow-x: visible;
  }

  .view-header .header-info {
    display: flex;
  }

  .view-controls {
    flex-direction: row;
    justify-content: space-between;
  }

  .date-navigator .date-display .date-range {
    display: inline;
  }
}
</style>