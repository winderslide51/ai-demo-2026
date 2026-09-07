import { formatMois } from '../../format'
import { labels } from '../../labels'
import styles from './MonthPicker.module.css'

type Props = {
  value: string
  options: string[]
  onChange: (mois: string) => void
}

export function MonthPicker({ value, options, onChange }: Props) {
  // Most recent month first — that is what people look for.
  const sorted = [...options].sort((a, b) => (a < b ? 1 : -1))
  return (
    <label className={styles.picker}>
      <span className={styles.label}>{labels.mois}</span>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {sorted.map((mois) => (
          <option key={mois} value={mois}>
            {formatMois(mois)}
          </option>
        ))}
      </select>
    </label>
  )
}
