import { describe, expect, it } from 'vitest';
import { detecterAlertes, identifiantAlerte } from '../src/domain/alertes.js';
import type { Releve, Site } from '../src/types.js';

const site: Site = {
  id: 'TST-01',
  nom: 'Site de test',
  ville: 'Testville',
  region: 'Test',
  type: 'USINE',
  adresse: '1 rue du Test',
  responsable: 'Test Testeur',
  puissanceSouscriteKva: 100,
  seuilAlerteKwh: 1000,
};

const hp = (jour: number, heure: number, kwh: number): Releve => ({
  horodatage: `2026-08-${String(jour).padStart(2, '0')}T${String(heure).padStart(2, '0')}:00:00`,
  kwh,
  plage: 'HP',
});
const hc = (jour: number, heure: number, kwh: number): Releve => ({ ...hp(jour, heure, kwh), plage: 'HC' });

// A calm week: HP readings at 80 kW, weekend nights (8 & 9 August) at 20 kW.
const calme: Releve[] = [hp(3, 8, 80), hp(3, 9, 80), hp(4, 10, 80), hc(8, 1, 20), hc(9, 2, 20)];

describe('detecterAlertes — dépassement de puissance', () => {
  it('ne lève rien quand aucun relevé ne dépasse la puissance souscrite', () => {
    expect(detecterAlertes(site, '2026-08', calme, new Set())).toEqual([]);
  });

  it('lève un AVERTISSEMENT pour un dépassement jusqu’à 110 %', () => {
    const alertes = detecterAlertes(site, '2026-08', [...calme, hp(5, 11, 108)], new Set());
    expect(alertes).toHaveLength(1);
    expect(alertes[0]).toMatchObject({
      type: 'DEPASSEMENT_PUISSANCE',
      severite: 'AVERTISSEMENT',
      detecteeLe: '2026-08-05T11:00:00',
      message: 'Puissance souscrite dépassée : 108 kW pour 100 kVA (1 h de dépassement).',
      acquittee: false,
    });
  });

  it('lève une alerte CRITIQUE au-delà de 110 % de la puissance souscrite', () => {
    const alertes = detecterAlertes(site, '2026-08', [...calme, hp(5, 11, 111), hp(5, 12, 105)], new Set());
    expect(alertes[0]).toMatchObject({ severite: 'CRITIQUE', detecteeLe: '2026-08-05T11:00:00' });
    expect(alertes[0]?.message).toContain('(2 h de dépassement)');
  });
});

describe('detecterAlertes — seuil de consommation mensuel', () => {
  // Generous subscribed power so that the big readings below never count as an overage.
  const siteLarge: Site = { ...site, puissanceSouscriteKva: 5000 };

  it('lève un AVERTISSEMENT daté du dernier jour du mois quand le seuil est dépassé', () => {
    const gourmand = [...calme, hc(10, 3, 900)];
    const alertes = detecterAlertes(siteLarge, '2026-08', gourmand, new Set());
    expect(alertes).toHaveLength(1);
    expect(alertes[0]).toMatchObject({
      type: 'SEUIL_CONSOMMATION',
      severite: 'AVERTISSEMENT',
      detecteeLe: '2026-08-31T23:00:00',
    });
    // fr-FR groups thousands with a narrow no-break space (U+202F).
    expect(alertes[0]?.message).toBe('Consommation mensuelle de 1 180 kWh au-dessus du seuil de 1 000 kWh.');
  });

  it('ne lève rien quand la consommation égale exactement le seuil', () => {
    const juste = [...calme, hc(10, 3, 720)];
    expect(detecterAlertes(siteLarge, '2026-08', juste, new Set())).toEqual([]);
  });
});

describe('detecterAlertes — anomalie de nuit', () => {
  it('lève une INFO quand les nuits de week-end dépassent 60 % de la moyenne HP', () => {
    const nuitsChargees = [hp(3, 8, 80), hp(3, 9, 80), hc(8, 1, 70), hc(9, 4, 70)];
    const alertes = detecterAlertes(site, '2026-08', nuitsChargees, new Set());
    expect(alertes).toHaveLength(1);
    expect(alertes[0]).toMatchObject({
      type: 'ANOMALIE_NUIT',
      severite: 'INFO',
      message: 'Consommation nocturne de week-end anormalement élevée (70 kW en moyenne).',
    });
  });

  it('ignore les heures de week-end après 05:00', () => {
    const journeeDeWeekEnd = [hp(3, 8, 80), hc(8, 12, 70), hc(9, 18, 70), hc(8, 1, 10)];
    expect(detecterAlertes(site, '2026-08', journeeDeWeekEnd, new Set())).toEqual([]);
  });
});

describe('detecterAlertes — identifiant, acquittement et tri', () => {
  it('construit un identifiant stable site-mois-type', () => {
    expect(identifiantAlerte('LYO-01', '2026-08', 'DEPASSEMENT_PUISSANCE')).toBe('LYO-01-2026-08-DEPASSEMENT_PUISSANCE');
  });

  it('marque l’alerte acquittée quand son identifiant est dans le jeu', () => {
    const acquittees = new Set(['TST-01-2026-08-DEPASSEMENT_PUISSANCE']);
    const alertes = detecterAlertes(site, '2026-08', [...calme, hp(5, 11, 108)], acquittees);
    expect(alertes[0]?.acquittee).toBe(true);
  });

  it('trie de la plus grave à la moins grave', () => {
    const tout = [hp(3, 8, 80), hp(5, 11, 120), hc(8, 1, 70), hc(9, 4, 70), hc(10, 3, 99), hc(11, 3, 99)];
    const alertes = detecterAlertes({ ...site, seuilAlerteKwh: 500 }, '2026-08', tout, new Set());
    expect(alertes.map((a) => a.severite)).toEqual(['CRITIQUE', 'AVERTISSEMENT', 'INFO']);
    expect(alertes.map((a) => a.siteNom)).toEqual(['Site de test', 'Site de test', 'Site de test']);
  });
});
