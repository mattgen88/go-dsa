<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Coins, Zap, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-vue-next'

const capacity = 5
const tokens = ref(5)
const refillRatePerSec = ref(1)
const requestLog = ref([])
let refillTimer = null

function sendRequest(count = 1) {
  const timestamp = new Date().toLocaleTimeString()
  if (tokens.value >= count) {
    tokens.value -= count
    requestLog.value.unshift({
      id: Date.now(),
      status: 'allowed',
      message: `200 OK — Consumed ${count} token(s). Remaining: ${tokens.value}`,
      time: timestamp
    })
  } else {
    requestLog.value.unshift({
      id: Date.now(),
      status: 'dropped',
      message: `429 Too Many Requests — Bucket empty! Rate limit exceeded.`,
      time: timestamp
    })
  }

  if (requestLog.value.length > 6) {
    requestLog.value.pop()
  }
}

function handleReset() {
  tokens.value = 5
  requestLog.value = []
}

onMounted(() => {
  refillTimer = setInterval(() => {
    if (tokens.value < capacity) {
      tokens.value = Math.min(capacity, tokens.value + 1)
    }
  }, 1000)
})

onUnmounted(() => {
  if (refillTimer) clearInterval(refillTimer)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <button
        @click="sendRequest(1)"
        class="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Zap class="w-3.5 h-3.5" /> Send Request (1 Token)
      </button>

      <button
        @click="sendRequest(3)"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Zap class="w-3.5 h-3.5" /> Burst 3 Requests
      </button>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Visual Bucket + Logs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
      <!-- Bucket Container (5 cols) -->
      <div class="md:col-span-5 flex flex-col items-center justify-center space-y-3">
        <div class="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
          <Coins class="w-4 h-4" />
          <span>Bucket (Refills 1 token/sec)</span>
        </div>

        <!-- The Physical Bucket -->
        <div class="w-36 h-48 border-x-4 border-b-4 border-cyan-500/60 bg-slate-950/80 rounded-b-2xl p-2.5 flex flex-col-reverse gap-2 shadow-inner">
          <div
            v-for="i in capacity"
            :key="i"
            :class="[
              'h-7 rounded-lg border font-mono text-xs font-bold flex items-center justify-center transition-all duration-300',
              i <= tokens
                ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'border-dashed border-slate-800 text-transparent'
            ]"
          >
            {{ i <= tokens ? '🪙 Token' : '' }}
          </div>
        </div>

        <div class="text-xs font-mono text-slate-300">
          Available: <strong class="text-amber-400 text-sm">{{ tokens }}</strong> / {{ capacity }}
        </div>
      </div>

      <!-- Live Traffic Logs (7 cols) -->
      <div class="md:col-span-7 space-y-2">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Incoming Traffic Log
        </div>

        <div class="space-y-1.5 min-h-[160px]">
          <div
            v-for="log in requestLog"
            :key="log.id"
            :class="[
              'p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all duration-200',
              log.status === 'allowed'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300 animate-pulse'
            ]"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2 v-if="log.status === 'allowed'" class="w-4 h-4 text-emerald-400 shrink-0" />
              <ShieldAlert v-else class="w-4 h-4 text-rose-400 shrink-0" />
              <span>{{ log.message }}</span>
            </div>
            <span class="text-[10px] text-slate-500 shrink-0">{{ log.time }}</span>
          </div>

          <div v-if="requestLog.length === 0" class="text-xs text-slate-600 italic py-8 text-center font-mono">
            No requests dispatched yet. Click "Send Request" to consume tokens.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
