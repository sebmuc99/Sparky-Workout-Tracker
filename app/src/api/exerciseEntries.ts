import sparky from './sparky'
import type { ExerciseEntry } from '@/types'

export async function getEntriesForDate(date: string): Promise<ExerciseEntry[]> {
  const response = await sparky.get<ExerciseEntry[] | { value: ExerciseEntry[] }>('/api/exercise-entries/by-date', {
    params: { selectedDate: date },
  })
  // API returns either a bare array or { value: [] } depending on version
  const data = response.data
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as { value: ExerciseEntry[] }).value)) return (data as { value: ExerciseEntry[] }).value
  return []
}

export async function createEntry(data: Partial<ExerciseEntry>): Promise<ExerciseEntry> {
  const response = await sparky.post<ExerciseEntry>('/api/exercise-entries', data)
  return response.data
}

export async function updateEntry(id: string, data: Partial<ExerciseEntry>): Promise<ExerciseEntry> {
  const response = await sparky.put<ExerciseEntry>(`/api/exercise-entries/${id}`, data)
  return response.data
}

export async function getHistory(exerciseId: string, limit = 1): Promise<ExerciseEntry[]> {
  const response = await sparky.get<ExerciseEntry[]>(
    `/api/exercise-entries/history/${exerciseId}`,
    { params: { limit } }
  )
  return response.data
}
