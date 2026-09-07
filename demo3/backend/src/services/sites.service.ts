// Site summaries and details: orchestration only, the rules live in domain/.

import { arrondir2, calculerDepassement, resumerConsommation } from '../domain/tarification.js';
import { decomposer } from '../domain/plages.js';
import { genererReleves } from '../data/generateur.js';
import { fenetreHistorique, moisPrecedent } from '../data/mois.js';
import { SITES, trouverSite } from '../data/sites.js';
import { IntrouvableError } from '../errors.js';
import type { Journalier, ProfilHoraire, Releve, Site, SiteDetail, SiteResume } from '../types.js';
import { alertesDuSite } from './alertes.service.js';
import { factureDuSite } from './factures.service.js';

export function evolution(actuel: number, precedent: number | null): number | null {
  if (precedent === null || precedent === 0) return null;
  return arrondir2(((actuel - precedent) / precedent) * 100);
}

function consommationDuMois(siteId: string, mois: string): number {
  return resumerConsommation(genererReleves(siteId, mois)).kwh;
}

export function resumerSite(site: Site, mois: string): SiteResume {
  const releves = genererReleves(site.id, mois);
  const conso = resumerConsommation(releves);
  const depassement = calculerDepassement(releves, site.puissanceSouscriteKva);
  const facture = factureDuSite(site, mois);
  const precedent = moisPrecedent(mois);

  return {
    id: site.id,
    nom: site.nom,
    ville: site.ville,
    region: site.region,
    type: site.type,
    puissanceSouscriteKva: site.puissanceSouscriteKva,
    seuilAlerteKwh: site.seuilAlerteKwh,
    consommationKwh: arrondir2(conso.kwh),
    consommationHpKwh: arrondir2(conso.hpKwh),
    consommationHcKwh: arrondir2(conso.hcKwh),
    puissanceMaxKw: arrondir2(conso.puissanceMaxKw),
    depassementKwh: arrondir2(depassement.kwh),
    heuresDepassement: depassement.heures,
    montantHt: facture.totalHt,
    nbAlertesActives: alertesDuSite(site, mois).filter((a) => !a.acquittee).length,
    evolutionPct: evolution(conso.kwh, precedent ? consommationDuMois(site.id, precedent) : null),
    tendance: fenetreHistorique(mois).map((m) => arrondir2(consommationDuMois(site.id, m))),
  };
}

export function listerSites(mois: string): SiteResume[] {
  return SITES.map((site) => resumerSite(site, mois)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

function profilJournalier(releves: Releve[], puissanceSouscriteKva: number): Journalier[] {
  const parJour = new Map<string, Journalier>();
  for (const releve of releves) {
    const date = releve.horodatage.slice(0, 10);
    const jour = parJour.get(date) ?? { date, hpKwh: 0, hcKwh: 0, puissanceMaxKw: 0, depassementKwh: 0 };
    if (releve.plage === 'HP') jour.hpKwh += releve.kwh;
    else jour.hcKwh += releve.kwh;
    jour.puissanceMaxKw = Math.max(jour.puissanceMaxKw, releve.kwh);
    jour.depassementKwh += Math.max(0, releve.kwh - puissanceSouscriteKva);
    parJour.set(date, jour);
  }
  return [...parJour.values()].map((j) => ({
    ...j,
    hpKwh: arrondir2(j.hpKwh),
    hcKwh: arrondir2(j.hcKwh),
    puissanceMaxKw: arrondir2(j.puissanceMaxKw),
    depassementKwh: arrondir2(j.depassementKwh),
  }));
}

function profilHoraire(releves: Releve[]): ProfilHoraire[] {
  const sommes = new Array<number>(24).fill(0);
  const comptes = new Array<number>(24).fill(0);
  for (const releve of releves) {
    const { heure } = decomposer(releve.horodatage);
    sommes[heure] = (sommes[heure] ?? 0) + releve.kwh;
    comptes[heure] = (comptes[heure] ?? 0) + 1;
  }
  return sommes.map((somme, heure) => ({
    heure,
    moyenneKw: arrondir2(comptes[heure] ? somme / comptes[heure]! : 0),
  }));
}

export function detaillerSite(siteId: string, mois: string): SiteDetail {
  const site = trouverSite(siteId);
  if (!site) {
    throw new IntrouvableError(`Site inconnu : ${siteId}.`);
  }
  const releves = genererReleves(site.id, mois);
  return {
    ...resumerSite(site, mois),
    adresse: site.adresse,
    responsable: site.responsable,
    facture: factureDuSite(site, mois),
    journalier: profilJournalier(releves, site.puissanceSouscriteKva),
    profilHoraire: profilHoraire(releves),
    alertes: alertesDuSite(site, mois),
  };
}

export function relevesDuSite(siteId: string, mois: string): { siteId: string; mois: string; releves: Releve[] } {
  if (!trouverSite(siteId)) {
    throw new IntrouvableError(`Site inconnu : ${siteId}.`);
  }
  return { siteId, mois, releves: genererReleves(siteId, mois) };
}
