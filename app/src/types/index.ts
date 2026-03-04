// ─── Sparky Fitness API types ─────────────────────────────────────────────────

export interface SparkyExercise {
  id: string                       // UUID
  name: string
  category: string | null
  equipment: string | null
  description: string | null
  calories_per_hour: number
  is_custom: boolean
  shared_with_public: boolean
}

// ─── Workout Plan ─────────────────────────────────────────────────────────────

export interface PlanSet {
  id: number
  set_number: number
  set_type: string
  reps: number | null
  weight: number | null
  duration: number | null
  rest_time: number | null         // seconds
  notes: string | null
}

export interface PlanAssignment {
  id: number
  day_of_week: number              // 0 = Sun, 1 = Mon, …, 6 = Sat (JS convention)
  sort_order: number
  exercise_id: string              // UUID
  exercise_name: string
  workout_preset_id: number | null
  workout_preset_name: string | null
  sets: PlanSet[]
}

export interface WorkoutPlanTemplate {
  id: number
  plan_name: string
  description: string | null
  start_date: string
  end_date: string
  is_active: boolean
  assignments: PlanAssignment[]
}

// ─── Exercise Entries ─────────────────────────────────────────────────────────

export interface EntrySet {
  id?: number
  set_number?: number
  set_type?: string
  reps: number
  weight: number | null
  duration: number | null
  rest_time?: number | null
  notes?: string | null
  rpe?: number | null
}

export interface ExerciseEntry {
  id: string                       // UUID
  exercise_id: string              // UUID
  exercise_name?: string
  entry_date: string               // YYYY-MM-DD
  duration_minutes: number | null
  calories_burned: number | null
  notes: string | null
  sets: EntrySet[]
  workout_plan_assignment_id: number | null
  exercise_snapshot?: {
    id: string
    name: string
    category: string | null
    calories_per_hour: number
  }
}

// ─── Tracking mode ───────────────────────────────────────────────────────────

/** How reps are recorded during a set */
export type TrackingMode = 'counter' | 'timer'

// ─── In-memory active set (not persisted separately) ─────────────────────────

export interface ActiveSet {
  setNumber: number
  timeStart: string                // ISO datetime
  reps: number
}
