// Deterministic hourly readings for a (site, month) — ADR-0002.
// Same input → same output, on every machine, so the demo numbers never move.

import type { Releve, Site, SiteType } from '../types.js';
import { plageDe, jourDeLaSemaine } from '../domain/plages.js';
import { GRILLE } from './grille.js';
import { joursDuMois } from './mois.js';
import { trouverSite } from './sites.js';

/** Nominal load of each site in kW — the level its equipment actually draws on a busy hour. */
const CHARGE_NOMINALE_KW: Record<string, number> = {
  'LYO-01': 1100,
  'LIL-02': 250, // subscribed 630 kVA: deliberately oversized (§4.5)
  'NTE-03': 1250,
  'MRS-01': 820,
  'TLS-01': 360,
  'BDX-01': 400,
  'STR-01': 660,
  'NCY-01': 190,
  'RNS-01': 520,
  'GRE-01': 260,
  'PAR-01': 320,
  'LEH-01': 130,
};

/** Mild seasonality: spring heating tail, summer holidays in August. */
const SAISONNALITE: Record<string, number> = {
  '2026-03': 1.04,
  '2026-04': 0.99,
  '2026-05': 0.96,
  '2026-06': 0.98,
  '2026-07': 1.0,
  '2026-08': 0.93,
};

const AMPLITUDE_BRUIT = 0.06;

// --- seeded PRNG ---------------------------------------------------------------------------

function hacher(texte: string): number {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(graine: number): () => number {
  let a = graine;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- load profiles (fraction of the nominal load) -------------------------------------------

function entre(heure: number, debut: number, fin: number): boolean {
  return heure >= debut && heure < fin;
}

function profilUsine(weekEnd: boolean, h: number): number {
  if (weekEnd) return 0.18;
  if (entre(h, 8, 12) || entre(h, 13, 18)) return 1.0;
  if (entre(h, 12, 13)) return 0.85;
  if (entre(h, 6, 8)) return 0.6 + 0.125 * (h - 6);
  if (entre(h, 18, 20)) return 0.7;
  if (entre(h, 20, 22)) return 0.45;
  if (entre(h, 5, 6)) return 0.4;
  return 0.22;
}

function profilEntrepot(weekEnd: boolean, h: number): number {
  if (weekEnd) return 0.12;
  if (entre(h, 12, 13)) return 0.8;
  if (entre(h, 7, 19)) return 1.0;
  if (h === 6 || h === 19) return 0.6;
  return 0.15;
}

function profilSiege(weekEnd: boolean, h: number): number {
  if (weekEnd) return 0.08;
  if (entre(h, 12, 14)) return 0.85;
  if (entre(h, 8, 19)) return 1.0;
  if (h === 7 || h === 19) return 0.5;
  return 0.12;
}

function profilLogistique(weekEnd: boolean, h: number): number {
  if (weekEnd) return 0.35;
  if (entre(h, 6, 10) || entre(h, 16, 20)) return 1.0;
  if (entre(h, 5, 22)) return 0.8;
  return 0.3;
}

function profilDatacenter(weekEnd: boolean, h: number): number {
  return !weekEnd && entre(h, 6, 22) ? 1.0 : 0.55;
}

function profilLaboratoire(weekEnd: boolean, h: number): number {
  if (weekEnd) return 0.3;
  return entre(h, 7, 20) ? 1.0 : 0.3;
}

const PROFILS: Record<SiteType, (weekEnd: boolean, heure: number) => number> = {
  USINE: profilUsine,
  ENTREPOT: profilEntrepot,
  SIEGE: profilSiege,
  LOGISTIQUE: profilLogistique,
  DATACENTER: profilDatacenter,
  LABORATOIRE: profilLaboratoire,
};

// --- deliberate scenarios for the demo month (§4.5) ----------------------------------------

type Contexte = { site: Site; mois: string; jour: number; heure: number; weekEnd: boolean; bruit: () => number };

/** Returns an absolute kW override for the hour, or null to keep the regular profile. */
function scenario({ site, mois, jour, heure, weekEnd, bruit }: Contexte): number | null {
  if (mois !== '2026-08') return null;
  const petitBruit = 1 + (bruit() * 2 - 1) * 0.01;

  // LYO-01: repeated overages, peaking around 118 % of the subscribed power (~42 h over).
  if (site.id === 'LYO-01' && !weekEnd && jour % 3 === 0 && entre(heure, 9, 15)) {
    return site.puissanceSouscriteKva * (1.05 + 0.13 * ((heure - 9) / 5)) * petitBruit;
  }
  // TLS-01: a handful of mild overages (~103 %), enough for an AVERTISSEMENT.
  if (site.id === 'TLS-01' && !weekEnd && jour % 5 === 0 && entre(heure, 10, 13)) {
    return site.puissanceSouscriteKva * 1.03 * petitBruit;
  }
  // NTE-03: weekend nights stay high — a batch left running (ANOMALIE_NUIT).
  if (site.id === 'NTE-03' && weekEnd && heure <= 5) {
    return CHARGE_NOMINALE_KW[site.id]! * 0.85 * petitBruit;
  }
  // MRS-01: production catch-up on weekends pushes the month just past its threshold.
  if (site.id === 'MRS-01' && weekEnd) {
    return CHARGE_NOMINALE_KW[site.id]! * 0.5 * SAISONNALITE[mois]! * (1 + (bruit() * 2 - 1) * AMPLITUDE_BRUIT);
  }
  return null;
}

// --- generation -----------------------------------------------------------------------------

const cache = new Map<string, Releve[]>();

function horodatage(mois: string, jour: number, heure: number): string {
  return `${mois}-${String(jour).padStart(2, '0')}T${String(heure).padStart(2, '0')}:00:00`;
}

/** One reading per hour of the month, HP/HC tagged, deterministic for (siteId, mois). */
export function genererReleves(siteId: string, mois: string): Releve[] {
  const cle = `${siteId}|${mois}`;
  const existant = cache.get(cle);
  if (existant) return existant;

  const site = trouverSite(siteId);
  if (!site) {
    throw new Error(`Site inconnu : ${siteId}`);
  }
  const nominal = CHARGE_NOMINALE_KW[siteId] ?? site.puissanceSouscriteKva * 0.8;
  const saison = SAISONNALITE[mois] ?? 1;
  const bruit = mulberry32(hacher(cle));
  const profil = PROFILS[site.type];
  const [annee, moisNum] = mois.split('-').map(Number) as [number, number];

  const releves: Releve[] = [];
  for (let jour = 1; jour <= joursDuMois(mois); jour++) {
    const jourSemaine = jourDeLaSemaine(annee, moisNum, jour);
    const weekEnd = jourSemaine === 'samedi' || jourSemaine === 'dimanche';
    for (let heure = 0; heure < 24; heure++) {
      const aleatoire = 1 + (bruit() * 2 - 1) * AMPLITUDE_BRUIT;
      const force = scenario({ site, mois, jour, heure, weekEnd, bruit });
      const kw = force ?? nominal * profil(weekEnd, heure) * saison * aleatoire;
      const stamp = horodatage(mois, jour, heure);
      releves.push({ horodatage: stamp, kwh: Math.round(kw * 10) / 10, plage: plageDe(stamp, GRILLE) });
    }
  }
  cache.set(cle, releves);
  return releves;
}
