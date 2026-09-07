// Business rule §4.3 — the monthly invoice of a site, derived from its hourly readings
// and the contract's tariff grid. Pure functions: nothing here touches Express or a clock.

import type { Depassement, Facture, GrilleTarifaire, LigneFacture, Releve, Site } from '../types.js';

/** Round to 2 decimals — applied at the boundary only, never mid-computation. */
export function arrondir2(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

export type ResumeConsommation = {
  kwh: number;
  hpKwh: number;
  hcKwh: number;
  puissanceMaxKw: number;
};

/** Totals of a series of readings: overall, per tariff band, and the peak hourly power. */
export function resumerConsommation(releves: Releve[]): ResumeConsommation {
  let hpKwh = 0;
  let hcKwh = 0;
  let puissanceMaxKw = 0;
  for (const releve of releves) {
    if (releve.plage === 'HP') {
      hpKwh += releve.kwh;
    } else {
      hcKwh += releve.kwh;
    }
    puissanceMaxKw = Math.max(puissanceMaxKw, releve.kwh);
  }
  return { kwh: hpKwh + hcKwh, hpKwh, hcKwh, puissanceMaxKw };
}

/**
 * Overage against the subscribed power: every kWh drawn above `puissanceSouscriteKva`
 * within one hour is an excess kWh (1 kVA ≈ 1 kW, simplification assumed by the spec).
 */
export function calculerDepassement(releves: Releve[], puissanceSouscriteKva: number): Depassement {
  let heures = 0;
  let kwh = 0;
  let puissanceMaxKw = 0;
  for (const releve of releves) {
    puissanceMaxKw = Math.max(puissanceMaxKw, releve.kwh);
    const exces = releve.kwh - puissanceSouscriteKva;
    if (exces > 0) {
      heures += 1;
      kwh += exces;
    }
  }
  return { heures, kwh, puissanceMaxKw };
}

function ligne(
  code: string,
  libelle: string,
  quantite: number,
  unite: 'kVA' | 'kWh',
  prixUnitaire: number,
): LigneFacture {
  return { code, libelle, quantite, unite, prixUnitaire, montant: quantite * prixUnitaire };
}

/** The invoice of one site for one month. Lines keep the order and codes of the spec. */
export function calculerFacture(
  site: Pick<Site, 'id' | 'puissanceSouscriteKva'>,
  mois: string,
  releves: Releve[],
  grille: GrilleTarifaire,
): Facture {
  const conso = resumerConsommation(releves);
  const depassement = calculerDepassement(releves, site.puissanceSouscriteKva);

  const lignes = [
    ligne('ABONNEMENT', 'Abonnement — puissance souscrite', site.puissanceSouscriteKva, 'kVA', grille.abonnementKvaMois),
    ligne('ENERGIE_HP', 'Énergie heures pleines', conso.hpKwh, 'kWh', grille.hpPrixKwh),
    ligne('ENERGIE_HC', 'Énergie heures creuses', conso.hcKwh, 'kWh', grille.hcPrixKwh),
    ligne('PENALITE_DEPASSEMENT', 'Pénalité de dépassement de puissance', depassement.kwh, 'kWh', grille.penaliteKwhDepassement),
    ligne('ACCISE', "Accise sur l'électricité", conso.kwh, 'kWh', grille.acciseKwh),
  ];

  const totalHt = lignes.reduce((somme, l) => somme + l.montant, 0);
  const tva = totalHt * grille.tvaTaux;

  return {
    siteId: site.id,
    mois,
    lignes: lignes.map((l) => ({ ...l, quantite: arrondir2(l.quantite), montant: arrondir2(l.montant) })),
    totalHt: arrondir2(totalHt),
    tva: arrondir2(tva),
    totalTtc: arrondir2(totalHt + tva),
    depassement: {
      heures: depassement.heures,
      kwh: arrondir2(depassement.kwh),
      puissanceMaxKw: arrondir2(depassement.puissanceMaxKw),
    },
  };
}
