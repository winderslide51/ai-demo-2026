import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { reinitialiserAcquittements } from '../src/services/alertes.service.js';

const app = createApp();
const MOIS_INVALIDE = 'Mois invalide : attendu YYYY-MM entre 2026-03 et 2026-08.';

beforeEach(() => reinitialiserAcquittements());

describe('GET /api/health, /api/client, /api/mois', () => {
  it('répond ok sur /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('renvoie le client, son contrat et la grille tarifaire', async () => {
    const res = await request(app).get('/api/client');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      nom: 'Valmont Industries',
      contrat: { reference: 'VLM-2026-0142', grille: { hpPrixKwh: 0.1842, hcPrixKwh: 0.1231, tvaTaux: 0.2 } },
    });
  });

  it('liste les mois disponibles et le mois par défaut', async () => {
    const res = await request(app).get('/api/mois');
    expect(res.status).toBe(200);
    expect(res.body.mois).toHaveLength(6);
    expect(res.body.moisParDefaut).toBe('2026-08');
  });

  it('renvoie 404 en français sur une ressource inconnue', async () => {
    const res = await request(app).get('/api/inconnu');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Ressource introuvable.' });
  });
});

describe('GET /api/synthese', () => {
  it('agrège les 12 sites sur le mois par défaut', async () => {
    const res = await request(app).get('/api/synthese');
    expect(res.status).toBe(200);
    expect(res.body.mois).toBe('2026-08');
    expect(res.body.nbSites).toBe(12);
    expect(res.body.consommationKwh).toBeCloseTo(res.body.consommationHpKwh + res.body.consommationHcKwh, 0);
    expect(res.body.historique).toHaveLength(6);
    expect(res.body.topSites).toHaveLength(5);
    expect(res.body.nbSitesEnDepassement).toBe(2);
    expect(res.body.penalitesHt).toBeGreaterThan(0);
  });

  it('n’a pas d’évolution sur le premier mois disponible', async () => {
    const res = await request(app).get('/api/synthese?mois=2026-03');
    expect(res.status).toBe(200);
    expect(res.body.evolutionPct).toBeNull();
    expect(res.body.historique).toHaveLength(1);
  });

  it('refuse un mois hors plage', async () => {
    const res = await request(app).get('/api/synthese?mois=2025-12');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: MOIS_INVALIDE });
  });
});

describe('GET /api/sites', () => {
  it('renvoie les 12 sites triés par nom', async () => {
    const res = await request(app).get('/api/sites?mois=2026-08');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(12);
    const noms = res.body.map((s: { nom: string }) => s.nom);
    expect(noms).toEqual([...noms].sort((a, b) => a.localeCompare(b, 'fr')));
    expect(res.body[0]).toMatchObject({ id: 'NTE-03', tendance: expect.any(Array) });
    expect(res.body[0].tendance).toHaveLength(6);
  });

  it('refuse un mois mal formé', async () => {
    const res = await request(app).get('/api/sites?mois=aout');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(MOIS_INVALIDE);
  });
});

describe('GET /api/sites/:id', () => {
  it('détaille un site : facture, profils, alertes', async () => {
    const res = await request(app).get('/api/sites/LYO-01');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'LYO-01',
      nom: 'Usine de Vénissieux',
      responsable: expect.any(String),
      facture: { siteId: 'LYO-01', mois: '2026-08' },
    });
    expect(res.body.journalier).toHaveLength(31);
    expect(res.body.profilHoraire).toHaveLength(24);
    expect(res.body.alertes[0]).toMatchObject({ type: 'DEPASSEMENT_PUISSANCE', severite: 'CRITIQUE' });
    expect(res.body.heuresDepassement).toBeGreaterThan(0);
    expect(res.body.evolutionPct).not.toBeNull();
  });

  it('renvoie 404 pour un site inconnu', async () => {
    const res = await request(app).get('/api/sites/XXX-99');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Site inconnu : XXX-99.' });
  });
});

