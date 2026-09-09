import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHealth } from './useHealth';
import { fetchHealth } from '../api/health';
import { ApiError } from '../api/client';

vi.mock('../api/health');

const fetchHealthMock = vi.mocked(fetchHealth);

describe('useHealth', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('starts in the loading state', () => {
    fetchHealthMock.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHealth());

    expect(result.current.state).toEqual({ status: 'loading' });
  });

  it('transitions to success with the DTO', async () => {
    const dto = { status: 'ok' as const, service: 'cra-api', apiVersion: '0.1.0' };
    fetchHealthMock.mockResolvedValue(dto);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'success', data: dto });
    });
  });

  it('transitions to error with the French message', async () => {
    fetchHealthMock.mockRejectedValue(new ApiError(0, 'Impossible de contacter le serveur.'));

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: 'error',
        message: 'Impossible de contacter le serveur.',
      });
    });
  });

  it('re-issues the request when reload is called', async () => {
    const dto = { status: 'ok' as const, service: 'cra-api', apiVersion: '0.1.0' };
    fetchHealthMock.mockRejectedValueOnce(new ApiError(0, 'Impossible de contacter le serveur.'));
    fetchHealthMock.mockResolvedValueOnce(dto);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'success', data: dto });
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });
});
