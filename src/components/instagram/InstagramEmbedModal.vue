<script setup lang="ts">
import { onMounted, watch, computed, nextTick, ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  permalink: { type: String, required: false },
})
const emit = defineEmits<{ close: [] }>()
const modalRef = ref<HTMLElement | null>(null)
const loading = ref(false)

const ensureEmbedScript = () => {
  const id = 'ig-embed-js'
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.id = id
  s.src = 'https://www.instagram.com/embed.js'
  s.async = true
  document.body.appendChild(s)
}

const processEmbeds = () => {
  const w = window as any
  if (w.instgrm && w.instgrm.Embeds && typeof w.instgrm.Embeds.process === 'function') {
    w.instgrm.Embeds.process()
  }
}

const waitForEmbed = () => {
  loading.value = true
  let tries = 0
  const check = () => {
    const hasIframe = !!modalRef.value?.querySelector('iframe')
    if (hasIframe) {
      loading.value = false
      return
    }
    tries += 1
    if (tries < 60) {
      setTimeout(check, 100)
    } else {
      loading.value = false
    }
  }
  setTimeout(check, 120)
}

onMounted(() => {
  ensureEmbedScript()
  processEmbeds()
})
watch(() => props.permalink, async () => { await nextTick(); processEmbeds(); waitForEmbed() })
watch(() => props.open, async (val) => { if (val) { await nextTick(); processEmbeds(); waitForEmbed() } })

const normalizedPermalink = computed(() => {
  const url = (props.permalink || '').trim()
  if (!url) return ''
  const hasSlash = url.endsWith('/')
  const base = hasSlash ? url : `${url}/`
  return base.includes('?') ? base : `${base}?utm_source=ig_embed`
})
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal" ref="modalRef">
      <button class="close" @click="emit('close')"><i class="fas fa-times"></i></button>
      <div v-if="loading" class="loader"><i class="fa-solid fa-spinner fa-spin"></i></div>
      <blockquote
        class="instagram-media"
        :key="normalizedPermalink"
        :data-instgrm-permalink="normalizedPermalink"
        data-instgrm-version="14"
      ></blockquote>
      <div v-if="!normalizedPermalink" class="fallback">No se pudo cargar el contenido.</div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  overflow: auto;
  padding: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #1e293b;
}
.loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.modal .instagram-media {
  width: 100%;
}
.fallback { margin-top: 0.75rem; font-size: 0.875rem; color: #334155; }
</style>