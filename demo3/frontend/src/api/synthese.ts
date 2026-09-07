import type { Synthese } from '../types/dto'
import { apiFetch, withMois } from './client'

export function getSynthese(mois?: string): Promise<Synthese> {
  return apiFetch<Synthese>(withMois('/synthese', mois))
}
