import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { labels } from '../labels'

export type RemoteStatus = 'loading' | 'ready' | 'error'

export type Remote<T> = {
  data: T | null
  status: RemoteStatus
  error: string | null
  reload: () => void
}

/**
 * Runs `load` whenever `deps` change and exposes the three remote states.
 * `load` must be memoised by the caller (useCallback) — it is the dependency.
 */
export function useRemote<T>(load: () => Promise<T>): Remote<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<RemoteStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    load()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : labels.erreurGenerique)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [load, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { data, status, error, reload }
}
