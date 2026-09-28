<script setup>
import { ref } from 'vue'
import { Play, RotateCcw, Plus, Scissors } from 'lucide-vue-next'

const intervals = ref([
  { start: 1, end: 3, merged: false },
  { start: 2, end: 6, merged: false },
  { start: 8, end: 10, merged: false },
  { start: 15, end: 18, merged: false }
])

const isMerged = ref(false)
const logMessage = ref('Intervals: [1, 3], [2, 6], [8, 10], [15, 18]. Click "Merge Overlapping" to consolidate.')

function handleMerge() {
  if (isMerged.value) return

  // Sort by start
  const sorted = [...intervals.value].sort((a, b) => a.start - b.start)
  const merged = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = sorted[i]

    if (curr.start <= prev.end) {
      // Overlap -> expand end
      prev.end = Math.max(prev.end, curr.end)
      prev.merged = true
    } else {
      merged.push({ ...curr })
    }
  }

  intervals.value = merged
  isMerged.value = true
  logMessage.value = `Merged into ${merged.length} non-overlapping intervals: ${merged.map(i => `[${i.start}, ${i.end}]`).join(', ')}.`
}

function handleReset() {
  intervals.value = [
    { start: 1, end: 3, merged: false },
    { start: 2, end: 6, merged: false },
    { start: 8, end: 10, merged: false },
    { start: 15, end: 18, merged: false }
  ]
  isMerged.value = false
  logMessage.value = 'Intervals reset to initial state.'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <button
        @click="handleMerge"
        :disabled="isMerged"
        class="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Play class="w-3.5 h-3.5" /> Merge Overlapping Intervals
      </button>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status -->
    <div class="p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300">
      {{ logMessage }}
    </div>

    <!-- Visual Timeline Canvas -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
      <div class="text-xs font-mono text-slate-400">Timeline (0 to 20 units):</div>

      <!-- Intervals rendered as horizontal bars -->
      <div class="space-y-2.5 py-4">
        <div
          v-for="(inv, idx) in intervals"
          :key="idx"
          class="relative h-10 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center px-2"
        >
          <!-- Interval bar positioned proportionally -->
          <div
            :style="{
              left: `${(inv.start / 20) * 100}%`,
              width: `${((inv.end - inv.start) / 20) * 100}%`
            }"
            :class="[
              'absolute h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center transition-all duration-300',
              inv.merged || isMerged
                ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-950'
                : 'bg-cyan-600/80 text-white shadow-sm'
            ]"
          >
            [{{ inv.start }}, {{ inv.end }}]
          </div>
        </div>
      </div>

      <!-- Axis markers -->
      <div class="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
        <span>0</span>
        <span>5</span>
        <span>10</span>
        <span>15</span>
        <span>20</span>
      </div>
    </div>
  </div>
</template>
