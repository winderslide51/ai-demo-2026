import { Link } from 'react-router'
import { labels } from '../labels'
import styles from './pages.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.notFound}>
      <h2>{labels.pageIntrouvable}</h2>
      <p>
        <Link to="/">{labels.retourAccueil}</Link>
      </p>
    </div>
  )
}
