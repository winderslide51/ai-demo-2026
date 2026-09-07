import { labels } from '../../labels'
import { Button } from './Button'
import styles from './ErrorBanner.module.css'

type Props = { message: string | null; onRetry?: () => void }

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className={styles.banner} role="alert">
      <div className={styles.text}>
        <strong>{labels.erreurGenerique}</strong>
        {message && message !== labels.erreurGenerique && <span className={styles.detail}>{message}</span>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {labels.reessayer}
        </Button>
      )}
    </div>
  )
}
