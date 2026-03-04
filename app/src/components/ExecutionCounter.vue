<template>
  <div class="text-center space-y-4">
    <!-- Current rep count display -->
    <div>
      <p class="text-7xl font-black text-white tabular-nums">
        {{ workoutStore.activeSet?.reps ?? 0 }}
      </p>
      <p class="text-slate-400 text-sm mt-1">Reps this set</p>
    </div>

    <!-- Big rep button -->
    <button
      @click="handleTrack"
      :disabled="workoutStore.loading"
      class="w-full h-32 rounded-3xl bg-blue-600 hover:bg-blue-500 active:scale-95 active:bg-blue-700 text-white font-black text-3xl shadow-lg shadow-blue-900/50 transition-all duration-100 select-none disabled:opacity-50"
    >
      + Rep
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from "@/stores/workout";

const workoutStore = useWorkoutStore();

async function handleTrack(): Promise<void> {
  // Haptic feedback on supported devices
  if ("vibrate" in navigator) navigator.vibrate(40);
  await workoutStore.trackExecution();
}
</script>
