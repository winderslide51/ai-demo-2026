import { describe, expect, it } from 'vitest';
import { genererReleves } from '../src/data/generateur.js';
import { MOIS_DISPONIBLES, fenetreHistorique, joursDuMois, moisPrecedent } from '../src/data/mois.js';
import { SITES, trouverSite } from '../src/data/sites.js';
import { detecterAlertes } from '../src/domain/alertes.js';
import { resumerConsommation } from '../src/domain/tarification.js';

const alertesDe = (siteId: string, mois: string) =>
  detecterAlertes(trouverSite(siteId)!, mois, genererReleves(siteId, mois), new Set());

describe('genererReleves — déterminisme et forme', () => {
  it('produit un relevé par heure du mois (744 en août)', () => {
    expect(genererReleves('LYO-01', '2026-08')).toHaveLength(744);
    expect(genererReleves('LYO-01', '2026-04')).toHaveLength(720);
  });

  it('renvoie exactement les mêmes relevés pour les mêmes entrées', () => {
    const a = genererReleves('BDX-01', '2026-05');
    const b = genererReleves('BDX-01', '2026-05');
    expect(b).toEqual(a);
    expect(b[100]).toMatchObject({ horodatage: '2026-05-05T04:00:00' });
  });

  it('produit des séries différentes pour deux sites', () => {
    expect(genererReleves('RNS-01', '2026-06')).not.toEqual(genererReleves('STR-01', '2026-06'));
  });

  it('étiquette chaque relevé HP ou HC', () => {
    const releves = genererReleves('PAR-01', '2026-07');
    expect(releves.every((r) => r.plage === 'HP' || r.plage === 'HC')).toBe(true);
    expect(releves.find((r) => r.horodatage === '2026-07-06T10:00:00')?.plage).toBe('HP'); // lundi
    expect(releves.find((r) => r.horodatage === '2026-07-05T10:00:00')?.plage).toBe('HC'); // dimanche
  });

  it('refuse un site inconnu', () => {
    expect(() => genererReleves('XXX-99', '2026-08')).toThrow(/Site inconnu/);
  });
});

describe('genererReleves — scénarios de démonstration (§4.5, août 2026)', () => {
  it('LYO-01 dépasse sa puissance souscrite de plus de 10 % : alerte CRITIQUE', () => {
    const site = trouverSite('LYO-01')!;
    const { puissanceMaxKw } = resumerConsommation(genererReleves('LYO-01', '2026-08'));
    expect(puissanceMaxKw).toBeGreaterThan(site.puissanceSouscriteKva * 1.1);
    expect(alertesDe('LYO-01', '2026-08')[0]).toMatchObject({ type: 'DEPASSEMENT_PUISSANCE', severite: 'CRITIQUE' });
  });

  it('LIL-02 ne dépasse jamais 45 % de sa puissance souscrite', () => {
    const site = trouverSite('LIL-02')!;
    const { puissanceMaxKw } = resumerConsommation(genererReleves('LIL-02', '2026-08'));
    expect(puissanceMaxKw).toBeLessThan(site.puissanceSouscriteKva * 0.45);
  });

  it('NTE-03 présente une anomalie de nuit', () => {
    expect(alertesDe('NTE-03', '2026-08').map((a) => a.type)).toEqual(['ANOMALIE_NUIT']);
  });

  it('MRS-01 dépasse légèrement son seuil mensuel', () => {
    const site = trouverSite('MRS-01')!;
    const { kwh } = resumerConsommation(genererReleves('MRS-01', '2026-08'));
    expect(kwh).toBeGreaterThan(site.seuilAlerteKwh);
    expect(kwh).toBeLessThan(site.seuilAlerteKwh * 1.06);
    expect(alertesDe('MRS-01', '2026-08').map((a) => a.type)).toEqual(['SEUIL_CONSOMMATION']);
  });

  it('les autres sites ne lèvent aucune alerte critique', () => {
    const critiques = SITES.flatMap((s) => alertesDe(s.id, '2026-08')).filter((a) => a.severite === 'CRITIQUE');
    expect(critiques.map((a) => a.siteId)).toEqual(['LYO-01']);
  });
});

describe('mois disponibles', () => {
  it('couvre mars à août 2026', () => {
    expect(MOIS_DISPONIBLES).toEqual(['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08']);
    expect(joursDuMois('2026-02')).toBe(28);
  });

  it('connaît le mois précédent, sauf pour le premier', () => {
    expect(moisPrecedent('2026-08')).toBe('2026-07');
    expect(moisPrecedent('2026-03')).toBeNull();
  });

  it('construit une fenêtre historique bornée au mois demandé', () => {
    expect(fenetreHistorique('2026-08')).toHaveLength(6);
    expect(fenetreHistorique('2026-04')).toEqual(['2026-03', '2026-04']);
  });
});
