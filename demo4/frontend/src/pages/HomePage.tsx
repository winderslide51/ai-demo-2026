import { Link } from 'react-router'
import { AnnonceList } from '../features/annonces/AnnonceList'
import { useAnnonces } from '../features/annonces/useAnnonces'
import { Button } from '../shared/ui'
import styles from './HomePage.module.css'

export const LOADING_MESSAGE = 'Chargement des annonces…'
export const EMPTY_MESSAGE = 'Aucune annonce pour le moment.'
export const LOAD_ERROR_MESSAGE = 'Impossible de charger les annonces.'

export function HomePage() {
  const { state, reload } = useAnnonces()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Annonces récentes</h1>

      {state.status === 'loading' && (
        <p className={styles.status} role="status">
          {LOADING_MESSAGE}
        </p>
      )}

      {state.status === 'error' && (
        <div className={styles.error} role="alert">
          <p>{LOAD_ERROR_MESSAGE}</p>
          <Button variant="secondary" onClick={reload}>
            Réessayer
          </Button>
        </div>
      )}

      {state.status === 'ready' &&
        (state.annonces.length === 0 ? (
          <div className={styles.empty}>
            <p>{EMPTY_MESSAGE}</p>
            <Link to="/deposer" className={styles.emptyLink}>
              Déposer la première annonce
            </Link>
          </div>
        ) : (
          <AnnonceList annonces={state.annonces} />
        ))}
    </div>
  )
}
