import { describe, expect, it } from 'vitest';
import { arrondir2, calculerDepassement, calculerFacture, resumerConsommation } from '../src/domain/tarification.js';
import { GRILLE } from '../src/data/grille.js';
import type { Releve } from '../src/types.js';

const site = { id: 'TST-01', puissanceSouscriteKva: 100 };

// Three readings: two HP (one above the subscribed power), one HC.
const releves: Releve[] = [
  { horodatage: '2026-08-03T08:00:00', kwh: 80, plage: 'HP' },
  { horodatage: '2026-08-03T09:00:00', kwh: 120, plage: 'HP' },
  { horodatage: '2026-08-03T23:00:00', kwh: 40, plage: 'HC' },
];

describe('resumerConsommation', () => {
  it('totalise la consommation par plage et relève la puissance maximale', () => {
    expect(resumerConsommation(releves)).toEqual({ kwh: 240, hpKwh: 200, hcKwh: 40, puissanceMaxKw: 120 });
  });

  it('renvoie des zéros sans relevé', () => {
    expect(resumerConsommation([])).toEqual({ kwh: 0, hpKwh: 0, hcKwh: 0, puissanceMaxKw: 0 });
  });
});

describe('calculerDepassement', () => {
  it('compte uniquement les kWh au-delà de la puissance souscrite, heure par heure', () => {
    expect(calculerDepassement(releves, 100)).toEqual({ heures: 1, kwh: 20, puissanceMaxKw: 120 });
  });

  it('ne compte aucun dépassement quand tout reste sous la puissance souscrite', () => {
    expect(calculerDepassement(releves, 200)).toEqual({ heures: 0, kwh: 0, puissanceMaxKw: 120 });
  });
});

describe('calculerFacture (§4.3)', () => {
  const facture = calculerFacture(site, '2026-08', releves, GRILLE);
  const ligne = (code: string) => facture.lignes.find((l) => l.code === code)!;

  it('produit les cinq lignes dans l’ordre du contrat', () => {
    expect(facture.lignes.map((l) => l.code)).toEqual([
      'ABONNEMENT',
      'ENERGIE_HP',
      'ENERGIE_HC',
      'PENALITE_DEPASSEMENT',
      'ACCISE',
    ]);
  });

  it('facture l’abonnement sur la puissance souscrite en kVA', () => {
    expect(ligne('ABONNEMENT')).toMatchObject({ quantite: 100, unite: 'kVA', prixUnitaire: 2.85, montant: 285 });
  });

  it('facture l’énergie heures pleines au tarif HP', () => {
    expect(ligne('ENERGIE_HP')).toMatchObject({ quantite: 200, unite: 'kWh', montant: arrondir2(200 * 0.1842) });
  });

  it('facture l’énergie heures creuses au tarif HC', () => {
    expect(ligne('ENERGIE_HC')).toMatchObject({ quantite: 40, unite: 'kWh', montant: arrondir2(40 * 0.1231) });
  });

  it('calcule la pénalité uniquement sur les kWh au-delà de la puissance souscrite', () => {
    expect(ligne('PENALITE_DEPASSEMENT')).toMatchObject({ quantite: 20, prixUnitaire: 0.95, montant: 19 });
  });

  it('applique l’accise sur la totalité des kWh', () => {
    expect(ligne('ACCISE')).toMatchObject({ quantite: 240, montant: arrondir2(240 * 0.0205) });
  });

  it('totalise HT, TVA à 20 % et TTC, arrondis à 2 décimales', () => {
    const attenduHt = 285 + 200 * 0.1842 + 40 * 0.1231 + 20 * 0.95 + 240 * 0.0205;
    expect(facture.totalHt).toBe(arrondir2(attenduHt));
    expect(facture.tva).toBe(arrondir2(attenduHt * 0.2));
    expect(facture.totalTtc).toBe(arrondir2(attenduHt * 1.2));
  });

  it('expose le détail du dépassement', () => {
    expect(facture.depassement).toEqual({ heures: 1, kwh: 20, puissanceMaxKw: 120 });
  });

  it('garde une ligne de pénalité à 0 € quand il n’y a pas de dépassement', () => {
    const sansDepassement = calculerFacture({ ...site, puissanceSouscriteKva: 500 }, '2026-08', releves, GRILLE);
    expect(sansDepassement.lignes.find((l) => l.code === 'PENALITE_DEPASSEMENT')).toMatchObject({
      quantite: 0,
      montant: 0,
    });
  });

  it('porte l’identifiant du site et le mois', () => {
    expect(facture).toMatchObject({ siteId: 'TST-01', mois: '2026-08' });
  });
});

describe('arrondir2', () => {
  it('arrondit au centime, au plus proche', () => {
    expect(arrondir2(1.005)).toBe(1);
    expect(arrondir2(2.675)).toBe(2.68);
    expect(arrondir2(10.126)).toBe(10.13);
  });
});
