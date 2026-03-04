<template>
  <div class="space-y-3">
    <AppLoader v-if="exercisesStore.loading || loadingMeta" />
    <template v-else>
      <button
        v-for="ex in exercisesStore.exercises"
        :key="ex.id"
        @click="workoutStore.prepareWorkout(ex)"
        :disabled="workoutStore.loading"
        class="w-full text-left rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500 active:scale-[0.99] transition-all p-4 space-y-2 disabled:opacity-50 disabled:pointer-events-none"
      >
        <!-- Name -->
        <div class="flex items-center justify-between">
          <span class="text-white font-bold text-base">{{ ex.name }}</span>
        </div>

        <!-- Last workout info -->
        <div class="text-xs text-slate-400">
          <template v-if="lastWorkouts[ex.id]">
            <span class="text-slate-300"
              >Last: {{ formatDate(lastWorkouts[ex.id]!.entry_date) }}</span
            >
            <span class="mx-1.5 text-slate-600">·</span>
            <span>{{ lastWorkouts[ex.id]!.sets?.length ?? 0 }} sets</span>
            <span class="mx-1.5 text-slate-600">·</span>
            <span
              >{{
                lastWorkouts[ex.id]!.sets?.reduce((s, r) => s + r.reps, 0) ?? 0
              }}
              reps</span
            >
          </template>
          <template v-else>
            <span class="text-slate-600 italic">No workouts yet</span>
          </template>
        </div>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useExercisesStore } from "@/stores/exercises";
import { useWorkoutStore } from "@/stores/workout";
import { getHistory } from "@/api/exerciseEntries";
import type { ExerciseEntry } from "@/types";
import AppLoader from "./AppLoader.vue";

const exercisesStore = useExercisesStore();
const workoutStore = useWorkoutStore();

const loadingMeta = ref(false);
const lastWorkouts = ref<Record<string, ExerciseEntry | null>>({});

onMounted(async () => {
  await exercisesStore.fetchExercises();
  loadingMeta.value = true;
  try {
    const results = await Promise.all(
      exercisesStore.exercises.map((ex) =>
        getHistory(ex.id, 1).then((entries) => ({
          id: ex.id,
          workout: entries[0] ?? null,
        })),
      ),
    );
    for (const { id, workout } of results) {
      lastWorkouts.value[id] = workout;
    }
  } finally {
    loadingMeta.value = false;
  }
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
</script>
