<template>
  <div
    class="rounded-2xl p-4 border transition"
    :class="
      live ? 'bg-blue-900/30 border-blue-600' : 'bg-slate-800 border-slate-700'
    "
  >
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold text-white">Set #{{ setNumber }}</span>
      <span
        v-if="live"
        class="text-xs text-blue-400 font-semibold uppercase tracking-wide animate-pulse"
      >
        In Progress
      </span>
      <span
        v-else
        class="text-xs text-green-400 font-semibold uppercase tracking-wide"
      >
        Done
      </span>
    </div>

    <div class="flex items-center justify-center gap-8 text-center">
      <div v-if="timeStart">
        <p class="text-slate-400 text-xs">Start</p>
        <p class="text-white font-medium">{{ formatTime(timeStart) }}</p>
      </div>
      <div>
        <p class="text-slate-400 text-xs">Reps</p>
        <p class="text-3xl font-bold text-blue-400">
          {{ reps }}<span v-if="targetReps" class="text-lg text-slate-500 font-normal"> / {{ targetReps }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  setNumber: number;
  reps: number;
  timeStart?: string | null;
  live?: boolean;
  targetReps?: number | null;
}>();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
