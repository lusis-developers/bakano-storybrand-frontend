<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '../../composables/useToast'
import { useBusinessStore } from '@/stores/business.store'
import { useFacebookPublishStore } from '@/stores/social/facebookPublish.store'
import type { ScheduledPagePost } from '@/types/facebook.types'

const emit = defineEmits<{
  (e: 'hour-cell-click', payload: { day: string; hour: string }): void
}>()

// Hacer businessId opcional y resolverlo desde el store si no se pasa
const props = defineProps<{ currentDateRange?: string; businessId?: string }>()
const businessStore = useBusinessStore()
const resolvedBusinessId = computed(() => {
  // Preferir el prop si viene, de lo contrario usar el negocio actual del store
  return (
    props.businessId ||
    businessStore.currentBusiness?.id ||
    // Algunos lugares usan _id
    (businessStore.currentBusiness as any)?._id ||
    ''
  )
})

const store = useFacebookPublishStore()

const dayNames: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const todayString = computed(() => {
  const t = new Date()
  return `${dayNames[t.getDay()]} ${t.getDate()}`
})

const monthIndexMap: Record<string, number> = {
  'ene': 0, 'enero': 0,
  'feb': 1, 'febrero': 1,
  'mar': 2, 'marzo': 2,
  'abr': 3, 'abril': 3,
  'may': 4, 'mayo': 4,
  'jun': 5, 'junio': 5,
  'jul': 6, 'julio': 6,
  'ago': 7, 'agosto': 7,
  'sep': 8, 'sept': 8, 'septiembre': 8,
  'oct': 9, 'octubre': 9,
  'nov': 10, 'noviembre': 10,
  'dic': 11, 'diciembre': 11,
}

const monthShort: string[] = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function parseRangeStart(range: string): Date {
  const left = (range || '').split(/\s*[-–]\s*/)[0] || ''
  const norm = left
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const m = /(\d{1,2})\s*(?:de\s*)?([a-z]+)\s*(?:de\s*)?(\d{4})/.exec(norm)
  if (m) {
    const day = parseInt(m[1], 10)
    const monKey = m[2]
    const year = parseInt(m[3], 10)
    const monIdx = monthIndexMap[monKey] ?? monthIndexMap[monKey.slice(0, 3)]
    if (typeof monIdx === 'number') return new Date(year, monIdx, day)
  }
  const fallback = new Date()
  const dow = fallback.getDay() // 0..6
  const diffToMonday = (dow + 6) % 7
  fallback.setDate(fallback.getDate() - diffToMonday)
  return fallback
}

type DayItem = { labelShort: string; labelLong: string; iso: string; date: Date }
const daysOfWeekData = computed<DayItem[]>(() => {
  const rangeStr = props.currentDateRange || '27 oct 2025 - 2 nov 2025'
  const start = parseRangeStart(rangeStr)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const labelShort = `${dayNames[d.getDay()]} ${d.getDate()}`
    const labelLong = `${dayNames[d.getDay()]} ${d.getDate()} ${monthShort[d.getMonth()]} ${d.getFullYear()}`
    return { labelShort, labelLong, iso: ymd(d), date: d }
  })
})

const hoursOfDay = computed(() => {
  return Array.from({ length: 13 }, (_, i) => `${i + 11}:00`)
})

// Toast para feedback cuando el usuario intenta programar en el pasado
const { triggerToast } = useToast()

function combineDateAndHour(base: Date, hour: string): Date {
  const [hStr, mStr] = hour.split(':')
  const d = new Date(base)
  d.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0)
  return d
}

function onHourCellClick(day: { labelLong: string; date: Date }, hour: string) {
  const target = combineDateAndHour(day.date, hour)
  const now = new Date()
  if (target.getTime() <= now.getTime()) {
    triggerToast('La fecha y hora seleccionadas ya pasaron', 'error', 3000)
    return
  }
  emit('hour-cell-click', { day: day.labelLong, hour })
}

// ==== Integración con posts programados en Facebook ====
const weekRange = computed(() => {
  const rangeStr = props.currentDateRange || ''
  const start = parseRangeStart(rangeStr)
  // inicio del día
  const startDate = new Date(start)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)
  return {
    startDate,
    endDate,
    from: Math.floor(startDate.getTime() / 1000),
    to: Math.floor(endDate.getTime() / 1000),
  }
})

async function fetchScheduled() {
  if (!resolvedBusinessId.value) return
  try {
    await store.fetchScheduledPosts(resolvedBusinessId.value, {
      from: weekRange.value.from,
      to: weekRange.value.to,
      sort: 'asc',
      limit: 50,
    })
  } catch (e: any) {
    triggerToast(e?.message || 'Error al cargar posts programados', 'error', 3000)
  }
}

onMounted(() => {
  fetchScheduled()
})

watch(
  () => [props.currentDateRange, resolvedBusinessId.value],
  () => {
    fetchScheduled()
  },
)

