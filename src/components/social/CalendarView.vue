<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
const emit = defineEmits<{
  (e: 'hour-cell-click', payload: { day: string; hour: string }): void
}>()

// --- Estado de la Vista ---

// 1. Estado de la Navegación Principal
const activeTab = ref('Calendario')
const tabs = [
  'Calendario',
  'Listado',
  'Autolistas',
  'Publicaciones eliminadas',
]

// 2. Estado de los Controles del Calendario
const searchQuery = ref('')
const showMejoresHoras = ref(true)
const currentDateRange = ref('27 oct 2025 - 2 nov 2025')

// 3. Estado de la Grilla (Datos estáticos para la UI)
// En una app real, esto vendría de un composable (p.ej. useCalendar)
const todayString = 'Viernes 31'
const daysOfWeek = [
  'Lunes 27',
  'Martes 28',
  'Miércoles 29',
  'Jueves 30',
  'Viernes 31',
  'Sábado 1',
  'Domingo 2',
]

// Generamos las horas de 11:00 a 23:00
const hoursOfDay = computed(() => {
  return Array.from({ length: 13 }, (_, i) => `${i + 11}:00`)
})

// --- Funciones (Stubs) ---

function goToPreviousWeek() {
  console.log('Navegando a la semana anterior...')
  // Aquí iría la lógica de `date-fns` o similar
}

function goToNextWeek() {
  console.log('Navegando a la semana siguiente...')
  // Aquí iría la lógica de `date-fns` o similar
}

function createPublication() {
  console.log('Abriendo modal para crear publicación...')
}

// --- Reloj y Zona Horaria Actual ---
const now = ref(new Date())
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const formattedTime = computed(() =>
  now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
)

let clockInterval: number | undefined
onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 30000) // actualiza cada 30s
})
onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})
</script>

<template>
  <div class="calendar-page">
    <div class="calendar-grid-wrapper">
      <main class="calendar-grid">
        <div class="grid-times">
          <div class="time-header-spacer"></div>
          <div
            v-for="hour in hoursOfDay"
            :key="hour"
            class="time-label"
          >
            {{ hour }}
          </div>
        </div>

        <div class="grid-days-container">
          <div class="days-header-row">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              class="day-header"
              :class="{ 'is-today': day === todayString }"
            >
              {{ day }}
            </div>
          </div>

          <div class="days-body-grid">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              class="day-column"
              :class="{ 'is-today-column': day === todayString }"
            >
              <div
                v-for="hour in hoursOfDay"
                :key="`${day}-${hour}`"
                class="hour-cell"
                @click="emit('hour-cell-click', { day, hour })"
              >
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Paleta Bakano: usa exclusivamente variables del módulo de colores
// Nota: Las variables SCSS ($BAKANO-*, $white, etc.) ya se inyectan globalmente vía vite.config.ts

// --- Tokens de diseño (solo medidas)
$header-height: 56px; // Alto fijo para el header de días
$time-col-width: 80px; // Ancho fijo para la columna de horas
$day-col-width: 180px; // Ancho fijo para cada columna de día
$cell-height: 96px; // Alto de cada celda de hora (más espacio entre horas)

.calendar-page {
  width: 100%;
  height: 100vh; // Ocupa toda la pantalla
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: $BAKANO-LIGHT;
  box-sizing: border-box;
}

// --- 1. Header de Navegación ---

// --- 3. Grilla del Calendario ---
.calendar-grid-wrapper {
  margin-top: 16px;
  width: 100%;
  flex: 1; // Ocupa el resto de la pantalla
  min-height: 0; // Necesario para que el contenedor flex permita overflow
  overflow: auto; // Scroll vertical y horizontal dentro del contenedor
  border: 1px solid $text-light;
  border-radius: 12px;
  background-color: $white;
  box-shadow: 0 4px 12px $overlay-purple;
}

.calendar-grid {
  display: grid;
  grid-template-columns: $time-col-width 1fr;
  min-width: $time-col-width + (7 * $day-col-width); // Fuerza scroll horizontal en móvil
  height: 100%;
}

.grid-times {
  display: flex;
  flex-direction: column;
  position: sticky; // Columna de horas pegajosa a la izquierda
  left: 0;
  z-index: 3;
  background-color: $white;
  border-right: 1px solid $text-light;

  .time-header-spacer {
    height: $header-height;
    border-bottom: 1px solid $text-light;
    position: sticky;
    top: 0; // Fija el header de horas
    background: $white;
    z-index: 4;
  }

  .time-label {
    height: $cell-height;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 8px;
    padding-top: 2px;
    margin-top: -8px; // Alinea el texto con la línea de la celda
    font-size: 12px;
    color: $BAKANO-PURPLE;
  }
}

.grid-days-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.days-header-row {
  display: grid;
  grid-template-columns: repeat(7, $day-col-width);
  height: $header-height;
  border-bottom: 1px solid $text-light;
  position: sticky; // Header de días pegajoso arriba
  top: 0;
  background: $white;
  z-index: 2;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: $BAKANO-DARK;
  border-right: 1px solid $text-light;
  &:last-child { border-right: none; }
  &.is-today { color: $BAKANO-PURPLE; }
}

.days-body-grid {
  display: grid;
  grid-template-columns: repeat(7, $day-col-width);
  width: 100%;
}

.day-column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid $text-light;
  &:last-child { border-right: none; }
}

.hour-cell {
  height: $cell-height;
  border-top: 1px solid $text-light;
  border-bottom: 1px solid $text-light;
  background-color: $white;
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: top left;
  &:last-child { border-bottom: none; }
}

// Estilo para la columna de "hoy"
.day-column.is-today-column {
  .hour-cell { background-color: $overlay-purple; }
}

// --- Media Queries (Desktop) ---
@media (min-width: 1024px) {
  .calendar-page { padding: 24px 32px; }
  .calendar-grid { min-width: 0; } // Se adapta al contenedor en desktop
}
</style>