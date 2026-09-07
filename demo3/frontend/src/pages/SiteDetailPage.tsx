import { Link, useLocation, useParams } from 'react-router'
import { AlerteCard } from '../components/AlerteCard'
import { FactureTable } from '../components/FactureTable'
import { JournalierChart } from '../components/charts/JournalierChart'
import { ProfilHoraireChart } from '../components/charts/ProfilHoraireChart'
import { PuissanceChart } from '../components/charts/PuissanceChart'
import { Badge, Card, EmptyState, ErrorBanner, KpiTile, Spinner, Toast } from '../components/ui'
import { formatEuros, formatKva, formatKw, formatKwh, formatMwh, formatNombre } from '../format'
import { useAcquitter } from '../hooks/useAcquitter'
import { useMoisParam } from '../hooks/useMoisParam'
import { useSite } from '../hooks/useResources'
import { labels, siteTypeLabels } from '../labels'
import styles from './pages.module.css'

export function SiteDetailPage() {
  const { id = '' } = useParams()
  const [mois] = useMoisParam()
  const { search } = useLocation()
  const site = useSite(id, mois)
  const { acquitter, acquittingId, toast, closeToast } = useAcquitter(site.reload)

  if (site.status === 'loading') return <Spinner />
  if (site.status === 'error' || !site.data) return <ErrorBanner message={site.error} onRetry={site.reload} />

  const s = site.data
  const penalite = s.facture.lignes.find((l) => l.code === 'PENALITE_DEPASSEMENT')?.montant ?? 0

  return (
    <div className="stack">
      <header className={`${styles.siteHeader} reveal`}>
        <div>
          <Link to={{ pathname: '/sites', search }} className={styles.backLink}>
            ← {labels.retourSites}
          </Link>
          <div className={styles.siteTitle}>
            <h2 style={{ fontSize: 24 }}>{s.nom}</h2>
            <Badge>{siteTypeLabels[s.type]}</Badge>
            <span className="mono faint">{s.id}</span>
          </div>
          <div className={styles.siteMeta}>
            <span>
              {labels.adresse} : <strong>{s.adresse}</strong>, {s.ville}
            </span>
            <span>
              {labels.responsable} : <strong>{s.responsable}</strong>
            </span>
          </div>
        </div>
        <div className={styles.siteFacts}>
          <div className={styles.fact}>
            <span className="eyebrow">{labels.puissanceSouscrite}</span>
            <span className={styles.factValue}>{formatKva(s.puissanceSouscriteKva)}</span>
          </div>
          <div className={styles.fact}>
            <span className="eyebrow">{labels.puissanceMax}</span>
            <span className={`${styles.factValue} ${s.puissanceMaxKw > s.puissanceSouscriteKva ? 'overage' : ''}`}>{formatKw(s.puissanceMaxKw)}</span>
          </div>
          <div className={styles.fact}>
            <span className="eyebrow">{labels.seuilAlerte}</span>
            <span className={styles.factValue}>{formatKwh(s.seuilAlerteKwh)}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-4">
        <KpiTile index={0} label={labels.kpiConsommationSite} value={formatMwh(s.consommationKwh).replace(' MWh', '')} unit="MWh" delta={s.evolutionPct} />
        <KpiTile index={1} label={labels.kpiMontantHt} value={formatEuros(s.montantHt)} footer={`${formatEuros(s.facture.totalTtc)} TTC`} />
        <KpiTile
          index={2}
          label={labels.kpiDepassement}
          value={formatNombre(s.depassementKwh)}
          unit="kWh"
          tone={s.depassementKwh > 0 ? 'overage' : 'neutral'}
          footer={`${formatNombre(s.heuresDepassement)} ${labels.heuresDepassement} · ${formatEuros(penalite)}`}
        />
        <KpiTile index={3} label={labels.kpiAlertes} value={formatNombre(s.nbAlertesActives)} tone={s.nbAlertesActives > 0 ? 'warning' : 'neutral'} />
      </div>

      <div className="grid grid-2">
        <Card index={4} title={labels.journalierTitre} subtitle={labels.journalierSousTitre}>
          <JournalierChart journalier={s.journalier} />
        </Card>
        <Card index={5} title={labels.puissanceTitre} subtitle={labels.puissanceSousTitre}>
          <PuissanceChart journalier={s.journalier} puissanceSouscriteKva={s.puissanceSouscriteKva} />
        </Card>
      </div>

      <div className="grid grid-main">
        <Card index={6} title={labels.factureTitre} subtitle={labels.factureSousTitre}>
          <FactureTable facture={s.facture} />
        </Card>
        <div className="stack">
          <Card index={7} title={labels.profilHoraireTitre} subtitle={labels.profilHoraireSousTitre}>
            <ProfilHoraireChart profil={s.profilHoraire} />
          </Card>
          <Card index={8} title={labels.alertesDuSite}>
            {s.alertes.length === 0 ? (
              <EmptyState message={labels.aucuneAlerteSite} />
            ) : (
              <div className={styles.alertList}>
                {s.alertes.map((a, i) => (
                  <AlerteCard key={a.id} alerte={a} showSite={false} index={i} onAcquitter={acquitter} acquitting={acquittingId === a.id} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {toast && <Toast kind={toast.kind} message={toast.message} onClose={closeToast} />}
    </div>
  )
}
