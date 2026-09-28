<script setup>
import { ref, computed } from 'vue'
import { Plus, Trash2, Scissors, RotateCcw, Info } from 'lucide-vue-next'

const slice = ref([10, 20, 30, 40])
const capacity = ref(4)
const inputValue = ref(50)
const sliceLow = ref(1)
const sliceHigh = ref(3)
const subsliceActive = ref(false)
const subsliceView = ref([])
const reallocated = ref(false)

const currentLen = computed(() => slice.value.length)
const currentCap = computed(() => capacity.value)

function handleAppend() {
  if (inputValue.value === null || inputValue.value === undefined || isNaN(inputValue.value)) {
    return
  }
  const val = Number(inputValue.value)
  if (slice.value.length >= capacity.value) {
    // Go slice growth simulation: double capacity
    capacity.value = capacity.value === 0 ? 1 : capacity.value * 2
    reallocated.value = true
    setTimeout(() => { reallocated.value = false }, 1800)
  }
  slice.value.push(val)
  inputValue.value += 10
}

function handlePop() {
  if (slice.value.length > 0) {
    slice.value.pop()
  }
}

function handleSlice() {
  const low = Math.max(0, Math.min(sliceLow.value, slice.value.length))
  const high = Math.max(low, Math.min(sliceHigh.value, slice.value.length))
  subsliceView.value = slice.value.slice(low, high)
  subsliceActive.value = true
}

function handleReset() {
  slice.value = [10, 20, 30, 40]
  capacity.value = 4
  inputValue.value = 50
  subsliceActive.value = false
  reallocated.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls bar -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <input
          v-model.number="inputValue"
          type="number"
          class="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
          placeholder="Value"
        />
        <button
          @click="handleAppend"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> append()
        </button>
      </div>

      <button
        @click="handlePop"
        :disabled="slice.length === 0"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium transition"
      >
        <Trash2 class="w-3.5 h-3.5" /> pop()
      </button>

      <div class="h-5 w-px bg-slate-700 hidden sm:block"></div>

      <!-- Slicing controls -->
      <div class="flex items-center gap-2 text-xs text-slate-300">
        <span>s[</span>
        <input
          v-model.number="sliceLow"
          type="number"
          min="0"
          :max="slice.length"
          class="w-12 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center font-mono text-cyan-400"
        />
        <span>:</span>
        <input
          v-model.number="sliceHigh"
          type="number"
          min="0"
          :max="slice.length"
          class="w-12 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center font-mono text-cyan-400"
        />
        <span>]</span>
        <button
          @click="handleSlice"
          class="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition"
        >
          <Scissors class="w-3 h-3" /> Slice
        </button>
      </div>

      <button
        @click="handleReset"
        class="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition"
      >
        <RotateCcw class="w-3.5 h-3.5" /> Reset
      </button>
    </div>

    <!-- Reallocation alert banner -->
    <div
      v-if="reallocated"
      class="flex items-center gap-2 p-3 bg-cyan-950/60 border border-cyan-500/50 rounded-lg text-cyan-300 text-xs animate-pulse"
    >
      <Info class="w-4 h-4 text-cyan-400 shrink-0" />
      <span>
        <strong>Go Runtime Growth:</strong> Capacity exceeded! New underlying array allocated at a new heap memory address and elements copied.
      </span>
    </div>

    <!-- Slice Header Inspector -->
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
        <div class="text-[11px] uppercase tracking-wider text-slate-400">Data Pointer (*T)</div>
        <div class="font-mono text-cyan-400 font-semibold mt-1 text-sm">
          {{ reallocated ? '0xc0000a4080 (new)' : '0xc0000b2040' }}
        </div>
      </div>
      <div class="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
        <div class="text-[11px] uppercase tracking-wider text-slate-400">Length (len)</div>
        <div class="font-mono text-emerald-400 font-semibold mt-1 text-lg">
          {{ currentLen }}
        </div>
      </div>
      <div class="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
        <div class="text-[11px] uppercase tracking-wider text-slate-400">Capacity (cap)</div>
        <div class="font-mono text-amber-400 font-semibold mt-1 text-lg">
          {{ currentCap }}
        </div>
      </div>
    </div>

    <!-- Visual Memory Layout -->
    <div class="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
      <div class="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
        <span>Underlying Contiguous Memory Array</span>
        <span class="text-slate-500 text-[11px] font-mono">
          Filled: {{ currentLen }} / Allocated: {{ currentCap }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2 overflow-x-auto py-2">
        <!-- Render allocated slots up to capacity -->
        <div
          v-for="index in currentCap"
          :key="index"
          class="relative flex flex-col items-center"
        >
          <!-- Element Box -->
          <div
            :class="[
              'w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono font-semibold border transition-all duration-300',
              index <= currentLen
                ? 'bg-slate-800 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/40'
                : 'bg-slate-950/60 border-dashed border-slate-800 text-slate-600'
            ]"
          >
            <span class="text-base">
              {{ index <= currentLen ? slice[index - 1] : '—' }}
            </span>
          </div>

          <!-- Index Label -->
          <div class="text-[10px] font-mono text-slate-500 mt-1">
            [{{ index - 1 }}]
          </div>

          <!-- Len indicator -->
          <div
            v-if="index === currentLen"
            class="absolute -top-5 text-[9px] font-mono text-emerald-400 uppercase tracking-tight"
          >
            len
          </div>
        </div>
      </div>
    </div>

    <!-- Subslice Inspector -->
    <div v-if="subsliceActive" class="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
      <div class="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-2">
        <Scissors class="w-3.5 h-3.5" />
        <span>Sub-slice View: s[{{ sliceLow }}:{{ sliceHigh }}]</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          v-for="(val, i) in subsliceView"
          :key="i"
          class="w-12 h-12 bg-indigo-900/40 border border-indigo-500/60 text-indigo-200 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-sm"
        >
          {{ val }}
          <span class="text-[9px] text-indigo-400 font-normal">[{{ i }}]</span>
        </div>
        <div v-if="subsliceView.length === 0" class="text-xs text-slate-500 italic">
          Empty slice []
        </div>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">
        Points to the same underlying array starting at offset index {{ sliceLow }} with length {{ subsliceView.length }}.
      </p>
    </div>
  </div>
</template>
