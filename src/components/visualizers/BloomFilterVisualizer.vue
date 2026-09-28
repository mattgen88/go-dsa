<script setup>
import { ref } from 'vue'
import { Plus, Search, RotateCcw, CheckCircle2, XCircle } from 'lucide-vue-next'

const bitSize = 16
const bits = ref(new Array(bitSize).fill(0))
const insertedWords = ref(['golang', 'redis'])
const inputWord = ref('postgres')
const queryWord = ref('golang')
const queryStatus = ref(null)
const logMessage = ref('Bloom Filter (16 bits, 3 hash functions). Probabilistic set membership.')

// 3 simple hash functions for demonstration
function hash1(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % bitSize
  return Math.abs(h)
}

function hash2(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 17 + str.charCodeAt(i) * 7) % bitSize
  return Math.abs(h)
}

function hash3(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 53 + str.charCodeAt(i) * 13) % bitSize
  return Math.abs(h)
}

function getIndices(str) {
  return [hash1(str), hash2(str), hash3(str)]
}

// Prepopulate initial
for (const w of insertedWords.value) {
  for (const idx of getIndices(w)) {
    bits.value[idx] = 1
  }
}

function handleAdd() {
  const w = inputWord.value.trim().toLowerCase()
  if (!w) return

  const indices = getIndices(w)
  for (const idx of indices) {
    bits.value[idx] = 1
  }
  if (!insertedWords.value.includes(w)) {
    insertedWords.value.push(w)
  }
  queryStatus.value = null
  logMessage.value = `Inserted '${w}': sets bits at indices [${indices.join(', ')}].`
  inputWord.value = ''
}

function handleQuery() {
  const w = queryWord.value.trim().toLowerCase()
  if (!w) return

  const indices = getIndices(w)
  const allSet = indices.every(idx => bits.value[idx] === 1)

  if (allSet) {
    queryStatus.value = 'maybe'
    logMessage.value = `Query '${w}': bits at [${indices.join(', ')}] are all 1 -> PROBABLY in set (or false positive)!`
  } else {
    queryStatus.value = 'no'
    const missing = indices.filter(idx => bits.value[idx] === 0)
    logMessage.value = `Query '${w}': bit ${missing[0]} is 0 -> DEFINITELY NOT in set!`
  }
}

function handleReset() {
  bits.value = new Array(bitSize).fill(0)
  insertedWords.value = []
  queryStatus.value = null
  logMessage.value = 'Bloom filter reset to empty.'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Add -->
      <div class="flex items-center gap-1.5">
        <input
          v-model="inputWord"
          type="text"
          class="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400"
          placeholder="Word"
        />
        <button
          @click="handleAdd"
          class="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <!-- Query -->
      <div class="flex items-center gap-1.5">
        <input
          v-model="queryWord"
          type="text"
          class="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-400"
          placeholder="Test word"
        />
        <button
          @click="handleQuery"
          class="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Search class="w-3.5 h-3.5" /> Test
        </button>
      </div>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status Banner -->
    <div
      :class="[
        'p-3 rounded-xl border text-xs font-mono flex items-center justify-between transition-colors',
        queryStatus === 'maybe'
          ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
          : queryStatus === 'no'
          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          : 'bg-slate-900/70 border-slate-800 text-slate-300'
      ]"
    >
      <div class="flex items-center gap-2">
        <CheckCircle2 v-if="queryStatus === 'no'" class="w-4 h-4 text-emerald-400 shrink-0" />
        <span v-else-if="queryStatus === 'maybe'" class="text-amber-400 font-bold shrink-0">~</span>
        <span>{{ logMessage }}</span>
      </div>
    </div>

    <!-- Bit Array Canvas -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
      <div class="text-xs font-mono text-slate-400 flex items-center justify-between">
        <span>Bit Array (m = 16 bits)</span>
        <span class="text-slate-500">Bits set: {{ bits.filter(b => b === 1).length }} / {{ bitSize }}</span>
      </div>

      <div class="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
        <div
          v-for="(val, idx) in bits"
          :key="idx"
          :class="[
            'h-12 rounded-lg border font-mono font-bold flex flex-col items-center justify-center transition-all duration-300',
            val === 1
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/60'
              : 'bg-slate-950 border-slate-800 text-slate-600'
          ]"
        >
          <span class="text-sm">{{ val }}</span>
          <span class="text-[9px] text-slate-500 font-normal font-mono">[{{ idx }}]</span>
        </div>
      </div>
    </div>

    <!-- Inserted Items -->
    <div class="flex items-center gap-2 text-xs font-mono">
      <span class="text-slate-400">Items in Filter:</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          v-for="w in insertedWords"
          :key="w"
          class="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300"
        >
          {{ w }}
        </span>
      </div>
    </div>
  </div>
</template>
