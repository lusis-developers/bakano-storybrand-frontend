<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'

interface Props {
  modelValue: boolean
  value?: string | null // opcional: valor inicial en formato 'YYYY-MM-DDTHH:MM'
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', v: string): void
  (e: 'cancel'): void
}>()

const date = ref<string>('')
const time = ref<string>('')

// Mes mostrado en el calendario (no usa el picker nativo)
const viewDate = ref<Date>(new Date())
const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] // semana iniciando en lunes

const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
)

function formatDateReadable(d: string): string {
  // d esperado YYYY-MM-DD
  try {
    const [y, m, day] = d.split('-').map((s) => parseInt(s, 10))
    const dt = new Date(y, (m || 1) - 1, day || 1)
    return dt.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return d
  }
}

function toYmd(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function mondayIndex(day: number) {
  // JS: 0=domingo..6=sábado -> 0=lunes..6=domingo
  return (day + 6) % 7
}

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = mondayIndex(firstOfMonth.getDay())
  const startDate = new Date(year, month, 1 - startOffset)
  const days: Array<{ date: Date; ymd: string; inMonth: boolean; isToday: boolean; isSelected: boolean }> = []
  const totalCells = 42 // 6 filas × 7 columnas
  const todayYmd = toYmd(new Date())
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const ymd = toYmd(d)
    days.push({
      date: d,
      ymd,
      inMonth: d.getMonth() === month,
      isToday: ymd === todayYmd,
      isSelected: !!date.value && ymd === date.value,
    })
  }
  return days
})

function prevMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}
function nextMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}

function selectDay(dayYmd: string) {
  date.value = dayYmd
}

const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutesOptions = ['00', '15', '30', '45']

const previewText = computed(() => {
  if (!date.value && !time.value) return 'Sin selección'
  if (date.value && time.value) return `${formatDateReadable(date.value)} · ${time.value}`
  if (date.value) return `${formatDateReadable(date.value)}`
  if (time.value) return `${time.value}`
  return 'Sin selección'
})

function toDatetimeLocal(d: string, t: string): string {
  if (!d || !t) return ''
  // Formato compatible con input datetime-local
  return `${d}T${t}`
}

function parseInitialValue(val?: string | null) {
  if (!val) return
  // Espera formato 'YYYY-MM-DDTHH:MM'
  const m = /^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}:[0-9]{2})/.exec(val)
  if (m) {
    date.value = m[1]
    time.value = m[2]
  }
}

onMounted(() => {
  parseInitialValue(props.value || null)
  // Sin valor inicial, mostrar mes actual. Con valor, centrar vista en esa fecha.
  if (date.value) {
    const [y, m, day] = date.value.split('-').map((s) => parseInt(s, 10))
    viewDate.value = new Date(y, (m || 1) - 1, day || 1)
  } else {
    viewDate.value = new Date()
  }
})

watch(() => props.value, (v) => parseInitialValue(v))

function close() {
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  close()
}

function confirm() {
  const result = toDatetimeLocal(date.value, time.value)
  if (!result) return
  emit('confirm', result)
  close()
}

function setToday() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  date.value = `${yyyy}-${mm}-${dd}`
  // keep current time if set, otherwise set next rounded half-hour
  if (!time.value) {
    const minutes = now.getMinutes()
    const rounded = minutes <= 30 ? 30 : 0
    const addHour = minutes > 30 ? 1 : 0
    now.setHours(now.getHours() + addHour)
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(rounded).padStart(2, '0')
    time.value = `${hh}:${min}`
  }
}

function setTomorrow() {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  date.value = `${yyyy}-${mm}-${dd}`
  if (!time.value) {
    const hh = '09'
    const min = '00'
    time.value = `${hh}:${min}`
  }
}

function addOneHour() {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  time.value = `${hh}:${min}`
  // set date too if empty
  if (!date.value) {
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    date.value = `${yyyy}-${mm}-${dd}`
  }
}
</script>

