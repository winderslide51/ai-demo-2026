import { Badge, Card, ErrorBanner, Spinner } from '../components/ui'
import { formatDate, formatPrixUnitaire, formatTaux } from '../format'
import { useClient } from '../hooks/useResources'
import { labels, plageLabels } from '../labels'
import styles from './pages.module.css'

export function ContratPage() {
  const client = useClient()

  if (client.status === 'loading') return <Spinner />
  if (client.status === 'error' || !client.data) return <ErrorBanner message={client.error} onRetry={client.reload} />

  const { nom, contrat } = client.data
  const g = contrat.grille

  const lignes = [
    { code: 'HP', libelle: labels.ligneHp, valeur: formatPrixUnitaire(g.hpPrixKwh), unite: labels.parKwh, tone: 'hp' as const },
    { code: 'HC', libelle: labels.ligneHc, valeur: formatPrixUnitaire(g.hcPrixKwh), unite: labels.parKwh, tone: 'hc' as const },
    { code: 'ABO', libelle: labels.ligneAbonnement, valeur: formatPrixUnitaire(g.abonnementKvaMois), unite: labels.parKvaMois, tone: 'neutral' as const },
    { code: 'PEN', libelle: labels.lignePenalite, valeur: formatPrixUnitaire(g.penaliteKwhDepassement), unite: labels.parKwhDepassement, tone: 'overage' as const },
    { code: 'ACC', libelle: labels.ligneAccise, valeur: formatPrixUnitaire(g.acciseKwh), unite: labels.parKwh, tone: 'neutral' as const },
    { code: 'TVA', libelle: labels.ligneTva, valeur: formatTaux(g.tvaTaux), unite: '', tone: 'neutral' as const },
  ]

  return (
    <div className="stack">
      <Card index={0} title={labels.contratTitre}>
        <div className={styles.contractFacts}>
          <div className={styles.contractFact}>
            <span className="eyebrow">Client</span>
            <span className={styles.contractFactValue}>{nom}</span>
          </div>
          <div className={styles.contractFact}>
            <span className="eyebrow">{labels.reference}</span>
            <span className={`${styles.contractFactValue} mono`}>{contrat.reference}</span>
          </div>
          <div className={styles.contractFact}>
            <span className="eyebrow">{labels.periode}</span>
            <span className={styles.contractFactValue}>{labels.duAu(formatDate(contrat.dateDebut), formatDate(contrat.dateFin))}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-main">
        <Card index={1} title={labels.grilleTitre} subtitle={labels.grilleSousTitre}>
          <table className={styles.grille}>
            <thead>
              <tr>
                <th scope="col">{labels.colLibelle}</th>
                <th scope="col" className={styles.grilleNum}>
                  {labels.colPrixUnitaire}
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.code}>
                  <td>
                    <Badge tone={l.tone}>{l.libelle}</Badge>
                  </td>
                  <td className={styles.grilleNum}>
                    {l.valeur} {l.unite && <span className={styles.grilleUnit}>{l.unite}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card index={2} title={labels.plagesTitre}>
          <div className={styles.plages}>
            <div className={`${styles.plage} ${styles.plageHp}`}>
              <h3>{plageLabels.HP}</h3>
              <p>{labels.definitionHp(g.heuresPleines.debut, g.heuresPleines.fin)}</p>
            </div>
            <div className={`${styles.plage} ${styles.plageHc}`}>
              <h3>{plageLabels.HC}</h3>
              <p>{labels.definitionHc}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
