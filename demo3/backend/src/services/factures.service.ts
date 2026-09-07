// The invoice of a site, derived at read time (ADR-0003).

import { calculerFacture } from '../domain/tarification.js';
import { genererReleves } from '../data/generateur.js';
import { GRILLE } from '../data/grille.js';
import { trouverSite } from '../data/sites.js';
import { IntrouvableError } from '../errors.js';
import type { Facture, Site } from '../types.js';

export function factureDuSite(site: Site, mois: string): Facture {
  return calculerFacture(site, mois, genererReleves(site.id, mois), GRILLE);
}

export function factureParId(siteId: string, mois: string): Facture {
  const site = trouverSite(siteId);
  if (!site) {
    throw new IntrouvableError(`Site inconnu : ${siteId}.`);
  }
  return factureDuSite(site, mois);
}
