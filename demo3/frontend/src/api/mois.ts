import type { MoisDisponibles } from '../types/dto'
import { apiFetch } from './client'

export function getMois(): Promise<MoisDisponibles> {
  return apiFetch<MoisDisponibles>('/mois')
}