function hhLabel(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:00`
}

// Mapa de posts por día y hora
const postsByDayHour = computed(() => {
  const result: Record<string, Record<string, ScheduledPagePost[]>> = {}
  const posts = store.scheduled?.posts || []
  for (const p of posts) {
    const dt = new Date((p.scheduled_publish_time || 0) * 1000)
    const dayIso = ymd(dt)
    const hourKey = hhLabel(dt)
    if (!result[dayIso]) result[dayIso] = {}
    if (!result[dayIso][hourKey]) result[dayIso][hourKey] = []
    result[dayIso][hourKey].push(p)
  }
  return result
})

function shortMessage(msg?: string) {
  if (!msg) return ''
  return msg.length > 60 ? `${msg.slice(0, 57)}…` : msg
}

// Contador por día según stats.byDay del backend
const scheduledCountByDay = computed<Record<string, number>>(() => {
  return store.scheduled?.stats?.byDay || {}
})

function openPermalink(url?: string) {
  if (!url) return
  try {
    window.open(url.replace(/\s|`/g, ''), '_blank')
  } catch {}
}
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
              v-for="day in daysOfWeekData"
              :key="day.iso"
              class="day-header"
              :class="{ 'is-today': day.labelShort === todayString }"
            >
              {{ day.labelShort }}
              <span v-if="scheduledCountByDay[day.iso]" class="day-count">{{ scheduledCountByDay[day.iso] }}</span>
            </div>
          </div>

          <div class="days-body-grid">
            <div
              v-for="day in daysOfWeekData"
              :key="day.iso"
              class="day-column"
              :class="{ 'is-today-column': day.labelShort === todayString }"
            >
              <div
                v-for="hour in hoursOfDay"
                :key="`${day.iso}-${hour}`"
                class="hour-cell"
                @click="onHourCellClick(day, hour)"
              >
                <div
                  v-for="post in (postsByDayHour[day.iso]?.[hour] || [])"
                  :key="post.id"
                  class="scheduled-post"
                  :title="post.message || ''"
                  @click="openPermalink(post.permalink_url)"
                >
                  <div class="post-time">{{ hour }}</div>
                  <div class="post-content">
                    <div class="post-message">{{ shortMessage(post.message) }}</div>
                    <img
                      v-if="post.full_picture"
                      :src="post.full_picture"
                      alt="preview"
                      class="post-thumb"
                    />
                    <img
                      v-else-if="post.attachments?.data?.[0]?.media?.image?.src"
                      :src="post.attachments.data[0].media.image.src"
                      alt="preview"
                      class="post-thumb"
                    />
                    <span v-else class="post-type" :class="post.status_type">{{ post.status_type || 'post' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 56px;
$time-col-width: 80px;
$day-col-width: 180px;
$cell-height: 96px;

.calendar-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: $BAKANO-LIGHT;
  box-sizing: border-box;
}

.calendar-grid-wrapper {
  margin-top: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid $text-light;
  border-radius: 12px;
  background-color: $white;
  box-shadow: 0 4px 12px $overlay-purple;
}

.calendar-grid {
  display: grid;
  grid-template-columns: $time-col-width 1fr;
  min-width: $time-col-width + (7 * $day-col-width);
  height: 100%;
}

.grid-times {
  display: flex;
  flex-direction: column;
  position: sticky;
  left: 0;
  z-index: 3;
  background-color: $white;
  border-right: 1px solid $text-light;

  .time-header-spacer {
    height: $header-height;
    border-bottom: 1px solid $text-light;
    position: sticky;
    top: 0;
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
    margin-top: -8px;
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
  position: sticky;
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

    &:last-child {
      border-right: none;
    }

    &.is-today {
      color: $BAKANO-PURPLE;
    }

    .day-count {
      margin-left: 8px;
      font-size: 11px;
      color: $white;
      background-color: $BAKANO-PURPLE;
      border-radius: 12px;
      padding: 2px 6px;
      line-height: 1;
    }
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

  &:last-child {
    border-right: none;
  }
}

  .hour-cell {
    height: $cell-height;
    border-top: 1px solid $text-light;
    border-bottom: 1px solid $text-light;
    background-color: $white;
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background-position: top left;

    &:last-child {
      border-bottom: none;
    }

    .scheduled-post {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      margin: 6px;
      border: 1px solid $text-light;
      border-radius: 8px;
      background-color: $overlay-purple;
      cursor: pointer;

      .post-time {
        font-size: 11px;
        color: $BAKANO-PURPLE;
        min-width: 44px;
      }

      .post-content {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
      }

      .post-message {
        font-size: 12px;
        color: $BAKANO-DARK;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 320px;
      }

      .post-thumb {
        width: 36px;
        height: 36px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid $text-light;
      }

      .post-type {
        font-size: 11px;
        color: $BAKANO-DARK;
        background-color: $white;
        border: 1px solid $text-light;
        border-radius: 6px;
        padding: 2px 6px;
      }
    }
  }

.day-column.is-today-column {
  .hour-cell {
    background-color: $overlay-purple;
  }
}

// Estado de carga de programación
.calendar-grid-wrapper::after {
  content: v-bind('store.scheduledLoading ? "Cargando posts programados…" : ""');
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 12px;
  color: $BAKANO-PURPLE;
}

// --- Media Queries (Desktop) ---
@media (min-width: 1024px) {
  .calendar-page {
    padding: 24px 32px;
  }

  .calendar-grid {
    min-width: 0;
  }
}
</style>