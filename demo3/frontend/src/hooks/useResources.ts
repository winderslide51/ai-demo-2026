import { useCallback } from 'react'
import { listAlertes } from '../api/alertes'
import { getClient } from '../api/contrat'
import { getMois } from '../api/mois'
import { getSite, listSites } from '../api/sites'
import { getSynthese } from '../api/synthese'
import type { AlerteFilters } from '../types/dto'
import { useRemote } from './useRemote'

export function useSynthese(mois?: string) {
  const load = useCallback(() => getSynthese(mois), [mois])
  return useRemote(load)
}

export function useSites(mois?: string) {
  const load = useCallback(() => listSites(mois), [mois])
  return useRemote(load)
}

export function useSite(id: string, mois?: string) {
  const load = useCallback(() => getSite(id, mois), [id, mois])
  return useRemote(load)
}

export function useAlertes(filters: AlerteFilters) {
  const { mois, siteId, acquittee } = filters
  const load = useCallback(() => listAlertes({ mois, siteId, acquittee }), [mois, siteId, acquittee])
  return useRemote(load)
}

export function useClient() {
  const load = useCallback(() => getClient(), [])
  return useRemote(load)
}

export function useMois() {
  const load = useCallback(() => getMois(), [])
  return useRemote(load)
}
