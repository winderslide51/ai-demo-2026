import { describe, expect, it } from 'vitest';
import { decomposer, jourDeLaSemaine, plageDe } from '../src/domain/plages.js';
import { GRILLE } from '../src/data/grille.js';

// 2026-08-03 is a Monday, 2026-08-08 a Saturday, 2026-08-09 a Sunday.

describe('plageDe — heures pleines / heures creuses (§4.1)', () => {
  it('classe un lundi à 07:00 en heures pleines', () => {
    expect(plageDe('2026-08-03T07:00:00', GRILLE)).toBe('HP');
  });

  it('classe la borne de début (06:00) en heures pleines, inclusive', () => {
    expect(plageDe('2026-08-03T06:00:00', GRILLE)).toBe('HP');
  });

  it('classe la borne de fin (22:00) en heures creuses, exclusive', () => {
    expect(plageDe('2026-08-03T22:00:00', GRILLE)).toBe('HC');
    expect(plageDe('2026-08-03T21:00:00', GRILLE)).toBe('HP');
  });

  it('classe la nuit de semaine en heures creuses', () => {
    expect(plageDe('2026-08-03T02:00:00', GRILLE)).toBe('HC');
    expect(plageDe('2026-08-03T05:00:00', GRILLE)).toBe('HC');
  });

  it('classe la totalité du samedi et du dimanche en heures creuses', () => {
    expect(plageDe('2026-08-08T12:00:00', GRILLE)).toBe('HC');
    expect(plageDe('2026-08-09T15:00:00', GRILLE)).toBe('HC');
  });

  it('accepte un objet Date, lu en heure locale', () => {
    expect(plageDe(new Date(2026, 7, 3, 10), GRILLE)).toBe('HP');
    expect(plageDe(new Date(2026, 7, 8, 10), GRILLE)).toBe('HC');
  });

  it('rejette un horodatage mal formé', () => {
    expect(() => plageDe('hier midi', GRILLE)).toThrow(/Horodatage invalide/);
  });
});

describe('utilitaires calendaires', () => {
  it('décompose un horodatage en ses composantes', () => {
    expect(decomposer('2026-08-03T07:00:00')).toEqual({ annee: 2026, mois: 8, jour: 3, heure: 7 });
  });

  it('nomme le jour de la semaine en français', () => {
    expect(jourDeLaSemaine(2026, 8, 3)).toBe('lundi');
    expect(jourDeLaSemaine(2026, 8, 9)).toBe('dimanche');
  });
});
