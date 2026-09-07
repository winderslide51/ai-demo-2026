import { ApiError, apiFetch, withMois } from './client'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the parsed JSON body on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { status: 'ok' }))
    await expect(apiFetch<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' })
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }))
  })

  it('throws an ApiError carrying the backend message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(409, { message: 'Cette alerte est déjà acquittée.' }))
    const error = await apiFetch('/alertes/x/acquitter', { method: 'POST' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(409)
    expect((error as ApiError).message).toBe('Cette alerte est déjà acquittée.')
  })

  it('falls back to a generic French message when the error body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Bad Gateway', { status: 502 }))
    const error = await apiFetch('/sites').catch((e: unknown) => e)
    expect((error as ApiError).message).toBe('Une erreur est survenue.')
  })

  it('maps a network failure to a French message', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await apiFetch('/sites').catch((e: unknown) => e)
    expect((error as ApiError).status).toBe(0)
    expect((error as ApiError).message).toBe('Impossible de joindre le serveur.')
  })

  it('returns undefined on 204', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    await expect(apiFetch('/x')).resolves.toBeUndefined()
  })
})

describe('withMois', () => {
  it('adds the month and extra params only when defined', () => {
    expect(withMois('/sites')).toBe('/sites')
    expect(withMois('/sites', '2026-08')).toBe('/sites?mois=2026-08')
    expect(withMois('/alertes', undefined, { siteId: 'LYO-01', acquittee: undefined })).toBe('/alertes?siteId=LYO-01')
  })
})
