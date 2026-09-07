import { useLocation, useNavigate } from 'react-router'
import { HpHcBar } from '../components/HpHcBar'
import { Card, DataTable, ErrorBanner, PowerGauge, Sparkline, Spinner, type Column } from '../components/ui'
import { formatEuros, formatKwh, formatPct } from '../format'
import { useMoisParam } from '../hooks/useMoisParam'
import { useSites } from '../hooks/useResources'
import { labels, siteTypeLabels } from '../labels'
import type { SiteResume } from '../types/dto'

export function SitesPage() {
  const [mois] = useMoisParam()
  const sites = useSites(mois)
  const navigate = useNavigate()
  const { search } = useLocation()

  if (sites.status === 'loading') return <Spinner />
  if (sites.status === 'error' || !sites.data) return <ErrorBanner message={sites.error} onRetry={sites.reload} />

  const columns: Column<SiteResume>[] = [
    {
      key: 'site',
      header: labels.colSite,
      width: '290px',
      render: (s) => (
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ whiteSpace: 'nowrap' }}>{s.nom}</strong>
          <span className="muted" style={{ fontSize: 12 }}>
            {siteTypeLabels[s.type]} · {s.ville} · <span className="mono">{s.id}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'conso',
      header: labels.colConsommation,
      align: 'right',
      render: (s) => (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span>{formatKwh(s.consommationKwh)}</span>
          <span className={s.evolutionPct !== null && s.evolutionPct > 0 ? 'overage' : 'faint'} style={{ fontSize: 11 }}>
            {s.evolutionPct === null ? '—' : formatPct(s.evolutionPct)}
          </span>
        </span>
      ),
    },
    { key: 'hphc', header: labels.colRepartition, render: (s) => <HpHcBar hpKwh={s.consommationHpKwh} hcKwh={s.consommationHcKwh} compact /> },
    {
      key: 'puissance',
      header: labels.colPuissance,
      render: (s) => <PowerGauge value={s.puissanceMaxKw} max={s.puissanceSouscriteKva} label={`${labels.colPuissance} — ${s.nom}`} />,
    },
    {
      key: 'depassement',
      header: labels.colDepassement,
      align: 'right',
      render: (s) => (s.depassementKwh > 0 ? <span className="overage">{formatKwh(s.depassementKwh)}</span> : <span className="faint">—</span>),
    },
    { key: 'montant', header: labels.colMontantHt, align: 'right', render: (s) => formatEuros(s.montantHt) },
    { key: 'tendance', header: labels.colTendance, render: (s) => <Sparkline values={s.tendance} tone={s.depassementKwh > 0 ? 'overage' : 'ink'} /> },
  ]

  return (
    <Card padded={false}>
      <DataTable
        caption={labels.pageSites}
        columns={columns}
        rows={sites.data}
        rowKey={(s) => s.id}
        emptyMessage={labels.aucunSite}
        onRowClick={(s) => navigate({ pathname: `/sites/${s.id}`, search })}
        rowLabel={(s) => `${labels.ouvrirSite} ${s.nom}`}
      />
    </Card>
  )
}
