// Business rule §4.1 — is a given hour billed as "heures pleines" (HP) or "heures creuses" (HC)?
// Pure function: no clock, no I/O. Timestamps are local wall-clock strings (`2026-08-03T07:00:00`).

import type { GrilleTarifaire, Plage } from '../types.js';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const;

export type Instant = { annee: number; mois: number; jour: number; heure: number };

/** Split a wall-clock ISO string (or a Date, read in local time) into its components. */
export function decomposer(horodatage: string | Date): Instant {
  if (horodatage instanceof Date) {
    return {
      annee: horodatage.getFullYear(),
      mois: horodatage.getMonth() + 1,
      jour: horodatage.getDate(),
      heure: horodatage.getHours(),
    };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})/.exec(horodatage);
  if (!match) {
    throw new Error(`Horodatage invalide : ${horodatage}`);
  }
  return {
    annee: Number(match[1]),
    mois: Number(match[2]),
    jour: Number(match[3]),
    heure: Number(match[4]),
  };
}

/** French weekday name of a calendar date, computed in UTC to avoid timezone drift. */
export function jourDeLaSemaine(annee: number, mois: number, jour: number): string {
  const index = new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay();
  return JOURS[index] ?? 'dimanche';
}

/** HP on weekdays between `heuresPleines.debut` (inclusive) and `.fin` (exclusive); HC otherwise. */
export function plageDe(horodatage: string | Date, grille: GrilleTarifaire): Plage {
  const { annee, mois, jour, heure } = decomposer(horodatage);
  const jourSemaine = jourDeLaSemaine(annee, mois, jour);
  if (grille.joursHeuresCreuses.includes(jourSemaine)) {
    return 'HC';
  }
  const { debut, fin } = grille.heuresPleines;
  return heure >= debut && heure < fin ? 'HP' : 'HC';
}
