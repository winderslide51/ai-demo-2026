import { useState } from 'react'
import { AlerteCard } from '../components/AlerteCard'
import { EmptyState, ErrorBanner, Spinner, Toast } from '../components/ui'
import { useAcquitter } from '../hooks/useAcquitter'
import { useMoisParam } from '../hooks/useMoisParam'
import { useAlertes, useSites } from '../hooks/useResources'
import { labels, severiteLabels } from '../labels'
import type { Severite } from '../types/dto'
import styles from './pages.module.css'

const severites: Severite[] = ['CRITIQUE', 'AVERTISSEMENT', 'INFO']

export function AlertesPage() {
  const [mois] = useMoisParam()
  const [severite, setSeverite] = useState<Severite | ''>('')
  const [siteId, setSiteId] = useState('')
  const [avecAcquittees, setAvecAcquittees] = useState(false)

  const sites = useSites(mois)
  const alertes = useAlertes({ mois, siteId: siteId || undefined, acquittee: avecAcquittees ? undefined : false })
  const { acquitter, acquittingId, toast, closeToast } = useAcquitter(alertes.reload)

  const visible = (alertes.data ?? []).filter((a) => !severite || a.severite === severite)

  return (
    <div className="stack">
      <div className={`${styles.filters} reveal`}>
        <label className={styles.filter}>
          {labels.filtreSeverite}
          <select value={severite} onChange={(e) => setSeverite(e.target.value as Severite | '')}>
            <option value="">{labels.filtreToutes}</option>
            {severites.map((s) => (
              <option key={s} value={s}>
                {severiteLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filter}>
          {labels.filtreSite}
          <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="">{labels.filtreTousLesSites}</option>
            {(sites.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={avecAcquittees} onChange={(e) => setAvecAcquittees(e.target.checked)} />
          {labels.afficherAcquittees}
        </label>
      </div>

      {alertes.status === 'loading' && <Spinner />}
      {alertes.status === 'error' && <ErrorBanner message={alertes.error} onRetry={alertes.reload} />}
      {alertes.status === 'ready' && visible.length === 0 && <EmptyState message={labels.aucuneAlerte} />}
      {alertes.status === 'ready' && visible.length > 0 && (
        <div className={styles.alertList}>
          {visible.map((a, i) => (
            <AlerteCard key={a.id} alerte={a} index={i} onAcquitter={acquitter} acquitting={acquittingId === a.id} />
          ))}
        </div>
      )}

      {toast && <Toast kind={toast.kind} message={toast.message} onClose={closeToast} />}
    </div>
  )
}
