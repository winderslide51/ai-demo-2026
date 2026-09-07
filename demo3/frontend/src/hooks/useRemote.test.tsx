import { act, renderHook, waitFor } from '@testing-library/react'
import { ApiError } from '../api/client'
import { useRemote } from './useRemote'

describe('useRemote', () => {
  it('goes from loading to ready and reloads on demand', async () => {
    const load = vi.fn().mockResolvedValue(42)
    const { result } = renderHook(() => useRemote(load))
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.data).toBe(42)

    act(() => result.current.reload())
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2))
  })

  it('exposes the ApiError message, and a generic one for unknown errors', async () => {
    const { result: r1 } = renderHook(() => useRemote(() => Promise.reject(new ApiError(404, 'Site inconnu.'))))
    await waitFor(() => expect(r1.current.status).toBe('error'))
    expect(r1.current.error).toBe('Site inconnu.')

    const { result: r2 } = renderHook(() => useRemote(() => Promise.reject(new Error('boom'))))
    await waitFor(() => expect(r2.current.status).toBe('error'))
    expect(r2.current.error).toBe('Une erreur est survenue.')
  })
})
