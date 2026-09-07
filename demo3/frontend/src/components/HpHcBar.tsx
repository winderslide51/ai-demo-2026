import { formatKwh } from '../format'
import { plageLabels } from '../labels'
import styles from './HpHcBar.module.css'

type Props = { hpKwh: number; hcKwh: number; compact?: boolean }

/** Two-tone bar: share of peak (amber) versus off-peak (teal) energy, with the percentages. */
export function HpHcBar({ hpKwh, hcKwh, compact = false }: Props) {
  const total = hpKwh + hcKwh
  const hpPct = total > 0 ? Math.round((hpKwh / total) * 100) : 0
  const hcPct = total > 0 ? 100 - hpPct : 0
  const title = `${plageLabels.HP} ${formatKwh(hpKwh)} · ${plageLabels.HC} ${formatKwh(hcKwh)}`
  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`} title={title}>
      <div className={styles.bar} role="img" aria-label={title}>
        <span className={styles.hp} style={{ width: `${hpPct}%` }} />
        <span className={styles.hc} style={{ width: `${hcPct}%` }} />
      </div>
      <span className={styles.legend}>
        <span className={styles.hpText}>HP {hpPct} %</span>
        <span className={styles.hcText}>HC {hcPct} %</span>
      </span>
    </div>
  )
}
