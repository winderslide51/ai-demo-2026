import type { Consommation, Facture, SiteDetail, SiteResume } from '../types/dto'
import { apiFetch, withMois } from './client'

export function listSites(mois?: string): Promise<SiteResume[]> {
  return apiFetch<SiteResume[]>(withMois('/sites', mois))
}

export function getSite(id: string, mois?: string): Promise<SiteDetail> {
  return apiFetch<SiteDetail>(withMois(`/sites/${encodeURIComponent(id)}`, mois))
}

export function getConsommation(id: string, mois?: string): Promise<Consommation> {
  return apiFetch<Consommation>(withMois(`/sites/${encodeURIComponent(id)}/consommation`, mois))
}

export function getFacture(id: string, mois?: string): Promise<Facture> {
  return apiFetch<Facture>(withMois(`/sites/${encodeURIComponent(id)}/facture`, mois))
}
