<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let editorView = null

onMounted(() => {
  if (!editorRef.value) return

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      go(),
      oneDark,
      EditorView.theme({
        '&': {
          height: '100%',
          backgroundColor: '#0b1120'
        },
        '.cm-scroller': {
          fontFamily: "'Fira Code', monospace",
          fontSize: '13px'
        },
        '.cm-gutters': {
          backgroundColor: '#070c18',
          borderRight: '1px solid #1e293b',
          color: '#475569'
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const val = update.state.doc.toString()
          emit('update:modelValue', val)
        }
      })
    ]
  })

  editorView = new EditorView({
    state,
    parent: editorRef.value
  })
})

watch(() => props.modelValue, (newVal) => {
  if (editorView) {
    const currentVal = editorView.state.doc.toString()
    if (newVal !== currentVal) {
      editorView.dispatch({
        changes: { from: 0, to: currentVal.length, insert: newVal || '' }
      })
    }
  }
})

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})
</script>

<template>
  <div class="relative w-full h-full min-h-[380px] overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120]">
    <div ref="editorRef" class="w-full h-full"></div>
  </div>
</template>
