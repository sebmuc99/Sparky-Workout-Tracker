<template>
  <div class="space-y-3">
    <AppLoader v-if="exercisesStore.loading" />
    <div v-else>
      <label
        for="exercise-select"
        class="block text-sm font-medium text-slate-300 mb-2"
        >Exercise</label
      >
      <select
        id="exercise-select"
        name="exercise"
        @change="handleSelect"
        class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="" disabled selected>Select an exercise…</option>
        <option
          v-for="ex in exercisesStore.exercises"
          :key="ex.id"
          :value="ex.id"
        >
          {{ ex.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useExercisesStore } from "@/stores/exercises";
import { useWorkoutStore } from "@/stores/workout";
import AppLoader from "./AppLoader.vue";

const exercisesStore = useExercisesStore();
const workoutStore = useWorkoutStore();

onMounted(() => exercisesStore.fetchExercises());

function handleSelect(event: Event): void {
  const id = (event.target as HTMLSelectElement).value;
  const exercise = exercisesStore.exercises.find((e) => e.id === id);
  if (exercise) workoutStore.prepareWorkout(exercise);
}
</script>
