import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/** The selected month lives in the URL (`?mois=YYYY-MM`) so every page shares it. */
export function useMoisParam(): [string | undefined, (mois: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const mois = searchParams.get('mois') ?? undefined
  const setMois = useCallback(
    (next: string) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set('mois', next)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )
  return [mois, setMois]
}
