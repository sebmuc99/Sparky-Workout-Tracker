<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
  >
    <div
      class="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-600 p-6 space-y-5"
    >
      <h2 class="text-white font-bold text-lg text-center">How many reps?</h2>

      <!-- Number input -->
      <div class="flex items-center justify-center gap-4">
        <button
          @click="decrease"
          class="w-14 h-14 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-2xl font-bold transition select-none"
        >
          −
        </button>

        <input
          ref="inputEl"
          v-model.number="reps"
          type="number"
          inputmode="numeric"
          min="0"
          class="w-24 h-16 rounded-xl bg-slate-900 border border-slate-600 text-center text-4xl font-black text-blue-400 focus:outline-none focus:border-blue-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          @click="increase"
          class="w-14 h-14 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-2xl font-bold transition select-none"
        >
          +
        </button>
      </div>

      <!-- Target hint -->
      <p v-if="targetReps" class="text-center text-slate-400 text-sm">
        Target:
        <span class="text-blue-400 font-semibold">{{ targetReps }}</span> reps
      </p>

      <!-- Confirm / Cancel -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition text-sm"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm', reps)"
          class="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition text-sm"
        >
          Save Set
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  targetReps?: number | null;
}>();

defineEmits<{
  confirm: [reps: number];
  cancel: [];
}>();

const reps = ref(props.targetReps ?? 10);
const inputEl = ref<HTMLInputElement | null>(null);

function increase(): void {
  reps.value++;
}
function decrease(): void {
  if (reps.value > 0) reps.value--;
}

onMounted(() => {
  // Auto-select the input so the user can type immediately
  inputEl.value?.select();
});
</script>
