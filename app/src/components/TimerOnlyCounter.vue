<template>
  <div class="text-center space-y-4">
    <!-- Elapsed timer -->
    <div>
      <p class="text-7xl font-black text-white tabular-nums">
        {{ elapsed }}
      </p>
      <p class="text-slate-400 text-sm mt-1">Elapsed</p>
    </div>

    <!-- Instruction hint -->
    <p class="text-slate-500 text-sm">
      Press <span class="text-orange-400 font-semibold">End Set</span> when done
      — you'll enter reps afterwards.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useWorkoutStore } from "@/stores/workout";

const workoutStore = useWorkoutStore();
const elapsed = ref("00:00");
let interval: ReturnType<typeof setInterval> | null = null;

function tick(): void {
  const start = workoutStore.activeSet?.timeStart;
  if (!start) return;
  const diff = Math.max(
    0,
    Math.floor((Date.now() - new Date(start).getTime()) / 1000),
  );
  const m = String(Math.floor(diff / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  elapsed.value = `${m}:${s}`;
}

onMounted(() => {
  tick();
  interval = setInterval(tick, 1000);
});

onUnmounted(() => {
  if (interval !== null) clearInterval(interval);
});
</script>
