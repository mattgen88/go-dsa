<script setup>
import { computed } from 'vue'
import ArrayVisualizer from './visualizers/ArrayVisualizer.vue'
import LinkedListVisualizer from './visualizers/LinkedListVisualizer.vue'
import StackQueueVisualizer from './visualizers/StackQueueVisualizer.vue'
import BinarySearchVisualizer from './visualizers/BinarySearchVisualizer.vue'
import SortingVisualizer from './visualizers/SortingVisualizer.vue'
import TreeVisualizer from './visualizers/TreeVisualizer.vue'
import GraphVisualizer from './visualizers/GraphVisualizer.vue'
import TwoPointersVisualizer from './visualizers/TwoPointersVisualizer.vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const currentComponent = computed(() => {
  switch (props.type) {
    case 'array':
      return ArrayVisualizer
    case 'linked-list':
      return LinkedListVisualizer
    case 'stack-queue':
      return StackQueueVisualizer
    case 'binary-search':
      return BinarySearchVisualizer
    case 'sorting':
      return SortingVisualizer
    case 'tree':
    case 'heap':
      return TreeVisualizer
    case 'graph':
      return GraphVisualizer
    case 'two-pointers':
      return TwoPointersVisualizer
    default:
      return ArrayVisualizer
  }
})
</script>

<template>
  <div class="visualizer-wrapper">
    <component :is="currentComponent" />
  </div>
</template>
