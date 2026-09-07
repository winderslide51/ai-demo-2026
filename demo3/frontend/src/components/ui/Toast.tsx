import { useEffect } from 'react'
import { labels } from '../../labels'
import styles from './Toast.module.css'

type Props = {
  kind: 'success' | 'error'
  message: string
  onClose: () => void
  autoCloseMs?: number
}

export function Toast({ kind, message, onClose, autoCloseMs = 5000 }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, autoCloseMs)
    return () => window.clearTimeout(timer)
  }, [onClose, autoCloseMs])

  return (
    <div className={`${styles.toast} ${styles[kind]}`} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        {kind === 'success' ? '✓' : '!'}
      </span>
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.close} onClick={onClose} aria-label={labels.fermer}>
        ×
      </button>
    </div>
  )
}
