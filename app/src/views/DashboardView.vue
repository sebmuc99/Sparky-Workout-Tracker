<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <!-- Top Bar -->
    <header
      class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700"
    >
      <h1 class="text-lg font-bold text-white">💪 Workout Tracker</h1>
      <button
        @click="handleLogout"
        class="text-slate-400 hover:text-white text-sm transition"
      >
        Logout
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <!-- Global error -->
      <div
        v-if="workoutStore.error"
        class="text-red-400 text-sm bg-red-900/30 rounded-xl px-4 py-3"
      >
        {{ workoutStore.error }}
      </div>

      <!-- STATE 1: No workout in progress → choose exercise -->
      <template v-if="!workoutStore.workoutStarted">
        <!-- Loading today's plan -->
        <div v-if="loadingPlan" class="flex justify-center py-12">
          <AppLoader />
        </div>

        <template v-else>
          <!-- ── Today's exercises (from Sparky plan entries) ── -->
          <section v-if="workoutStore.todaysEntries.length > 0">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-white font-bold text-base">📋 Today</h2>
              <span class="text-xs text-slate-500">{{
                new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })
              }}</span>
            </div>

            <div class="space-y-3">
              <button
                v-for="entry in workoutStore.todaysEntries"
                :key="entry.id"
                @click="workoutStore.startFromEntry(entry)"
                :disabled="workoutStore.loading"
                class="w-full text-left rounded-2xl border bg-slate-800 border-slate-700 hover:border-blue-500 active:scale-[0.99] transition-all p-4 space-y-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div class="flex items-center justify-between">
                  <span class="text-white font-bold text-base">{{
                    entry.exercise_snapshot?.name ?? entry.exercise_id
                  }}</span>
                  <span
                    v-if="doneSetsCount(entry) > 0"
                    class="text-xs text-slate-400"
                    >{{ doneSetsCount(entry) }} / {{ entry.sets.length }} sets
                    done</span
                  >
                </div>
                <!-- Sets -->
                <div class="flex gap-2 flex-wrap">
                  <span
                    v-for="s in entry.sets"
                    :key="s.id"
                    class="text-xs rounded-lg px-2 py-1"
                    :class="
                      s.notes === 'done'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-slate-700/60 text-slate-400'
                    "
                  >
                    Set {{ s.set_number }}: {{ s.reps }} reps<template
                      v-if="s.weight"
                      > · {{ s.weight }} kg</template
                    >
                  </span>
                </div>
              </button>
            </div>
          </section>

          <!-- No entries today -->
          <div v-else class="text-center text-slate-500 text-sm py-4">
            No exercises planned for today
          </div>

          <!-- ── All Exercises ─────────────────────────────── -->
          <section>
            <button
              @click="showAllExercises = !showAllExercises"
              class="w-full flex items-center justify-between text-slate-400 hover:text-white text-sm mb-3 transition"
            >
              <span class="font-medium">All exercises</span>
              <span>{{ showAllExercises ? "▲" : "▼" }}</span>
            </button>
            <ExerciseList v-if="showAllExercises" />
          </section>
        </template>
      </template>

      <!-- STATE 3 + 4: Workout in progress -->
      <template v-else>
        <WorkoutHeader />

        <!-- STATE 3: Between sets -->
        <template v-if="!workoutStore.setInProgress">
          <!-- Previous sets summary -->
          <div v-if="workoutStore.completedSets.length > 0" class="space-y-2">
            <SetCard
              v-for="(set, i) in workoutStore.completedSets"
              :key="i"
              :setNumber="i + 1"
              :reps="set.reps"
            />
          </div>

          <!-- Pause timer -->
          <PauseTimer v-if="workoutStore.pauseActive" />

          <!-- Start next set (hidden during pause) -->
          <button
            v-if="!workoutStore.pauseActive"
            @click="workoutStore.startNewSet()"
            :disabled="workoutStore.loading"
            class="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg transition disabled:opacity-50"
          >
            {{
              workoutStore.loading
                ? "Starting…"
                : `Start Set #${workoutStore.nextSetNumber}${workoutStore.nextPlannedSet?.reps ? ` · ${workoutStore.nextPlannedSet.reps} reps` : ""}`
            }}
          </button>

          <!-- Finish workout (visible once ≥1 set done) -->
          <template v-if="workoutStore.completedSets.length > 0">
            <!-- Normal button -->
            <button
              v-if="!showFinishConfirm"
              @click="showFinishConfirm = true"
              class="w-full py-3 rounded-2xl border border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition text-sm"
            >
              Finish Workout
            </button>

            <!-- Confirmation row -->
            <div
              v-else
              class="rounded-2xl border border-red-800 bg-red-950/40 px-4 py-3 space-y-3"
            >
              <p class="text-sm text-red-300 text-center font-medium">
                Finish this workout? ({{
                  workoutStore.completedSets.length
                }}
                sets · {{ workoutStore.totalExecutions }} reps)
              </p>
              <div class="flex gap-3">
                <button
                  @click="showFinishConfirm = false"
                  class="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition text-sm"
                >
                  Keep going
                </button>
                <button
                  @click="finishWorkout"
                  class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition text-sm"
                >
                  Yes, finish
                </button>
              </div>
            </div>
          </template>
        </template>

        <!-- STATE 4: Set in progress -->
        <template v-else>
          <SetCard
            v-if="workoutStore.activeSet"
            :setNumber="workoutStore.activeSet.setNumber"
            :reps="workoutStore.activeSet.reps"
            :timeStart="workoutStore.activeSet.timeStart"
            :targetReps="workoutStore.nextPlannedSet?.reps ?? null"
            :live="true"
          />

          <!-- Mode toggle -->
          <div class="flex items-center justify-center gap-2">
            <button
              @click="workoutStore.toggleTrackingMode()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition"
              :class="
                workoutStore.trackingMode === 'counter'
                  ? 'bg-blue-900/40 text-blue-400 border border-blue-700'
                  : 'bg-amber-900/40 text-amber-400 border border-amber-700'
              "
            >
              <span>{{
                workoutStore.trackingMode === "counter"
                  ? "🔢 Counter"
                  : "⏱️ Timer Only"
              }}</span>
              <span class="text-xs opacity-60">tap to switch</span>
            </button>
          </div>

          <!-- Counter mode: tap each rep -->
          <ExecutionCounter v-if="workoutStore.trackingMode === 'counter'" />
          <!-- Timer mode: just show elapsed time -->
          <TimerOnlyCounter v-else />

          <button
            @click="handleEndSet"
            :disabled="workoutStore.loading"
            class="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-lg transition disabled:opacity-50"
          >
            {{ workoutStore.loading ? "Saving…" : "End Set" }}
          </button>
        </template>
      </template>
    </main>

    <!-- Choice modal overlay (fixed, on top of everything) -->
    <WorkoutChoiceModal v-if="workoutStore.workoutChoicePending" />

    <!-- Rep input modal (timer mode) -->
    <RepInputModal
      v-if="showRepInput"
      :targetReps="workoutStore.nextPlannedSet?.reps ?? null"
      @confirm="confirmReps"
      @cancel="showRepInput = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useWorkoutStore } from "@/stores/workout";