<template>
  <div v-if="modelValue" class="calendar-select-overlay" @click.self="close">
    <div class="calendar-select-panel fancy-card">
      <div class="panel-header gradient">
        <div class="header-left">
          <i class="icon fa-solid fa-calendar-days" aria-hidden="true"></i>
          <div class="titles">
            <h3>Programar publicación</h3>
            <small>Elige una fecha y hora para agendar</small>
          </div>
        </div>
        <button class="close-btn" @click="close" aria-label="Cerrar">✕</button>
      </div>

      <div class="panel-preview">
        <span class="preview-label">Seleccionado:</span>
        <span class="preview-value">{{ previewText }}</span>
      </div>

      <div class="quick-actions">
        <button class="chip" @click="setToday">Hoy</button>
        <button class="chip" @click="setTomorrow">Mañana</button>
        <button class="chip" @click="addOneHour">+1 h</button>
      </div>

      <div class="calendar-wrapper">
        <div class="month-bar">
          <button class="nav-btn" @click="prevMonth" aria-label="Mes anterior">←</button>
          <div class="month-title">{{ monthLabel }}</div>
          <button class="nav-btn" @click="nextMonth" aria-label="Mes siguiente">→</button>
        </div>

        <div class="weekdays">
          <span v-for="w in weekdays" :key="w" class="weekday">{{ w }}</span>
        </div>

        <div class="calendar-grid">
          <button
            v-for="d in calendarDays"
            :key="d.ymd"
            class="day"
            :class="{ 'out-month': !d.inMonth, today: d.isToday, selected: d.isSelected }"
            @click="selectDay(d.ymd)"
          >
            <span class="day-number">{{ d.date.getDate() }}</span>
          </button>
        </div>
      </div>

      <div class="time-wrapper">
        <div class="field">
          <label>Hora</label>
          <div class="time-row">
            <select class="select" v-model="time" :aria-label="'Seleccionar hora'">
              <option disabled value="">--:--</option>
              <option v-for="h in hoursOptions" :key="h" :value="h + ':' + (time.split(':')[1] || '00')">{{ h }}</option>
            </select>
            <span class="colon">:</span>
            <select class="select" v-model="time" :aria-label="'Seleccionar minutos'">
              <option disabled value="">--:--</option>
              <option v-for="m in minutesOptions" :key="m" :value="(time.split(':')[0] || '00') + ':' + m">{{ m }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button class="btn btn-secondary" @click="cancel">Cancelar</button>
        <button class="btn btn-primary" :disabled="!date || !time" @click="confirm">Confirmar</button>
      </div>
    </div>
  </div>
 </template>

<style scoped lang="scss">
.calendar-select-overlay {
  position: fixed;
  inset: 0;
  background: rgba($BAKANO-DARK, 0.30);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  /* sobre el modal de CreatePost */
  padding: 12px;
}

.calendar-select-panel {
  width: 100%;
  max-width: 560px;
  background: $white;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -10px 24px rgba($BAKANO-DARK, 0.16);
  padding: 0;
  overflow: hidden;
  animation: slideUp 220ms ease-out;
}

.fancy-card {
  border: 1px solid rgba($BAKANO-DARK, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.gradient {
  background: $overlay-purple;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
}

.titles h3 {
  margin: 0;
  color: $BAKANO-DARK;
}

.titles small {
  color: rgba($BAKANO-DARK, 0.7);
}

.close-btn {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
}

.panel-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

.preview-label {
  color: rgba($BAKANO-DARK, 0.7);
}

.preview-value {
  font-weight: 600;
  color: $BAKANO-DARK;
}

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 8px;
}

.chip {
  background: $overlay-purple;
  color: $BAKANO-DARK;
  border: 1px solid $overlay-purple;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
}

.chip:hover {
  background: rgba($BAKANO-PURPLE, 0.18);
}


.calendar-wrapper {
  padding: 8px 16px 0;
}

.month-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
}

.month-title {
  font-weight: 700;
  color: $BAKANO-DARK;
  text-transform: capitalize;
}

.nav-btn {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  padding: 0 2px 6px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: rgba($BAKANO-DARK, 0.7);
  font-weight: 700;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day {
  height: 42px;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 10px;
  background: $white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.12s ease;
}

.day:hover {
  border-color: rgba($BAKANO-PURPLE, 0.3);
  background: rgba($BAKANO-PURPLE, 0.06);
}

.day.out-month {
  opacity: 0.5;
}

.day.today {
  border-color: $BAKANO-PURPLE;
  box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.12);
}

.day.selected {
  background: $BAKANO-PURPLE;
  color: $white;
  border-color: $BAKANO-PURPLE;
}

.day-number {
  font-weight: 700;
}

.time-wrapper {
  padding: 8px 16px 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-weight: 600;
  color: $BAKANO-DARK;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.colon {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.select {
  height: 44px;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 12px;
  padding: 8px 10px;
  background: $white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: $BAKANO-PURPLE;
  box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.14);
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px 16px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
}

.btn.btn-primary {
  background: $BAKANO-DARK;
  color: $white;
}

.btn.btn-secondary {
  background: $BAKANO-LIGHT;
  color: $BAKANO-DARK;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .calendar-select-overlay {
    align-items: center;
  }

  .calendar-select-panel {
    border-radius: 18px;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(24px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>