describe('GET /api/sites/:id/consommation', () => {
  it('renvoie les relevés horaires du mois', async () => {
    const res = await request(app).get('/api/sites/PAR-01/consommation?mois=2026-06');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ siteId: 'PAR-01', mois: '2026-06' });
    expect(res.body.releves).toHaveLength(720);
    expect(res.body.releves[0]).toEqual({ horodatage: '2026-06-01T00:00:00', kwh: expect.any(Number), plage: 'HC' });
  });

  it('renvoie 404 pour un site inconnu', async () => {
    const res = await request(app).get('/api/sites/XXX-99/consommation');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/sites/:id/facture', () => {
  it('renvoie la facture avec ses cinq lignes et ses totaux', async () => {
    const res = await request(app).get('/api/sites/LIL-02/facture');
    expect(res.status).toBe(200);
    expect(res.body.lignes.map((l: { code: string }) => l.code)).toEqual([
      'ABONNEMENT',
      'ENERGIE_HP',
      'ENERGIE_HC',
      'PENALITE_DEPASSEMENT',
      'ACCISE',
    ]);
    expect(res.body.lignes[3].montant).toBe(0);
    expect(res.body.totalTtc).toBeCloseTo(res.body.totalHt + res.body.tva, 1);
  });

  it('renvoie 404 pour un site inconnu et 400 pour un mois invalide', async () => {
    expect((await request(app).get('/api/sites/XXX-99/facture')).status).toBe(404);
    expect((await request(app).get('/api/sites/LIL-02/facture?mois=2030-01')).status).toBe(400);
  });
});

describe('GET /api/alertes', () => {
  it('liste les alertes du mois, les plus graves en premier', async () => {
    const res = await request(app).get('/api/alertes');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0]).toMatchObject({ siteId: 'LYO-01', severite: 'CRITIQUE', acquittee: false });
    const ordre = { CRITIQUE: 0, AVERTISSEMENT: 1, INFO: 2 } as const;
    const severites = res.body.map((a: { severite: keyof typeof ordre }) => ordre[a.severite]);
    expect(severites).toEqual([...severites].sort((a, b) => a - b));
  });

  it('filtre par site', async () => {
    const res = await request(app).get('/api/alertes?siteId=NTE-03');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ siteId: 'NTE-03', type: 'ANOMALIE_NUIT' });
  });

  it('filtre par acquittement', async () => {
    const res = await request(app).get('/api/alertes?acquittee=true');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('renvoie 404 pour un site inconnu et 400 pour un filtre invalide', async () => {
    expect((await request(app).get('/api/alertes?siteId=XXX-99')).status).toBe(404);
    expect((await request(app).get('/api/alertes?acquittee=oui')).status).toBe(400);
    expect((await request(app).get('/api/alertes?mois=2026-13')).status).toBe(400);
  });
});

describe('POST /api/alertes/:id/acquitter', () => {
  const id = 'LYO-01-2026-08-DEPASSEMENT_PUISSANCE';

  it('acquitte une alerte, puis refuse de l’acquitter une seconde fois (409)', async () => {
    const premier = await request(app).post(`/api/alertes/${id}/acquitter`);
    expect(premier.status).toBe(200);
    expect(premier.body).toMatchObject({ id, acquittee: true });

    const liste = await request(app).get('/api/alertes?acquittee=true');
    expect(liste.body.map((a: { id: string }) => a.id)).toEqual([id]);

    const second = await request(app).post(`/api/alertes/${id}/acquitter`);
    expect(second.status).toBe(409);
    expect(second.body).toEqual({ message: 'Cette alerte est déjà acquittée.' });
  });

  it('fait baisser le nombre d’alertes actives du site', async () => {
    await request(app).post(`/api/alertes/${id}/acquitter`);
    const site = await request(app).get('/api/sites/LYO-01');
    expect(site.body.nbAlertesActives).toBe(0);
  });

  it('renvoie 404 pour une alerte inconnue ou mal formée', async () => {
    expect((await request(app).post('/api/alertes/LIL-02-2026-08-DEPASSEMENT_PUISSANCE/acquitter')).status).toBe(404);
    expect((await request(app).post('/api/alertes/XXX-99-2026-08-ANOMALIE_NUIT/acquitter')).status).toBe(404);
    expect((await request(app).post('/api/alertes/nimporte-quoi/acquitter')).status).toBe(404);
    expect((await request(app).post('/api/alertes/LYO-01-2020-01-ANOMALIE_NUIT/acquitter')).status).toBe(404);
  });
});
