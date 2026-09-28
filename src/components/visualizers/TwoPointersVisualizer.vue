<script setup>
import { ref } from 'vue'
import { Play, RotateCcw, ChevronRight, CheckCircle2 } from 'lucide-vue-next'

const numbers = [2, 4, 7, 11, 15, 18, 21, 26]
const target = ref(22)
const left = ref(0)
const right = ref(numbers.length - 1)
const status = ref('idle') // 'idle', 'searching', 'found', 'notFound'
const log = ref('Click "Step Pointers" to step through the converging indices.')

function nextStep() {
  if (status.value === 'found' || status.value === 'notFound') return
  status.value = 'searching'

  if (left.value >= right.value) {
    status.value = 'notFound'
    log.value = 'Pointers met! No pair sums to target.'
    return
  }

  const sum = numbers[left.value] + numbers[right.value]
  const tgt = Number(target.value)

  if (sum === tgt) {
    status.value = 'found'
    log.value = `Pair found: numbers[${left.value}] (${numbers[left.value]}) + numbers[${right.value}] (${numbers[right.value]}) == ${tgt}!`
  } else if (sum < tgt) {
    log.value = `${numbers[left.value]} + ${numbers[right.value]} = ${sum} < ${tgt}. Sum is too small -> Increment left.`
    left.value++
  } else {
    log.value = `${numbers[left.value]} + ${numbers[right.value]} = ${sum} > ${tgt}. Sum is too large -> Decrement right.`
    right.value--
  }
}

function reset() {
  left.value = 0
  right.value = numbers.length - 1
  status.value = 'idle'
  log.value = 'Click "Step Pointers" to step through the converging indices.'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <label class="text-xs text-slate-400 font-mono">Target Sum:</label>
        <input
          v-model.number="target"
          type="number"
          class="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
        />
        <button
          @click="nextStep"
          :disabled="status === 'found' || status === 'notFound'"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <ChevronRight class="w-3.5 h-3.5" /> Step Pointers
        </button>
      </div>

      <button
        @click="reset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status Banner -->
    <div
      :class="[
        'flex items-center gap-2 p-3 rounded-lg text-xs font-mono transition-colors',
        status === 'found'
          ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
          : 'bg-slate-900/60 border border-slate-800 text-slate-300'
      ]"
    >
      <CheckCircle2 v-if="status === 'found'" class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{{ log }}</span>
    </div>

    <!-- Array Canvas -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
      <div class="flex items-center justify-center gap-2 min-w-max py-6">
        <div
          v-for="(val, idx) in numbers"
          :key="idx"
          class="relative flex flex-col items-center"
        >
          <!-- Pointer Flags -->
          <div class="absolute -top-7 flex gap-1 text-[10px] font-mono font-bold">
            <span v-if="idx === left" class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">left</span>
            <span v-if="idx === right" class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">right</span>
          </div>

          <!-- Value Box -->
          <div
            :class="[
              'w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-base border-2 transition-all duration-300',
              status === 'found' && (idx === left || idx === right)
                ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30'
                : idx === left
                ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                : idx === right
                ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-700 text-slate-400'
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

    <!-- Calculation readout -->
    <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center text-xs font-mono">
      <span>Current Sum: </span>
      <span class="text-blue-400 font-bold">nums[{{ left }}] ({{ numbers[left] }})</span>
      <span> + </span>
      <span class="text-purple-400 font-bold">nums[{{ right }}] ({{ numbers[right] }})</span>
      <span> = </span>
      <strong class="text-cyan-300 text-sm">{{ numbers[left] + numbers[right] }}</strong>
      <span class="text-slate-500"> (Target: {{ target }})</span>
    </div>
  </div>
</template>
