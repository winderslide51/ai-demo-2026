import { useCallback, useState } from 'react'
import { acquitterAlerte } from '../api/alertes'
import { ApiError } from '../api/client'
import { labels } from '../labels'
import type { Alerte } from '../types/dto'

export type ToastState = { kind: 'success' | 'error'; message: string } | null

/** Shared "acquitter" interaction: tracks the in-flight alert and the resulting toast. */
export function useAcquitter(onDone: () => void) {
  const [acquittingId, setAcquittingId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const acquitter = useCallback(
    async (alerte: Alerte) => {
      setAcquittingId(alerte.id)
      try {
        await acquitterAlerte(alerte.id)
        setToast({ kind: 'success', message: labels.alerteAcquittee })
        onDone()
      } catch (e: unknown) {
        setToast({ kind: 'error', message: e instanceof ApiError ? e.message : labels.erreurGenerique })
      } finally {
        setAcquittingId(null)
      }
    },
    [onDone],
  )

  const closeToast = useCallback(() => setToast(null), [])

  return { acquitter, acquittingId, toast, closeToast }
}
