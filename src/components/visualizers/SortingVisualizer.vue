<script setup>
import { ref, onUnmounted } from 'vue'
import { Play, Pause, RotateCcw, Shuffle, ChevronRight } from 'lucide-vue-next'

const algorithm = ref('bubble')
const array = ref([45, 12, 85, 32, 89, 39, 69, 22, 58, 77, 15, 63])
const comparing = ref([])
const swapping = ref([])
const sortedIndices = ref(new Set())
const isRunning = ref(false)
const speed = ref(200) // ms per step

let timer = null

function randomizeArray() {
  stopSort()
  const arr = []
  for (let i = 0; i < 14; i++) {
    arr.push(Math.floor(Math.random() * 85) + 10)
  }
  array.value = arr
  comparing.value = []
  swapping.value = []
  sortedIndices.value = new Set()
}

function stopSort() {
  isRunning.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// Generate execution steps for chosen algorithm
function generateSteps() {
  const steps = []
  const arr = [...array.value]
  const n = arr.length

  if (algorithm.value === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ type: 'compare', indices: [j, j + 1] })
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp
          steps.push({ type: 'swap', indices: [j, j + 1], array: [...arr] })
        }
      }
      steps.push({ type: 'sorted', index: n - i - 1 })
    }
    steps.push({ type: 'sorted', index: 0 })
  } else if (algorithm.value === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', indices: [minIdx, j] })
        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }
      if (minIdx !== i) {
        const temp = arr[i]
        arr[i] = arr[minIdx]
        arr[minIdx] = temp
        steps.push({ type: 'swap', indices: [i, minIdx], array: [...arr] })
      }
      steps.push({ type: 'sorted', index: i })
    }
    steps.push({ type: 'sorted', index: n - 1 })
  } else if (algorithm.value === 'insertion') {
    steps.push({ type: 'sorted', index: 0 })
    for (let i = 1; i < n; i++) {
      let j = i
      while (j > 0) {
        steps.push({ type: 'compare', indices: [j - 1, j] })
        if (arr[j - 1] > arr[j]) {
          const temp = arr[j]
          arr[j] = arr[j - 1]
          arr[j - 1] = temp
          steps.push({ type: 'swap', indices: [j - 1, j], array: [...arr] })
          j--
        } else {
          break
        }
      }
      for (let k = 0; k <= i; k++) {
        steps.push({ type: 'sorted', index: k })
      }
    }
  }

  return steps
}

let allSteps = []
let currentStepIdx = 0

function startSort() {
  if (isRunning.value) {
    stopSort()
    return
  }

  allSteps = generateSteps()
  currentStepIdx = 0
  isRunning.value = true
  runLoop()
}

function runLoop() {
  if (!isRunning.value || currentStepIdx >= allSteps.length) {
    stopSort()
    comparing.value = []
    swapping.value = []
    return
  }

  const s = allSteps[currentStepIdx]
  if (s.type === 'compare') {
    comparing.value = s.indices
    swapping.value = []
  } else if (s.type === 'swap') {
    swapping.value = s.indices
    array.value = s.array
  } else if (s.type === 'sorted') {
    sortedIndices.value.add(s.index)
  }

  currentStepIdx++
  timer = setTimeout(runLoop, speed.value)
}

onUnmounted(() => {
  stopSort()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <select
          v-model="algorithm"
          :disabled="isRunning"
          class="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="bubble">Bubble Sort O(n²)</option>
          <option value="selection">Selection Sort O(n²)</option>
          <option value="insertion">Insertion Sort O(n²)</option>
        </select>

        <button
          @click="startSort"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Pause v-if="isRunning" class="w-3.5 h-3.5" />
          <Play v-else class="w-3.5 h-3.5" />
          {{ isRunning ? 'Pause' : 'Play Sort' }}
        </button>

        <button
          @click="randomizeArray"
          :disabled="isRunning"
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
        >
          <Shuffle class="w-3.5 h-3.5" /> Randomize
        </button>
      </div>

      <!-- Speed Slider -->
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span>Speed:</span>
        <input
          v-model.number="speed"
          type="range"
          min="50"
          max="500"
          step="50"
          class="w-24 accent-cyan-500 cursor-pointer"
        />
      </div>
    </div>

    <!-- Bar Chart Canvas -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl h-64 flex items-end justify-center gap-2 px-6">
      <div
        v-for="(val, idx) in array"
        :key="idx"
        class="flex-1 flex flex-col items-center justify-end h-full group"
      >
        <!-- Bar Value -->
        <span class="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition">
          {{ val }}
        </span>

        <!-- Bar Element -->
        <div
          :style="{ height: `${val * 2}px` }"
          :class="[
            'w-full max-w-[36px] rounded-t-md transition-all duration-150',
            swapping.includes(idx)
              ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
              : comparing.includes(idx)
              ? 'bg-amber-400 shadow-md shadow-amber-400/40'
              : sortedIndices.has(idx)
              ? 'bg-emerald-500/90'
              : 'bg-cyan-600/80 hover:bg-cyan-500'
          ]"
        ></div>

        <!-- Index label -->
        <span class="text-[9px] font-mono text-slate-500 mt-1">
          {{ idx }}
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-cyan-600"></div>
        <span>Unsorted</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-amber-400"></div>
        <span>Comparing</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-rose-500"></div>
        <span>Swapping</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-emerald-500"></div>
        <span>Sorted</span>
      </div>
    </div>
  </div>
</template>
