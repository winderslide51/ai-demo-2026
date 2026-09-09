import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiGet } from './client';

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed typed body on a 200 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'ok', service: 'cra-api', apiVersion: '0.1.0' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiGet<{ status: string }>('/health');

    expect(result).toEqual({ status: 'ok', service: 'cra-api', apiVersion: '0.1.0' });
  });

  it('requests the relative /api/... URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiGet('/health');

    expect(fetchMock).toHaveBeenCalledWith('/api/health', { headers: { Accept: 'application/json' } });
  });

  it('throws an ApiError carrying the status and the French detail on a 500 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ detail: 'Une erreur interne est survenue.' }, { status: 500 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/health')).rejects.toMatchObject({
      status: 500,
      detail: 'Une erreur interne est survenue.',
    });
  });

  it('throws an ApiError carrying the status and the French detail on a 404 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ detail: 'Ressource introuvable.' }, { status: 404 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/inconnu')).rejects.toMatchObject({
      status: 404,
      detail: 'Ressource introuvable.',
    });
  });

  it('falls back to the default French message when the error body is not JSON', async () => {
    const notJsonResponse = new Response('<html>Bad gateway</html>', { status: 502 });
    const fetchMock = vi.fn().mockResolvedValue(notJsonResponse);
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/health')).rejects.toMatchObject({
      status: 502,
      detail: 'Le service a renvoyé une réponse inattendue.',
    });
  });

  it('throws ApiError(0, "Impossible de contacter le serveur.") when fetch rejects', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network failure'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/health')).rejects.toMatchObject({
      status: 0,
      detail: 'Impossible de contacter le serveur.',
    });
  });

  it('creates an ApiError with the Error subclass semantics', () => {
    const error = new ApiError(404, 'Ressource introuvable.');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Ressource introuvable.');
    expect(error.status).toBe(404);
    expect(error.detail).toBe('Ressource introuvable.');
  });
});
