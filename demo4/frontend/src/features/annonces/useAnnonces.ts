import { useCallback, useEffect, useState } from 'react'
import { type Annonce, listAnnonces } from '../../api/annonces'

export type AnnoncesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; annonces: Annonce[] }

/** Loads the annonce list on mount; `reload` re-runs the request (used by the retry button). */
export function useAnnonces(): { state: AnnoncesState; reload: () => void } {
  const [state, setState] = useState<AnnoncesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    // every failure lands here, ApiError and network TypeError alike
    listAnnonces().then(
      (annonces) => {
        if (!cancelled) setState({ status: 'ready', annonces })
      },
      () => {
        if (!cancelled) setState({ status: 'error' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [attempt])

  return { state, reload }
}
