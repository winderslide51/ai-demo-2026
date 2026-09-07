import { Link, useLocation } from 'react-router'
import { HistoriqueChart } from '../components/charts/HistoriqueChart'
import { Badge, Card, EmptyState, ErrorBanner, KpiTile, Spinner } from '../components/ui'
import { formatEuros, formatKwh, formatMwh, formatNombre } from '../format'
import { useMoisParam } from '../hooks/useMoisParam'
import { useAlertes, useSynthese } from '../hooks/useResources'
import { alerteTypeLabels, labels } from '../labels'
import type { Synthese } from '../types/dto'
import styles from './pages.module.css'

export function DashboardPage() {
  const [mois] = useMoisParam()
  const synthese = useSynthese(mois)
  const critiques = useAlertes({ mois, acquittee: false })

  if (synthese.status === 'loading') return <Spinner />
  if (synthese.status === 'error' || !synthese.data) return <ErrorBanner message={synthese.error} onRetry={synthese.reload} />

  const s = synthese.data
  const alertesCritiques = (critiques.data ?? []).filter((a) => a.severite === 'CRITIQUE')

  return (
    <div className="stack">
      <div className="grid grid-4">
        <KpiTile
          index={0}
          label={labels.kpiConsommation}
          value={formatMwh(s.consommationKwh).replace(' MWh', '')}
          unit="MWh"
          delta={s.evolutionPct}
          footer={<HpHcSplit synthese={s} />}
        />
        <KpiTile index={1} label={labels.kpiMontantHt} value={formatEuros(s.montantHt)} footer={`${formatEuros(s.montantTtc)} TTC`} />
        <KpiTile
          index={2}
          label={labels.kpiPenalites}
          value={formatEuros(s.penalitesHt)}
          tone={s.penalitesHt > 0 ? 'overage' : 'neutral'}
          footer={`${s.nbSitesEnDepassement} ${labels.kpiSitesEnDepassement}`}
        />
        <KpiTile
          index={3}
          label={labels.kpiAlertes}
          value={formatNombre(s.nbAlertesActives)}
          tone={s.nbAlertesActives > 0 ? 'warning' : 'neutral'}
          footer={`${s.nbSites} sites suivis`}
        />
      </div>

      <div className="grid grid-main">
        <Card index={4} title={labels.historiqueTitre} subtitle={labels.historiqueSousTitre}>
          <HistoriqueChart historique={s.historique} />
        </Card>
        <Card index={5} title={labels.topSitesTitre} subtitle={labels.topSitesSousTitre}>
          <TopSites topSites={s.topSites} />
        </Card>
      </div>

      <Card index={6} title={labels.alertesCritiquesTitre} subtitle={labels.alertesCritiquesSousTitre}>
        <AlertesCritiques alertes={alertesCritiques} loading={critiques.status === 'loading'} error={critiques.error} />
      </Card>
    </div>
  )
}

function HpHcSplit({ synthese }: { synthese: Synthese }) {
  return (
    <span className="row" style={{ gap: 'var(--s-2)', flexWrap: 'wrap' }}>
      <Badge tone="hp">
        HP {formatKwh(synthese.consommationHpKwh)}
      </Badge>
      <Badge tone="hc">
        HC {formatKwh(synthese.consommationHcKwh)}
      </Badge>
    </span>
  )
}

function TopSites({ topSites }: { topSites: Synthese['topSites'] }) {
  const { search } = useLocation()
  if (topSites.length === 0) return <EmptyState message={labels.aucunSite} />
  const max = Math.max(...topSites.map((t) => t.consommationKwh))
  return (
    <ol className={styles.rankList}>
      {topSites.map((site, i) => (
        <li key={site.siteId} className={styles.rankItem}>
          <span className={styles.rankIndex}>{String(i + 1).padStart(2, '0')}</span>
          <span className={styles.rankName}>
            <Link to={{ pathname: `/sites/${site.siteId}`, search }}>{site.nom}</Link>
            <span className={styles.rankBar} style={{ width: `${(site.consommationKwh / max) * 100}%` }} />
          </span>
          <span className={styles.rankValue}>
            <strong>{formatKwh(site.consommationKwh)}</strong>
            {formatEuros(site.montantHt)}
          </span>
        </li>
      ))}
    </ol>
  )
}

type AlertesCritiquesProps = {
  alertes: { id: string; siteId: string; siteNom: string; type: keyof typeof alerteTypeLabels; message: string }[]
  loading: boolean
  error: string | null
}

function AlertesCritiques({ alertes, loading, error }: AlertesCritiquesProps) {
  const { search } = useLocation()
  if (loading) return <Spinner />
  if (error) return <ErrorBanner message={error} />
  if (alertes.length === 0) return <EmptyState message={labels.aucuneAlerteCritique} />
  return (
    <>
      <ul className={styles.rankList}>
        {alertes.map((a) => (
          <li key={a.id} className={styles.rankItem} style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
            <Badge tone="critique">{alerteTypeLabels[a.type]}</Badge>
            <span>
              <Link to={{ pathname: `/sites/${a.siteId}`, search }}>{a.siteNom}</Link> — <span className="muted">{a.message}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.linkRow}>
        <Link to={{ pathname: '/alertes', search }}>{labels.voirToutesLesAlertes} →</Link>
      </p>
    </>
  )
}
