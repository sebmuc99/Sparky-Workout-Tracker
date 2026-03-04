import sparky from './sparky'
import type { SparkyExercise } from '@/types'

export async function getExercises(): Promise<SparkyExercise[]> {
  const response = await sparky.get<{ exercises: SparkyExercise[] }>('/api/exercises', {
    params: { itemsPerPage: 100, ownershipFilter: 'user' },
  })
  return response.data.exercises
}

export async function searchExercises(term: string): Promise<SparkyExercise[]> {
  const response = await sparky.get<SparkyExercise[]>('/api/exercises/search', {
    params: { searchTerm: term },
  })
  return response.data
}
