import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEntriesForDate, createEntry, updateEntry } from '@/api/exerciseEntries'
import type {
  SparkyExercise,
  PlanAssignment,
  ExerciseEntry,
  EntrySet,
  ActiveSet,
  TrackingMode,
} from '@/types'

export const useWorkoutStore = defineStore('workout', () => {
  // ─── Plan & today's data ─────────────────────────────────────────────────

  const todaysEntries = ref<ExerciseEntry[]>([])

  // ─── Active workout session ───────────────────────────────────────────────

  const selectedExercise = ref<SparkyExercise | null>(null)
  const selectedAssignment = ref<PlanAssignment | null>(null)
  const activeEntry = ref<ExerciseEntry | null>(null)
  const activeSet = ref<ActiveSet | null>(null)
  const completedSets = ref<EntrySet[]>([])

  const workoutStarted = ref(false)
  const setInProgress = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Tracking mode (counter vs timer-only) ────────────────────────────

  const TRACKING_MODE_KEY = 'workout-tracker:tracking-modes'
  const trackingMode = ref<TrackingMode>('counter')

  function loadTrackingMode(exerciseId: string): void {
    try {
      const stored = localStorage.getItem(TRACKING_MODE_KEY)
      const map: Record<string, TrackingMode> = stored ? JSON.parse(stored) : {}
      trackingMode.value = map[exerciseId] ?? 'counter'
    } catch {
      trackingMode.value = 'counter'
    }
  }

  function setTrackingMode(mode: TrackingMode): void {
    trackingMode.value = mode
    const exerciseId = selectedExercise.value?.id
    if (!exerciseId) return
    try {
      const stored = localStorage.getItem(TRACKING_MODE_KEY)
      const map: Record<string, TrackingMode> = stored ? JSON.parse(stored) : {}
      map[exerciseId] = mode
      localStorage.setItem(TRACKING_MODE_KEY, JSON.stringify(map))
    } catch { /* localStorage full / unavailable — ignore */ }
  }

  function toggleTrackingMode(): void {
    setTrackingMode(trackingMode.value === 'counter' ? 'timer' : 'counter')
  }

  // Continue-or-new choice state
  const workoutChoicePending = ref(false)
  const todaysExistingWorkouts = ref<ExerciseEntry[]>([])

  // ─── Pause timer ─────────────────────────────────────────────────────────

  const pauseActive = ref(false)
  const pauseRemainingSeconds = ref(0)
  const pauseTotalSeconds = ref(0)
  let pauseInterval: ReturnType<typeof setInterval> | null = null
  let pauseStartedAt: number | null = null  // wall-clock ms when pause started

  // ─── Getters ─────────────────────────────────────────────────────────────

  const nextSetNumber = computed(() => completedSets.value.length + 1)

  const totalExecutions = computed(() =>
    completedSets.value.reduce((sum, s) => sum + (s.reps ?? 0), 0)
  )

  // The next pending planned set (notes != 'done') — gives target reps/weight
  const nextPlannedSet = computed(() => {
    const sets = activeEntry.value?.sets ?? []
    const idx = completedSets.value.length
    const slot = sets[idx]
    return (slot && slot.notes !== 'done') ? slot : null
  })

  // ─── Plan loading ─────────────────────────────────────────────────────────

  async function loadToday(): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    todaysEntries.value = await getEntriesForDate(today)
  }

  // ─── Workout flow ─────────────────────────────────────────────────────────

  // Start directly from a pre-existing plan entry (no choice modal needed)
  async function startFromEntry(entry: ExerciseEntry): Promise<void> {
    resetWorkoutState()
    selectedExercise.value = entry.exercise_snapshot
      ? {
          id: entry.exercise_snapshot.id,
          name: entry.exercise_snapshot.name,
          category: entry.exercise_snapshot.category,
          equipment: null,
          description: null,
          calories_per_hour: entry.exercise_snapshot.calories_per_hour,
          is_custom: false,
          shared_with_public: false,
        }
      : { id: entry.exercise_id, name: entry.exercise_id, category: null, equipment: null, description: null, calories_per_hour: 0, is_custom: false, shared_with_public: false }
    loadTrackingMode(selectedExercise.value.id)
    await continueWorkout(entry)
  }

  async function prepareWorkout(
    exercise: SparkyExercise,
    assignment?: PlanAssignment
  ): Promise<void> {
    resetWorkoutState()
    selectedExercise.value = exercise
    selectedAssignment.value = assignment ?? null
    loadTrackingMode(exercise.id)
    loading.value = true
    error.value = null
    try {
      const existing = todaysEntries.value.filter((e) => e.exercise_id === exercise.id)
      if (existing.length > 0) {
        todaysExistingWorkouts.value = existing
        workoutChoicePending.value = true
      } else {
        await startFreshWorkout()
      }
    } catch (e) {
      error.value = 'Failed to load workout data'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function startFreshWorkout(): Promise<void> {
    if (!selectedExercise.value) return
    loading.value = true
    error.value = null
    try {
      const today = new Date().toISOString().split('T')[0]
      // Pre-populate sets from plan so set_number / reps targets are stored;
      // notes: null means "planned but not yet executed"
      const plannedSets: EntrySet[] = selectedAssignment.value?.sets.map((ps) => ({
        set_number: ps.set_number,
        set_type: ps.set_type,
        reps: ps.reps ?? 0,
        weight: ps.weight,
        duration: ps.duration,
        rest_time: ps.rest_time,
        notes: null,
      })) ?? []
      activeEntry.value = await createEntry({
        exercise_id: selectedExercise.value.id,
        entry_date: today,
        sets: plannedSets,
        workout_plan_assignment_id: selectedAssignment.value?.id ?? null,
      })
      workoutChoicePending.value = false
      workoutStarted.value = true
    } catch (e) {
      error.value = 'Failed to start workout'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function continueWorkout(entry: ExerciseEntry): Promise<void> {
    loading.value = true
    error.value = null
    try {
      activeEntry.value = entry
      // Only sets explicitly marked done count as completed; planned-but-not-done
      // sets (notes: null) are still pending.
      completedSets.value = (entry.sets ?? []).filter((s) => s.notes === 'done')
      workoutChoicePending.value = false
      workoutStarted.value = true
    } catch (e) {
      error.value = 'Failed to continue workout'
      throw e
    } finally {
      loading.value = false
    }
  }

  function startNewSet(): void {
    activeSet.value = {
      setNumber: nextSetNumber.value,
      timeStart: new Date().toISOString(),
      reps: 0,
    }
    setInProgress.value = true
  }

  async function trackExecution(): Promise<void> {
    if (!activeSet.value) return
    activeSet.value = { ...activeSet.value, reps: activeSet.value.reps + 1 }
  }

  async function finishSet(manualReps?: number): Promise<void> {
    if (!activeSet.value || !activeEntry.value) return
    // In timer mode the reps come from the manual input
    if (manualReps !== undefined) {
      activeSet.value = { ...activeSet.value, reps: manualReps }
    }
    loading.value = true
    error.value = null
    try {
      const justFinishedIndex = completedSets.value.length

      // Calculate actual duration in minutes (minimum 1 if set was started)
      const durationMinutes = activeSet.value.timeStart
        ? Math.max(1, Math.round((Date.now() - new Date(activeSet.value.timeStart).getTime()) / 60000))
        : null

      // Build the full sets array: replace the matching planned set (by index)
      // or append if no plan. Mark it done via notes.
      const allSets: EntrySet[] = [...(activeEntry.value.sets ?? [])]
      const plannedSlot = allSets[justFinishedIndex]
      const newSet: EntrySet = {
        ...(plannedSlot ?? {}),
        set_number: plannedSlot?.set_number ?? justFinishedIndex + 1,  // ← required by DB
        set_type: plannedSlot?.set_type ?? 'Working Set',
        reps: activeSet.value.reps,
        weight: plannedSlot?.weight ?? null,
        duration: durationMinutes,  // ← actual time spent on set
        notes: 'done',
      }
      // Replace in-place if slot exists, otherwise append
      if (justFinishedIndex < allSets.length) {
        allSets[justFinishedIndex] = newSet
      } else {
        allSets.push(newSet)
      }
      completedSets.value = [...completedSets.value, newSet]
      activeSet.value = null
      setInProgress.value = false

      // Recalculate entry-level duration and calories from all done sets
      const totalDurationMinutes = allSets
        .filter((s) => s.notes === 'done' && s.duration != null)
        .reduce((sum, s) => sum + (s.duration ?? 0), 0)
      const caloriesPerHour = selectedExercise.value?.calories_per_hour ?? 0
      const caloriesBurned = caloriesPerHour > 0 && totalDurationMinutes > 0
        ? Math.round(caloriesPerHour * (totalDurationMinutes / 60))
        : (activeEntry.value.calories_burned ?? null)

      // Persist full sets array + updated totals to Sparky
      activeEntry.value = await updateEntry(activeEntry.value.id, {
        sets: allSets,
        ...(totalDurationMinutes > 0 && { duration_minutes: totalDurationMinutes }),
        ...(caloriesBurned != null && { calories_burned: caloriesBurned }),
      })

      // Start rest timer: use the planned slot's rest_time, fall back to 90s
      const restTime = (plannedSlot?.rest_time != null && plannedSlot.rest_time > 0)
        ? plannedSlot.rest_time
        : 90
      startPause(restTime)
    } catch (e) {
      error.value = 'Failed to save set'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function finishWorkout(): Promise<void> {
    resetWorkoutState()
    // Reload today's entries so the plan view reflects the completed session
    const today = new Date().toISOString().split('T')[0]
    todaysEntries.value = await getEntriesForDate(today)
  }

  // ─── Pause timer ─────────────────────────────────────────────────────────

  function startPause(seconds: number): void {
    pauseStartedAt = Date.now()
    pauseTotalSeconds.value = seconds
    pauseRemainingSeconds.value = seconds
    pauseActive.value = true
    pauseInterval = setInterval(() => {
      pauseRemainingSeconds.value -= 1
      if (pauseRemainingSeconds.value <= 0) {
        finishPause()
      }
    }, 1000)
  }

  function finishPause(): void {
    // Calculate how long the user actually rested
    const actualRestSeconds = pauseStartedAt
      ? Math.round((Date.now() - pauseStartedAt) / 1000)
      : null
    pauseStartedAt = null
    pauseActive.value = false
    pauseRemainingSeconds.value = 0
    pauseTotalSeconds.value = 0
    if (pauseInterval !== null) {
      clearInterval(pauseInterval)
      pauseInterval = null
    }
    // Patch rest_time onto the last completed set
    if (actualRestSeconds && activeEntry.value && completedSets.value.length > 0) {
      const allSets: EntrySet[] = [...(activeEntry.value.sets ?? [])]
      let lastDoneIndex = -1
      for (let i = allSets.length - 1; i >= 0; i--) {
        if (allSets[i].notes === 'done') { lastDoneIndex = i; break }
      }
      if (lastDoneIndex >= 0) {
        allSets[lastDoneIndex] = { ...allSets[lastDoneIndex], rest_time: actualRestSeconds }
        completedSets.value[completedSets.value.length - 1] = {
          ...completedSets.value[completedSets.value.length - 1],
          rest_time: actualRestSeconds,
        }
        // Fire-and-forget — failure is non-critical
        updateEntry(activeEntry.value.id, { sets: allSets })
          .then((updated) => { activeEntry.value = updated })
          .catch(() => {})
      }
    }
  }

  function resetWorkoutState(): void {
    finishPause()
    selectedExercise.value = null
    selectedAssignment.value = null
    activeEntry.value = null
    activeSet.value = null
    completedSets.value = []
    workoutStarted.value = false
    setInProgress.value = false
    workoutChoicePending.value = false
    todaysExistingWorkouts.value = []
    error.value = null
  }

  return {
    // today's entries
    todaysEntries,
    // active session
    selectedExercise,
    selectedAssignment,
    activeEntry,
    activeSet,
    completedSets,
    workoutStarted,
    setInProgress,
    loading,
    error,
    // tracking mode
    trackingMode,
    setTrackingMode,
    toggleTrackingMode,
    // pause
    pauseActive,
    pauseRemainingSeconds,
    pauseTotalSeconds,
    // choice modal
    workoutChoicePending,
    todaysExistingWorkouts,
    // getters
    nextSetNumber,
    totalExecutions,
    nextPlannedSet,
    // actions
    loadToday,
    startFromEntry,
    prepareWorkout,
    startFreshWorkout,
    continueWorkout,
    startNewSet,
    trackExecution,
    finishSet,
    finishWorkout,
    startPause,
    finishPause,
    resetWorkoutState,
  }
})
