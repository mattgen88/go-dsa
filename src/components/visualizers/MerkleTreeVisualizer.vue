<script setup>
import { ref, computed } from 'vue'
import { ShieldCheck, ShieldAlert, RotateCcw, Edit3, ArrowUp } from 'lucide-vue-next'

// Initial blocks
const block1 = ref('Tx1: Alice pays Bob $10')
const block2 = ref('Tx2: Bob pays Charlie $5')
const block3 = ref('Tx3: Charlie pays Dave $2')
const block4 = ref('Tx4: Dave pays Eve $8')

const isTampered = ref(false)

// Fast 32-bit FNV-1a hex hash for visual representation
function miniHash(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

// Compute Leaf Hashes
const hash1 = computed(() => miniHash(block1.value))
const hash2 = computed(() => miniHash(block2.value))
const hash3 = computed(() => miniHash(block3.value))
const hash4 = computed(() => miniHash(block4.value))

// Compute Intermediate Parent Hashes
const hash12 = computed(() => miniHash(hash1.value + hash2.value))
const hash34 = computed(() => miniHash(hash3.value + hash4.value))

// Compute Top Merkle Root Hash
const merkleRoot = computed(() => miniHash(hash12.value + hash34.value))

function tamperBlock2() {
  block2.value = 'Tx2: Bob pays Hacker $500 [TAMPERED]'
  isTampered.value = true
}

function handleReset() {
  block1.value = 'Tx1: Alice pays Bob $10'
  block2.value = 'Tx2: Bob pays Charlie $5'
  block3.value = 'Tx3: Charlie pays Dave $2'
  block4.value = 'Tx4: Dave pays Eve $8'
  isTampered.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-2">
        <button
          @click="tamperBlock2"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition',
            isTampered
              ? 'bg-rose-950/80 border border-rose-600 text-rose-300'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          ]"
        >
          <Edit3 class="w-3.5 h-3.5" /> Tamper with Transaction 2
        </button>

        <span class="text-xs text-slate-400 font-mono hidden sm:inline">
          {{ isTampered ? 'Tampering detected! Avalanche effect propagates up to Root.' : 'Tree is valid & verified.' }}
        </span>
      </div>

      <button
        @click="handleReset"
        title="Reset Data Blocks"
        class="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status Banner -->
    <div
      :class="[
        'p-3 rounded-xl border text-xs font-mono flex items-center justify-between transition-colors',
        isTampered
          ? 'bg-rose-950/50 border-rose-500/60 text-rose-300'
          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
      ]"
    >
      <div class="flex items-center gap-2">
        <ShieldAlert v-if="isTampered" class="w-4 h-4 text-rose-400 shrink-0" />
        <ShieldCheck v-else class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Merkle Root Hash: <strong class="font-mono text-sm tracking-wider">{{ merkleRoot }}</strong>
          {{ isTampered ? ' (CRYPTOGRAPHIC INTEGRITY BROKEN!)' : ' (INTEGRITY VERIFIED)' }}
        </span>
      </div>
    </div>

    <!-- Merkle Tree Hierarchy Diagram -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-6 flex flex-col items-center">
      <!-- 1. MERKLE ROOT NODE -->
      <div class="flex flex-col items-center">
        <div class="text-[10px] uppercase font-mono font-bold text-amber-400 mb-1 tracking-wider">
          Top Merkle Root Hash
        </div>
        <div
          :class="[
            'px-5 py-2.5 rounded-xl border font-mono text-xs font-bold transition-all duration-300 shadow-lg',
            isTampered
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
              : 'bg-amber-950/60 border-amber-500/70 text-amber-200'
          ]"
        >
          0x{{ merkleRoot }}
        </div>
      </div>

      <!-- Connector Arrows -->
      <div class="flex items-center justify-around w-full max-w-md text-slate-600">
        <div class="flex flex-col items-center">
          <ArrowUp class="w-4 h-4 text-slate-500" />
        </div>
        <div class="flex flex-col items-center">
          <ArrowUp class="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <!-- 2. INTERMEDIATE PARENT HASHES -->
      <div class="grid grid-cols-2 gap-8 w-full max-w-md">
        <!-- Hash 1+2 -->
        <div class="flex flex-col items-center">
          <span class="text-[10px] font-mono text-slate-400 mb-1">Hash(H1 + H2)</span>
          <div
            :class="[
              'w-full py-2 px-3 rounded-lg border font-mono text-xs text-center transition-all duration-300',
              isTampered
                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-700 text-slate-300'
            ]"
          >
            0x{{ hash12 }}
          </div>
        </div>

        <!-- Hash 3+4 -->
        <div class="flex flex-col items-center">
          <span class="text-[10px] font-mono text-slate-400 mb-1">Hash(H3 + H4)</span>
          <div class="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-950 font-mono text-xs text-center text-slate-300">
            0x{{ hash34 }}
          </div>
        </div>
      </div>

      <!-- Connector Arrows -->
      <div class="grid grid-cols-4 gap-4 w-full max-w-lg text-slate-600">
        <div class="flex justify-center"><ArrowUp class="w-3.5 h-3.5 text-slate-600" /></div>
        <div class="flex justify-center"><ArrowUp class="w-3.5 h-3.5 text-slate-600" /></div>
        <div class="flex justify-center"><ArrowUp class="w-3.5 h-3.5 text-slate-600" /></div>
        <div class="flex justify-center"><ArrowUp class="w-3.5 h-3.5 text-slate-600" /></div>
      </div>

      <!-- 3. LEAF HASH NODES -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
        <div class="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-[11px] text-cyan-300">
          <div class="text-[9px] text-slate-500">Hash 1</div>
          0x{{ hash1 }}
        </div>
        <div
          :class="[
            'p-2 rounded-lg border text-center font-mono text-[11px] transition-all duration-300',
            isTampered
              ? 'bg-rose-950/60 border-rose-500 text-rose-300'
              : 'bg-slate-950 border-slate-800 text-cyan-300'
          ]"
        >
          <div class="text-[9px] text-slate-500">Hash 2</div>
          0x{{ hash2 }}
        </div>
        <div class="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-[11px] text-cyan-300">
          <div class="text-[9px] text-slate-500">Hash 3</div>
          0x{{ hash3 }}
        </div>
        <div class="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-[11px] text-cyan-300">
          <div class="text-[9px] text-slate-500">Hash 4</div>
          0x{{ hash4 }}
        </div>
      </div>

      <!-- 4. RAW DATA BLOCKS -->
      <div class="w-full max-w-lg space-y-2 pt-2 border-t border-slate-800">
        <div class="text-[10px] uppercase font-mono font-bold text-slate-400">
          Underlying Data Blocks (Editable):
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <input
            v-model="block1"
            class="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:border-cyan-500 outline-none"
          />
          <input
            v-model="block2"
            :class="[
              'px-2.5 py-1.5 rounded outline-none border transition',
              isTampered
                ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 focus:border-cyan-500'
            ]"
          />
          <input
            v-model="block3"
            class="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:border-cyan-500 outline-none"
          />
          <input
            v-model="block4"
            class="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
