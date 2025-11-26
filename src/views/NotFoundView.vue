<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const seconds = ref(5)
let timer: number | null = null

const goHome = () => router.push('/')

onMounted(() => {
  timer = setInterval(() => {
    seconds.value--
    if (seconds.value <= 0) {
      if (timer) clearInterval(timer)
      goHome()
    }
  }, 1000)
})
</script>

<template>
  <div class="notfound">
    <div class="card">
      <div class="icon">
        <i class="fas fa-triangle-exclamation"></i>
      </div>
      <h1>Página no encontrada</h1>
      <p>La ruta "{{ route.fullPath }}" no existe.</p>
      <p class="hint">Serás redirigido al inicio en {{ seconds }}s</p>
      <button class="btn" @click="goHome">Ir al inicio</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notfound {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 16px;
}

.card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.icon {
  font-size: 2rem;
  color: $BAKANO-PINK;
  margin-bottom: 10px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  margin: 0 0 6px;
}

p {
  color: lighten($BAKANO-DARK, 30%);
  margin: 0 0 8px;
}

.hint {
  font-size: 0.875rem;
}

.btn {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba($BAKANO-PINK, 0.3);
  background: $overlay-purple;
  color: $BAKANO-PINK;
  font-weight: 700;
  cursor: pointer;
}

@media (min-width: 768px) {
  .card {
    padding: 32px;
  }
}
</style>

