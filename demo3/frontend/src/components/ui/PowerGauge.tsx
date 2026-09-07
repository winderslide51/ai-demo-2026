import { formatKva, formatKw } from '../../format'
import styles from './PowerGauge.module.css'

type Props = {
  value: number
  max: number
  label: string
}

/** Subscribed power sits at 80 % of the track, leaving 20 % of room to draw an overage. */
const LIMIT_PCT = 80
const MAX_OVER_RATIO = 0.25

/** Horizontal gauge: measured peak power against the subscribed power. Red beyond 100 %. */
export function PowerGauge({ value, max, label }: Props) {
  const ratio = max > 0 ? value / max : 0
  const over = ratio > 1
  const fillWidth = Math.min(ratio, 1) * LIMIT_PCT
  const overflowWidth = over ? Math.min(ratio - 1, MAX_OVER_RATIO) * LIMIT_PCT : 0
  return (
    <div className={styles.gauge} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className={styles.track}>
        <div className={`${styles.fill} ${over ? styles.over : ''}`} style={{ width: `${fillWidth}%` }} />
        {over && <div className={styles.overflow} style={{ left: `${LIMIT_PCT}%`, width: `${overflowWidth}%` }} />}
        <div className={styles.limit} style={{ left: `${LIMIT_PCT}%` }} aria-hidden="true" />
      </div>
      <span className={`${styles.text} ${over ? styles.overText : ''}`}>
        {formatKw(value)} <span className={styles.sep}>/</span> {formatKva(max)}
      </span>
    </div>
  )
}
