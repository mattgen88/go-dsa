<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import TopicDetail from './components/TopicDetail.vue'
import {
  enrichedCategories,
  topicList,
  topicsById,
  getTopicById,
  searchTopics
} from './data/index'
import { checkBackendHealth } from './services/playground'
import { Menu, X, Search, Sparkles, BookOpen } from 'lucide-vue-next'

// Topic selection
const activeTopicId = ref('arrays-slices')
const searchQuery = ref('')
const mobileSidebarOpen = ref(false)
const backendConnected = ref(false)

// Completed topics persistent storage
const completedTopics = ref(new Set())

function loadCompleted() {
  try {
    const raw = localStorage.getItem('godsa_completed')
    if (raw) {
      completedTopics.value = new Set(JSON.parse(raw))
    }
  } catch (e) {
    // fallback
  }
}

function saveCompleted() {
  try {
    localStorage.setItem('godsa_completed', JSON.stringify([...completedTopics.value]))
  } catch (e) {
    // fallback
  }
}

function toggleComplete(topicId) {
  if (completedTopics.value.has(topicId)) {
    completedTopics.value.delete(topicId)
  } else {
    completedTopics.value.add(topicId)
  }
  saveCompleted()
}

// Active topic computation
const currentTopic = computed(() => {
  return topicsById[activeTopicId.value] || topicList[0]
})

// Filtered topics based on search
const filteredSearchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  return searchTopics(searchQuery.value)
})

function selectTopic(id) {
  activeTopicId.value = id
  searchQuery.value = ''
  window.location.hash = id
  mobileSidebarOpen.value = false
}

// Read URL hash on load or popstate
function syncFromHash() {
  const hash = window.location.hash.replace('#', '')
  if (hash && topicsById[hash]) {
    activeTopicId.value = hash
  }
}

onMounted(async () => {
  loadCompleted()
  syncFromHash()
  window.addEventListener('popstate', syncFromHash)

  // Check Go backend health
  const health = await checkBackendHealth()
  backendConnected.value = health.ok

  // Retry every 10s if offline
  setInterval(async () => {
    const h = await checkBackendHealth()
    backendConnected.value = h.ok
  }, 10000)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
    <!-- Header -->
    <Header
      v-model:searchQuery="searchQuery"
      :backend-connected="backendConnected"
      :completed-count="completedTopics.size"
      :total-count="topicList.length"
    />

    <!-- Mobile Subheader with Drawer Toggle & Search -->
    <div class="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800">
      <button
        @click="mobileSidebarOpen = !mobileSidebarOpen"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium"
      >
        <Menu v-if="!mobileSidebarOpen" class="w-4 h-4 text-cyan-400" />
        <X v-else class="w-4 h-4 text-slate-400" />
        <span>Menu & Topics</span>
      </button>

      <span class="text-xs font-mono text-cyan-300 truncate max-w-[180px]">
        {{ currentTopic.title }}
      </span>
    </div>

    <!-- Main Layout: Sidebar + Content -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto relative">
      <!-- Backdrop for mobile drawer -->
      <div
        v-if="mobileSidebarOpen"
        @click="mobileSidebarOpen = false"
        class="fixed inset-0 z-20 bg-slate-950/80 backdrop-blur-sm lg:hidden"
      ></div>

      <!-- Left Sidebar Menu -->
      <Sidebar
        :categories="enrichedCategories"
        :active-topic-id="activeTopicId"
        :completed-topics="completedTopics"
        :is-open-mobile="mobileSidebarOpen"
        @select-topic="selectTopic"
        @close-mobile="mobileSidebarOpen = false"
      />

      <!-- Right Main Content Area -->
      <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
        <!-- Search Results Dropdown/Overlay if search is typed -->
        <div
          v-if="searchQuery.trim()"
          class="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl"
        >
          <div class="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>Search Results for "<strong class="text-cyan-400">{{ searchQuery }}</strong>":</span>
            <button @click="searchQuery = ''" class="hover:text-slate-200">Clear</button>
          </div>

          <div v-if="filteredSearchResults.length === 0" class="text-xs text-slate-500 py-3 italic">
            No matching topics found. Try searching for "trees", "slices", "O(1)", or "graphs".
          </div>

          <div class="grid sm:grid-cols-2 gap-2">
            <button
              v-for="item in filteredSearchResults"
              :key="item.id"
              @click="selectTopic(item.id)"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/40 text-left transition group"
            >
              <div>
                <div class="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {{ item.title }}
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                  {{ item.summary }}
                </div>
              </div>
              <span class="text-[9px] px-2 py-0.5 rounded font-mono bg-slate-900 text-slate-400 border border-slate-800">
                {{ item.difficulty }}
              </span>
            </button>
          </div>
        </div>

        <!-- Topic Detail & Code Runner -->
        <TopicDetail
          :topic="currentTopic"
          :is-completed="completedTopics.has(currentTopic.id)"
          @toggle-complete="toggleComplete"
        />
      </main>
    </div>
  </div>
</template>
