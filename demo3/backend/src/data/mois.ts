// Months for which readings exist. The default is the last closed month.

export const MOIS_DISPONIBLES = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'] as const;

export const MOIS_PAR_DEFAUT = '2026-08';

export function moisDisponible(mois: string): boolean {
  return (MOIS_DISPONIBLES as readonly string[]).includes(mois);
}

/** Number of days in a `YYYY-MM` month. */
export function joursDuMois(mois: string): number {
  const [annee, moisNum] = mois.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(annee, moisNum, 0)).getUTCDate();
}

/** The month before `mois`, if readings exist for it. */
export function moisPrecedent(mois: string): string | null {
  const index = (MOIS_DISPONIBLES as readonly string[]).indexOf(mois);
  return index > 0 ? (MOIS_DISPONIBLES[index - 1] ?? null) : null;
}

/** Up to the six available months ending at `mois`, oldest first. */
export function fenetreHistorique(mois: string): string[] {
  const index = (MOIS_DISPONIBLES as readonly string[]).indexOf(mois);
  return MOIS_DISPONIBLES.slice(Math.max(0, index - 5), index + 1);
}
