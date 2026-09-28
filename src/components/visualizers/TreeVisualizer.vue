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
const activeTraversal = ref('')
const isRunning = ref(false)

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
  if (isRunning.value) return
  isRunning.value = true
  activeTraversal.value = 'search'
  const target = Number(searchVal.value)
  let curr = root
  traversalMessage.value = `Searching for ${target}...`

  while (curr && isRunning.value) {
    activeNodeVal.value = curr.val
    await new Promise(r => setTimeout(r, 600))
    if (curr.val === target) {
      traversalMessage.value = `Found node with value ${target}!`
      isRunning.value = false
      return
    }
    if (target < curr.val) curr = curr.left
    else curr = curr.right
  }

  activeNodeVal.value = null
  traversalMessage.value = `Target ${target} does not exist in BST.`
  isRunning.value = false
}

// 1. In-Order Traversal: Left -> Root -> Right
async function runInOrder() {
  if (isRunning.value) return
  isRunning.value = true
  activeTraversal.value = 'in-order'
  traversalResult.value = []
  traversalMessage.value = 'In-Order Traversal (Left -> Root -> Right): Sorted order in BST'

  async function inOrder(node) {
    if (!node || !isRunning.value) return
    await inOrder(node.left)
    if (!isRunning.value) return
    activeNodeVal.value = node.val
    traversalResult.value.push(node.val)
    await new Promise(r => setTimeout(r, 450))
    await inOrder(node.right)
  }

  await inOrder(root)
  activeNodeVal.value = null
  if (isRunning.value) {
    traversalMessage.value = 'In-order traversal complete (strictly ascending sorted order).'
  }
  isRunning.value = false
}

// 2. Pre-Order Traversal: Root -> Left -> Right
async function runPreOrder() {
  if (isRunning.value) return
  isRunning.value = true
  activeTraversal.value = 'pre-order'
  traversalResult.value = []
  traversalMessage.value = 'Pre-Order Traversal (Root -> Left -> Right): Visits root before subtrees (ideal for tree cloning & serialization)'

  async function preOrder(node) {
    if (!node || !isRunning.value) return
    activeNodeVal.value = node.val
    traversalResult.value.push(node.val)
    await new Promise(r => setTimeout(r, 450))
    if (!isRunning.value) return
    await preOrder(node.left)
    if (!isRunning.value) return
    await preOrder(node.right)
  }

  await preOrder(root)
  activeNodeVal.value = null
  if (isRunning.value) {
    traversalMessage.value = 'Pre-order traversal complete.'
  }
  isRunning.value = false
}

// 3. Post-Order Traversal: Left -> Right -> Root
async function runPostOrder() {
  if (isRunning.value) return
  isRunning.value = true
  activeTraversal.value = 'post-order'
  traversalResult.value = []
  traversalMessage.value = 'Post-Order Traversal (Left -> Right -> Root): Visits children before root (ideal for deletion & subtree bottom-up math)'

  async function postOrder(node) {
    if (!node || !isRunning.value) return
    await postOrder(node.left)
    if (!isRunning.value) return
    await postOrder(node.right)
    if (!isRunning.value) return
    activeNodeVal.value = node.val
    traversalResult.value.push(node.val)
    await new Promise(r => setTimeout(r, 450))
  }

  await postOrder(root)
  activeNodeVal.value = null
  if (isRunning.value) {
    traversalMessage.value = 'Post-order traversal complete.'
  }
  isRunning.value = false
}

// 4. Level-Order Traversal (BFS): Queue row by row
async function runLevelOrder() {
  if (isRunning.value) return
  isRunning.value = true
  activeTraversal.value = 'level-order'
  traversalResult.value = []
  traversalMessage.value = 'Level-Order Traversal (BFS): Visits nodes horizontally row-by-row using a FIFO queue'

  const queue = [root]
  while (queue.length > 0 && isRunning.value) {
    const node = queue.shift()
    if (!node) continue
    activeNodeVal.value = node.val
    traversalResult.value.push(node.val)
    await new Promise(r => setTimeout(r, 450))

    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }

  activeNodeVal.value = null
  if (isRunning.value) {
    traversalMessage.value = 'Level-order BFS traversal complete.'
  }
  isRunning.value = false
}

function handleReset() {
  isRunning.value = false
  root = buildInitialTree()
  calculateLayout()
  activeNodeVal.value = null
  traversalResult.value = []
  traversalMessage.value = ''
  activeTraversal.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls Bar -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Insert -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="inputVal"
          type="number"
          :disabled="isRunning"
          class="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
          placeholder="Val"
        />
        <button
          @click="handleInsert"
          :disabled="isRunning"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus class="w-3.5 h-3.5" /> Insert
        </button>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="searchVal"
          type="number"
          :disabled="isRunning"
          class="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
          placeholder="Val"
        />
        <button
          @click="handleSearch"
          :disabled="isRunning"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Search class="w-3.5 h-3.5" /> Search
        </button>
      </div>

      <div class="h-5 w-px bg-slate-700 hidden sm:block"></div>

      <!-- Traversal Buttons Group -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[11px] font-mono text-slate-400 font-semibold mr-1">Traverse:</span>
        <button
          @click="runPreOrder"
          :disabled="isRunning"
          :class="[
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition',
            activeTraversal === 'pre-order' && isRunning
              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50'
          ]"
        >
          <Play class="w-3 h-3 text-blue-400" /> Pre-Order
        </button>

        <button
          @click="runInOrder"
          :disabled="isRunning"
          :class="[
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition',
            activeTraversal === 'in-order' && isRunning
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50'
          ]"
        >
          <Play class="w-3 h-3 text-indigo-400" /> In-Order
        </button>

        <button
          @click="runPostOrder"
          :disabled="isRunning"
          :class="[
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition',
            activeTraversal === 'post-order' && isRunning
              ? 'bg-purple-600 text-white ring-2 ring-purple-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50'
          ]"
        >
          <Play class="w-3 h-3 text-purple-400" /> Post-Order
        </button>

        <button
          @click="runLevelOrder"
          :disabled="isRunning"
          :class="[
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition',
            activeTraversal === 'level-order' && isRunning
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50'
          ]"
        >
          <Play class="w-3 h-3 text-emerald-400" /> Level-Order (BFS)
        </button>
      </div>

      <button
        @click="handleReset"
        title="Reset Tree & Stop Traversal"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status Message -->
    <div
      v-if="traversalMessage"
      class="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 flex items-center justify-between"
    >
      <span>{{ traversalMessage }}</span>
      <span v-if="isRunning" class="text-[10px] text-amber-400 animate-pulse">Running animation...</span>
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
                : traversalResult.includes(node.val)
                ? 'fill-cyan-950 stroke-cyan-400 stroke-2'
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
    <div v-if="traversalResult.length > 0" class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          {{ activeTraversal.replace('-', ' ') }} Visited Sequence:
        </span>
        <span class="text-slate-500 text-[11px]">{{ traversalResult.length }} nodes</span>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          v-for="(v, i) in traversalResult"
          :key="i"
          class="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 font-mono text-xs shadow-sm"
        >
          {{ v }}
        </span>
      </div>
    </div>
  </div>
</template>
