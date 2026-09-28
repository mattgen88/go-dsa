<script setup>
import { ref } from 'vue'
import { Plus, Search, RotateCcw, Play } from 'lucide-vue-next'

class BSTNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

const inputVal = ref(45)
const searchVal = ref(60)
const activeNodeVal = ref(null)
const traversalResult = ref([])
const traversalMessage = ref('')

// Initialize standard balanced-ish BST
let root = buildInitialTree()

function buildInitialTree() {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let r = null
  for (const v of values) {
    r = insertNode(r, v)
  }
  return r
}

function insertNode(node, val) {
  if (!node) return new BSTNode(val)
  if (val < node.val) node.left = insertNode(node.left, val)
  else if (val > node.val) node.right = insertNode(node.right, val)
  return node
}

// Tree layout for SVG rendering
const svgNodes = ref([])
const svgEdges = ref([])

function calculateLayout() {
  const nodes = []
  const edges = []

  function traverse(node, x, y, dx) {
    if (!node) return
    nodes.push({ val: node.val, x, y })

    if (node.left) {
      edges.push({ x1: x, y1: y, x2: x - dx, y2: y + 60 })
      traverse(node.left, x - dx, y + 60, dx * 0.55)
    }
    if (node.right) {
      edges.push({ x1: x, y1: y, x2: x + dx, y2: y + 60 })
      traverse(node.right, x + dx, y + 60, dx * 0.55)
    }
  }

  traverse(root, 300, 40, 130)
  svgNodes.value = nodes
  svgEdges.value = edges
}

calculateLayout()

function handleInsert() {
  if (inputVal.value !== null && !isNaN(inputVal.value)) {
    root = insertNode(root, Number(inputVal.value))
    calculateLayout()
    inputVal.value += 7
  }
}

async function handleSearch() {
  const target = Number(searchVal.value)
  let curr = root
  traversalMessage.value = `Searching for ${target}...`

  while (curr) {
    activeNodeVal.value = curr.val
    await new Promise(r => setTimeout(r, 600))
    if (curr.val === target) {
      traversalMessage.value = `Found node with value ${target}!`
      return
    }
    if (target < curr.val) curr = curr.left
    else curr = curr.right
  }

  activeNodeVal.value = null
  traversalMessage.value = `Target ${target} does not exist in BST.`
}

async function runInOrder() {
  traversalResult.value = []
  traversalMessage.value = 'Running In-Order Traversal (Left -> Root -> Right)...'

  async function inOrder(node) {
    if (!node) return
    await inOrder(node.left)
    activeNodeVal.value = node.val
    traversalResult.value.push(node.val)
    await new Promise(r => setTimeout(r, 450))
    await inOrder(node.right)
  }

  await inOrder(root)
  activeNodeVal.value = null
  traversalMessage.value = 'In-order traversal complete (strictly sorted order).'
}

function handleReset() {
  root = buildInitialTree()
  calculateLayout()
  activeNodeVal.value = null
  traversalResult.value = []
  traversalMessage.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Insert -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="inputVal"
          type="number"
          class="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
          placeholder="Val"
        />
        <button
          @click="handleInsert"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> Insert
        </button>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="searchVal"
          type="number"
          class="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
          placeholder="Val"
        />
        <button
          @click="handleSearch"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Search class="w-3.5 h-3.5" /> Search
        </button>
      </div>

      <!-- In-order Traversal -->
      <button
        @click="runInOrder"
        class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
      >
        <Play class="w-3.5 h-3.5" /> In-Order
      </button>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status Message -->
    <div
      v-if="traversalMessage"
      class="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300"
    >
      {{ traversalMessage }}
    </div>

    <!-- SVG BST Diagram -->
    <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-center overflow-x-auto">
      <svg class="w-full max-w-[600px] h-[260px] overflow-visible">
        <!-- Branches -->
        <line
          v-for="(edge, i) in svgEdges"
          :key="'e-' + i"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          stroke="#334155"
          stroke-width="2"
        />

        <!-- Nodes -->
        <g
          v-for="node in svgNodes"
          :key="'n-' + node.val"
          class="transition-all duration-300 cursor-pointer"
        >
          <!-- Circle -->
          <circle
            :cx="node.x"
            :cy="node.y"
            r="19"
            :class="[
              'transition-all duration-300',
              activeNodeVal === node.val
                ? 'fill-amber-500 stroke-amber-300 stroke-[3px] scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'fill-slate-900 stroke-cyan-500/80 stroke-2 hover:stroke-cyan-400'
            ]"
          />
          <!-- Label -->
          <text
            :x="node.x"
            :y="node.y + 5"
            text-anchor="middle"
            :class="[
              'text-xs font-mono font-bold select-none',
              activeNodeVal === node.val ? 'fill-slate-950' : 'fill-cyan-200'
            ]"
          >
            {{ node.val }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Traversal Output Array -->
    <div v-if="traversalResult.length > 0" class="flex items-center gap-2 text-xs font-mono">
      <span class="text-slate-400">Visited Order:</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          v-for="(v, i) in traversalResult"
          :key="i"
          class="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300"
        >
          {{ v }}
        </span>
      </div>
    </div>
  </div>
</template>
