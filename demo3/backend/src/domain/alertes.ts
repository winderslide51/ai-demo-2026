// Business rule §4.4 — alerts derived from a site's readings for one month.
// Pure: the only "state" is the set of acknowledged alert ids passed in.

import type { Alerte, AlerteType, Releve, Severite, Site } from '../types.js';
import { decomposer, jourDeLaSemaine } from './plages.js';
import { calculerDepassement, resumerConsommation } from './tarification.js';

export const ORDRE_SEVERITE: Record<Severite, number> = { CRITIQUE: 0, AVERTISSEMENT: 1, INFO: 2 };

/** Ratio of the peak power over the subscribed power above which an overage is CRITIQUE. */
export const SEUIL_CRITIQUE = 1.1;
/** Weekend night mean above this share of the HP mean is an anomaly. */
export const SEUIL_ANOMALIE_NUIT = 0.6;
/** Night window for the anomaly rule: hours 00:00 to 05:00 inclusive. */
export const DERNIERE_HEURE_NUIT = 5;

const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** Stable identifier — one alert of each type per site and month (ADR-0003). */
export function identifiantAlerte(siteId: string, mois: string, type: AlerteType): string {
  return `${siteId}-${mois}-${type}`;
}

function dernierJourDuMois(mois: string): string {
  const [annee, moisNum] = mois.split('-').map(Number) as [number, number];
  const jours = new Date(Date.UTC(annee, moisNum, 0)).getUTCDate();
  return `${mois}-${String(jours).padStart(2, '0')}T23:00:00`;
}

function estNuitDeWeekEnd(horodatage: string): boolean {
  const { annee, mois, jour, heure } = decomposer(horodatage);
  const jourSemaine = jourDeLaSemaine(annee, mois, jour);
  return (jourSemaine === 'samedi' || jourSemaine === 'dimanche') && heure <= DERNIERE_HEURE_NUIT;
}

function moyenne(valeurs: number[]): number {
  return valeurs.length === 0 ? 0 : valeurs.reduce((s, v) => s + v, 0) / valeurs.length;
}

function detecterDepassement(site: Site, mois: string, releves: Releve[]): Alerte | null {
  const depassement = calculerDepassement(releves, site.puissanceSouscriteKva);
  if (depassement.heures === 0) {
    return null;
  }
  const premier = releves.find((r) => r.kwh > site.puissanceSouscriteKva);
  const severite: Severite =
    depassement.puissanceMaxKw > site.puissanceSouscriteKva * SEUIL_CRITIQUE ? 'CRITIQUE' : 'AVERTISSEMENT';
  return alerte(site, mois, 'DEPASSEMENT_PUISSANCE', severite, premier?.horodatage ?? dernierJourDuMois(mois),
    `Puissance souscrite dépassée : ${nombre.format(depassement.puissanceMaxKw)} kW pour ${nombre.format(site.puissanceSouscriteKva)} kVA (${nombre.format(depassement.heures)} h de dépassement).`);
}

function detecterSeuil(site: Site, mois: string, releves: Releve[]): Alerte | null {
  const { kwh } = resumerConsommation(releves);
  if (kwh <= site.seuilAlerteKwh) {
    return null;
  }
  return alerte(site, mois, 'SEUIL_CONSOMMATION', 'AVERTISSEMENT', dernierJourDuMois(mois),
    `Consommation mensuelle de ${nombre.format(kwh)} kWh au-dessus du seuil de ${nombre.format(site.seuilAlerteKwh)} kWh.`);
}

function detecterAnomalieNuit(site: Site, mois: string, releves: Releve[]): Alerte | null {
  const moyenneHp = moyenne(releves.filter((r) => r.plage === 'HP').map((r) => r.kwh));
  const moyenneNuit = moyenne(releves.filter((r) => estNuitDeWeekEnd(r.horodatage)).map((r) => r.kwh));
  if (moyenneHp === 0 || moyenneNuit <= moyenneHp * SEUIL_ANOMALIE_NUIT) {
    return null;
  }
  return alerte(site, mois, 'ANOMALIE_NUIT', 'INFO', dernierJourDuMois(mois),
    `Consommation nocturne de week-end anormalement élevée (${nombre.format(moyenneNuit)} kW en moyenne).`);
}

function alerte(site: Site, mois: string, type: AlerteType, severite: Severite, detecteeLe: string, message: string): Alerte {
  return {
    id: identifiantAlerte(site.id, mois, type),
    siteId: site.id,
    siteNom: site.nom,
    mois,
    type,
    severite,
    message,
    detecteeLe,
    acquittee: false,
  };
}

/** All alerts of a site for a month, most severe first, flagged with their acknowledgement. */
export function detecterAlertes(site: Site, mois: string, releves: Releve[], acquittees: Set<string>): Alerte[] {
  const candidates = [
    detecterDepassement(site, mois, releves),
    detecterSeuil(site, mois, releves),
    detecterAnomalieNuit(site, mois, releves),
  ];
  return candidates
    .filter((a): a is Alerte => a !== null)
    .map((a) => ({ ...a, acquittee: acquittees.has(a.id) }))
    .sort((a, b) => ORDRE_SEVERITE[a.severite] - ORDRE_SEVERITE[b.severite]);
}
