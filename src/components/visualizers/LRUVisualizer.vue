<script setup>
import { ref } from 'vue'
import { Plus, Search, RotateCcw, ArrowRight, Trash2 } from 'lucide-vue-next'

const capacity = 4
const cache = ref([
  { key: 'user:1', val: 'Alice' },
  { key: 'user:2', val: 'Bob' },
  { key: 'user:3', val: 'Charlie' }
])

const inputKey = ref('user:4')
const inputVal = ref('David')
const getKey = ref('user:1')
const logMessage = ref('LRU Cache (Capacity: 4). MRU is on the Left, LRU on the Right.')
const evictedItem = ref(null)
const hitKey = ref(null)

function handlePut() {
  const k = inputKey.value.trim()
  const v = inputVal.value.trim()
  if (!k) return

  hitKey.value = null
  evictedItem.value = null

  // Check if exists
  const existingIdx = cache.value.findIndex(item => item.key === k)
  if (existingIdx !== -1) {
    // Update value and move to MRU (front)
    cache.value.splice(existingIdx, 1)
    cache.value.unshift({ key: k, val: v })
    logMessage.value = `Updated key '${k}' -> moved to MRU (front).`
    return
  }

  // If at capacity, evict LRU (tail)
  if (cache.value.length >= capacity) {
    const evicted = cache.value.pop()
    evictedItem.value = evicted
    logMessage.value = `Cache full! Evicted LRU item '${evicted.key}' to insert '${k}'.`
  } else {
    logMessage.value = `Inserted '${k}' at MRU (front).`
  }

  cache.value.unshift({ key: k, val: v })
  const nextId = cache.value.length + 2
  inputKey.value = `user:${nextId}`
  inputVal.value = `User-${nextId}`
}

function handleGet() {
  const k = getKey.value.trim()
  evictedItem.value = null
  const idx = cache.value.findIndex(item => item.key === k)

  if (idx !== -1) {
    const item = cache.value.splice(idx, 1)[0]
    cache.value.unshift(item) // Move to MRU front
    hitKey.value = k
    logMessage.value = `Cache HIT for '${k}'! Value: '${item.val}'. Promoted to MRU front.`
  } else {
    hitKey.value = null
    logMessage.value = `Cache MISS for '${k}'! Key not in cache.`
  }
}

function handleReset() {
  cache.value = [
    { key: 'user:1', val: 'Alice' },
    { key: 'user:2', val: 'Bob' },
    { key: 'user:3', val: 'Charlie' }
  ]
  inputKey.value = 'user:4'
  inputVal.value = 'David'
  getKey.value = 'user:1'
  evictedItem.value = null
  hitKey.value = null
  logMessage.value = 'Cache reset to initial state.'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Put -->
      <div class="flex items-center gap-1.5">
        <input
          v-model="inputKey"
          type="text"
          class="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400"
          placeholder="Key"
        />
        <input
          v-model="inputVal"
          type="text"
          class="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400"
          placeholder="Val"
        />
        <button
          @click="handlePut"
          class="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> Put(k, v)
        </button>
      </div>

      <!-- Get -->
      <div class="flex items-center gap-1.5">
        <input
          v-model="getKey"
          type="text"
          class="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-400"
          placeholder="Key"
        />
        <button
          @click="handleGet"
          class="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Search class="w-3.5 h-3.5" /> Get(k)
        </button>
      </div>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status banner -->
    <div class="p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center justify-between">
      <span>{{ logMessage }}</span>
      <span class="text-slate-500 text-[11px]">Slots: {{ cache.length }} / {{ capacity }}</span>
    </div>

    <!-- Doubly Linked List Visualizer -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto min-h-[140px] flex items-center justify-center">
      <div class="flex items-center gap-3">
        <!-- MRU Label -->
        <div class="flex flex-col items-center mr-2">
          <span class="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">MRU (Head)</span>
          <ArrowRight class="w-4 h-4 text-emerald-400" />
        </div>

        <!-- Cache Node Cards -->
        <div
          v-for="(item, idx) in cache"
          :key="item.key"
          class="flex items-center group transition-all duration-300"
        >
          <div
            :class="[
              'flex flex-col p-3 rounded-xl border bg-slate-950 min-w-[100px] shadow-lg transition-all duration-300',
              hitKey === item.key
                ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-amber-500/20'
                : idx === 0
                ? 'border-emerald-500/80 shadow-emerald-950/40'
                : idx === cache.length - 1
                ? 'border-rose-500/60 shadow-rose-950/40'
                : 'border-slate-700'
            ]"
          >
            <div class="text-[10px] font-mono text-slate-400 font-bold truncate">
              {{ item.key }}
            </div>
            <div class="text-sm font-mono font-bold text-cyan-300 mt-0.5 truncate">
              {{ item.val }}
            </div>
            <div class="text-[9px] text-slate-500 mt-1 font-mono">
              {{ idx === 0 ? 'MRU' : idx === cache.length - 1 ? 'LRU (Next to Evict)' : `slot ${idx}` }}
            </div>
          </div>

          <!-- Pointer link -->
          <div v-if="idx < cache.length - 1" class="flex items-center px-1 text-slate-600">
            <div class="w-4 h-0.5 bg-slate-700"></div>
          </div>
        </div>

        <!-- LRU Label -->
        <div class="flex flex-col items-center ml-2">
          <span class="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">LRU (Tail)</span>
        </div>
      </div>
    </div>

    <!-- Eviction notice -->
    <div
      v-if="evictedItem"
      class="p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs font-mono text-rose-300 flex items-center gap-2"
    >
      <Trash2 class="w-4 h-4 text-rose-400 shrink-0" />
      <span>Evicted from memory: <strong>{{ evictedItem.key }}</strong> ({{ evictedItem.val }})</span>
    </div>
  </div>
</template>
