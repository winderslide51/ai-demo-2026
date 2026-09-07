// The single demo customer, its contract and the tariff grid (docs/SPEC-TECHNIQUE.md §4.2).

import type { Client, GrilleTarifaire } from '../types.js';

export const GRILLE: GrilleTarifaire = {
  hpPrixKwh: 0.1842,
  hcPrixKwh: 0.1231,
  abonnementKvaMois: 2.85,
  penaliteKwhDepassement: 0.95,
  acciseKwh: 0.0205,
  tvaTaux: 0.2,
  heuresPleines: { debut: 6, fin: 22 },
  joursHeuresCreuses: ['samedi', 'dimanche'],
};

export const CLIENT: Client = {
  id: 'valmont',
  nom: 'Valmont Industries',
  contrat: {
    reference: 'VLM-2026-0142',
    dateDebut: '2026-01-01',
    dateFin: '2028-12-31',
    grille: GRILLE,
  },
};
