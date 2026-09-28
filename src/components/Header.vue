<script setup>
import { ref } from 'vue'
import { Terminal, Search, Award, CheckCircle, ExternalLink, Zap } from 'lucide-vue-next'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  backendConnected: {
    type: Boolean,
    default: false
  },
  completedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 14
  }
})

const emit = defineEmits(['update:searchQuery', 'open-playground'])
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <span class="font-mono font-extrabold text-cyan-400 text-lg tracking-tighter">go</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-base text-slate-100 tracking-tight">GoDSA Lab</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Interactive
            </span>
          </div>
          <p class="text-xs text-slate-400 hidden sm:block">Data Structures & Algorithms in Go</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 max-w-md mx-4 hidden md:block">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            :value="searchQuery"
            @input="emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search topics, algorithms, complexities (e.g. BST, O(log n), BFS)..."
            class="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
          />
        </div>
      </div>

      <!-- Right Action Items -->
      <div class="flex items-center gap-3">
        <!-- Progress Counter -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <Award class="w-4 h-4 text-amber-400" />
          <span class="text-slate-400">Mastery:</span>
          <span class="font-mono font-bold text-cyan-300">{{ completedCount }}/{{ totalCount }}</span>
        </div>

        <!-- Backend Status Badge -->
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border"
          :class="backendConnected
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
            : 'bg-amber-950/40 text-amber-400 border-amber-800/40'"
          :title="backendConnected ? 'Go server connected for local execution & formatting' : 'Running in playground mode. Start Go server with npm run server for local execution.'"
        >
          <div
            class="w-2 h-2 rounded-full"
            :class="backendConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'"
          ></div>
          <span class="hidden sm:inline">{{ backendConnected ? 'Go Server Active' : 'Playground Mode' }}</span>
        </div>

        <!-- Go Playground official link -->
        <a
          href="https://go.dev/play"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
        >
          <span>go.dev/play</span>
          <ExternalLink class="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </div>
  </header>
</template>
