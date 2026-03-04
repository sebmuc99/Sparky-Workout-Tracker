<template>
  <div
    class="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center space-y-4"
  >
    <p class="text-slate-400 text-sm font-medium uppercase tracking-wide">
      Pause
    </p>

    <!-- Countdown ring -->
    <div class="relative inline-flex items-center justify-center">
      <svg class="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
        <!-- Background track -->
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#334155"
          stroke-width="8"
        />
        <!-- Progress arc -->
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#3b82f6"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-1000"
        />
      </svg>
      <span class="absolute text-3xl font-black text-white tabular-nums">{{
        display
      }}</span>
    </div>

    <button
      @click="workoutStore.finishPause()"
      class="text-slate-400 hover:text-white text-sm underline transition"
    >
      Skip Pause
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWorkoutStore } from "@/stores/workout";

const workoutStore = useWorkoutStore();

const circumference = 2 * Math.PI * 52;

// Total pause seconds — set by the store when startPause() is called
const totalSeconds = computed(() => workoutStore.pauseTotalSeconds || 1);

const dashOffset = computed(() => {
  const progress = workoutStore.pauseRemainingSeconds / totalSeconds.value;
  return circumference * (1 - progress);
});

const display = computed(() => {
  const sec = workoutStore.pauseRemainingSeconds;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
});
</script>
