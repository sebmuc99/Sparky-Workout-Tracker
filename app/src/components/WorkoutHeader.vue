<template>
  <div class="bg-slate-800 rounded-2xl p-4 border border-slate-700">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-slate-400 text-xs uppercase tracking-wide">Exercise</p>
        <p class="text-white font-bold text-lg">
          {{ workoutStore.selectedExercise?.name }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-slate-400 text-xs uppercase tracking-wide">Today</p>
        <p class="text-white font-semibold text-sm">{{ today }}</p>
      </div>
    </div>
    <div class="mt-3 flex gap-4 text-center">
      <div class="flex-1 bg-slate-700/50 rounded-xl py-2">
        <p class="text-2xl font-bold text-blue-400">
          {{ workoutStore.completedSets.length }}
        </p>
        <p class="text-slate-400 text-xs">Sets</p>
      </div>
      <div class="flex-1 bg-slate-700/50 rounded-xl py-2">
        <p class="text-2xl font-bold text-blue-400">
          {{ workoutStore.totalExecutions }}
        </p>
        <p class="text-slate-400 text-xs">Total Reps</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWorkoutStore } from "@/stores/workout";

const workoutStore = useWorkoutStore();

const today = computed(() =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }),
);
</script>
