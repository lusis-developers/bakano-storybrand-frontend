<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | undefined
  options: Option[]
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary'
}

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  size: 'medium',
  variant: 'primary'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const selectRef = ref<HTMLDivElement>()
const searchQuery = ref('')
const focusedIndex = ref(-1)

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const displayValue = computed(() => {
  return selectedOption.value?.label || props.placeholder
})

const selectOption = (option: Option) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  searchQuery.value = ''
  focusedIndex.value = -1
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    searchQuery.value = ''
    focusedIndex.value = -1
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleDropdown()
    }
    return
  }

  switch (event.key) {
    case 'Escape':
      isOpen.value = false
      searchQuery.value = ''
      focusedIndex.value = -1
      break
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (focusedIndex.value >= 0 && filteredOptions.value[focusedIndex.value]) {
        selectOption(filteredOptions.value[focusedIndex.value])
      }
      break
  }
}

const handleClickOutside = (event: Event) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
    focusedIndex.value = -1
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div 
    ref="selectRef"
    class="custom-select"
    :class="[
      `custom-select--${size}`,
      `custom-select--${variant}`,
      {
        'custom-select--open': isOpen,
        'custom-select--disabled': disabled,
        'custom-select--has-value': modelValue !== undefined && modelValue !== ''
      }
    ]"
  >
    <div 
      class="custom-select__trigger"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
    >
      <span class="custom-select__value">{{ displayValue }}</span>
      <i class="custom-select__icon fas fa-chevron-down"></i>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="custom-select__dropdown">
        <div class="custom-select__search" v-if="options.length > 5">
          <input
            v-model="searchQuery"
            type="text"
            class="custom-select__search-input"
            placeholder="Buscar opciones..."
            @click.stop
          >
          <i class="custom-select__search-icon fas fa-search"></i>
        </div>
        
        <div class="custom-select__options">
          <div
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            class="custom-select__option"
            :class="{
              'custom-select__option--selected': option.value === modelValue,
              'custom-select__option--focused': index === focusedIndex,
              'custom-select__option--disabled': option.disabled
            }"
            @click="selectOption(option)"
            @mouseenter="focusedIndex = index"
          >
            {{ option.label }}
            <i v-if="option.value === modelValue" class="custom-select__check fas fa-check"></i>
          </div>
          
          <div v-if="filteredOptions.length === 0" class="custom-select__no-options">
            No options found
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/colorVariables.module.scss' as colors;

.custom-select {
  position: relative;
  width: 100%;
  font-family: inherit;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background: colors.$white;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: colors.$BAKANO-DARK;
    outline: none;
    box-sizing: border-box;

    &:hover {
      border-color: colors.$BAKANO-PURPLE;
    }

    &:focus {
      border-color: colors.$BAKANO-PURPLE;
      box-shadow: 0 0 0 3px rgba(colors.$BAKANO-PURPLE, 0.1);
    }
  }

  &__value {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__icon {
    margin-left: 0.5rem;
    color: #6b7280;
    transition: transform 0.2s ease;
    font-size: 0.75rem;
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 0.25rem;
    background: colors.$white;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  &__search {
    position: relative;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  &__search-input {
    width: 80%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: colors.$BAKANO-PURPLE;
    }
  }

  &__search-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: 0.75rem;
  }

  &__options {
    max-height: 200px;
    overflow-y: auto;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 0.875rem;
    color: colors.$BAKANO-DARK;

    &:hover,
    &--focused {
      background-color: colors.$overlay-purple;
    }

    &--selected {
      background-color: rgba(colors.$BAKANO-PURPLE, 0.05);
      color: colors.$BAKANO-PURPLE;
      font-weight: 500;
    }

    &--disabled {
      color: #9ca3af;
      cursor: not-allowed;
      opacity: 0.5;

      &:hover {
        background-color: transparent;
      }
    }
  }

  &__check {
    color: colors.$BAKANO-PURPLE;
    font-size: 0.75rem;
  }

  &__no-options {
    padding: 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
    font-style: italic;
  }

  // States
  &--open {
    .custom-select__trigger {
      border-color: colors.$BAKANO-PURPLE;
      box-shadow: 0 0 0 3px rgba(colors.$BAKANO-PURPLE, 0.1);
    }

    .custom-select__icon {
      transform: rotate(180deg);
    }
  }

  &--disabled {
    .custom-select__trigger {
      background-color: #f9fafb;
      border-color: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;

      &:hover {
        border-color: #e5e7eb;
      }
    }
  }

  &--has-value {
    .custom-select__value {
      color: colors.$BAKANO-DARK;
    }
  }

  // Sizes
  &--small {
    .custom-select__trigger {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
    }
  }

  &--large {
    .custom-select__trigger {
      padding: 1rem 1.25rem;
      font-size: 1rem;
    }
  }

  // Variants
  &--secondary {
    .custom-select__trigger {
      background-color: colors.$BAKANO-LIGHT;
      border-color: #d1d5db;

      &:hover {
        border-color: colors.$BAKANO-DARK;
      }

      &:focus {
        border-color: colors.$BAKANO-DARK;
        box-shadow: 0 0 0 3px rgba(colors.$BAKANO-DARK, 0.1);
      }
    }

    &.custom-select--open {
      .custom-select__trigger {
        border-color: colors.$BAKANO-DARK;
        box-shadow: 0 0 0 3px rgba(colors.$BAKANO-DARK, 0.1);
      }
    }
  }
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>