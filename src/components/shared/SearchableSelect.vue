<script setup lang="ts" generic="T extends { [key: string]: any }">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  items: T[]
  modelValue: string | number | null
  labelField: keyof T
  valueField: keyof T
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'select', item: T | null): void
}>()

const isOpen = ref(false)
const searchTerm = ref('')
const container = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
// 💡 1. AÑADIMOS UNA REF PARA EL MENÚ DESPLEGABLE
const dropdownRef = ref<HTMLElement | null>(null)

const dropdownStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px',
})

const filteredResults = computed(() => {
  if (!searchTerm.value) return props.items
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return props.items.filter((item) => {
    const label = String(item[props.labelField]).toLowerCase()
    return label.includes(lowerCaseSearch)
  })
})

const updateDropdownPosition = () => {
  if (inputRef.value) {
    const rect = inputRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
    }
  }
}

const openDropdownAndShowAll = async () => {
  isOpen.value = true
  searchTerm.value = ''
  await nextTick()
  updateDropdownPosition()
}

const selectItem = (item: T) => {
  const value = item[props.valueField] as string | number
  const label = item[props.labelField] as string
  searchTerm.value = label
  isOpen.value = false
  emit('update:modelValue', value)
  emit('select', item)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    container.value &&
    !container.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!isOpen.value) {
      const selectedItem = props.items.find((item) => item[props.valueField] === newValue)
      searchTerm.value = selectedItem ? (selectedItem[props.labelField] as string) : ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div ref="container" class="searchable-select-container">
    <input
      ref="inputRef"
      :value="searchTerm"
      @input="searchTerm = ($event.target as HTMLInputElement).value"
      type="text"
      :placeholder="placeholder || 'Buscar...'"
      class="search-input"
      @focus="openDropdownAndShowAll"
      autocomplete="off"
    />
    <Teleport to="body">
      <div v-if="isOpen" ref="dropdownRef" class="results-dropdown" :style="dropdownStyle">
        <ul v-if="filteredResults.length > 0">
          <li
            v-for="item in filteredResults"
            :key="(item as any)[valueField]"
            class="results-item"
            @click="selectItem(item)"
          >
            <span class="item-name">{{ (item as any)[labelField] }}</span>
            <span v-if="item.email" class="item-email">{{ item.email }}</span>
          </li>
        </ul>
        <div v-else class="results-item is-empty">No se encontraron resultados.</div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.searchable-select-container {
  position: relative;
  width: 100%;
}

.search-input {
  // width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1.5px solid rgba($BAKANO-DARK, 0.1);
  border-radius: 10px;
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  background-color: $white;

  &:focus {
    outline: 0;
    border-color: $BAKANO-PINK;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.15);
  }
}

.results-dropdown {
  position: absolute;
  background: $white;
  border: 1px solid rgba($BAKANO-DARK, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 220px;
  overflow-y: auto;
  z-index: 9999;

  ul {
    list-style: none;
    margin: 0;
    padding: 0.25rem;
  }
}

.results-item {
  padding: 0.75rem;
  cursor: pointer;
  color: $BAKANO-DARK;
  transition: background-color 0.2s ease;
  border-radius: 6px;

  &:hover {
    background-color: $overlay-purple;
    color: $BAKANO-PURPLE;
  }

  &.is-empty {
    font-style: italic;
    color: rgba($BAKANO-DARK, 0.6);
    cursor: default;

    &:hover {
      background-color: transparent;
      color: rgba($BAKANO-DARK, 0.6);
    }
  }
}

.item-name {
  display: block;
  font-weight: 500;
}

.item-email {
  display: block;
  font-size: 0.85rem;
  color: rgba($BAKANO-DARK, 0.7);
}
</style>