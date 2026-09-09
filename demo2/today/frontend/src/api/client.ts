import type { ApiErrorBody } from '../types/api';

/**
 * The only module allowed to call `fetch` (ADR 0002). Every other module reaches
 * the backend through a typed function built on top of `apiGet`.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

const UNEXPECTED_RESPONSE_MESSAGE = 'Le service a renvoyé une réponse inattendue.';
const NETWORK_FAILURE_MESSAGE = 'Impossible de contacter le serveur.';

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body?.detail === 'string' && body.detail.length > 0) {
      return body.detail;
    }
    return UNEXPECTED_RESPONSE_MESSAGE;
  } catch {
    return UNEXPECTED_RESPONSE_MESSAGE;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ApiError(0, NETWORK_FAILURE_MESSAGE);
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
}
