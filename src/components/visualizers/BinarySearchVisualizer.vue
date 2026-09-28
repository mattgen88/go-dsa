<script setup>
import { ref } from 'vue'
import { Play, RotateCcw, ChevronRight, CheckCircle2, XCircle } from 'lucide-vue-next'

const array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
const target = ref(23)
const low = ref(0)
const high = ref(array.length - 1)
const mid = ref(Math.floor((0 + array.length - 1) / 2))
const step = ref(0)
const status = ref('idle') // 'idle', 'searching', 'found', 'notFound'
const logMessage = ref('Set a target number and click "Search" or "Step" to begin.')

function startSearch() {
  low.value = 0
  high.value = array.length - 1
  mid.value = Math.floor((low.value + high.value) / 2)
  step.value = 1
  status.value = 'searching'
  evaluateStep()
}

function nextStep() {
  if (status.value === 'idle') {
    startSearch()
    return
  }
  if (status.value === 'found' || status.value === 'notFound') {
    return
  }

  const currentMidVal = array[mid.value]
  const tgt = Number(target.value)

  if (currentMidVal === tgt) {
    status.value = 'found'
    logMessage.value = `Target ${tgt} matched at index ${mid.value}!`
    return
  }

  if (currentMidVal < tgt) {
    low.value = mid.value + 1
    logMessage.value = `${currentMidVal} < ${tgt}: Target is in right half. Set low = ${low.value}.`
  } else {
    high.value = mid.value - 1
    logMessage.value = `${currentMidVal} > ${tgt}: Target is in left half. Set high = ${high.value}.`
  }

  if (low.value > high.value) {
    status.value = 'notFound'
    logMessage.value = `Search space exhausted (low > high). Target ${tgt} not found in array.`
    return
  }

  mid.value = Math.floor((low.value + high.value) / 2)
  step.value++
}

function evaluateStep() {
  const currentMidVal = array[mid.value]
  const tgt = Number(target.value)
  if (currentMidVal === tgt) {
    status.value = 'found'
    logMessage.value = `Target ${tgt} found at mid index ${mid.value} in step ${step.value}!`
  } else if (currentMidVal < tgt) {
    logMessage.value = `Step ${step.value}: mid=[${mid.value}] (${currentMidVal}) < ${tgt}. Eliminate left half [${low.value}..${mid.value}].`
  } else {
    logMessage.value = `Step ${step.value}: mid=[${mid.value}] (${currentMidVal}) > ${tgt}. Eliminate right half [${mid.value}..${high.value}].`
  }
}

function handleReset() {
  low.value = 0
  high.value = array.length - 1
  mid.value = Math.floor((0 + array.length - 1) / 2)
  step.value = 0
  status.value = 'idle'
  logMessage.value = 'Set a target number and click "Search" or "Step" to begin.'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <label class="text-xs text-slate-400 font-mono">Target:</label>
        <input
          v-model.number="target"
          type="number"
          class="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
        />
        <button
          @click="startSearch"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Play class="w-3.5 h-3.5" /> Search
        </button>
        <button
          @click="nextStep"
          :disabled="status === 'found' || status === 'notFound'"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <ChevronRight class="w-3.5 h-3.5" /> Next Step
        </button>
      </div>

      <!-- Reset -->
      <button
        @click="handleReset"
        class="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition"
      >
        <RotateCcw class="w-3.5 h-3.5" /> Reset
      </button>
    </div>

    <!-- Live Status Banner -->
    <div
      :class="[
        'flex items-center gap-2 p-3 rounded-lg text-xs font-mono transition-colors',
        status === 'found'
          ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
          : status === 'notFound'
          ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
          : 'bg-slate-900/60 border border-slate-800 text-slate-300'
      ]"
    >
      <CheckCircle2 v-if="status === 'found'" class="w-4 h-4 text-emerald-400 shrink-0" />
      <XCircle v-else-if="status === 'notFound'" class="w-4 h-4 text-rose-400 shrink-0" />
      <span>{{ logMessage }}</span>
    </div>

    <!-- Array Visualizer -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
      <div class="flex items-center justify-center gap-2 min-w-max py-6">
        <div
          v-for="(val, idx) in array"
          :key="idx"
          class="relative flex flex-col items-center"
        >
          <!-- Pointer Flags -->
          <div class="absolute -top-7 flex gap-1 text-[10px] font-mono font-bold">
            <span v-if="status !== 'idle' && idx === low" class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">low</span>
            <span v-if="status !== 'idle' && idx === mid" class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">mid</span>
            <span v-if="status !== 'idle' && idx === high" class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">high</span>
          </div>

          <!-- Value Box -->
          <div
            :class="[
              'w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-base border-2 transition-all duration-300',
              status === 'found' && idx === mid
                ? 'bg-emerald-600 text-white border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30'
                : status !== 'idle' && idx === mid
                ? 'bg-amber-950/70 border-amber-400 text-amber-200 scale-105 shadow-md'
                : status !== 'idle' && (idx < low || idx > high)
                ? 'opacity-25 bg-slate-950 border-slate-800 text-slate-600'
                : 'bg-slate-950 border-slate-700 text-slate-200'
            ]"
          >
            {{ val }}
          </div>

          <!-- Index Label -->
          <div class="text-[10px] font-mono text-slate-500 mt-2">
            [{{ idx }}]
          </div>
        </div>
      </div>
    </div>

    <!-- Pointer Coordinates -->
    <div class="grid grid-cols-3 gap-3 text-center text-xs font-mono">
      <div class="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
        <span class="text-blue-400 font-semibold">low:</span> {{ status !== 'idle' ? low : '—' }}
      </div>
      <div class="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
        <span class="text-amber-400 font-semibold">mid:</span> {{ status !== 'idle' ? mid : '—' }} ({{ status !== 'idle' ? array[mid] : '—' }})
      </div>
      <div class="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
        <span class="text-purple-400 font-semibold">high:</span> {{ status !== 'idle' ? high : '—' }}
      </div>
    </div>
  </div>
</template>
