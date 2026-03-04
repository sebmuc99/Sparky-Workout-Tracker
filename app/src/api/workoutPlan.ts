import sparky from './sparky'
import type { WorkoutPlanTemplate } from '@/types'

export async function getActivePlan(date: string): Promise<WorkoutPlanTemplate | null> {
  try {
    const response = await sparky.get<WorkoutPlanTemplate>(
      `/api/workout-plan-templates/active/${date}`
    )
    return response.data
  } catch {
    return null
  }
}

export async function getWorkoutPlans(): Promise<WorkoutPlanTemplate[]> {
  const response = await sparky.get<{ value: WorkoutPlanTemplate[] }>(
    '/api/workout-plan-templates'
  )
  return response.data.value
}
