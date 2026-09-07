// Alerts across sites, plus the only mutable state of the application: acknowledgements.

import { detecterAlertes, ORDRE_SEVERITE } from '../domain/alertes.js';
import { genererReleves } from '../data/generateur.js';
import { moisDisponible } from '../data/mois.js';
import { SITES, trouverSite } from '../data/sites.js';
import { ConflitError, IntrouvableError } from '../errors.js';
import type { Alerte, AlerteType, Site } from '../types.js';

const acquittees = new Set<string>();

const FORMAT_ID = /^(.+)-(\d{4}-\d{2})-(DEPASSEMENT_PUISSANCE|SEUIL_CONSOMMATION|ANOMALIE_NUIT)$/;

export function alertesDuSite(site: Site, mois: string): Alerte[] {
  return detecterAlertes(site, mois, genererReleves(site.id, mois), acquittees);
}

export type FiltreAlertes = { mois: string; siteId?: string; acquittee?: boolean };

/** Alerts of the month, most severe first, then by site name. */
export function listerAlertes({ mois, siteId, acquittee }: FiltreAlertes): Alerte[] {
  let sites = SITES;
  if (siteId !== undefined) {
    const site = trouverSite(siteId);
    if (!site) {
      throw new IntrouvableError(`Site inconnu : ${siteId}.`);
    }
    sites = [site];
  }
  return sites
    .flatMap((site) => alertesDuSite(site, mois))
    .filter((alerte) => acquittee === undefined || alerte.acquittee === acquittee)
    .sort(
      (a, b) => ORDRE_SEVERITE[a.severite] - ORDRE_SEVERITE[b.severite] || a.siteNom.localeCompare(b.siteNom, 'fr'),
    );
}

/** Acknowledge one alert. 404 if it does not exist for that site/month, 409 if already done. */
export function acquitter(id: string): Alerte {
  const match = FORMAT_ID.exec(id);
  const site = match ? trouverSite(match[1]!) : undefined;
  const mois = match?.[2] ?? '';
  if (!match || !site || !moisDisponible(mois)) {
    throw new IntrouvableError('Alerte introuvable.');
  }
  const type = match[3] as AlerteType;
  const alerte = alertesDuSite(site, mois).find((a) => a.type === type);
  if (!alerte) {
    throw new IntrouvableError('Alerte introuvable.');
  }
  if (alerte.acquittee) {
    throw new ConflitError('Cette alerte est déjà acquittée.');
  }
  acquittees.add(id);
  return { ...alerte, acquittee: true };
}

/** Test helper — forget every acknowledgement. */
export function reinitialiserAcquittements(): void {
  acquittees.clear();
}
