<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{
  search: [payload: { hashtags: string[]; resultsType: 'posts' | 'stories'; resultsLimit: number; keywordSearch?: boolean }]
}>()

const input = ref('')
const saved = ref<string[]>([])
const resultsType = ref<'posts' | 'stories'>('stories')
const resultsLimit = ref<number>(5)
const keywordSearch = ref<boolean>(true)
const { triggerToast } = useToast()

const sanitizeToken = (t: string): string => {
  return t.trim().replace(/^#/, '').replace(/[^A-Za-z0-9_]+/g, '').toLowerCase()
}

const addKeyword = () => {
  const raw = input.value
  const v = sanitizeToken(raw)
  if (!v) {
    triggerToast('Palabra inválida: usa letras, números o _ sin espacios', 'error', 4000)
    return
  }
  if (v !== raw.trim().replace(/^#/, '')) {
    triggerToast(`Corregido a #${v}`, 'info', 3000)
  }
  if (!saved.value.includes(v)) saved.value.push(v)
  input.value = ''
}

const removeKeyword = (k: string) => {
  saved.value = saved.value.filter((x) => x !== k)
}

const clearKeywords = () => {
  saved.value = []
}

const submit = () => {
  const base = saved.value.length
    ? saved.value
    : input.value
        .split(/[,\s]+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

  const sanitized = base.map(sanitizeToken).filter((p) => p.length > 0)

  if (!sanitized.length) {
    triggerToast('Agrega palabras válidas sin espacios ni símbolos', 'error', 4000)
    return
  }

  const corrected = base.filter((b, i) => sanitizeToken(b) !== b.replace(/^#/, '').toLowerCase())
  if (corrected.length) {
    triggerToast('Se corrigieron palabras inválidas para Instagram', 'info', 3000)
  }

  emit('search', {
    hashtags: Array.from(new Set(sanitized)),
    resultsType: resultsType.value,
    resultsLimit: resultsLimit.value,
    keywordSearch: keywordSearch.value,
  })
}
</script>

<template>
  <div class="search-form">
    <div class="header">
      <i class="fas fa-magnifying-glass"></i>
      <div class="title">
        <h3>Buscar inspiración</h3>
        <p>Escribe palabras clave o hashtags para encontrar contenido viral</p>
      </div>
    </div>
    <div class="fields">
      <div class="input-row">
        <input
          class="input"
          type="text"
          v-model="input"
          placeholder="Escribe una palabra clave…"
          aria-label="Palabra clave"
          @keyup.enter="addKeyword"
        />
        <button class="btn ghost" @click="addKeyword" aria-label="Guardar palabra">
          <i class="fas fa-plus"></i>
          Guardar
        </button>
      </div>

      <div class="chips" v-if="saved.length">
        <span class="chip" v-for="k in saved" :key="k">
          #{{ k }}
          <button class="chip-remove" @click="removeKeyword(k)" aria-label="Quitar"><i class="fas fa-times"></i></button>
        </span>
        <button class="btn link" @click="clearKeywords">Limpiar</button>
      </div>

      <div class="controls">
        <div class="segmented">
          <button :class="['seg-btn', { active: resultsType==='posts' }]" @click="resultsType='posts'">Posts</button>
          <button :class="['seg-btn', { active: resultsType==='stories' }]" @click="resultsType='stories'">Stories</button>
        </div>
        <select class="select" v-model.number="resultsLimit" aria-label="Límite">
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
        <label class="toggle">
          <input type="checkbox" v-model="keywordSearch" />
          Buscar por palabras clave
        </label>
        <button class="btn" @click="submit" :disabled="!saved.length && !input.trim().length">
          <i class="fas fa-search"></i>
          Buscar
        </button>
      </div>
    </div>
  </div>
  </template>

<style lang="scss" scoped>
.search-form { display: grid; gap: 1rem; padding: 1rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; }
.header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.header i { color: $BAKANO-PURPLE; font-size: 1.25rem; }
.title h3 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 600; }
.title p { margin: 0; font-size: 0.875rem; color: #64748b; }
.fields { display: grid; gap: 0.75rem; }
.input-row { display: flex; gap: 0.5rem; }
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.controls { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.btn { display: inline-flex; align-items: center; gap: 0.5rem; background: $BAKANO-PINK; color: #fff; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.ghost { background: #f1f5f9; color: #1e293b; }
.btn.link { background: transparent; color: #1e293b; border: 1px dashed #e2e8f0; }
.toggle { display: inline-flex; align-items: center; gap: 0.5rem; color: #1e293b; }
.chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 0.25rem; background: #f8fafc; color: #334155; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; border: 1px solid #e2e8f0; }
.chip-remove { border: none; background: transparent; color: #64748b; display: inline-flex; align-items: center; }
.segmented { display: inline-flex; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.seg-btn { padding: 0.5rem 0.75rem; border: none; background: #fff; color: #1e293b; }
.seg-btn.active { background: $BAKANO-LIGHT; color: $BAKANO-DARK; }
@media (min-width: 768px) {
  .fields { grid-template-columns: 1fr auto; align-items: center; }
}
</style>