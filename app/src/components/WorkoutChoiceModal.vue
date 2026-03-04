<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-40 bg-black/60 flex items-end justify-center">
    <!-- Sheet -->
    <div
      class="w-full max-w-md bg-slate-800 rounded-t-3xl border-t border-slate-700 px-5 pt-5 pb-8 space-y-4"
    >
      <!-- Handle -->
      <div class="mx-auto w-10 h-1 bg-slate-600 rounded-full mb-1" />

      <!-- Header -->
      <div>
        <p class="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
          {{ workoutStore.selectedExercise?.name }}
        </p>
        <h2 class="text-white font-bold text-lg">Continue or start fresh?</h2>
        <p class="text-slate-400 text-sm">
          You already trained today. Pick a session to continue, or start a new
          one.
        </p>
      </div>

      <!-- Existing sessions -->
      <div class="space-y-2">
        <button
          v-for="(w, idx) in workoutStore.todaysExistingWorkouts"
          :key="w.id"
          @click="workoutStore.continueWorkout(w)"
          :disabled="workoutStore.loading"
          class="w-full text-left rounded-2xl bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 px-4 py-3 transition disabled:opacity-50"
        >
          <div class="flex items-center justify-between">
            <span class="text-white font-semibold text-sm">
              Session
              {{
                workoutStore.todaysExistingWorkouts.length > 1 ? idx + 1 : ""
              }}
            </span>
            <span class="text-blue-400 text-sm font-medium">Continue →</span>
          </div>
          <p class="text-slate-400 text-xs mt-0.5">
            {{ w.sets?.length ?? 0 }} sets completed ·
            {{ w.sets?.reduce((s, r) => s + r.reps, 0) ?? 0 }} total reps
          </p>
        </button>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-slate-700" />
        <span class="text-slate-500 text-xs">or</span>
        <div class="flex-1 h-px bg-slate-700" />
      </div>

      <!-- Start fresh -->
      <button
        @click="workoutStore.startFreshWorkout()"
        :disabled="workoutStore.loading"
        class="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold transition disabled:opacity-50"
      >
        {{ workoutStore.loading ? "Starting…" : "Start New Session" }}
      </button>

      <!-- Cancel -->
      <button
        @click="workoutStore.resetWorkoutState()"
        :disabled="workoutStore.loading"
        class="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition"
      >
        ← Back to exercises
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from "@/stores/workout";
const workoutStore = useWorkoutStore();
</script>
