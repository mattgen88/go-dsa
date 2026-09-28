<script setup>
import { ref } from 'vue'
import { Play, RotateCcw } from 'lucide-vue-next'

const nodes = [
  { id: 'A', x: 70, y: 120 },
  { id: 'B', x: 190, y: 50 },
  { id: 'C', x: 190, y: 190 },
  { id: 'D', x: 330, y: 50 },
  { id: 'E', x: 330, y: 190 },
  { id: 'F', x: 450, y: 120 }
]

const edges = [
  { u: 'A', v: 'B' },
  { u: 'A', v: 'C' },
  { u: 'B', v: 'D' },
  { u: 'C', v: 'E' },
  { u: 'D', v: 'E' },
  { u: 'D', v: 'F' },
  { u: 'E', v: 'F' }
]

const adj = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'E'],
  D: ['B', 'E', 'F'],
  E: ['C', 'D', 'F'],
  F: ['D', 'E']
}

const activeNode = ref(null)
const visitedNodes = ref(new Set())
const traversalQueue = ref([])
const traversalLog = ref([])
const isRunning = ref(false)

function getNode(id) {
  return nodes.find(n => n.id === id)
}

async function runBFS() {
  if (isRunning.value) return
  resetState()
  isRunning.value = true

  const visited = new Set(['A'])
  visitedNodes.value = new Set(['A'])
  const queue = ['A']
  traversalQueue.value = [...queue]

  while (queue.length > 0) {
    const curr = queue.shift()
    activeNode.value = curr
    traversalLog.value.push(curr)
    traversalQueue.value = [...queue]
    await new Promise(r => setTimeout(r, 700))

    for (const neighbor of adj[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        visitedNodes.value.add(neighbor)
        queue.push(neighbor)
        traversalQueue.value = [...queue]
      }
    }
  }

  activeNode.value = null
  isRunning.value = false
}

async function runDFS() {
  if (isRunning.value) return
  resetState()
  isRunning.value = true

  const visited = new Set()

  async function dfs(node) {
    visited.add(node)
    visitedNodes.value.add(node)
    activeNode.value = node
    traversalLog.value.push(node)
    await new Promise(r => setTimeout(r, 700))

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        await dfs(neighbor)
      }
    }
  }

  await dfs('A')
  activeNode.value = null
  isRunning.value = false
}

function resetState() {
  activeNode.value = null
  visitedNodes.value = new Set()
  traversalQueue.value = []
  traversalLog.value = []
  isRunning.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <button
        @click="runBFS"
        :disabled="isRunning"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Play class="w-3.5 h-3.5" /> Run BFS from 'A' (Queue)
      </button>

      <button
        @click="runDFS"
        :disabled="isRunning"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Play class="w-3.5 h-3.5" /> Run DFS from 'A' (Recursion)
      </button>

      <button
        @click="resetState"
        :disabled="isRunning"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- SVG Graph Network -->
    <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-center">
      <svg class="w-full max-w-[540px] h-[240px] overflow-visible">
        <!-- Edges -->
        <line
          v-for="(e, i) in edges"
          :key="i"
          :x1="getNode(e.u).x"
          :y1="getNode(e.u).y"
          :x2="getNode(e.v).x"
          :y2="getNode(e.v).y"
          :class="[
            'stroke-2 transition-all duration-300',
            visitedNodes.has(e.u) && visitedNodes.has(e.v)
              ? 'stroke-cyan-500/70'
              : 'stroke-slate-700'
          ]"
        />

        <!-- Nodes -->
        <g
          v-for="n in nodes"
          :key="n.id"
          class="transition-all duration-300 cursor-pointer"
        >
          <circle
            :cx="n.x"
            :cy="n.y"
            r="20"
            :class="[
              'transition-all duration-300',
              activeNode === n.id
                ? 'fill-amber-500 stroke-amber-300 stroke-[3px] scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                : visitedNodes.has(n.id)
                ? 'fill-cyan-950 stroke-cyan-400 stroke-2'
                : 'fill-slate-900 stroke-slate-700 stroke-2'
            ]"
          />
          <text
            :x="n.x"
            :y="n.y + 5"
            text-anchor="middle"
            :class="[
              'text-xs font-mono font-bold select-none',
              activeNode === n.id ? 'fill-slate-950' : 'fill-slate-200'
            ]"
          >
            {{ n.id }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Traversal Progress -->
    <div class="flex items-center gap-2 text-xs font-mono">
      <span class="text-slate-400">Order Visited:</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          v-for="(n, idx) in traversalLog"
          :key="idx"
          class="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300"
        >
          {{ n }}
        </span>
        <span v-if="traversalLog.length === 0" class="text-slate-600 italic">None yet</span>
      </div>
    </div>
  </div>
</template>
