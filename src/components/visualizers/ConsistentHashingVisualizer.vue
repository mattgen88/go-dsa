<script setup>
import { ref, computed } from 'vue'
import { Plus, Trash2, RotateCcw, Server, Key, ArrowRight } from 'lucide-vue-next'

// Simplified 360-degree hash ring
const servers = ref([
  { id: 'Node-A', angle: 45, color: '#38bdf8' },
  { id: 'Node-B', angle: 165, color: '#a855f7' },
  { id: 'Node-C', angle: 285, color: '#34d399' }
])

const keys = ref([
  { name: 'user:101', angle: 30 },
  { name: 'user:204', angle: 90 },
  { name: 'user:305', angle: 210 },
  { name: 'user:409', angle: 315 },
  { name: 'session:88', angle: 140 }
])

const newKeyName = ref('order:77')
const logMessage = ref('Consistent Hashing Ring (360°). Keys route clockwise to the first encountered node.')

function findAssignedServer(keyAngle) {
  // Sort servers by angle
  const sorted = [...servers.value].sort((a, b) => a.angle - b.angle)
  for (const s of sorted) {
    if (s.angle >= keyAngle) return s
  }
  return sorted[0] // Wrap around ring
}

function handleAddKey() {
  const name = newKeyName.value.trim()
  if (!name) return
  // Deterministic pseudo angle from string
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }
  keys.value.push({ name, angle: hash })
  const assigned = findAssignedServer(hash)
  logMessage.value = `Key '${name}' (hash: ${hash}°) mapped clockwise to ${assigned.id}!`
  newKeyName.value = `key:${Math.floor(Math.random() * 900) + 100}`
}

function handleAddServer() {
  if (servers.value.length >= 6) return
  const id = `Node-${String.fromCharCode(65 + servers.value.length)}`
  const angle = Math.floor(Math.random() * 320) + 20
  const colors = ['#f59e0b', '#ec4899', '#06b6d4', '#84cc16']
  const color = colors[servers.value.length % colors.length]
  servers.value.push({ id, angle, color })
  logMessage.value = `Added server ${id} at angle ${angle}°. Only adjacent clockwise keys are rebalanced!`
}

function handleRemoveServer() {
  if (servers.value.length <= 2) return
  const removed = servers.value.pop()
  logMessage.value = `Removed ${removed.id}. Its keys naturally spill over clockwise to the next node.`
}

function handleReset() {
  servers.value = [
    { id: 'Node-A', angle: 45, color: '#38bdf8' },
    { id: 'Node-B', angle: 165, color: '#a855f7' },
    { id: 'Node-C', angle: 285, color: '#34d399' }
  ]
  keys.value = [
    { name: 'user:101', angle: 30 },
    { name: 'user:204', angle: 90 },
    { name: 'user:305', angle: 210 },
    { name: 'user:409', angle: 315 },
    { name: 'session:88', angle: 140 }
  ]
  logMessage.value = 'Ring reset to initial state.'
}

function getCoordinates(angle, radius = 100, cx = 150, cy = 130) {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div class="flex items-center gap-1.5">
        <input
          v-model="newKeyName"
          type="text"
          class="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400"
          placeholder="Key name"
        />
        <button
          @click="handleAddKey"
          class="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Key class="w-3.5 h-3.5" /> Hash Key
        </button>
      </div>

      <div class="h-5 w-px bg-slate-700 hidden sm:block"></div>

      <!-- Add/Remove Servers -->
      <button
        @click="handleAddServer"
        :disabled="servers.length >= 6"
        class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
      >
        <Server class="w-3.5 h-3.5" /> Add Node
      </button>

      <button
        @click="handleRemoveServer"
        :disabled="servers.length <= 2"
        class="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium transition"
      >
        <Trash2 class="w-3.5 h-3.5" /> Remove Node
      </button>

      <button
        @click="handleReset"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Status -->
    <div class="p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300">
      {{ logMessage }}
    </div>

    <!-- SVG Hash Ring -->
    <div class="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-around gap-6">
      <div class="relative">
        <svg class="w-[300px] h-[260px] overflow-visible">
          <!-- Outer Circle Ring -->
          <circle
            cx="150"
            cy="130"
            r="100"
            fill="none"
            stroke="#1e293b"
            stroke-width="6"
            stroke-dasharray="4 4"
          />

          <!-- 0/360 indicator -->
          <text x="150" y="20" fill="#475569" font-size="10" font-family="monospace" text-anchor="middle">
            0° / 360°
          </text>

          <!-- Keys on Ring -->
          <g v-for="k in keys" :key="k.name">
            <circle
              :cx="getCoordinates(k.angle).x"
              :cy="getCoordinates(k.angle).y"
              r="6"
              :fill="findAssignedServer(k.angle).color"
              stroke="#0f172a"
              stroke-width="2"
            />
            <text
              :x="getCoordinates(k.angle, 118).x"
              :y="getCoordinates(k.angle, 118).y"
              fill="#94a3b8"
              font-size="9"
              font-family="monospace"
              text-anchor="middle"
            >
              {{ k.name }}
            </text>
          </g>

          <!-- Servers on Ring -->
          <g v-for="s in servers" :key="s.id">
            <circle
              :cx="getCoordinates(s.angle).x"
              :cy="getCoordinates(s.angle).y"
              r="14"
              :fill="s.color"
              stroke="#020617"
              stroke-width="3"
            />
            <text
              :x="getCoordinates(s.angle).x"
              :y="getCoordinates(s.angle).y + 4"
              fill="#020617"
              font-size="10"
              font-family="monospace"
              font-weight="bold"
              text-anchor="middle"
            >
              {{ s.id.replace('Node-', '') }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Mapping Table -->
      <div class="w-full md:w-64 space-y-2 text-xs font-mono">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Node Key Allocation
        </div>
        <div
          v-for="s in servers"
          :key="s.id"
          class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: s.color }"></div>
            <span class="font-bold text-slate-200">{{ s.id }}</span>
            <span class="text-slate-500 text-[10px]">({{ s.angle }}°)</span>
          </div>
          <span class="text-cyan-400 font-bold">
            {{ keys.filter(k => findAssignedServer(k.angle).id === s.id).length }} keys
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
