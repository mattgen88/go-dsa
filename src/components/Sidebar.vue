<script setup>
import { computed } from 'vue'
import {
  Layers,
  GitFork,
  Share2,
  ArrowDownUp,
  Search,
  Zap,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Database,
  Server,
  Wifi,
  Activity
} from 'lucide-vue-next'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeTopicId: {
    type: String,
    required: true
  },
  completedTopics: {
    type: Set,
    required: true
  },
  isOpenMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-topic', 'close-mobile'])

const totalTopicsCount = computed(() => {
  return props.categories.reduce((acc, cat) => acc + (cat.topics ? cat.topics.length : 0), 0)
})

function getCategoryIcon(name) {
  switch (name) {
    case 'Briefcase': return Briefcase
    case 'Database': return Database
    case 'Server': return Server
    case 'Wifi': return Wifi
    case 'Activity': return Activity
    case 'Layers': return Layers
    case 'GitFork': return GitFork
    case 'Share2': return Share2
    case 'ArrowDownUp': return ArrowDownUp
    case 'Search': return Search
    case 'Zap': return Zap
    default: return Layers
  }
}

function getDifficultyBadge(diff) {
  switch (diff) {
    case 'Beginner':
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
    case 'Intermediate':
      return 'bg-amber-950/80 text-amber-400 border-amber-800/60'
    case 'Advanced':
      return 'bg-purple-950/80 text-purple-400 border-purple-800/60'
    default:
      return 'bg-slate-800 text-slate-300'
  }
}
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-30 w-72 bg-slate-950/95 lg:bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
      isOpenMobile ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Top label -->
    <div class="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
      <span class="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">Curriculum</span>
      <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono">
        {{ totalTopicsCount }} Topics
      </span>
    </div>

    <!-- Category & Topic Navigation List -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      <div v-for="category in categories" :key="category.id" class="space-y-1.5">
        <!-- Category Header -->
        <div class="px-3 py-1 flex items-center gap-2 text-xs font-bold text-slate-300">
          <component :is="getCategoryIcon(category.icon)" class="w-4 h-4 text-cyan-400" />
          <span>{{ category.name }}</span>
        </div>

        <!-- Topics in this Category -->
        <div class="space-y-0.5 pl-1">
          <button
            v-for="topic in category.topics"
            :key="topic.id"
            @click="emit('select-topic', topic.id); emit('close-mobile')"
            :class="[
              'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition group',
              activeTopicId === topic.id
                ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-semibold shadow-sm shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <!-- Completion checkmark -->
              <CheckCircle2
                v-if="completedTopics.has(topic.id)"
                class="w-3.5 h-3.5 text-emerald-400 shrink-0"
              />
              <div
                v-else
                class="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-500 shrink-0"
              ></div>

              <span class="truncate">{{ topic.title }}</span>
            </div>

            <!-- Difficulty Tag -->
            <span
              :class="[
                'text-[9px] px-1.5 py-0.5 rounded border font-mono shrink-0 ml-1.5',
                getDifficultyBadge(topic.difficulty)
              ]"
            >
              {{ topic.difficulty }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
