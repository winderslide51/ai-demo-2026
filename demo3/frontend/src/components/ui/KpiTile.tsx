import type { ReactNode } from 'react'
import { formatPct } from '../../format'
import { labels } from '../../labels'
import styles from './KpiTile.module.css'

type Props = {
  label: string
  value: string
  unit?: string
  delta?: number | null
  deltaLabel?: string
  tone?: 'neutral' | 'overage' | 'hp' | 'hc' | 'warning'
  footer?: ReactNode
  index?: number
}

export function KpiTile({ label, value, unit, delta, deltaLabel = labels.vsMoisPrecedent, tone = 'neutral', footer, index = 0 }: Props) {
  const deltaTone = delta === undefined || delta === null ? '' : delta > 0 ? styles.up : delta < 0 ? styles.down : styles.flat
  return (
    <div className={`${styles.tile} ${styles[tone]} reveal`} style={{ ['--i' as string]: index }}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        <span className={styles.number}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </p>
      {delta !== undefined && delta !== null && (
        <p className={`${styles.delta} ${deltaTone}`}>
          <span aria-hidden="true">{delta > 0 ? '▲' : delta < 0 ? '▼' : '■'}</span> {formatPct(delta)}{' '}
          <span className={styles.deltaLabel}>{deltaLabel}</span>
        </p>
      )}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
