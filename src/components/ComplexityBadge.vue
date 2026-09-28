<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})

const colorClass = computed(() => {
  const v = props.value.toLowerCase()
  if (v.includes('o(1)')) return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
  if (v.includes('o(log n)')) return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40'
  if (v.includes('o(n)')) return 'bg-blue-950/60 text-blue-400 border-blue-800/40'
  if (v.includes('o(n log n)')) return 'bg-amber-950/60 text-amber-400 border-amber-800/40'
  if (v.includes('o(n²)') || v.includes('o(n^2)') || v.includes('o(2^n)') || v.includes('o(n!)')) {
    return 'bg-rose-950/60 text-rose-400 border-rose-800/40'
  }
  return 'bg-slate-800 text-slate-300 border-slate-700'
})
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-900/60 border-slate-800">
    <span class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{{ label }}</span>
    <span :class="['px-2 py-0.5 rounded text-xs font-mono font-bold border', colorClass]">
      {{ value }}
    </span>
  </div>
</template>
