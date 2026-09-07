import { labels } from '../labels'

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ErrorBody = { message?: unknown }

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody
    if (typeof body.message === 'string' && body.message.length > 0) return body.message
  } catch {
    // body is not JSON — fall through to the generic message
  }
  return labels.erreurGenerique
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, labels.erreurReseau)
  }
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function withMois(path: string, mois?: string, extra: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams()
  if (mois) params.set('mois', mois)
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) params.set(key, value)
  }
  const query = params.toString()
  return query ? `${path}?${query}` : path
}
