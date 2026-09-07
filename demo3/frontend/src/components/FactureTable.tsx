import { formatEuros, formatNombre, formatPrixUnitaire } from '../format'
import { labels } from '../labels'
import type { Facture } from '../types/dto'
import styles from './FactureTable.module.css'

type Props = { facture: Facture }

export function FactureTable({ facture }: Props) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{labels.factureTitre}</caption>
      <thead>
        <tr>
          <th scope="col">{labels.colLibelle}</th>
          <th scope="col" className={styles.num}>
            {labels.colQuantite}
          </th>
          <th scope="col" className={styles.num}>
            {labels.colPrixUnitaire}
          </th>
          <th scope="col" className={styles.num}>
            {labels.colMontant}
          </th>
        </tr>
      </thead>
      <tbody>
        {facture.lignes.map((ligne) => {
          const penalty = ligne.code === 'PENALITE_DEPASSEMENT' && ligne.montant > 0
          return (
            <tr key={ligne.code} className={penalty ? styles.penalty : undefined}>
              <td>
                {ligne.libelle}
                {penalty && <span className={styles.penaltyTag}>{labels.kpiDepassement}</span>}
              </td>
              <td className={styles.num}>
                {formatNombre(ligne.quantite)} <span className="faint">{ligne.unite}</span>
              </td>
              <td className={styles.num}>{formatPrixUnitaire(ligne.prixUnitaire)}</td>
              <td className={styles.num}>{formatEuros(ligne.montant)}</td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={3}>
            {labels.totalHt}
          </th>
          <td className={styles.num}>{formatEuros(facture.totalHt)}</td>
        </tr>
        <tr>
          <th scope="row" colSpan={3}>
            {labels.tva}
          </th>
          <td className={styles.num}>{formatEuros(facture.tva)}</td>
        </tr>
        <tr className={styles.total}>
          <th scope="row" colSpan={3}>
            {labels.totalTtc}
          </th>
          <td className={styles.num}>{formatEuros(facture.totalTtc)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
