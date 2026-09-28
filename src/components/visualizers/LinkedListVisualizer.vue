<script setup>
import { ref } from 'vue'
import { Plus, Trash2, ArrowRight, RotateCw, RotateCcw } from 'lucide-vue-next'

const nodes = ref([10, 20, 30, 40])
const inputValue = ref(50)
const deleteTarget = ref(20)
const isReversing = ref(false)

function handlePrepend() {
  if (inputValue.value !== null && !isNaN(inputValue.value)) {
    nodes.value.unshift(Number(inputValue.value))
    inputValue.value += 5
  }
}

function handleAppend() {
  if (inputValue.value !== null && !isNaN(inputValue.value)) {
    nodes.value.push(Number(inputValue.value))
    inputValue.value += 5
  }
}

function handleDelete() {
  const target = Number(deleteTarget.value)
  const idx = nodes.value.indexOf(target)
  if (idx !== -1) {
    nodes.value.splice(idx, 1)
  }
}

async function handleReverse() {
  if (nodes.value.length <= 1 || isReversing.value) return
  isReversing.value = true
  
  // Visual reversal
  const reversed = [...nodes.value].reverse()
  nodes.value = reversed
  setTimeout(() => {
    isReversing.value = false
  }, 600)
}

function handleReset() {
  nodes.value = [10, 20, 30, 40]
  inputValue.value = 50
  deleteTarget.value = 20
  isReversing.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls Bar -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <input
          v-model.number="inputValue"
          type="number"
          class="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
          placeholder="Val"
        />
        <button
          @click="handlePrepend"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
        >
          <Plus class="w-3.5 h-3.5" /> Prepend
        </button>
        <button
          @click="handleAppend"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> Append
        </button>
      </div>

      <div class="h-5 w-px bg-slate-700 hidden sm:block"></div>

      <!-- Delete control -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="deleteTarget"
          type="number"
          class="w-16 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-rose-400"
          placeholder="Val"
        />
        <button
          @click="handleDelete"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-xs transition"
        >
          <Trash2 class="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <!-- Reverse animation -->
      <button
        @click="handleReverse"
        :disabled="isReversing"
        class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition ml-auto"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isReversing }" /> Reverse List
      </button>

      <button
        @click="handleReset"
        class="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Node Pointers Visualizer Canvas -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto min-h-[160px] flex items-center">
      <!-- Head Label -->
      <div class="flex items-center gap-3">
        <div class="flex flex-col items-center mr-2">
          <span class="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">head</span>
          <ArrowRight class="w-4 h-4 text-cyan-400" />
        </div>

        <!-- Render list nodes -->
        <div
          v-for="(val, index) in nodes"
          :key="index"
          class="flex items-center group transition-all duration-300"
        >
          <!-- Node Box -->
          <div class="flex items-center rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg group-hover:border-cyan-500/80 transition">
            <!-- Data Field -->
            <div class="px-4 py-3 bg-slate-900 text-cyan-300 font-mono font-bold text-base min-w-[50px] text-center border-r border-slate-800">
              {{ val }}
              <div class="text-[9px] text-slate-500 font-normal">.Val</div>
            </div>
            <!-- Pointer Field -->
            <div class="px-3 py-3 bg-slate-950/80 text-slate-400 flex flex-col items-center justify-center">
              <div class="w-2.5 h-2.5 rounded-full bg-cyan-400/80"></div>
              <div class="text-[9px] text-slate-500 font-normal mt-0.5">.Next</div>
            </div>
          </div>

          <!-- Pointer Arrow to Next Node -->
          <div class="flex items-center px-2 text-cyan-500/70">
            <div class="w-4 h-0.5 bg-cyan-500/60"></div>
            <ArrowRight class="w-3.5 h-3.5 -ml-1 text-cyan-400" />
          </div>
        </div>

        <!-- nil Terminator -->
        <div class="px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg font-mono text-xs font-semibold text-rose-400">
          nil
        </div>
      </div>
    </div>

    <!-- State Description -->
    <div class="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
      <span>Total Nodes: <strong class="text-slate-200">{{ nodes.length }}</strong></span>
      <span>Head Value: <strong class="text-cyan-300">{{ nodes.length > 0 ? nodes[0] : 'nil' }}</strong></span>
      <span>Tail Value: <strong class="text-cyan-300">{{ nodes.length > 0 ? nodes[nodes.length - 1] : 'nil' }}</strong></span>
    </div>
  </div>
</template>
