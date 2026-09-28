<script setup>
import { ref, computed } from 'vue'
import { Play, RotateCcw, Activity, Sliders, Zap } from 'lucide-vue-next'

const N = 64 // 64 sample points
const freq1 = ref(3) // 3 Hz component
const freq2 = ref(8) // 8 Hz component
const noiseLevel = ref(0.2) // noise amplitude
const showFFT = ref(true)

// Generate Time Domain Signal samples
const timeSamples = computed(() => {
  const samples = []
  for (let i = 0; i < N; i++) {
    const t = i / N
    const wave1 = Math.sin(2 * Math.PI * freq1.value * t)
    const wave2 = 0.6 * Math.sin(2 * Math.PI * freq2.value * t)
    const noise = (Math.random() - 0.5) * noiseLevel.value * 2
    samples.push(wave1 + wave2 + noise)
  }
  return samples
})

// SVG Polyline points for time domain wave
const timePointsSVG = computed(() => {
  const width = 500
  const height = 120
  const midY = height / 2
  const scaleY = 24

  return timeSamples.value
    .map((val, idx) => {
      const x = (idx / (N - 1)) * width
      const y = midY - val * scaleY
      return `${x},${y}`
    })
    .join(' ')
})

// Discrete Fourier Transform computation for frequency spectrum magnitudes
const spectrumMagnitudes = computed(() => {
  const samples = timeSamples.value
  const magnitudes = []
  const halfN = N / 2 // Nyquist limit

  for (let k = 0; k < halfN; k++) {
    let real = 0
    let imag = 0
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N
      real += samples[n] * Math.cos(angle)
      imag -= samples[n] * Math.sin(angle)
    }
    // Normalization magnitude
    const mag = Math.sqrt(real * real + imag * imag) / (N / 2)
    magnitudes.push({ freqBin: k, magnitude: mag })
  }
  return magnitudes
})

function handleReset() {
  freq1.value = 3
  freq2.value = 8
  noiseLevel.value = 0.2
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls & Sliders -->
    <div class="flex flex-wrap items-center gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Frequency 1 Slider -->
      <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
        <span>Freq 1:</span>
        <input
          v-model.number="freq1"
          type="range"
          min="1"
          max="12"
          step="1"
          class="w-20 accent-cyan-500 cursor-pointer"
        />
        <span class="w-7 font-bold text-slate-200">{{ freq1 }}Hz</span>
      </div>

      <!-- Frequency 2 Slider -->
      <div class="flex items-center gap-2 text-xs font-mono text-purple-400">
        <span>Freq 2:</span>
        <input
          v-model.number="freq2"
          type="range"
          min="1"
          max="16"
          step="1"
          class="w-20 accent-purple-500 cursor-pointer"
        />
        <span class="w-7 font-bold text-slate-200">{{ freq2 }}Hz</span>
      </div>

      <!-- Noise Level Slider -->
      <div class="flex items-center gap-2 text-xs font-mono text-amber-400">
        <span>Noise:</span>
        <input
          v-model.number="noiseLevel"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="w-16 accent-amber-500 cursor-pointer"
        />
        <span class="w-7 font-bold text-slate-200">{{ (noiseLevel * 100).toFixed(0) }}%</span>
      </div>

      <!-- Reset -->
      <button
        @click="handleReset"
        title="Reset Frequencies"
        class="ml-auto p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- 1. TIME DOMAIN CANVAS -->
    <div class="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
      <div class="flex items-center justify-between text-xs font-mono text-slate-300">
        <span class="flex items-center gap-1.5 font-bold text-cyan-400">
          <Activity class="w-4 h-4" /> 1. Time Domain Waveform: s(t) = sin(2π·{{ freq1 }}t) + 0.6·sin(2π·{{ freq2 }}t) + noise
        </span>
        <span class="text-slate-500 text-[11px]">{{ N }} Sample Points</span>
      </div>

      <div class="bg-slate-950 p-2 rounded-lg border border-slate-800/80 overflow-x-auto flex justify-center">
        <svg class="w-full max-w-[500px] h-[120px] overflow-visible">
          <!-- Center Zero Line -->
          <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" stroke-dasharray="3 3" />
          <!-- Waveform Polyline -->
          <polyline
            :points="timePointsSVG"
            fill="none"
            stroke="#38bdf8"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <!-- 2. FREQUENCY SPECTRUM (FFT MAGNITUDE) -->
    <div class="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
      <div class="flex items-center justify-between text-xs font-mono text-slate-300">
        <span class="flex items-center gap-1.5 font-bold text-emerald-400">
          <Zap class="w-4 h-4" /> 2. Frequency Domain (Fast Fourier Transform Decomposition)
        </span>
        <span class="text-slate-400 text-[11px]">
          Peaks at <strong class="text-cyan-400">{{ freq1 }}Hz</strong> and <strong class="text-purple-400">{{ freq2 }}Hz</strong>
        </span>
      </div>

      <!-- Frequency Bar Chart -->
      <div class="bg-slate-950 p-4 rounded-lg border border-slate-800/80 h-44 flex items-end justify-between gap-1 overflow-x-auto">
        <div
          v-for="bin in spectrumMagnitudes"
          :key="bin.freqBin"
          class="flex-1 flex flex-col items-center justify-end h-full group min-w-[10px]"
        >
          <!-- Tooltip Magnitude -->
          <span class="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
            {{ bin.magnitude.toFixed(1) }}
          </span>

          <!-- Frequency Bar -->
          <div
            :style="{ height: `${Math.min(100, bin.magnitude * 95)}px` }"
            :class="[
              'w-full rounded-t transition-all duration-200',
              bin.freqBin === freq1
                ? 'bg-cyan-400 shadow-md shadow-cyan-500/50'
                : bin.freqBin === freq2
                ? 'bg-purple-400 shadow-md shadow-purple-500/50'
                : bin.magnitude > 0.3
                ? 'bg-emerald-500/70'
                : 'bg-slate-800'
            ]"
          ></div>

          <!-- Frequency Bin Label -->
          <span
            :class="[
              'text-[9px] font-mono mt-1',
              bin.freqBin === freq1 || bin.freqBin === freq2
                ? 'text-cyan-300 font-bold'
                : 'text-slate-600'
            ]"
          >
            {{ bin.freqBin }}
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
        <span>0 Hz (DC)</span>
        <span>Frequency Bins (Hz) &rarr;</span>
        <span>{{ N / 2 }} Hz (Nyquist Limit)</span>
      </div>
    </div>
  </div>
</template>
