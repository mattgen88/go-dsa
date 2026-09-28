<script setup>
import { computed } from 'vue'
import { Terminal, Clock, CheckCircle2, AlertTriangle, Trash2, Globe } from 'lucide-vue-next'

const props = defineProps({
  output: {
    type: String,
    default: ''
  },
  errors: {
    type: String,
    default: ''
  },
  durationMs: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    default: '' // 'local', 'playground', 'offline'
  },
  isRunning: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear'])

const hasContent = computed(() => Boolean(props.output || props.errors || props.isRunning))
</script>

<template>
  <div class="flex flex-col h-full rounded-xl border border-slate-800 bg-[#070c18] overflow-hidden shadow-lg">
    <!-- Terminal Header Bar -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 mr-2">
          <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <Terminal class="w-3.5 h-3.5 text-cyan-400" />
        <span class="text-xs font-mono font-medium text-slate-300">Terminal Output</span>
      </div>

      <!-- Execution metadata tags -->
      <div class="flex items-center gap-2">
        <div
          v-if="isRunning"
          class="flex items-center gap-1.5 text-xs font-mono text-cyan-400 animate-pulse"
        >
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span>Compiling & Running...</span>
        </div>

        <div
          v-else-if="durationMs > 0"
          class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400"
        >
          <Clock class="w-3 h-3" />
          <span>{{ durationMs }}ms</span>
        </div>

        <div
          v-if="source"
          class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider"
          :class="source === 'playground' ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'"
        >
          <Globe v-if="source === 'playground'" class="w-2.5 h-2.5" />
          <span>{{ source === 'playground' ? 'Playground API' : 'Local Runner' }}</span>
        </div>

        <button
          v-if="hasContent && !isRunning"
          @click="emit('clear')"
          title="Clear console"
          class="p-1 text-slate-500 hover:text-slate-300 transition"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Output Body -->
    <div class="flex-1 p-4 font-mono text-xs overflow-y-auto min-h-[160px] max-h-[320px] select-text">
      <!-- Loading State -->
      <div v-if="isRunning" class="flex items-center gap-2 text-cyan-400/90 py-4 italic">
        <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Executing Go code in sandbox environment...</span>
      </div>

      <!-- Errors Output -->
      <div v-else-if="errors" class="space-y-2">
        <div class="flex items-center gap-1.5 text-rose-400 font-semibold">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span>Compilation / Execution Error:</span>
        </div>
        <pre class="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 whitespace-pre-wrap leading-relaxed">{{ errors }}</pre>
      </div>

      <!-- Success Stdout -->
      <pre
        v-else-if="output"
        class="text-slate-200 whitespace-pre-wrap leading-relaxed selection:bg-cyan-500/40"
      >{{ output }}</pre>

      <!-- Empty State -->
      <div v-else class="text-slate-600 italic py-6 text-center">
        No execution output yet. Click <strong class="text-slate-400 not-italic">▶ Run Code</strong> to compile and execute.
      </div>
    </div>
  </div>
</template>
