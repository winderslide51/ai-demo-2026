import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

type Props = { message: string; action?: ReactNode }

export function EmptyState({ message, action }: Props) {
  return (
    <div className={styles.empty}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className={styles.icon}>
        <rect x="6" y="10" width="28" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 18h28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 26h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
      </svg>
      <p>{message}</p>
      {action}
    </div>
  )
}
