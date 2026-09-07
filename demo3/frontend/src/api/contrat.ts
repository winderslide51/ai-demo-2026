import type { Client } from '../types/dto'
import { apiFetch } from './client'

/** GET /api/client — the single customer of the demo, with its contract and tariff grid. */
export function getClient(): Promise<Client> {
  return apiFetch<Client>('/client')
}
