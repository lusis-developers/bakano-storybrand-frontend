<script setup lang="ts">
const props = defineProps({
  count: { type: Number, required: false, default: 6 },
})
</script>

<template>
  <div class="grid">
    <div class="skeleton" v-for="i in props.count" :key="i">
      <div class="line w-60"></div>
      <div class="line w-40"></div>
      <div class="line w-80"></div>
      <div class="line w-30"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }
.skeleton { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; }
.line { height: 10px; background: #f1f5f9; border-radius: 6px; margin-bottom: 8px; position: relative; overflow: hidden; }
.line::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(241,245,249,0) 0%, rgba(226,232,240,0.8) 50%, rgba(241,245,249,0) 100%); animation: shimmer 1.6s infinite; }
.w-60 { width: 60%; }
.w-40 { width: 40%; }
.w-80 { width: 80%; }
.w-30 { width: 30%; }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
</style>