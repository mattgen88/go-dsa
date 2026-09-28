<script setup>
import { ref, watch, computed } from 'vue'
import confetti from 'canvas-confetti'
import {
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  ExternalLink,
  CheckCircle2,
  Check,
  BookOpen,
  Eye,
  Code2,
  Terminal,
  Cpu,
  Layers
} from 'lucide-vue-next'
import ComplexityBadge from './ComplexityBadge.vue'
import Visualizer from './Visualizer.vue'
import CodeEditor from './CodeEditor.vue'
import OutputConsole from './OutputConsole.vue'
import { runGoCode, formatGoCode, shareToPlayground } from '../services/playground'

const props = defineProps({
  topic: {
    type: Object,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-complete'])

// Active main tab: 'visualizer' | 'theory' | 'code'
const activeMainTab = ref('visualizer')

// Code editor active snippet tab: 'core' | 'practical' | 'exercise'
const activeCodeTab = ref('core')

// Current code in editor
const editorCode = ref('')

// Execution output state
const isRunning = ref(false)
const consoleOutput = ref('')
const consoleErrors = ref('')
const executionDuration = ref(0)
const runnerSource = ref('')

// Copied feedback
const copied = ref(false)
const isSharing = ref(false)

// Sync code whenever topic or activeCodeTab changes
function syncEditorCode() {
  if (props.topic && props.topic.codeSamples) {
    editorCode.value = props.topic.codeSamples[activeCodeTab.value] || props.topic.codeSamples.core
  }
  consoleOutput.value = ''
  consoleErrors.value = ''
  executionDuration.value = 0
  runnerSource.value = ''
}

watch(() => props.topic, () => {
  syncEditorCode()
}, { immediate: true })

watch(activeCodeTab, () => {
  syncEditorCode()
})

async function handleRunCode() {
  if (isRunning.value) return
  isRunning.value = true
  consoleOutput.value = ''
  consoleErrors.value = ''

  const res = await runGoCode(editorCode.value)
  isRunning.value = false
  consoleOutput.value = res.output
  consoleErrors.value = res.errors
  executionDuration.value = res.durationMs
  runnerSource.value = res.source

  // Check if test passed in exercise
  if (activeCodeTab.value === 'exercise' && res.success && (res.output.includes('SUCCESS') || res.output.includes('PASS') || res.output.includes('All tests passed'))) {
    triggerCelebration()
    if (!props.isCompleted) {
      emit('toggle-complete', props.topic.id)
    }
  }
}

async function handleFormatCode() {
  const res = await formatGoCode(editorCode.value)
  if (res.success && res.code) {
    editorCode.value = res.code
  } else if (res.error) {
    consoleErrors.value = `Format error: ${res.error}`
  }
}

function handleResetCode() {
  if (props.topic && props.topic.codeSamples) {
    editorCode.value = props.topic.codeSamples[activeCodeTab.value] || props.topic.codeSamples.core
  }
}

async function handleCopyCode() {
  try {
    await navigator.clipboard.writeText(editorCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    // clipboard failed
  }
}

async function handleShareToPlayground() {
  if (isSharing.value) return
  isSharing.value = true
  const res = await shareToPlayground(editorCode.value)
  isSharing.value = false
  if (res.url) {
    window.open(res.url, '_blank')
  }
}

function triggerCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  })
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-16">
    <!-- Topic Header -->
    <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold">
              {{ topic.category.replace('-', ' ') }}
            </span>
            <span class="text-slate-600">•</span>
            <span class="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {{ topic.difficulty }}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-slate-100 tracking-tight">{{ topic.title }}</h2>
          <p class="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">{{ topic.summary }}</p>
        </div>

        <!-- Mark as complete button -->
        <button
          @click="emit('toggle-complete', topic.id); if (!isCompleted) triggerCelebration();"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-sm',
            isCompleted
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
          ]"
        >
          <CheckCircle2 :class="['w-4 h-4', isCompleted ? 'text-emerald-400' : 'text-slate-500']" />
          <span>{{ isCompleted ? 'Completed' : 'Mark Completed' }}</span>
        </button>
      </div>

      <!-- Complexity Matrix -->
      <div class="pt-3 border-t border-slate-800/80">
        <div class="text-[11px] font-mono text-slate-500 mb-2 uppercase tracking-wider">Complexity Profile</div>
        <div class="flex flex-wrap gap-2">
          <ComplexityBadge
            v-for="(val, key) in topic.timeComplexity"
            :key="key"
            :label="key"
            :value="val"
          />
        </div>
      </div>
    </div>

    <!-- Main Section Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
      <button
        @click="activeMainTab = 'visualizer'"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition',
          activeMainTab === 'visualizer'
            ? 'bg-cyan-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        ]"
      >
        <Eye class="w-4 h-4" />
        <span>Interactive Visualizer</span>
      </button>

      <button
        @click="activeMainTab = 'code'"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition',
          activeMainTab === 'code'
            ? 'bg-cyan-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        ]"
      >
        <Code2 class="w-4 h-4" />
        <span>Go Code Runner</span>
      </button>

      <button
        @click="activeMainTab = 'theory'"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition',
          activeMainTab === 'theory'
            ? 'bg-cyan-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        ]"
      >
        <BookOpen class="w-4 h-4" />
        <span>Theory & Go Internals</span>
      </button>
    </div>

    <!-- TAB 1: INTERACTIVE VISUALIZER -->
    <div v-show="activeMainTab === 'visualizer'" class="space-y-6">
      <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Cpu class="w-4 h-4 text-cyan-400" />
            <h3 class="text-sm font-bold text-slate-200">Interactive Simulation</h3>
          </div>
          <span class="text-xs text-slate-500 font-mono">Live Widget</span>
        </div>

        <!-- Render the dynamic visualizer widget -->
        <Visualizer :type="topic.visualizerType" />
      </div>

      <!-- Quick concept highlights below visualizer -->
      <div class="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Key Takeaways</h4>
        <ul class="space-y-1.5 text-xs text-slate-300">
          <li v-for="(point, idx) in topic.keyPoints" :key="idx" class="flex items-start gap-2">
            <span class="text-cyan-400 font-bold mt-0.5">•</span>
            <span class="leading-relaxed">{{ point }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- TAB 2: THEORY & GO INTERNALS -->
    <div v-show="activeMainTab === 'theory'" class="space-y-6">
      <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu class="w-4 h-4 text-cyan-400" />
          <span>Go Runtime & Memory Representation</span>
        </h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          How Go implements this structure under the hood in memory, its interaction with the garbage collector (GC), and idiomatic Go idioms.
        </p>

        <pre class="p-4 rounded-xl bg-[#080d1a] border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">{{ topic.goInternals }}</pre>
      </div>

      <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
        <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Layers class="w-4 h-4 text-cyan-400" />
          <span>Core Concepts & Principles</span>
        </h3>
        <div class="grid sm:grid-cols-2 gap-3 pt-2">
          <div
            v-for="(point, idx) in topic.keyPoints"
            :key="idx"
            class="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed"
          >
            {{ point }}
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: CODE RUNNER & PLAYGROUND -->
    <div v-show="activeMainTab === 'code'" class="space-y-4">
      <!-- Snippet Sub-Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <!-- Sub-tabs -->
        <div class="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            @click="activeCodeTab = 'core'"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition',
              activeCodeTab === 'core'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            1. Core Implementation
          </button>
          <button
            @click="activeCodeTab = 'practical'"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition',
              activeCodeTab === 'practical'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            2. Real-World Problem
          </button>
          <button
            @click="activeCodeTab = 'exercise'"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition',
              activeCodeTab === 'exercise'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            3. Practice Challenge
          </button>
        </div>

        <!-- Action Toolbar -->
        <div class="flex items-center gap-2">
          <!-- Run Button -->
          <button
            @click="handleRunCode"
            :disabled="isRunning"
            class="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950 transition"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>{{ isRunning ? 'Running...' : 'Run Code' }}</span>
          </button>

          <!-- Format Button -->
          <button
            @click="handleFormatCode"
            title="Format with go fmt"
            class="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
            <span class="hidden sm:inline">Format</span>
          </button>

          <!-- Copy Button -->
          <button
            @click="handleCopyCode"
            title="Copy Code"
            class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
            <Copy v-else class="w-3.5 h-3.5" />
          </button>

          <!-- Reset Button -->
          <button
            @click="handleResetCode"
            title="Reset code to initial"
            class="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>

          <!-- Open in official Go Playground -->
          <button
            @click="handleShareToPlayground"
            :disabled="isSharing"
            title="Open in official Go Playground (go.dev/play)"
            class="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 text-cyan-300 rounded-lg text-xs font-medium transition"
          >
            <span>{{ isSharing ? 'Sharing...' : 'Open Go.dev' }}</span>
            <ExternalLink class="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </div>

      <!-- Editor + Console Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Code Editor (7 cols) -->
        <div class="lg:col-span-7 h-[460px]">
          <CodeEditor v-model="editorCode" />
        </div>

        <!-- Output Console (5 cols) -->
        <div class="lg:col-span-5 h-[460px]">
          <OutputConsole
            :output="consoleOutput"
            :errors="consoleErrors"
            :duration-ms="executionDuration"
            :source="runnerSource"
            :is-running="isRunning"
            @clear="consoleOutput = ''; consoleErrors = ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>
