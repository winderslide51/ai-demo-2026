import { Link, useLocation } from 'react-router'
import { formatDateHeure } from '../format'
import { alerteTypeLabels, labels, severiteLabels } from '../labels'
import type { Alerte } from '../types/dto'
import { Badge, type BadgeTone } from './ui/Badge'
import { Button } from './ui/Button'
import styles from './AlerteCard.module.css'

const severityTone: Record<Alerte['severite'], BadgeTone> = {
  CRITIQUE: 'critique',
  AVERTISSEMENT: 'avertissement',
  INFO: 'info',
}

type Props = {
  alerte: Alerte
  onAcquitter?: (alerte: Alerte) => void
  acquitting?: boolean
  showSite?: boolean
  index?: number
}

export function AlerteCard({ alerte, onAcquitter, acquitting = false, showSite = true, index = 0 }: Props) {
  const { search } = useLocation()
  return (
    <article className={`${styles.card} ${styles[alerte.severite.toLowerCase()]} ${alerte.acquittee ? styles.done : ''} reveal`} style={{ ['--i' as string]: index }}>
      <div className={styles.head}>
        <Badge tone={severityTone[alerte.severite]}>{severiteLabels[alerte.severite]}</Badge>
        <span className={styles.type}>{alerteTypeLabels[alerte.type]}</span>
        {showSite && (
          <Link to={{ pathname: `/sites/${alerte.siteId}`, search }} className={styles.site}>
            {alerte.siteNom}
          </Link>
        )}
        <span className={styles.date}>
          {labels.detecteeLe} {formatDateHeure(alerte.detecteeLe)}
        </span>
      </div>
      <p className={styles.message}>{alerte.message}</p>
      <div className={styles.actions}>
        {alerte.acquittee ? (
          <Badge tone="success">{labels.acquittee}</Badge>
        ) : (
          onAcquitter && (
            <Button variant="secondary" size="sm" loading={acquitting} onClick={() => onAcquitter(alerte)}>
              {labels.acquitter}
            </Button>
          )
        )}
      </div>
    </article>
  )
}