import type { ExerciseEntry } from "@/types";
import AppLoader from "@/components/AppLoader.vue";
import ExerciseList from "@/components/ExerciseList.vue";
import WorkoutHeader from "@/components/WorkoutHeader.vue";
import SetCard from "@/components/SetCard.vue";
import ExecutionCounter from "@/components/ExecutionCounter.vue";
import TimerOnlyCounter from "@/components/TimerOnlyCounter.vue";
import RepInputModal from "@/components/RepInputModal.vue";
import PauseTimer from "@/components/PauseTimer.vue";
import WorkoutChoiceModal from "@/components/WorkoutChoiceModal.vue";

const router = useRouter();
const auth = useAuthStore();
const workoutStore = useWorkoutStore();

const showFinishConfirm = ref(false);
const showAllExercises = ref(false);
const loadingPlan = ref(false);
const showRepInput = ref(false);

function doneSetsCount(entry: ExerciseEntry): number {
  return entry.sets?.filter((s) => s.notes === "done").length ?? 0;
}

onMounted(async () => {
  loadingPlan.value = true;
  try {
    await workoutStore.loadToday();
  } finally {
    loadingPlan.value = false;
  }
});

async function finishWorkout(): Promise<void> {
  showFinishConfirm.value = false;
  await workoutStore.finishWorkout();
}

function handleEndSet(): void {
  if (workoutStore.trackingMode === "timer") {
    showRepInput.value = true;
  } else {
    workoutStore.finishSet();
  }
}

async function confirmReps(reps: number): Promise<void> {
  showRepInput.value = false;
  await workoutStore.finishSet(reps);
}

function handleLogout(): void {
  workoutStore.resetWorkoutState();
  auth.clearSession();
  router.push("/login");
}
</script>
