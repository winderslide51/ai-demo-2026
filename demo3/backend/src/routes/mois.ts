// Parsing of the `mois` query parameter, shared by every route.

import { MOIS_DISPONIBLES, MOIS_PAR_DEFAUT, moisDisponible } from '../data/mois.js';
import { RequeteInvalideError } from '../errors.js';

const MESSAGE_MOIS_INVALIDE = `Mois invalide : attendu YYYY-MM entre ${MOIS_DISPONIBLES[0]} et ${MOIS_DISPONIBLES[MOIS_DISPONIBLES.length - 1]}.`;

export function lireMois(valeur: unknown): string {
  if (valeur === undefined) {
    return MOIS_PAR_DEFAUT;
  }
  if (typeof valeur !== 'string' || !/^\d{4}-\d{2}$/.test(valeur) || !moisDisponible(valeur)) {
    throw new RequeteInvalideError(MESSAGE_MOIS_INVALIDE);
  }
  return valeur;
}

export function lireBooleen(valeur: unknown): boolean | undefined {
  if (valeur === undefined) return undefined;
  if (valeur === 'true') return true;
  if (valeur === 'false') return false;
  throw new RequeteInvalideError('Paramètre invalide : attendu true ou false.');
}
