import { labels } from '../../labels'
import styles from './Spinner.module.css'

type Props = { label?: string }

export function Spinner({ label = labels.chargement }: Props) {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.ring} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
