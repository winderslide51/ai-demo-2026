import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'hp' | 'hc' | 'overage' | 'critique' | 'avertissement' | 'info' | 'neutral' | 'success'

type Props = {
  tone?: BadgeTone
  children: ReactNode
  title?: string
}

export function Badge({ tone = 'neutral', children, title }: Props) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`} title={title}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
