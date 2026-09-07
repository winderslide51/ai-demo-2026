// Fleet-level figures for the dashboard.

import { arrondir2 } from '../domain/tarification.js';
import { fenetreHistorique, moisPrecedent } from '../data/mois.js';
import { SITES } from '../data/sites.js';
import type { Synthese } from '../types.js';
import { factureDuSite } from './factures.service.js';
import { evolution, listerSites } from './sites.service.js';

type Totaux = { consommationKwh: number; montantHt: number };

function totauxDuMois(mois: string): Totaux {
  return listerSites(mois).reduce<Totaux>(
    (acc, site) => ({
      consommationKwh: acc.consommationKwh + site.consommationKwh,
      montantHt: acc.montantHt + site.montantHt,
    }),
    { consommationKwh: 0, montantHt: 0 },
  );
}

export function calculerSynthese(mois: string): Synthese {
  const sites = listerSites(mois);
  const factures = SITES.map((site) => factureDuSite(site, mois));
  const somme = (valeurs: number[]) => valeurs.reduce((s, v) => s + v, 0);

  const consommationKwh = somme(sites.map((s) => s.consommationKwh));
  const precedent = moisPrecedent(mois);

  return {
    mois,
    nbSites: sites.length,
    consommationKwh: arrondir2(consommationKwh),
    consommationHpKwh: arrondir2(somme(sites.map((s) => s.consommationHpKwh))),
    consommationHcKwh: arrondir2(somme(sites.map((s) => s.consommationHcKwh))),
    montantHt: arrondir2(somme(factures.map((f) => f.totalHt))),
    montantTtc: arrondir2(somme(factures.map((f) => f.totalTtc))),
    penalitesHt: arrondir2(
      somme(factures.map((f) => f.lignes.find((l) => l.code === 'PENALITE_DEPASSEMENT')?.montant ?? 0)),
    ),
    nbAlertesActives: somme(sites.map((s) => s.nbAlertesActives)),
    nbSitesEnDepassement: sites.filter((s) => s.heuresDepassement > 0).length,
    evolutionPct: evolution(consommationKwh, precedent ? totauxDuMois(precedent).consommationKwh : null),
    historique: fenetreHistorique(mois).map((m) => {
      const totaux = totauxDuMois(m);
      return { mois: m, consommationKwh: arrondir2(totaux.consommationKwh), montantHt: arrondir2(totaux.montantHt) };
    }),
    topSites: [...sites]
      .sort((a, b) => b.consommationKwh - a.consommationKwh)
      .slice(0, 5)
      .map((s) => ({ siteId: s.id, nom: s.nom, consommationKwh: s.consommationKwh, montantHt: s.montantHt })),
  };
}
