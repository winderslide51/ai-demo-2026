import { type Annonce, CATEGORY_LABELS } from '../../api/annonces'
import styles from './AnnonceTile.module.css'
import { formatPrice } from './formatPrice'
import { formatRelativeDate } from './relativeDate'

/** Read-only tile: no link, no button — the detail page comes in a later change. */
export function AnnonceTile({ annonce }: { annonce: Annonce }) {
  return (
    <article className={styles.tile}>
      <h3 className={styles.title}>{annonce.title}</h3>
      <p className={styles.price}>{formatPrice(annonce.price)}</p>
      <p className={styles.meta}>{CATEGORY_LABELS[annonce.category]}</p>
      <p className={styles.meta}>
        {annonce.city} ({annonce.postalCode})
      </p>
      <time className={styles.date} dateTime={annonce.createdAt}>
        {formatRelativeDate(annonce.createdAt)}
      </time>
    </article>
  )
}
