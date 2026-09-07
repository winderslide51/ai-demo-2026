import type { ReactNode } from 'react'
import styles from './Card.module.css'

type Props = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  index?: number
  className?: string
  padded?: boolean
}

export function Card({ title, subtitle, actions, children, index = 0, className, padded = true }: Props) {
  return (
    <section className={`${styles.card} reveal ${className ?? ''}`} style={{ ['--i' as string]: index }}>
      {(title || actions) && (
        <header className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={padded ? styles.body : styles.bodyFlush}>{children}</div>
    </section>
  )
}
