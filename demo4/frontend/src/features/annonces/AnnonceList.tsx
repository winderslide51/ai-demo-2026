import type { Annonce } from '../../api/annonces'
import styles from './AnnonceList.module.css'
import { AnnonceTile } from './AnnonceTile'

/** Presentational: renders the annonces in the order the API returned them. */
export function AnnonceList({ annonces }: { annonces: Annonce[] }) {
  return (
    <ul className={styles.grid}>
      {annonces.map((annonce) => (
        <li key={annonce.id}>
          <AnnonceTile annonce={annonce} />
        </li>
      ))}
    </ul>
  )
}
