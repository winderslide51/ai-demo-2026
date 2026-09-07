import type { Alerte, AlerteFilters } from '../types/dto'
import { apiFetch, withMois } from './client'

export function listAlertes(filters: AlerteFilters = {}): Promise<Alerte[]> {
  return apiFetch<Alerte[]>(
    withMois('/alertes', filters.mois, {
      siteId: filters.siteId,
      acquittee: filters.acquittee === undefined ? undefined : String(filters.acquittee),
    }),
  )
}

export function acquitterAlerte(id: string): Promise<Alerte> {
  return apiFetch<Alerte>(`/alertes/${encodeURIComponent(id)}/acquitter`, { method: 'POST' })
}
