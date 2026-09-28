<script setup>
import { ref } from 'vue'
import { ArrowDown, ArrowUp, Plus, Trash2, RotateCcw, ArrowRight } from 'lucide-vue-next'

const mode = ref('stack') // 'stack' or 'queue'
const items = ref(['Page 1', 'Page 2', 'Page 3'])
const inputValue = ref('Page 4')
const peekHighlight = ref(false)

function handleAdd() {
  if (!inputValue.value.trim()) return
  items.value.push(inputValue.value.trim())
  const nextNum = items.value.length + 1
  inputValue.value = mode.value === 'stack' ? `Page ${nextNum}` : `Task ${nextNum}`
}

function handleRemove() {
  if (items.value.length === 0) return
  if (mode.value === 'stack') {
    // Pop from end (top of stack)
    items.value.pop()
  } else {
    // Dequeue from front (head of queue)
    items.value.shift()
  }
}

function handlePeek() {
  peekHighlight.value = true
  setTimeout(() => {
    peekHighlight.value = false
  }, 1000)
}

function handleReset() {
  items.value = mode.value === 'stack' ? ['Page 1', 'Page 2', 'Page 3'] : ['Task 1', 'Task 2', 'Task 3']
  inputValue.value = mode.value === 'stack' ? 'Page 4' : 'Task 4'
  peekHighlight.value = false
}

function switchMode(newMode) {
  mode.value = newMode
  handleReset()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Mode Switcher & Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Mode Tabs -->
      <div class="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
        <button
          @click="switchMode('stack')"
          :class="[
            'px-3 py-1.5 rounded-md font-medium transition',
            mode === 'stack'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          Stack (LIFO)
        </button>
        <button
          @click="switchMode('queue')"
          :class="[
            'px-3 py-1.5 rounded-md font-medium transition',
            mode === 'queue'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          Queue (FIFO)
        </button>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <input
          v-model="inputValue"
          type="text"
          class="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          placeholder="Item label"
        />
        <button
          @click="handleAdd"
          class="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" />
          {{ mode === 'stack' ? 'Push()' : 'Enqueue()' }}
        </button>
        <button
          @click="handleRemove"
          :disabled="items.length === 0"
          class="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 disabled:opacity-50 rounded-lg text-xs font-medium transition"
        >
          <Trash2 class="w-3.5 h-3.5" />
          {{ mode === 'stack' ? 'Pop()' : 'Dequeue()' }}
        </button>
        <button
          @click="handlePeek"
          :disabled="items.length === 0"
          class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
        >
          Peek()
        </button>
        <button
          @click="handleReset"
          class="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
        >
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Visual Container -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center min-h-[240px]">
      <!-- STACK VISUALIZATION (Vertical Container) -->
      <div v-if="mode === 'stack'" class="flex flex-col items-center">
        <div class="text-[11px] font-mono text-cyan-400 mb-2 flex items-center gap-1">
          <ArrowDown class="w-3.5 h-3.5" /> Top of Stack (LIFO: Push & Pop here)
        </div>

        <div class="w-64 border-x-2 border-b-2 border-cyan-500/50 bg-slate-950/80 rounded-b-xl p-3 flex flex-col-reverse gap-2 min-h-[160px] shadow-inner">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            :class="[
              'px-4 py-2.5 rounded-lg border font-mono text-xs font-semibold flex items-center justify-between transition-all duration-300',
              idx === items.length - 1 && peekHighlight
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                : idx === items.length - 1
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                : 'bg-slate-900 border-slate-700/80 text-slate-300'
            ]"
          >
            <span>{{ item }}</span>
            <span class="text-[10px] text-slate-500">slot {{ idx }}</span>
          </div>
          <div v-if="items.length === 0" class="text-xs text-slate-600 text-center py-8 italic">
            Stack is empty
          </div>
        </div>
      </div>

      <!-- QUEUE VISUALIZATION (Horizontal Pipe) -->
      <div v-else class="w-full flex flex-col items-center">
        <div class="w-full max-w-xl flex items-center justify-between text-xs font-mono mb-2 px-4">
          <span class="text-rose-400 flex items-center gap-1">
            <ArrowRight class="w-3.5 h-3.5" /> Dequeue Front (Head)
          </span>
          <span class="text-emerald-400 flex items-center gap-1">
            Enqueue Rear (Tail) <ArrowRight class="w-3.5 h-3.5" />
          </span>
        </div>

        <div class="w-full max-w-xl border-y-2 border-slate-700 bg-slate-950/80 p-3 flex items-center gap-3 overflow-x-auto min-h-[90px] shadow-inner">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            :class="[
              'shrink-0 px-4 py-3 rounded-lg border font-mono text-xs font-semibold flex flex-col items-center min-w-[90px] transition-all duration-300',
              idx === 0 && peekHighlight
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                : idx === 0
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                : idx === items.length - 1
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            ]"
          >
            <span>{{ item }}</span>
            <span class="text-[9px] text-slate-500 mt-1 font-normal">
              {{ idx === 0 ? 'head' : idx === items.length - 1 ? 'tail' : `[${idx}]` }}
            </span>
          </div>
          <div v-if="items.length === 0" class="w-full text-xs text-slate-600 text-center py-4 italic">
            Queue is empty
          </div>
        </div>
      </div>
    </div>

    <!-- Status summary -->
    <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
      <span>Total Elements: <strong class="text-slate-200">{{ items.length }}</strong></span>
      <span>
        {{ mode === 'stack' ? 'Top Element: ' : 'Next in Line: ' }}
        <strong class="text-cyan-400">
          {{ items.length > 0 ? (mode === 'stack' ? items[items.length - 1] : items[0]) : 'None' }}
        </strong>
      </span>
    </div>
  </div>
</template>
