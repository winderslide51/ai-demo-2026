import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHealth } from './health';

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json' },
  });
}

describe('fetchHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls /api/health and returns the HealthDto', async () => {
    const dto = { status: 'ok', service: 'cra-api', apiVersion: '0.1.0' };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(dto));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchHealth();

    expect(fetchMock).toHaveBeenCalledWith('/api/health', { headers: { Accept: 'application/json' } });
    expect(result).toEqual(dto);
  });
});
