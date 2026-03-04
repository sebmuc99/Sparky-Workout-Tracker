import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getExercises } from '@/api/exercises'
import type { SparkyExercise } from '@/types'

export const useExercisesStore = defineStore('exercises', () => {
  const exercises = ref<SparkyExercise[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function fetchExercises(): Promise<void> {
    if (loaded.value) return
    loading.value = true
    try {
      exercises.value = await getExercises()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    exercises.value = []
    loaded.value = false
  }

  return { exercises, loading, loaded, fetchExercises, reset }
})
